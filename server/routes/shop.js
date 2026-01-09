const express = require('express');
const crypto = require('crypto');
const Shop = require('../models/Shop');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { managerOnly } = require('../middleware/rbac');
const { sendTechApprovalNotification, sendManagerTechRequestNotification } = require('../services/notificationService');

const router = express.Router();

// @route   GET /api/shop/my-shop
// @desc    Get current user's shop details
// @access  Private
router.get('/my-shop', protect, async (req, res) => {
    try {
        if (!req.user.shop) {
            return res.status(404).json({
                success: false,
                error: 'No shop associated with your account'
            });
        }

        const shop = await Shop.findById(req.user.shop)
            .populate('manager', 'name email');

        if (!shop) {
            return res.status(404).json({
                success: false,
                error: 'Shop not found'
            });
        }

        res.json({
            success: true,
            data: shop
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/shop/pending-techs
// @desc    Get pending technician requests for manager's shop
// @access  Private/Manager
router.get('/pending-techs', protect, managerOnly, async (req, res) => {
    try {
        const pendingTechs = await User.find({
            shop: req.user.shop,
            role: 'technician',
            shopStatus: 'pending'
        }).select('-password');

        res.json({
            success: true,
            count: pendingTechs.length,
            data: pendingTechs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/shop/approve-tech/:id
// @desc    Approve a technician to join the shop
// @access  Private/Manager
router.post('/approve-tech/:id', protect, managerOnly, async (req, res) => {
    try {
        const tech = await User.findById(req.params.id);

        if (!tech) {
            return res.status(404).json({
                success: false,
                error: 'Technician not found'
            });
        }

        if (tech.shop.toString() !== req.user.shop.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Technician is not from your shop'
            });
        }

        if (tech.shopStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'Technician is not pending approval'
            });
        }

        tech.shopStatus = 'approved';
        tech.isActive = true;
        await tech.save();

        // Get shop name for email
        const shop = await Shop.findById(req.user.shop);

        // Send approval notification to tech
        try {
            await sendTechApprovalNotification(tech, {
                shopName: shop?.name || 'the shop',
                approved: true,
                managerName: req.user.name
            });
        } catch (emailError) {
            console.log('Email notification failed:', emailError.message);
        }

        res.json({
            success: true,
            message: `${tech.name} has been approved to join the shop`,
            data: tech
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/shop/reject-tech/:id
// @desc    Reject a technician from joining the shop
// @access  Private/Manager
router.post('/reject-tech/:id', protect, managerOnly, async (req, res) => {
    try {
        const { reason } = req.body;
        const tech = await User.findById(req.params.id);

        if (!tech) {
            return res.status(404).json({
                success: false,
                error: 'Technician not found'
            });
        }

        if (tech.shop.toString() !== req.user.shop.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Technician is not from your shop'
            });
        }

        tech.shopStatus = 'rejected';
        tech.isActive = false;
        await tech.save();

        // Get shop name for email
        const shop = await Shop.findById(req.user.shop);

        // Send rejection notification to tech
        try {
            await sendTechApprovalNotification(tech, {
                shopName: shop?.name || 'the shop',
                approved: false,
                reason: reason || 'No reason provided',
                managerName: req.user.name
            });
        } catch (emailError) {
            console.log('Email notification failed:', emailError.message);
        }

        res.json({
            success: true,
            message: `${tech.name}'s request has been rejected`,
            data: tech
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/shop/remove-tech/:id
// @desc    Remove an approved technician from the shop
// @access  Private/Manager
router.post('/remove-tech/:id', protect, managerOnly, async (req, res) => {
    try {
        const tech = await User.findById(req.params.id);

        if (!tech) {
            return res.status(404).json({
                success: false,
                error: 'Technician not found'
            });
        }

        if (tech.shop.toString() !== req.user.shop.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Technician is not from your shop'
            });
        }

        tech.shop = null;
        tech.shopStatus = 'pending';
        tech.isActive = false;
        await tech.save();

        res.json({
            success: true,
            message: `${tech.name} has been removed from the shop`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/shop/regenerate-code
// @desc    Generate new shop code
// @access  Private/Manager
router.put('/regenerate-code', protect, managerOnly, async (req, res) => {
    try {
        const shop = await Shop.findById(req.user.shop);

        if (!shop) {
            return res.status(404).json({
                success: false,
                error: 'Shop not found'
            });
        }

        const newCode = await shop.regenerateCode();

        res.json({
            success: true,
            message: 'Shop code regenerated successfully',
            data: { code: newCode }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/shop/update
// @desc    Update shop details
// @access  Private/Manager
router.put('/update', protect, managerOnly, async (req, res) => {
    try {
        const { name, address, phone } = req.body;
        const shop = await Shop.findById(req.user.shop);

        if (!shop) {
            return res.status(404).json({
                success: false,
                error: 'Shop not found'
            });
        }

        if (name) shop.name = name;
        if (address) shop.address = address;
        if (phone) shop.phone = phone;

        await shop.save();

        res.json({
            success: true,
            message: 'Shop updated successfully',
            data: shop
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/shop/validate-code/:code
// @desc    Validate a shop code (for signup)
// @access  Public
router.get('/validate-code/:code', async (req, res) => {
    try {
        const shop = await Shop.findOne({
            code: req.params.code.toUpperCase(),
            isActive: true
        }).select('name');

        if (!shop) {
            return res.status(404).json({
                success: false,
                error: 'Invalid shop code'
            });
        }

        res.json({
            success: true,
            data: { name: shop.name }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/shop/email-approve/:token
// @desc    Approve technician via email link (public)
// @access  Public (uses secure token)
router.get('/email-approve/:token', async (req, res) => {
    try {
        const tech = await User.findOne({
            approvalToken: req.params.token,
            shopStatus: 'pending'
        });

        if (!tech) {
            return res.send(`
                <html>
                <head><title>TekGear</title><style>body{font-family:sans-serif;text-align:center;padding:50px;background:#0a0a0a;color:white;}</style></head>
                <body>
                    <h1 style="color:#ef4444;">❌ Invalid or Expired Link</h1>
                    <p>This approval link is no longer valid. The request may have already been processed.</p>
                </body>
                </html>
            `);
        }

        const shop = await Shop.findById(tech.shop);

        tech.shopStatus = 'approved';
        tech.isActive = true;
        tech.approvalToken = null; // Clear token after use
        await tech.save();

        // Send approval notification to tech
        try {
            await sendTechApprovalNotification(tech, {
                shopName: shop?.name || 'the shop',
                approved: true,
                managerName: 'Manager'
            });
        } catch (emailError) {
            console.log('Email notification failed:', emailError.message);
        }

        res.send(`
            <html>
            <head><title>TekGear</title><style>
                body{font-family:sans-serif;text-align:center;padding:50px;background:#0a0a0a;color:white;}
                .success{color:#4cad9a;}
                .card{background:#1a1a1a;border-radius:16px;padding:32px;max-width:500px;margin:0 auto;border:1px solid #4cad9a33;}
            </style></head>
            <body>
                <div class="card">
                    <h1 class="success">✅ Approved!</h1>
                    <h2>${tech.name} has been approved</h2>
                    <p>They can now log in to <strong>${shop?.name || 'TekGear'}</strong> and start working.</p>
                    <p style="color:#888;margin-top:30px;">You can close this window.</p>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send(`<html><body><h1>Error: ${error.message}</h1></body></html>`);
    }
});

// @route   GET /api/shop/email-reject/:token
// @desc    Reject technician via email link (public)
// @access  Public (uses secure token)
router.get('/email-reject/:token', async (req, res) => {
    try {
        const tech = await User.findOne({
            approvalToken: req.params.token,
            shopStatus: 'pending'
        });

        if (!tech) {
            return res.send(`
                <html>
                <head><title>TekGear</title><style>body{font-family:sans-serif;text-align:center;padding:50px;background:#0a0a0a;color:white;}</style></head>
                <body>
                    <h1 style="color:#ef4444;">❌ Invalid or Expired Link</h1>
                    <p>This rejection link is no longer valid. The request may have already been processed.</p>
                </body>
                </html>
            `);
        }

        const shop = await Shop.findById(tech.shop);

        tech.shopStatus = 'rejected';
        tech.isActive = false;
        tech.approvalToken = null; // Clear token after use
        await tech.save();

        // Send rejection notification to tech
        try {
            await sendTechApprovalNotification(tech, {
                shopName: shop?.name || 'the shop',
                approved: false,
                reason: 'Request declined by manager',
                managerName: 'Manager'
            });
        } catch (emailError) {
            console.log('Email notification failed:', emailError.message);
        }

        res.send(`
            <html>
            <head><title>TekGear</title><style>
                body{font-family:sans-serif;text-align:center;padding:50px;background:#0a0a0a;color:white;}
                .rejected{color:#ef4444;}
                .card{background:#1a1a1a;border-radius:16px;padding:32px;max-width:500px;margin:0 auto;border:1px solid #ef444433;}
            </style></head>
            <body>
                <div class="card">
                    <h1 class="rejected">❌ Rejected</h1>
                    <h2>${tech.name}'s request was rejected</h2>
                    <p>They will be notified via email.</p>
                    <p style="color:#888;margin-top:30px;">You can close this window.</p>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send(`<html><body><h1>Error: ${error.message}</h1></body></html>`);
    }
});

// Helper function to generate approval token
const generateApprovalToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Export the token generator for use in auth routes
router.generateApprovalToken = generateApprovalToken;

module.exports = router;

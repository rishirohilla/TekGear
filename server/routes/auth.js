const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Shop = require('../models/Shop');
const { generateToken, protect } = require('../middleware/auth');
const { sendManagerTechRequestNotification, sendTechRequestConfirmation } = require('../services/notificationService');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// @route   POST /api/auth/signup
// @desc    Register a new user (manager creates shop, tech joins with code)
// @access  Public
router.post('/signup', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['manager', 'technician']).withMessage('Role must be manager or technician'),
    body('certifications').optional().isArray().withMessage('Certifications must be an array'),
    body('shopCode').optional().trim(),
    body('shopName').optional().trim(),
    body('shopAddress').optional().trim()
], handleValidationErrors, async (req, res) => {
    try {
        const { name, email, password, role, certifications, shopCode, shopName, shopAddress } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User already exists with this email'
            });
        }

        let shop = null;
        let shopStatus = 'pending';

        if (role === 'manager') {
            // Manager must provide shop name to create a new shop
            if (!shopName) {
                return res.status(400).json({
                    success: false,
                    error: 'Shop name is required for manager signup'
                });
            }

            // Create user first
            const user = await User.create({
                name,
                email,
                password,
                role,
                certifications: [],
                shopStatus: 'approved',
                isActive: true
            });

            // Create shop with this manager
            shop = await Shop.create({
                name: shopName,
                address: shopAddress || '',
                manager: user._id
            });

            // Update user with shop reference
            user.shop = shop._id;
            await user.save();

            const token = generateToken(user._id, user.email, user.role);

            return res.status(201).json({
                success: true,
                message: `Shop "${shop.name}" created! Your shop code is: ${shop.code}`,
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        certifications: user.certifications,
                        shop: shop._id,
                        shopStatus: 'approved'
                    },
                    shop: {
                        id: shop._id,
                        name: shop.name,
                        code: shop.code
                    },
                    token
                }
            });
        } else {
            // Technician must provide shop code to join
            if (!shopCode) {
                return res.status(400).json({
                    success: false,
                    error: 'Shop code is required for technician signup'
                });
            }

            // Find shop by code
            shop = await Shop.findOne({ code: shopCode.toUpperCase(), isActive: true });
            if (!shop) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid shop code. Please check with your manager.'
                });
            }

            // Generate approval token for email-based actions
            const approvalToken = crypto.randomBytes(32).toString('hex');

            // Create technician with pending status
            const user = await User.create({
                name,
                email,
                password,
                role,
                certifications: certifications || [],
                shop: shop._id,
                shopStatus: 'pending',
                isActive: false, // Not active until approved
                approvalToken: approvalToken
            });

            // Notify manager about new request with approval links
            const manager = await User.findById(shop.manager);
            if (manager) {
                try {
                    await sendManagerTechRequestNotification(manager, {
                        techName: user.name,
                        techEmail: user.email,
                        techCertifications: user.certifications,
                        shopName: shop.name,
                        approvalToken: approvalToken
                    });
                } catch (emailError) {
                    console.log('Manager notification failed:', emailError.message);
                }
            }

            // Send confirmation to tech
            try {
                await sendTechRequestConfirmation(user, shop.name);
            } catch (emailError) {
                console.log('Tech confirmation failed:', emailError.message);
            }

            // Don't give token yet - they need approval first
            return res.status(201).json({
                success: true,
                message: `Account request submitted! Waiting for ${shop.name} manager approval.`,
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        shopStatus: 'pending'
                    },
                    shop: {
                        name: shop.name
                    },
                    requiresApproval: true
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], handleValidationErrors, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include password
        const user = await User.findOne({ email }).select('+password').populate('shop', 'name code');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check if technician is approved
        if (user.role === 'technician' && user.shopStatus === 'pending') {
            return res.status(403).json({
                success: false,
                error: 'Your account is pending manager approval. Please wait.',
                shopStatus: 'pending'
            });
        }

        if (user.role === 'technician' && user.shopStatus === 'rejected') {
            return res.status(403).json({
                success: false,
                error: 'Your account request was not approved. Please contact the shop manager.',
                shopStatus: 'rejected'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Account is deactivated'
            });
        }

        // Generate token
        const token = generateToken(user._id, user.email, user.role);

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    certifications: user.certifications,
                    weeklyEarnings: user.weeklyEarnings,
                    weeklyBonusGoal: user.weeklyBonusGoal,
                    shop: user.shop,
                    shopStatus: user.shopStatus
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('shop', 'name code address');
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

const express = require('express');
const IncentiveRule = require('../models/IncentiveRule');
const { protect } = require('../middleware/auth');
const { managerOnly } = require('../middleware/rbac');

const router = express.Router();

// @route   GET /api/incentive-rules
// @desc    Get all incentive rules
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const rules = await IncentiveRule.find()
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: rules.length,
            data: rules
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/incentive-rules/active
// @desc    Get active incentive rule
// @access  Private
router.get('/active', protect, async (req, res) => {
    try {
        const rule = await IncentiveRule.getActiveRule();

        if (!rule) {
            return res.status(404).json({
                success: false,
                error: 'No active incentive rule found'
            });
        }

        res.json({
            success: true,
            data: rule
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/incentive-rules
// @desc    Create a new incentive rule
// @access  Private/Manager
router.post('/', protect, managerOnly, async (req, res) => {
    try {
        const ruleData = {
            ...req.body,
            createdBy: req.user._id
        };

        // If new rule is active, deactivate others
        if (req.body.isActive) {
            await IncentiveRule.updateMany(
                { isActive: true },
                { isActive: false }
            );
        }

        const rule = await IncentiveRule.create(ruleData);

        res.status(201).json({
            success: true,
            data: rule
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/incentive-rules/:id
// @desc    Update an incentive rule
// @access  Private/Manager
router.put('/:id', protect, managerOnly, async (req, res) => {
    try {
        // If setting this rule as active, deactivate others
        if (req.body.isActive) {
            await IncentiveRule.updateMany(
                { _id: { $ne: req.params.id }, isActive: true },
                { isActive: false }
            );
        }

        const rule = await IncentiveRule.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!rule) {
            return res.status(404).json({
                success: false,
                error: 'Incentive rule not found'
            });
        }

        res.json({
            success: true,
            data: rule
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   DELETE /api/incentive-rules/:id
// @desc    Delete an incentive rule
// @access  Private/Manager
router.delete('/:id', protect, managerOnly, async (req, res) => {
    try {
        const rule = await IncentiveRule.findByIdAndDelete(req.params.id);

        if (!rule) {
            return res.status(404).json({
                success: false,
                error: 'Incentive rule not found'
            });
        }

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

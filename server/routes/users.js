const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { managerOnly } = require('../middleware/rbac');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all technicians (Manager only)
// @access  Private/Manager
router.get('/', protect, managerOnly, async (req, res) => {
    try {
        // Only get technicians from manager's shop
        const users = await User.find({
            role: 'technician',
            shop: req.user.shop,
            shopStatus: 'approved'
        })
            .select('-password')
            .sort({ name: 1 });

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/users/:id
// @desc    Get single user by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        // Technicians can only view their own profile
        if (req.user.role === 'technician' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

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

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private/Manager or Own Profile
router.put('/:id', protect, async (req, res) => {
    try {
        // Technicians can only update their own profile (limited fields)
        if (req.user.role === 'technician' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        const allowedUpdates = req.user.role === 'manager'
            ? ['name', 'certifications', 'baseRate', 'weeklyBonusGoal', 'bonusMultiplier', 'isActive']
            : ['name', 'avatar'];

        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

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

// @route   PUT /api/users/:id/settings
// @desc    Manager updates technician settings (bonus multiplier, weekly goal)
// @access  Private/Manager
router.put('/:id/settings', protect, managerOnly, async (req, res) => {
    try {
        const { bonusMultiplier, weeklyBonusGoal } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        if (user.role !== 'technician') {
            return res.status(400).json({
                success: false,
                error: 'Can only update technician settings'
            });
        }

        // Update settings
        if (typeof bonusMultiplier === 'number') {
            user.bonusMultiplier = Math.min(Math.max(bonusMultiplier, 0), 3); // 0x to 3x
        }
        if (typeof weeklyBonusGoal === 'number') {
            user.weeklyBonusGoal = Math.max(weeklyBonusGoal, 0);
        }

        await user.save();

        res.json({
            success: true,
            data: user,
            message: `Settings updated for ${user.name}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/users/:id/reset-weekly
// @desc    Reset technician's weekly earnings (typically automated)
// @access  Private/Manager
router.post('/:id/reset-weekly', protect, managerOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Archive current week's data
        if (user.weeklyEarnings > 0) {
            user.efficiencyHistory.push({
                weekStartDate: new Date(),
                bonusEarned: user.weeklyEarnings
            });
        }

        user.weeklyEarnings = 0;
        await user.save();

        res.json({
            success: true,
            data: user,
            message: `Weekly earnings reset for ${user.name}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/users/:id/stats
// @desc    Get user statistics
// @access  Private
router.get('/:id/stats', protect, async (req, res) => {
    try {
        if (req.user.role === 'technician' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const Job = require('../models/Job');
        const completedJobs = await Job.find({
            assignedTech: user._id,
            status: 'completed'
        });

        const stats = {
            totalJobsCompleted: completedJobs.length,
            totalTimeSaved: completedJobs.reduce((acc, job) => acc + (job.timeSaved || 0), 0),
            totalIncentiveEarned: completedJobs.reduce((acc, job) => acc + (job.incentiveEarned || 0), 0),
            weeklyEarnings: user.weeklyEarnings,
            weeklyBonusGoal: user.weeklyBonusGoal,
            bonusMultiplier: user.bonusMultiplier || 1.0,
            progressToGoal: user.weeklyBonusGoal > 0
                ? Math.min((user.weeklyEarnings / user.weeklyBonusGoal) * 100, 100)
                : 0,
            efficiencyHistory: user.efficiencyHistory.slice(-10) // Last 10 weeks
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

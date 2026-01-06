const express = require('express');
const Job = require('../models/Job');
const User = require('../models/User');
const IncentiveRule = require('../models/IncentiveRule');
const { protect } = require('../middleware/auth');
const { managerOnly } = require('../middleware/rbac');
const { sendBonusNotification } = require('../services/notificationService');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs (Manager) or available jobs for tech (filtered by certification)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'technician') {
            // Technicians only see available jobs matching their certifications
            query = {
                status: 'available',
                requiredCert: { $in: req.user.certifications }
            };
        }

        // Filter by status if provided
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Filter by certification if provided
        if (req.query.cert) {
            query.requiredCert = req.query.cert;
        }

        const jobs = await Job.find(query)
            .populate('assignedTech', 'name email certifications')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/jobs/my-jobs
// @desc    Get technician's assigned/completed jobs
// @access  Private/Technician
router.get('/my-jobs', protect, async (req, res) => {
    try {
        const jobs = await Job.find({ assignedTech: req.user._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('assignedTech', 'name email certifications')
            .populate('createdBy', 'name');

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        // Technicians can only view jobs they're assigned to or available jobs they're certified for
        if (req.user.role === 'technician') {
            const isAssigned = job.assignedTech && job.assignedTech._id.toString() === req.user._id.toString();
            const canAccess = isAssigned ||
                (job.status === 'available' && req.user.certifications.includes(job.requiredCert));

            if (!canAccess) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied'
                });
            }
        }

        res.json({
            success: true,
            data: job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private/Manager
router.post('/', protect, managerOnly, async (req, res) => {
    try {
        const jobData = {
            ...req.body,
            createdBy: req.user._id
        };

        const job = await Job.create(jobData);

        res.status(201).json({
            success: true,
            data: job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/jobs/:id/start
// @desc    Start a job (assign to tech and start timer)
// @access  Private/Technician
router.post('/:id/start', protect, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        if (job.status !== 'available') {
            return res.status(400).json({
                success: false,
                error: 'Job is not available'
            });
        }

        // Check if tech has required certification
        if (!req.user.certifications.includes(job.requiredCert)) {
            return res.status(403).json({
                success: false,
                error: `You need ${job.requiredCert} certification to start this job`
            });
        }

        job.status = 'in-progress';
        job.assignedTech = req.user._id;
        job.startedAt = new Date();
        await job.save();

        res.json({
            success: true,
            data: job,
            message: `Job started! Book time: ${job.bookTime} minutes. Beat the clock!`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/jobs/:id/complete
// @desc    Complete a job and calculate incentive
// @access  Private/Technician
router.post('/:id/complete', protect, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        if (job.status !== 'in-progress') {
            return res.status(400).json({
                success: false,
                error: 'Job is not in progress'
            });
        }

        if (job.assignedTech.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'You are not assigned to this job'
            });
        }

        // Calculate actual time
        const completedAt = new Date();
        const actualTime = req.body.actualTime || Math.round((completedAt - job.startedAt) / 60000); // Convert to minutes

        job.status = 'completed';
        job.completedAt = completedAt;
        job.actualTime = actualTime;
        job.notes = req.body.notes || '';

        // Calculate incentive
        let incentiveEarned = 0;
        let timeSaved = 0;

        if (actualTime < job.bookTime) {
            timeSaved = job.bookTime - actualTime;
            job.timeSaved = timeSaved;

            // Get active incentive rule
            const rule = await IncentiveRule.getActiveRule(job.requiredCert);
            if (rule) {
                const bonusUnits = Math.floor(timeSaved / rule.timeSavedThreshold);
                incentiveEarned = bonusUnits * rule.bonusPerUnit;
                job.incentiveEarned = incentiveEarned;
            }
        }

        await job.save();

        // Update tech's earnings
        const tech = await User.findById(req.user._id);
        tech.weeklyEarnings += incentiveEarned;
        tech.totalJobsCompleted += 1;
        tech.totalTimeSaved += timeSaved;
        await tech.save();

        // Send notification if bonus earned
        if (incentiveEarned > 0) {
            try {
                await sendBonusNotification(tech, {
                    timeSaved,
                    incentiveEarned,
                    jobTitle: job.title
                });
            } catch (notifyError) {
                console.log('Notification failed:', notifyError.message);
            }
        }

        res.json({
            success: true,
            data: job,
            incentive: {
                timeSaved,
                incentiveEarned,
                message: incentiveEarned > 0
                    ? `🎉 Efficiency Bonus Earned! You beat the clock by ${timeSaved} mins. +$${incentiveEarned.toFixed(2)} added to your weekly pulse!`
                    : 'Job completed successfully!'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Private/Manager
router.put('/:id', protect, managerOnly, async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        res.json({
            success: true,
            data: job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private/Manager
router.delete('/:id', protect, managerOnly, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        if (job.status === 'in-progress') {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete a job that is in progress'
            });
        }

        await job.deleteOne();

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

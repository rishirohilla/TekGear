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
            // Technicians only see available jobs matching their certifications AND their shop
            query = {
                status: 'available',
                requiredCert: { $in: req.user.certifications },
                shop: req.user.shop
            };
        } else {
            // Managers only see their shop's jobs
            query = { shop: req.user.shop };
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
        const jobs = await Job.find({
            shop: req.user.shop, // Only jobs from their shop
            $or: [
                { assignedTech: req.user._id },
                { requestedBy: req.user._id }
            ]
        }).sort({ createdAt: -1 });

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

// @route   GET /api/jobs/pending-requests
// @desc    Get all pending job requests (Manager only)
// @access  Private/Manager
// NOTE: This route MUST be defined BEFORE /:id routes!
router.get('/pending-requests', protect, managerOnly, async (req, res) => {
    try {
        const pendingJobs = await Job.find({
            requestStatus: 'pending',
            shop: req.user.shop // Only jobs from manager's shop
        })
            .populate('requestedBy', 'name email certifications')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: pendingJobs.length,
            data: pendingJobs
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
            createdBy: req.user._id,
            shop: req.user.shop // Assign to manager's shop
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

// ================== JOB REQUEST/APPROVAL WORKFLOW ==================

const crypto = require('crypto');
const { sendJobRequestNotification, sendJobApprovalNotification } = require('../services/notificationService');

// NOTE: pending-requests route is defined earlier in the file (before :id routes)

// @route   POST /api/jobs/:id/request
// @desc    Tech requests to take a job (needs manager approval)
// @access  Private/Technician
router.post('/:id/request', protect, async (req, res) => {
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
                error: 'Job is not available for request'
            });
        }

        // Check if tech has required certification
        if (!req.user.certifications.includes(job.requiredCert)) {
            return res.status(403).json({
                success: false,
                error: `You need ${job.requiredCert} certification to request this job`
            });
        }

        // Generate approval token for email link
        const approvalToken = crypto.randomBytes(32).toString('hex');

        job.status = 'pending-approval';
        job.requestedBy = req.user._id;
        job.requestStatus = 'pending';
        job.assignmentType = 'requested';
        job.approvalToken = approvalToken;
        await job.save();

        // Find managers to notify
        const managers = await User.find({ role: 'manager', isActive: true });

        // Send email notification to managers
        for (const manager of managers) {
            try {
                await sendJobRequestNotification(manager, {
                    techName: req.user.name,
                    techEmail: req.user.email,
                    jobTitle: job.title,
                    jobId: job._id,
                    requiredCert: job.requiredCert,
                    bookTime: job.bookTime,
                    approvalToken
                });
            } catch (notifyError) {
                console.log('Manager notification failed:', notifyError.message);
            }
        }

        res.json({
            success: true,
            data: job,
            message: 'Job request submitted! Waiting for manager approval.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/jobs/:id/approve
// @desc    Manager approves job request from dashboard
// @access  Private/Manager
router.post('/:id/approve', protect, managerOnly, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('requestedBy', 'name email');

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        if (job.requestStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'No pending request for this job'
            });
        }

        job.status = 'available'; // Back to available, tech can now start
        job.requestStatus = 'approved';
        job.approvedBy = req.user._id;
        job.approvedAt = new Date();
        job.assignedTech = job.requestedBy._id;
        job.approvalToken = null;
        await job.save();

        // Notify tech of approval
        try {
            await sendJobApprovalNotification(job.requestedBy, {
                jobTitle: job.title,
                approved: true,
                managerName: req.user.name
            });
        } catch (notifyError) {
            console.log('Tech notification failed:', notifyError.message);
        }

        res.json({
            success: true,
            data: job,
            message: `Job approved for ${job.requestedBy.name}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/jobs/:id/approve/:token
// @desc    Manager approves job via email link
// @access  Public (token-based auth)
router.get('/:id/approve/:token', async (req, res) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            approvalToken: req.params.token
        }).populate('requestedBy', 'name email');

        if (!job) {
            return res.status(404).send(`
                <html>
                    <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #0a0a0a; color: white;">
                        <h1 style="color: #ef4444;">❌ Invalid or Expired Link</h1>
                        <p>This approval link is no longer valid.</p>
                    </body>
                </html>
            `);
        }

        if (job.requestStatus !== 'pending') {
            return res.send(`
                <html>
                    <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #0a0a0a; color: white;">
                        <h1 style="color: #f59e0b;">⚠️ Already Processed</h1>
                        <p>This job request has already been ${job.requestStatus}.</p>
                    </body>
                </html>
            `);
        }

        job.status = 'available';
        job.requestStatus = 'approved';
        job.approvedAt = new Date();
        job.assignedTech = job.requestedBy._id;
        job.approvalToken = null;
        await job.save();

        // Notify tech
        try {
            await sendJobApprovalNotification(job.requestedBy, {
                jobTitle: job.title,
                approved: true,
                managerName: 'Manager (via email)'
            });
        } catch (e) { }

        res.send(`
            <html>
                <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #0a0a0a; color: white;">
                    <h1 style="color: #4cad9a;">✅ Job Approved!</h1>
                    <p><strong>${job.requestedBy.name}</strong> can now start working on:</p>
                    <h2 style="color: #4cad9a;">${job.title}</h2>
                    <p style="color: #666;">You can close this window.</p>
                </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send('Error processing approval');
    }
});

// @route   POST /api/jobs/:id/reject
// @desc    Manager rejects job request
// @access  Private/Manager
router.post('/:id/reject', protect, managerOnly, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('requestedBy', 'name email');

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        if (job.requestStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'No pending request for this job'
            });
        }

        const rejectedTech = job.requestedBy;

        job.status = 'available'; // Back to pool
        job.requestStatus = 'rejected';
        job.rejectedReason = req.body.reason || 'No reason provided';
        job.requestedBy = null;
        job.assignmentType = null;
        job.approvalToken = null;
        await job.save();

        // Notify tech of rejection
        try {
            await sendJobApprovalNotification(rejectedTech, {
                jobTitle: job.title,
                approved: false,
                reason: job.rejectedReason,
                managerName: req.user.name
            });
        } catch (notifyError) {
            console.log('Tech notification failed:', notifyError.message);
        }

        res.json({
            success: true,
            data: job,
            message: 'Job request rejected'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/jobs/:id/assign
// @desc    Manager directly assigns job to tech
// @access  Private/Manager
router.post('/:id/assign', protect, managerOnly, async (req, res) => {
    try {
        const { techId } = req.body;

        const job = await Job.findById(req.params.id);
        const tech = await User.findById(techId);

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        if (!tech || tech.role !== 'technician') {
            return res.status(404).json({
                success: false,
                error: 'Technician not found'
            });
        }

        // Check if tech has required certification
        if (!tech.certifications.includes(job.requiredCert)) {
            return res.status(400).json({
                success: false,
                error: `${tech.name} doesn't have ${job.requiredCert} certification`
            });
        }

        job.status = 'available';
        job.assignedTech = techId;
        job.assignmentType = 'direct';
        job.requestStatus = 'approved';
        job.approvedBy = req.user._id;
        job.approvedAt = new Date();
        await job.save();

        // Notify tech of assignment
        try {
            await sendJobApprovalNotification(tech, {
                jobTitle: job.title,
                approved: true,
                managerName: req.user.name,
                directAssignment: true
            });
        } catch (notifyError) {
            console.log('Tech notification failed:', notifyError.message);
        }

        res.json({
            success: true,
            data: job,
            message: `Job assigned to ${tech.name}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/jobs/:id/reassign
// @desc    Manager force-reassigns job (even mid-progress)
// @access  Private/Manager
router.post('/:id/reassign', protect, managerOnly, async (req, res) => {
    try {
        const { techId, reason } = req.body;

        const job = await Job.findById(req.params.id).populate('assignedTech', 'name email');
        const newTech = await User.findById(techId);

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        if (!newTech || newTech.role !== 'technician') {
            return res.status(404).json({
                success: false,
                error: 'Technician not found'
            });
        }

        // Check if new tech has required certification
        if (!newTech.certifications.includes(job.requiredCert)) {
            return res.status(400).json({
                success: false,
                error: `${newTech.name} doesn't have ${job.requiredCert} certification`
            });
        }

        const previousTech = job.assignedTech;
        const wasInProgress = job.status === 'in-progress';

        // Reset job status if it was in progress
        if (wasInProgress) {
            job.status = 'available';
            job.startedAt = null;
        }

        job.assignedTech = techId;
        job.assignmentType = 'direct';
        job.notes = `Reassigned from ${previousTech?.name || 'unassigned'} to ${newTech.name}. Reason: ${reason || 'Manager decision'}`;
        await job.save();

        // Notify new tech
        try {
            await sendJobApprovalNotification(newTech, {
                jobTitle: job.title,
                approved: true,
                managerName: req.user.name,
                directAssignment: true,
                reassigned: true
            });
        } catch (e) { }

        res.json({
            success: true,
            data: job,
            message: `Job reassigned to ${newTech.name}`,
            wasInProgress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

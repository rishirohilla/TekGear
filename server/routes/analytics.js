const express = require('express');
const Job = require('../models/Job');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { managerOnly } = require('../middleware/rbac');

const router = express.Router();

// @route   GET /api/analytics/leaderboard
// @desc    Get technician leaderboard by efficiency ratio
// @access  Private/Manager
router.get('/leaderboard', protect, managerOnly, async (req, res) => {
    try {
        const technicians = await User.find({ role: 'technician', isActive: true });

        const leaderboard = await Promise.all(technicians.map(async (tech) => {
            const completedJobs = await Job.find({
                assignedTech: tech._id,
                status: 'completed'
            });

            const totalBookTime = completedJobs.reduce((acc, job) => acc + job.bookTime, 0);
            const totalActualTime = completedJobs.reduce((acc, job) => acc + (job.actualTime || job.bookTime), 0);
            const totalTimeSaved = completedJobs.reduce((acc, job) => acc + (job.timeSaved || 0), 0);
            const totalIncentive = completedJobs.reduce((acc, job) => acc + (job.incentiveEarned || 0), 0);

            // Efficiency ratio = Flagged Hours / Clocked Hours (higher is better)
            const efficiencyRatio = totalActualTime > 0 ? (totalBookTime / totalActualTime) : 1;

            return {
                techId: tech._id,
                name: tech.name,
                certifications: tech.certifications,
                jobsCompleted: completedJobs.length,
                totalBookTime,
                totalActualTime,
                totalTimeSaved,
                totalIncentive,
                efficiencyRatio: Math.round(efficiencyRatio * 100) / 100,
                weeklyEarnings: tech.weeklyEarnings
            };
        }));

        // Sort by efficiency ratio (highest first)
        leaderboard.sort((a, b) => b.efficiencyRatio - a.efficiencyRatio);

        res.json({
            success: true,
            data: leaderboard
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/analytics/bottlenecks
// @desc    Get job types that consistently take longer than book time
// @access  Private/Manager
router.get('/bottlenecks', protect, managerOnly, async (req, res) => {
    try {
        const completedJobs = await Job.find({ status: 'completed' });

        // Group by certification type
        const certGroups = {};
        completedJobs.forEach(job => {
            if (!certGroups[job.requiredCert]) {
                certGroups[job.requiredCert] = {
                    cert: job.requiredCert,
                    jobs: [],
                    totalBookTime: 0,
                    totalActualTime: 0,
                    overTimeCount: 0
                };
            }
            certGroups[job.requiredCert].jobs.push(job);
            certGroups[job.requiredCert].totalBookTime += job.bookTime;
            certGroups[job.requiredCert].totalActualTime += job.actualTime || job.bookTime;
            if ((job.actualTime || 0) > job.bookTime) {
                certGroups[job.requiredCert].overTimeCount++;
            }
        });

        const bottlenecks = Object.values(certGroups).map(group => ({
            certification: group.cert,
            totalJobs: group.jobs.length,
            avgBookTime: Math.round(group.totalBookTime / group.jobs.length),
            avgActualTime: Math.round(group.totalActualTime / group.jobs.length),
            overTimePercentage: Math.round((group.overTimeCount / group.jobs.length) * 100),
            timeLoss: group.totalActualTime - group.totalBookTime,
            isBottleneck: group.totalActualTime > group.totalBookTime
        }));

        // Sort by time loss (biggest bottlenecks first)
        bottlenecks.sort((a, b) => b.timeLoss - a.timeLoss);

        res.json({
            success: true,
            data: bottlenecks.filter(b => b.isBottleneck)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/analytics/training-suggestions
// @desc    Identify techs who are slow at certain certified tasks
// @access  Private/Manager
router.get('/training-suggestions', protect, managerOnly, async (req, res) => {
    try {
        const technicians = await User.find({ role: 'technician', isActive: true });
        const suggestions = [];

        for (const tech of technicians) {
            for (const cert of tech.certifications) {
                const jobs = await Job.find({
                    assignedTech: tech._id,
                    requiredCert: cert,
                    status: 'completed'
                });

                if (jobs.length >= 3) { // Need at least 3 jobs to make a suggestion
                    const totalBookTime = jobs.reduce((acc, job) => acc + job.bookTime, 0);
                    const totalActualTime = jobs.reduce((acc, job) => acc + (job.actualTime || job.bookTime), 0);
                    const avgEfficiency = totalBookTime / totalActualTime;

                    // If consistently over time (efficiency < 0.9)
                    if (avgEfficiency < 0.9) {
                        const overTimeJobs = jobs.filter(j => (j.actualTime || 0) > j.bookTime).length;
                        suggestions.push({
                            techId: tech._id,
                            techName: tech.name,
                            certification: cert,
                            jobsAnalyzed: jobs.length,
                            avgEfficiency: Math.round(avgEfficiency * 100) / 100,
                            overTimePercentage: Math.round((overTimeJobs / jobs.length) * 100),
                            suggestedTraining: `Advanced ${cert} Training`,
                            priority: avgEfficiency < 0.7 ? 'High' : avgEfficiency < 0.85 ? 'Medium' : 'Low',
                            potentialTimeSavings: totalActualTime - totalBookTime
                        });
                    }
                }
            }
        }

        // Sort by priority
        const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
        suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        res.json({
            success: true,
            count: suggestions.length,
            data: suggestions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/analytics/overview
// @desc    Get overall dashboard statistics
// @access  Private/Manager
router.get('/overview', protect, managerOnly, async (req, res) => {
    try {
        const totalTechs = await User.countDocuments({ role: 'technician', isActive: true });
        const totalJobs = await Job.countDocuments();
        const completedJobs = await Job.countDocuments({ status: 'completed' });
        const inProgressJobs = await Job.countDocuments({ status: 'in-progress' });
        const availableJobs = await Job.countDocuments({ status: 'available' });

        const completedJobsData = await Job.find({ status: 'completed' });
        const totalTimeSaved = completedJobsData.reduce((acc, job) => acc + (job.timeSaved || 0), 0);
        const totalIncentivesPaid = completedJobsData.reduce((acc, job) => acc + (job.incentiveEarned || 0), 0);
        const totalBookTime = completedJobsData.reduce((acc, job) => acc + job.bookTime, 0);
        const totalActualTime = completedJobsData.reduce((acc, job) => acc + (job.actualTime || job.bookTime), 0);

        const overallEfficiency = totalActualTime > 0 ? (totalBookTime / totalActualTime) : 1;

        res.json({
            success: true,
            data: {
                totalTechs,
                totalJobs,
                completedJobs,
                inProgressJobs,
                availableJobs,
                totalTimeSaved,
                totalIncentivesPaid,
                overallEfficiency: Math.round(overallEfficiency * 100) / 100
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/analytics/weekly-trends
// @desc    Get weekly performance trends
// @access  Private/Manager
router.get('/weekly-trends', protect, managerOnly, async (req, res) => {
    try {
        const weeks = 8; // Last 8 weeks
        const trends = [];
        const now = new Date();

        for (let i = 0; i < weeks; i++) {
            const weekEnd = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
            const weekStart = new Date(weekEnd.getTime() - (7 * 24 * 60 * 60 * 1000));

            const jobs = await Job.find({
                status: 'completed',
                completedAt: { $gte: weekStart, $lt: weekEnd }
            });

            const totalBookTime = jobs.reduce((acc, job) => acc + job.bookTime, 0);
            const totalActualTime = jobs.reduce((acc, job) => acc + (job.actualTime || job.bookTime), 0);
            const totalIncentives = jobs.reduce((acc, job) => acc + (job.incentiveEarned || 0), 0);

            trends.unshift({
                weekStart: weekStart.toISOString().split('T')[0],
                weekEnd: weekEnd.toISOString().split('T')[0],
                jobsCompleted: jobs.length,
                efficiency: totalActualTime > 0 ? Math.round((totalBookTime / totalActualTime) * 100) / 100 : 1,
                incentivesPaid: totalIncentives
            });
        }

        res.json({
            success: true,
            data: trends
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

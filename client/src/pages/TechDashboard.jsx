import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { jobsAPI, usersAPI, incentiveRulesAPI } from '../services/api';
import Navbar from '../components/common/Navbar';
import NotificationToast, { useNotifications } from '../components/common/NotificationToast';
import AvailableJobs from '../components/technician/AvailableJobs';
import JobTimer from '../components/technician/JobTimer';
import EarningsProgress from '../components/technician/EarningsProgress';
import {
    Zap, Clock, DollarSign, Target, Award, Briefcase,
    TrendingUp, Calendar, ChevronRight
} from 'lucide-react';

const TechDashboard = () => {
    const { user, updateUser } = useAuth();
    const { isDark } = useTheme();
    const [activeJob, setActiveJob] = useState(null);
    const [stats, setStats] = useState(null);
    const [activeRule, setActiveRule] = useState(null);
    const [loading, setLoading] = useState(true);
    const { notifications, removeNotification, showBonus, showSuccess, showError } = useNotifications();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [myJobsRes, statsRes, ruleRes] = await Promise.all([
                jobsAPI.getMyJobs(),
                usersAPI.getStats(user.id),
                incentiveRulesAPI.getActive().catch(() => ({ data: { data: null } }))
            ]);

            // Find active in-progress job
            const inProgress = myJobsRes.data.data.find(j => j.status === 'in-progress');
            setActiveJob(inProgress || null);
            setStats(statsRes.data.data);
            setActiveRule(ruleRes.data.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJobStart = async (job) => {
        try {
            const response = await jobsAPI.start(job._id);
            setActiveJob(response.data.data);
            showSuccess(response.data.message, 'Job Started!');
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to start job');
        }
    };

    const handleJobComplete = async (actualTime) => {
        if (!activeJob) return;

        try {
            const response = await jobsAPI.complete(activeJob._id, { actualTime });
            const { incentive } = response.data;

            if (incentive.incentiveEarned > 0) {
                showBonus(incentive.incentiveEarned, incentive.timeSaved);

                // Update user earnings
                updateUser({
                    ...user,
                    weeklyEarnings: (user.weeklyEarnings || 0) + incentive.incentiveEarned
                });
            } else {
                showSuccess(incentive.message, 'Job Completed');
            }

            setActiveJob(null);
            loadData();
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to complete job');
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${isDark ? 'bg-dark-900' : 'bg-gray-100'} flex items-center justify-center`}>
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-dark-900' : 'bg-gray-100'}`}>
            <Navbar />
            <NotificationToast notifications={notifications} onDismiss={removeNotification} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Welcome back, <span className="text-primary-400">{user.name.split(' ')[0]}</span>!
                    </h1>
                    <p className={`mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Ready to beat the clock today?</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <QuickStat
                        icon={Briefcase}
                        value={stats?.totalJobsCompleted || 0}
                        label="Jobs Completed"
                        color="primary"
                    />
                    <QuickStat
                        icon={Clock}
                        value={`${stats?.totalTimeSaved || 0}m`}
                        label="Time Saved"
                        color="green"
                    />
                    <QuickStat
                        icon={DollarSign}
                        value={`$${(stats?.totalIncentiveEarned || 0).toFixed(0)}`}
                        label="Total Earned"
                        color="yellow"
                    />
                    <QuickStat
                        icon={TrendingUp}
                        value={`${(stats?.progressToGoal || 0).toFixed(0)}%`}
                        label="Weekly Goal"
                        color="blue"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Active Job or Available Jobs */}
                    <div className="lg:col-span-2 space-y-6">
                        {activeJob ? (
                            <JobTimer
                                job={activeJob}
                                onComplete={handleJobComplete}
                                incentiveRule={activeRule}
                            />
                        ) : (
                            <AvailableJobs
                                certifications={user.certifications}
                                onStartJob={handleJobStart}
                            />
                        )}

                        {/* Certifications */}
                        <div className="glass-card p-5">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-primary-400" />
                                Your Certifications
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {user.certifications.map((cert) => (
                                    <span key={cert} className="badge-primary text-sm py-1.5 px-3">
                                        {cert}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-dark-500 mt-3">
                                Jobs matching your certifications will appear in your available jobs list
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Earnings Progress */}
                    <div className="space-y-6">
                        <EarningsProgress
                            weeklyEarnings={stats?.weeklyEarnings || user.weeklyEarnings || 0}
                            weeklyGoal={stats?.weeklyBonusGoal || user.weeklyBonusGoal || 500}
                            progressToGoal={stats?.progressToGoal || 0}
                        />

                        {/* Incentive Info */}
                        {activeRule && (
                            <div className="glass-card p-5 border-primary-500/30 bg-primary-500/5">
                                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-primary-400" />
                                    Active Incentive
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-sm text-dark-300">{activeRule.name}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-primary-400">{activeRule.timeSavedThreshold}</p>
                                            <p className="text-xs text-dark-500">mins threshold</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-dark-500" />
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-green-400">${activeRule.bonusPerUnit}</p>
                                            <p className="text-xs text-dark-500">bonus</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

// Quick Stat Component
const QuickStat = ({ icon: Icon, value, label, color }) => {
    const colorClasses = {
        primary: 'bg-primary-500/20 text-primary-400',
        green: 'bg-green-500/20 text-green-400',
        yellow: 'bg-yellow-500/20 text-yellow-400',
        blue: 'bg-blue-500/20 text-blue-400'
    };

    return (
        <div className="glass-card p-4">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="stat-value text-xl">{value}</p>
                    <p className="stat-label text-xs">{label}</p>
                </div>
            </div>
        </div>
    );
};

export default TechDashboard;

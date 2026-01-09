import { useState, useEffect } from 'react';
import { jobsAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import {
    Briefcase, Clock, Tag, Car, PlayCircle, Send,
    Loader2, AlertCircle, ChevronRight, CheckCircle, XCircle, Hourglass
} from 'lucide-react';

const AvailableJobs = ({ certifications, onStartJob, onRequestJob }) => {
    const { isDark } = useTheme();
    const [jobs, setJobs] = useState([]);
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const [availableRes, myJobsRes] = await Promise.all([
                jobsAPI.getAll(),
                jobsAPI.getMyJobs()
            ]);
            setJobs(availableRes.data.data);
            setMyJobs(myJobsRes.data.data);
        } catch (error) {
            console.error('Failed to load jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestJob = async (job) => {
        setActionLoading(job._id);
        try {
            await jobsAPI.request(job._id);
            loadJobs(); // Refresh to show pending status
        } catch (error) {
            console.error('Failed to request job:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleStartJob = async (job) => {
        setActionLoading(job._id);
        await onStartJob(job);
        setActionLoading(null);
    };

    const getPriorityStyles = (priority) => {
        switch (priority) {
            case 'urgent': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
            case 'high': return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' };
            case 'medium': return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' };
            case 'low': return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' };
            default: return { bg: isDark ? 'bg-dark-600' : 'bg-gray-100', text: isDark ? 'text-dark-400' : 'text-gray-500', border: isDark ? 'border-dark-600' : 'border-gray-200' };
        }
    };

    // Find approved jobs assigned to me that I can start
    const approvedJobs = myJobs.filter(j =>
        j.status === 'available' && j.requestStatus === 'approved'
    );

    // Filter out jobs that are pending my approval or already assigned
    const requestableJobs = jobs.filter(j =>
        j.status === 'available' && j.requestStatus !== 'pending'
    );

    if (loading) {
        return (
            <div className="glass-card p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Approved Jobs - Ready to Start */}
            {approvedJobs.length > 0 && (
                <div className="space-y-4">
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        Ready to Start
                        <span className="badge bg-green-500/20 text-green-400 text-xs ml-2">
                            {approvedJobs.length} approved
                        </span>
                    </h2>
                    <div className="grid gap-4">
                        {approvedJobs.map((job) => {
                            const priority = getPriorityStyles(job.priority);
                            return (
                                <div
                                    key={job._id}
                                    className={`glass-card p-5 border border-green-500/30 bg-green-500/5`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="badge bg-green-500/20 text-green-400 text-xs">
                                                    ✓ Approved
                                                </span>
                                                <span className="badge-primary text-xs">
                                                    {job.requiredCert}
                                                </span>
                                            </div>
                                            <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{job.title}</h3>
                                            <div className="flex items-center gap-4 mt-3">
                                                {job.vehicleInfo?.make && (
                                                    <span className={`flex items-center gap-1 text-sm ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                                        <Car className="w-4 h-4" />
                                                        {job.vehicleInfo.make} {job.vehicleInfo.model}
                                                    </span>
                                                )}
                                                <span className={`flex items-center gap-1 text-sm ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                                    <Clock className="w-4 h-4" />
                                                    {job.bookTime} min book time
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleStartJob(job)}
                                            disabled={actionLoading === job._id}
                                            className="btn-primary ml-4 whitespace-nowrap"
                                        >
                                            {actionLoading === job._id ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <PlayCircle className="w-5 h-5 mr-2" />
                                                    Start Job
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Available Jobs - Request to Work */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                        <Briefcase className="w-5 h-5 text-primary-400" />
                        Available Jobs
                    </h2>
                    <button onClick={loadJobs} className="text-sm text-primary-400 hover:text-primary-300">
                        Refresh
                    </button>
                </div>

                {requestableJobs.length === 0 ? (
                    <div className="glass-card p-8 text-center">
                        <div className={`w-16 h-16 ${isDark ? 'bg-dark-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                            <Briefcase className={`w-8 h-8 ${isDark ? 'text-dark-500' : 'text-gray-400'}`} />
                        </div>
                        <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>No Jobs Available</h3>
                        <p className={`text-sm mt-2 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                            Jobs matching your certifications ({certifications.join(', ')}) will appear here
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {requestableJobs.map((job) => {
                            const priority = getPriorityStyles(job.priority);
                            return (
                                <div
                                    key={job._id}
                                    className={`glass-card p-5 border ${priority.border} hover:border-primary-500/50 transition-all`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`badge ${priority.bg} ${priority.text} text-xs`}>
                                                    {job.priority}
                                                </span>
                                                <span className="badge-primary text-xs">
                                                    {job.requiredCert}
                                                </span>
                                            </div>

                                            <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{job.title}</h3>

                                            {job.description && (
                                                <p className={`text-sm mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{job.description}</p>
                                            )}

                                            <div className="flex items-center gap-4 mt-3">
                                                {job.vehicleInfo?.make && (
                                                    <span className={`flex items-center gap-1 text-sm ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                                        <Car className="w-4 h-4" />
                                                        {job.vehicleInfo.make} {job.vehicleInfo.model}
                                                    </span>
                                                )}
                                                <span className={`flex items-center gap-1 text-sm ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                                    <Clock className="w-4 h-4" />
                                                    {job.bookTime} min book time
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleRequestJob(job)}
                                            disabled={actionLoading === job._id}
                                            className="btn-secondary ml-4 whitespace-nowrap"
                                        >
                                            {actionLoading === job._id ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5 mr-2" />
                                                    Request Job
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Potential Earnings Preview */}
                                    <div className={`mt-4 pt-4 border-t ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
                                        <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                            <AlertCircle className="w-3 h-3" />
                                            <span>Beat the {job.bookTime} min book time to earn efficiency bonuses</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pending Requests Info */}
            {myJobs.some(j => j.requestStatus === 'pending') && (
                <div className="glass-card p-4 border border-yellow-500/30 bg-yellow-500/5">
                    <div className="flex items-center gap-3">
                        <Hourglass className="w-5 h-5 text-yellow-400 animate-pulse" />
                        <div>
                            <p className="text-yellow-400 font-medium">Pending Approval</p>
                            <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                You have {myJobs.filter(j => j.requestStatus === 'pending').length} job request(s) waiting for manager approval
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvailableJobs;

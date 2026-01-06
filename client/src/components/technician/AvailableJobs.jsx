import { useState, useEffect } from 'react';
import { jobsAPI } from '../../services/api';
import {
    Briefcase, Clock, Tag, Car, PlayCircle,
    Loader2, AlertCircle, ChevronRight
} from 'lucide-react';

const AvailableJobs = ({ certifications, onStartJob }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startingJob, setStartingJob] = useState(null);

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const response = await jobsAPI.getAll();
            setJobs(response.data.data);
        } catch (error) {
            console.error('Failed to load jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartJob = async (job) => {
        setStartingJob(job._id);
        await onStartJob(job);
        setStartingJob(null);
    };

    const getPriorityStyles = (priority) => {
        switch (priority) {
            case 'urgent': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
            case 'high': return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' };
            case 'medium': return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' };
            case 'low': return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' };
            default: return { bg: 'bg-dark-600', text: 'text-dark-400', border: 'border-dark-600' };
        }
    };

    if (loading) {
        return (
            <div className="glass-card p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary-400" />
                    Available Jobs
                </h2>
                <button onClick={loadJobs} className="text-sm text-primary-400 hover:text-primary-300">
                    Refresh
                </button>
            </div>

            {jobs.length === 0 ? (
                <div className="glass-card p-8 text-center">
                    <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-dark-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white">No Jobs Available</h3>
                    <p className="text-dark-400 text-sm mt-2">
                        Jobs matching your certifications ({certifications.join(', ')}) will appear here
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {jobs.map((job) => {
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

                                        <h3 className="font-semibold text-white text-lg">{job.title}</h3>

                                        {job.description && (
                                            <p className="text-dark-400 text-sm mt-1">{job.description}</p>
                                        )}

                                        <div className="flex items-center gap-4 mt-3">
                                            {job.vehicleInfo?.make && (
                                                <span className="flex items-center gap-1 text-sm text-dark-300">
                                                    <Car className="w-4 h-4" />
                                                    {job.vehicleInfo.make} {job.vehicleInfo.model}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-sm text-dark-300">
                                                <Clock className="w-4 h-4" />
                                                {job.bookTime} min book time
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleStartJob(job)}
                                        disabled={startingJob === job._id}
                                        className="btn-primary ml-4 whitespace-nowrap"
                                    >
                                        {startingJob === job._id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <PlayCircle className="w-5 h-5 mr-2" />
                                                Start Job
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Potential Earnings Preview */}
                                <div className="mt-4 pt-4 border-t border-dark-700">
                                    <div className="flex items-center gap-2 text-xs text-dark-400">
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
    );
};

export default AvailableJobs;

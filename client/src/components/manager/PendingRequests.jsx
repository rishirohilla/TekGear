import { useState, useEffect } from 'react';
import { jobsAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import {
    Clock, User, Award, CheckCircle, XCircle,
    Loader2, AlertCircle, Inbox
} from 'lucide-react';

const PendingRequests = () => {
    const { isDark } = useTheme();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(null);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const response = await jobsAPI.getPendingRequests();
            setRequests(response.data.data);
        } catch (error) {
            console.error('Failed to load requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (jobId) => {
        setActionLoading(jobId);
        try {
            await jobsAPI.approve(jobId);
            setRequests(prev => prev.filter(r => r._id !== jobId));
        } catch (error) {
            console.error('Failed to approve:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (jobId) => {
        setActionLoading(jobId);
        try {
            await jobsAPI.reject(jobId, { reason: rejectReason || 'No reason provided' });
            setRequests(prev => prev.filter(r => r._id !== jobId));
            setShowRejectModal(null);
            setRejectReason('');
        } catch (error) {
            console.error('Failed to reject:', error);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Pending Job Requests</h2>
                    <p className={`text-sm mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                        Technicians waiting for your approval to start jobs
                    </p>
                </div>
                <div className="badge-primary text-lg px-4 py-2">
                    {requests.length} Pending
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className={`w-20 h-20 ${isDark ? 'bg-dark-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <Inbox className={`w-10 h-10 ${isDark ? 'text-dark-500' : 'text-gray-400'}`} />
                    </div>
                    <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>No Pending Requests</h3>
                    <p className={`text-sm mt-2 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                        All job requests have been processed
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map((request) => (
                        <div key={request._id} className="glass-card p-5 border border-yellow-500/30 bg-yellow-500/5">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-primary-400" />
                                        </div>
                                        <div>
                                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{request.requestedBy?.name}</p>
                                            <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{request.requestedBy?.email}</p>
                                        </div>
                                    </div>

                                    <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{request.title}</h3>

                                    <div className="flex flex-wrap gap-3">
                                        <span className="badge-primary">{request.requiredCert}</span>
                                        <span className={`flex items-center gap-1 text-sm ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                            <Clock className="w-4 h-4" />
                                            {request.bookTime} min book time
                                        </span>
                                        {request.vehicleInfo?.make && (
                                            <span className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                                {request.vehicleInfo.make} {request.vehicleInfo.model}
                                            </span>
                                        )}
                                    </div>

                                    {/* Tech Certifications */}
                                    <div className="mt-3 flex items-center gap-2">
                                        <Award className={`w-4 h-4 ${isDark ? 'text-dark-500' : 'text-gray-400'}`} />
                                        <span className={`text-xs ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>Certifications:</span>
                                        <div className="flex gap-1">
                                            {request.requestedBy?.certifications?.map((cert) => (
                                                <span
                                                    key={cert}
                                                    className={`text-xs px-2 py-0.5 rounded ${cert === request.requiredCert
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : isDark ? 'bg-dark-700 text-dark-400' : 'bg-gray-100 text-gray-500'
                                                        }`}
                                                >
                                                    {cert}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => handleApprove(request._id)}
                                        disabled={actionLoading === request._id}
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        {actionLoading === request._id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4" />
                                        )}
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => setShowRejectModal(request._id)}
                                        disabled={actionLoading === request._id}
                                        className="btn-secondary flex items-center gap-2 text-red-400 hover:text-red-300"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                </div>
                            </div>

                            {/* Requested Time */}
                            <div className={`mt-4 pt-4 border-t ${isDark ? 'border-dark-700' : 'border-gray-200'} flex items-center gap-2 text-xs ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                                <AlertCircle className="w-3 h-3" />
                                Requested {new Date(request.updatedAt).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`${isDark ? 'bg-dark-800 border-dark-600' : 'bg-white border-gray-200'} border rounded-2xl p-6 w-full max-w-md animate-slide-up shadow-2xl`}>
                        <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Reject Request</h3>
                        <p className={`mb-4 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                            Provide a reason for rejecting this job request:
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g., Workload too high, Need different certification..."
                            className="input-field w-full h-24 resize-none"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setShowRejectModal(null)}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleReject(showRejectModal)}
                                disabled={actionLoading === showRejectModal}
                                className="btn-primary flex-1 bg-red-500 hover:bg-red-600"
                            >
                                {actionLoading === showRejectModal ? (
                                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : (
                                    'Confirm Reject'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingRequests;

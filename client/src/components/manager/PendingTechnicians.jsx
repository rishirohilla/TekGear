import { useState, useEffect } from 'react';
import { shopAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import {
    UserCheck, UserX, Clock, Award, Mail,
    RefreshCw, Copy, CheckCircle, AlertCircle
} from 'lucide-react';

const PendingTechnicians = () => {
    const { isDark } = useTheme();
    const [pendingTechs, setPendingTechs] = useState([]);
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [copied, setCopied] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [pendingRes, shopRes] = await Promise.all([
                shopAPI.getPendingTechs(),
                shopAPI.getMyShop()
            ]);
            setPendingTechs(pendingRes.data.data);
            setShop(shopRes.data.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (techId) => {
        setActionLoading(techId);
        try {
            const response = await shopAPI.approveTech(techId);
            setMessage({ type: 'success', text: response.data.message });
            setPendingTechs(prev => prev.filter(t => t._id !== techId));
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to approve' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (techId, reason = '') => {
        setActionLoading(techId);
        try {
            const response = await shopAPI.rejectTech(techId, { reason });
            setMessage({ type: 'success', text: response.data.message });
            setPendingTechs(prev => prev.filter(t => t._id !== techId));
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to reject' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleRegenerateCode = async () => {
        try {
            const response = await shopAPI.regenerateCode();
            setShop(prev => ({ ...prev, code: response.data.data.code }));
            setMessage({ type: 'success', text: 'Shop code regenerated!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to regenerate code' });
        }
    };

    const copyCode = () => {
        if (shop?.code) {
            navigator.clipboard.writeText(shop.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Pending Approvals
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                        Technicians requesting to join your shop
                    </p>
                </div>
                <button
                    onClick={loadData}
                    className="btn-secondary flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* Shop Code Card */}
            {shop && (
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {shop.name}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                Share this code with technicians to join your shop
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`px-6 py-3 rounded-xl font-mono text-xl font-bold ${isDark ? 'bg-dark-700 text-primary-400' : 'bg-gray-100 text-primary-600'
                                }`}>
                                {shop.code}
                            </div>
                            <button
                                onClick={copyCode}
                                className="btn-secondary p-3"
                                title="Copy code"
                            >
                                {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={handleRegenerateCode}
                                className="btn-ghost p-3"
                                title="Generate new code"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pending Technicians List */}
            {pendingTechs.length === 0 ? (
                <div className={`glass-card p-12 text-center ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No pending requests</p>
                    <p className="text-sm mt-1">When technicians request to join, they'll appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingTechs.map((tech) => (
                        <div key={tech._id} className="glass-card p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-dark-700' : 'bg-gray-100'
                                        }`}>
                                        <span className="text-lg font-bold text-primary-400">
                                            {tech.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {tech.name}
                                        </h4>
                                        <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                            <Mail className="w-4 h-4" />
                                            {tech.email}
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {tech.certifications?.map((cert) => (
                                                <span
                                                    key={cert}
                                                    className={`px-2 py-1 rounded-lg text-xs font-medium ${isDark
                                                            ? 'bg-primary-500/20 text-primary-400'
                                                            : 'bg-primary-100 text-primary-700'
                                                        }`}
                                                >
                                                    {cert}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleApprove(tech._id)}
                                        disabled={actionLoading === tech._id}
                                        className="btn-primary flex items-center gap-2 px-4 py-2"
                                    >
                                        <UserCheck className="w-4 h-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(tech._id)}
                                        disabled={actionLoading === tech._id}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${isDark
                                                ? 'border-red-500/50 text-red-400 hover:bg-red-500/10'
                                                : 'border-red-300 text-red-600 hover:bg-red-50'
                                            }`}
                                    >
                                        <UserX className="w-4 h-4" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PendingTechnicians;

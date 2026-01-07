import { useState, useEffect } from 'react';
import { jobsAPI, usersAPI } from '../../services/api';
import {
    Briefcase, Plus, Clock, User, Car, Tag,
    Loader2, CheckCircle, AlertCircle, PlayCircle, X,
    UserPlus, RefreshCw
} from 'lucide-react';

const certOptions = ['EV', 'Engine', 'Brakes', 'Transmission', 'Electrical', 'HVAC', 'Diagnostics'];
const priorityOptions = ['low', 'medium', 'high', 'urgent'];

const JobsManager = () => {
    const [jobs, setJobs] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('all');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requiredCert: 'Engine',
        bookTime: 60,
        priority: 'medium',
        vehicleInfo: { make: '', model: '', year: 2024, vin: '' }
    });

    // Assign/Reassign modal state
    const [showAssignModal, setShowAssignModal] = useState(null);
    const [selectedTech, setSelectedTech] = useState('');
    const [reassignReason, setReassignReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [jobsRes, techsRes] = await Promise.all([
                jobsAPI.getAll(),
                usersAPI.getAll()
            ]);
            setJobs(jobsRes.data.data);
            setTechnicians(techsRes.data.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await jobsAPI.create(formData);
            loadData();
            resetForm();
        } catch (error) {
            console.error('Failed to create job:', error);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setFormData({
            title: '',
            description: '',
            requiredCert: 'Engine',
            bookTime: 60,
            priority: 'medium',
            vehicleInfo: { make: '', model: '', year: 2024, vin: '' }
        });
    };

    const handleAssign = async () => {
        if (!selectedTech || !showAssignModal) return;
        setActionLoading(true);
        try {
            const isReassign = showAssignModal.assignedTech;
            if (isReassign) {
                await jobsAPI.reassign(showAssignModal._id, {
                    techId: selectedTech,
                    reason: reassignReason || 'Manager decision'
                });
            } else {
                await jobsAPI.assign(showAssignModal._id, selectedTech);
            }
            loadData();
            closeAssignModal();
        } catch (error) {
            console.error('Failed to assign:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const closeAssignModal = () => {
        setShowAssignModal(null);
        setSelectedTech('');
        setReassignReason('');
    };

    const getEligibleTechs = (job) => {
        return technicians.filter(t => t.certifications?.includes(job.requiredCert));
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'available': return <AlertCircle className="w-4 h-4 text-blue-400" />;
            case 'pending-approval': return <Clock className="w-4 h-4 text-yellow-400" />;
            case 'in-progress': return <PlayCircle className="w-4 h-4 text-yellow-400" />;
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
            default: return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'badge bg-blue-500/20 text-blue-400';
            case 'pending-approval': return 'badge bg-yellow-500/20 text-yellow-400';
            case 'in-progress': return 'badge bg-orange-500/20 text-orange-400';
            case 'completed': return 'badge bg-green-500/20 text-green-400';
            default: return 'badge bg-dark-600 text-dark-400';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'text-red-400';
            case 'high': return 'text-orange-400';
            case 'medium': return 'text-yellow-400';
            case 'low': return 'text-green-400';
            default: return 'text-dark-400';
        }
    };

    const filteredJobs = jobs.filter(job => {
        if (filter === 'all') return true;
        return job.status === filter;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Briefcase className="w-7 h-7 text-primary-500" />
                        Jobs Management
                    </h1>
                    <p className="text-dark-400 mt-1">Create, assign, and manage service orders</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary">
                    <Plus className="w-5 h-5 mr-2" />
                    New Job
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {['all', 'available', 'pending-approval', 'in-progress', 'completed'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${filter === status
                                ? 'bg-primary-500 text-white'
                                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'}
            `}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </button>
                ))}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">Create New Job</h2>
                            <button onClick={resetForm} className="text-dark-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Job Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input-field"
                                    placeholder="e.g., Brake Pad Replacement"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field resize-none"
                                    rows={2}
                                    placeholder="Job details..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">Required Cert</label>
                                    <select
                                        value={formData.requiredCert}
                                        onChange={(e) => setFormData({ ...formData, requiredCert: e.target.value })}
                                        className="input-field"
                                    >
                                        {certOptions.map(cert => (
                                            <option key={cert} value={cert}>{cert}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">Book Time (mins)</label>
                                    <input
                                        type="number"
                                        value={formData.bookTime}
                                        onChange={(e) => setFormData({ ...formData, bookTime: parseInt(e.target.value) })}
                                        className="input-field"
                                        min={1}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Priority</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {priorityOptions.map(priority => (
                                        <button
                                            key={priority}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, priority })}
                                            className={`
                        py-2 rounded-lg text-sm capitalize transition-all
                        ${formData.priority === priority
                                                    ? 'bg-primary-500/20 border border-primary-500 text-primary-400'
                                                    : 'bg-dark-700 border border-dark-600 text-dark-400 hover:border-dark-500'}
                      `}
                                        >
                                            {priority}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-dark-700 pt-4">
                                <label className="block text-sm font-medium text-dark-300 mb-3">Vehicle Info</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        value={formData.vehicleInfo.make}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            vehicleInfo: { ...formData.vehicleInfo, make: e.target.value }
                                        })}
                                        className="input-field"
                                        placeholder="Make (e.g., Toyota)"
                                    />
                                    <input
                                        type="text"
                                        value={formData.vehicleInfo.model}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            vehicleInfo: { ...formData.vehicleInfo, model: e.target.value }
                                        })}
                                        className="input-field"
                                        placeholder="Model (e.g., Camry)"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={resetForm} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex-1">
                                    Create Job
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign/Reassign Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-6 w-full max-w-md animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">
                                {showAssignModal.assignedTech ? 'Reassign Job' : 'Assign Job'}
                            </h2>
                            <button onClick={closeAssignModal} className="text-dark-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-4 p-3 bg-dark-700 rounded-lg">
                            <p className="text-white font-medium">{showAssignModal.title}</p>
                            <p className="text-sm text-dark-400">{showAssignModal.requiredCert} • {showAssignModal.bookTime} min</p>
                            {showAssignModal.assignedTech && (
                                <p className="text-sm text-yellow-400 mt-1">
                                    Currently assigned to: {showAssignModal.assignedTech.name}
                                </p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Select Technician ({getEligibleTechs(showAssignModal).length} eligible)
                            </label>
                            <select
                                value={selectedTech}
                                onChange={(e) => setSelectedTech(e.target.value)}
                                className="input-field"
                            >
                                <option value="">-- Select Technician --</option>
                                {getEligibleTechs(showAssignModal).map(tech => (
                                    <option key={tech._id} value={tech._id}>
                                        {tech.name} ({tech.certifications.join(', ')})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {showAssignModal.assignedTech && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-dark-300 mb-2">
                                    Reason for Reassignment
                                </label>
                                <input
                                    type="text"
                                    value={reassignReason}
                                    onChange={(e) => setReassignReason(e.target.value)}
                                    className="input-field"
                                    placeholder="e.g., Tech unavailable, priority change..."
                                />
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button onClick={closeAssignModal} className="btn-secondary flex-1">
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={!selectedTech || actionLoading}
                                className="btn-primary flex-1"
                            >
                                {actionLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : showAssignModal.assignedTech ? (
                                    'Reassign'
                                ) : (
                                    'Assign'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Jobs Table */}
            <div className="glass-card overflow-hidden">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Service Order</th>
                            <th>Job</th>
                            <th>Vehicle</th>
                            <th>Cert</th>
                            <th>Book Time</th>
                            <th>Status</th>
                            <th>Assigned</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredJobs.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-8 text-dark-400">
                                    No jobs found
                                </td>
                            </tr>
                        ) : (
                            filteredJobs.map((job) => (
                                <tr key={job._id}>
                                    <td className="font-mono text-xs text-dark-400">{job.serviceOrderNumber}</td>
                                    <td>
                                        <div>
                                            <p className="font-medium text-white">{job.title}</p>
                                            <span className={`text-xs ${getPriorityColor(job.priority)}`}>
                                                {job.priority}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-dark-300">
                                        {job.vehicleInfo?.make} {job.vehicleInfo?.model}
                                    </td>
                                    <td>
                                        <span className="badge-primary">{job.requiredCert}</span>
                                    </td>
                                    <td>
                                        <span className="flex items-center gap-1 text-dark-300">
                                            <Clock className="w-3 h-3" />
                                            {job.bookTime}m
                                        </span>
                                    </td>
                                    <td>
                                        <span className={getStatusColor(job.status)}>
                                            {getStatusIcon(job.status)}
                                            <span className="ml-1">{job.status}</span>
                                        </span>
                                    </td>
                                    <td className="text-dark-300">
                                        {job.assignedTech?.name || '-'}
                                    </td>
                                    <td>
                                        {job.status !== 'completed' && (
                                            <button
                                                onClick={() => setShowAssignModal(job)}
                                                className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${job.assignedTech
                                                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                                        : 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
                                                    }`}
                                            >
                                                {job.assignedTech ? (
                                                    <>
                                                        <RefreshCw className="w-3 h-3" />
                                                        Reassign
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus className="w-3 h-3" />
                                                        Assign
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default JobsManager;


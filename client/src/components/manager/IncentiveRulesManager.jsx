import { useState, useEffect } from 'react';
import { incentiveRulesAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import {
    DollarSign, Plus, Edit2, Trash2, Check, X,
    Clock, Loader2, Zap, AlertCircle
} from 'lucide-react';

const IncentiveRulesManager = () => {
    const { isDark } = useTheme();
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        timeSavedThreshold: 30,
        bonusPerUnit: 10,
        isActive: true
    });

    useEffect(() => {
        loadRules();
    }, []);

    const loadRules = async () => {
        try {
            const response = await incentiveRulesAPI.getAll();
            setRules(response.data.data);
        } catch (error) {
            console.error('Failed to load rules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRule) {
                await incentiveRulesAPI.update(editingRule._id, formData);
            } else {
                await incentiveRulesAPI.create(formData);
            }
            loadRules();
            resetForm();
        } catch (error) {
            console.error('Failed to save rule:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this rule?')) {
            try {
                await incentiveRulesAPI.delete(id);
                loadRules();
            } catch (error) {
                console.error('Failed to delete rule:', error);
            }
        }
    };

    const handleEdit = (rule) => {
        setEditingRule(rule);
        setFormData({
            name: rule.name,
            description: rule.description || '',
            timeSavedThreshold: rule.timeSavedThreshold,
            bonusPerUnit: rule.bonusPerUnit,
            isActive: rule.isActive
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingRule(null);
        setFormData({
            name: '',
            description: '',
            timeSavedThreshold: 30,
            bonusPerUnit: 10,
            isActive: true
        });
    };

    const toggleActive = async (rule) => {
        try {
            await incentiveRulesAPI.update(rule._id, { isActive: !rule.isActive });
            loadRules();
        } catch (error) {
            console.error('Failed to toggle rule:', error);
        }
    };

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
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-3`}>
                        <DollarSign className="w-7 h-7 text-green-500" />
                        Incentive Rules
                    </h1>
                    <p className={`mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Define bonus rules for beating the clock</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Rule
                </button>
            </div>

            {/* Info Card */}
            <div className="glass-card p-5 border-primary-500/30 bg-primary-500/5">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>How Incentive Rules Work</h3>
                        <p className={`text-sm mt-1 ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                            When a technician completes a job in less than the book time, they earn a bonus.
                            The bonus is calculated as: <span className="text-primary-400">(Time Saved ÷ Threshold) × Bonus Per Unit</span>
                        </p>
                        <p className={`text-xs mt-2 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                            Example: If threshold is 30 mins and bonus is $10, saving 45 mins = 1 unit = $10 bonus
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`${isDark ? 'bg-dark-800 border-dark-600' : 'bg-white border-gray-200'} border rounded-2xl p-6 w-full max-w-lg animate-slide-up shadow-2xl`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {editingRule ? 'Edit Rule' : 'Create New Rule'}
                            </h2>
                            <button onClick={resetForm} className={`${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className={`block text-sm font-medium ${isDark ? 'text-dark-300' : 'text-gray-600'} mb-2`}>
                                    Rule Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    placeholder="e.g., Standard Efficiency Bonus"
                                    required
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium ${isDark ? 'text-dark-300' : 'text-gray-600'} mb-2`}>
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field resize-none"
                                    rows={2}
                                    placeholder="Describe this incentive rule..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium ${isDark ? 'text-dark-300' : 'text-gray-600'} mb-2`}>
                                        <Clock className="w-4 h-4 inline mr-1" />
                                        Time Threshold (mins)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.timeSavedThreshold}
                                        onChange={(e) => setFormData({ ...formData, timeSavedThreshold: parseInt(e.target.value) })}
                                        className="input-field"
                                        min={1}
                                        required
                                    />
                                    <p className={`text-xs mt-1 ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>Minutes saved per bonus unit</p>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium ${isDark ? 'text-dark-300' : 'text-gray-600'} mb-2`}>
                                        <DollarSign className="w-4 h-4 inline mr-1" />
                                        Bonus Per Unit ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.bonusPerUnit}
                                        onChange={(e) => setFormData({ ...formData, bonusPerUnit: parseFloat(e.target.value) })}
                                        className="input-field"
                                        min={0}
                                        step={0.01}
                                        required
                                    />
                                    <p className={`text-xs mt-1 ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>Bonus amount per unit</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    className={`w-12 h-6 rounded-full transition-all duration-200 flex items-center ${formData.isActive ? 'bg-primary-500 justify-end' : isDark ? 'bg-dark-600 justify-start' : 'bg-gray-300 justify-start'}`}
                                >
                                    <div className="w-5 h-5 bg-white rounded-full mx-0.5" />
                                </button>
                                <span className={`text-sm ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                    {formData.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={resetForm} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex-1">
                                    {editingRule ? 'Update Rule' : 'Create Rule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rules List */}
            {rules.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className={`w-16 h-16 ${isDark ? 'bg-dark-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <DollarSign className={`w-8 h-8 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                    </div>
                    <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>No Incentive Rules</h3>
                    <p className={`mt-2 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Create your first incentive rule to start rewarding efficiency.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rules.map((rule) => (
                        <div
                            key={rule._id}
                            className={`glass-card p-5 ${rule.isActive ? 'border-primary-500/30' : 'opacity-60'}`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{rule.name}</h3>
                                        {rule.isActive && (
                                            <span className="badge-success text-xs">Active</span>
                                        )}
                                    </div>
                                    {rule.description && (
                                        <p className={`text-sm mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{rule.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleEdit(rule)}
                                        className={`p-2 ${isDark ? 'text-dark-400 hover:text-white hover:bg-dark-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} rounded-lg transition-colors`}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(rule._id)}
                                        className={`p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className={`${isDark ? 'bg-dark-700' : 'bg-gray-100'} rounded-xl p-4 text-center`}>
                                    <p className="text-2xl font-bold text-primary-400">{rule.timeSavedThreshold}</p>
                                    <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>mins / unit</p>
                                </div>
                                <div className={`${isDark ? 'bg-dark-700' : 'bg-gray-100'} rounded-xl p-4 text-center`}>
                                    <p className="text-2xl font-bold text-green-400">${rule.bonusPerUnit}</p>
                                    <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>per unit</p>
                                </div>
                            </div>

                            <div className={`mt-4 pt-4 border-t ${isDark ? 'border-dark-700' : 'border-gray-200'} flex items-center justify-between`}>
                                <span className={`text-xs ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                                    Created by {rule.createdBy?.name || 'System'}
                                </span>
                                <button
                                    onClick={() => toggleActive(rule)}
                                    className={`text-xs ${rule.isActive ? 'text-orange-400' : 'text-primary-400'}`}
                                >
                                    {rule.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default IncentiveRulesManager;

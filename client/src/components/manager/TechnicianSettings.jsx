import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import {
    Users, Settings, Sliders, Target, DollarSign,
    Loader2, Save, RefreshCw, Search
} from 'lucide-react';

const TechnicianSettings = () => {
    const { isDark } = useTheme();
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({});
    const [search, setSearch] = useState('');
    const [editingTech, setEditingTech] = useState(null);
    const [editValues, setEditValues] = useState({ bonusMultiplier: 1, weeklyBonusGoal: 500 });

    useEffect(() => {
        loadTechnicians();
    }, []);

    const loadTechnicians = async () => {
        try {
            const response = await usersAPI.getAll();
            setTechnicians(response.data.data);
        } catch (error) {
            console.error('Failed to load technicians:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (tech) => {
        setEditingTech(tech._id);
        setEditValues({
            bonusMultiplier: tech.bonusMultiplier || 1,
            weeklyBonusGoal: tech.weeklyBonusGoal || 500
        });
    };

    const handleSave = async (techId) => {
        setSaving((prev) => ({ ...prev, [techId]: true }));
        try {
            await usersAPI.updateSettings(techId, editValues);
            setTechnicians((prev) =>
                prev.map((t) =>
                    t._id === techId
                        ? { ...t, bonusMultiplier: editValues.bonusMultiplier, weeklyBonusGoal: editValues.weeklyBonusGoal }
                        : t
                )
            );
            setEditingTech(null);
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setSaving((prev) => ({ ...prev, [techId]: false }));
        }
    };

    const handleResetWeekly = async (techId) => {
        setSaving((prev) => ({ ...prev, [techId]: true }));
        try {
            await usersAPI.resetWeekly(techId);
            setTechnicians((prev) =>
                prev.map((t) => (t._id === techId ? { ...t, weeklyEarnings: 0 } : t))
            );
        } catch (error) {
            console.error('Failed to reset:', error);
        } finally {
            setSaving((prev) => ({ ...prev, [techId]: false }));
        }
    };

    const filteredTechs = technicians.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase())
    );

    const getMultiplierColor = (multiplier) => {
        if (multiplier >= 1.5) return 'text-green-400';
        if (multiplier >= 1) return 'text-primary-400';
        if (multiplier >= 0.5) return 'text-yellow-400';
        return 'text-red-400';
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
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                        <Settings className="w-6 h-6 text-primary-400" />
                        Technician Settings
                    </h2>
                    <p className={`text-sm mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                        Adjust bonus multipliers and weekly goals for each technician
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-dark-500' : 'text-gray-400'}`} />
                <input
                    type="text"
                    placeholder="Search technicians..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field w-full !pl-10"
                />
            </div>

            {/* Technicians Table */}
            <div className="glass-card overflow-hidden">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Technician</th>
                            <th>Certifications</th>
                            <th>Weekly Earnings</th>
                            <th>Weekly Goal</th>
                            <th>Bonus Multiplier</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTechs.map((tech) => (
                            <tr key={tech._id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                                            <span className="text-primary-400 font-bold">
                                                {tech.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{tech.name}</p>
                                            <p className={`text-xs ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>{tech.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-wrap gap-1">
                                        {tech.certifications?.slice(0, 3).map((cert) => (
                                            <span key={cert} className={`badge text-xs ${isDark ? 'bg-dark-700 text-dark-300' : 'bg-gray-100 text-gray-600'}`}>
                                                {cert}
                                            </span>
                                        ))}
                                        {tech.certifications?.length > 3 && (
                                            <span className={`text-xs ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                                                +{tech.certifications.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <span className="text-green-400 font-bold">
                                        ${(tech.weeklyEarnings || 0).toFixed(2)}
                                    </span>
                                </td>
                                <td>
                                    {editingTech === tech._id ? (
                                        <input
                                            type="number"
                                            value={editValues.weeklyBonusGoal}
                                            onChange={(e) =>
                                                setEditValues((prev) => ({
                                                    ...prev,
                                                    weeklyBonusGoal: parseFloat(e.target.value) || 0
                                                }))
                                            }
                                            className="input-field w-24 text-sm"
                                            min="0"
                                        />
                                    ) : (
                                        <span className={isDark ? 'text-white' : 'text-gray-900'}>${tech.weeklyBonusGoal || 500}</span>
                                    )}
                                </td>
                                <td>
                                    {editingTech === tech._id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={editValues.bonusMultiplier}
                                                onChange={(e) =>
                                                    setEditValues((prev) => ({
                                                        ...prev,
                                                        bonusMultiplier: parseFloat(e.target.value) || 1
                                                    }))
                                                }
                                                className="input-field w-20 text-sm"
                                                min="0"
                                                max="3"
                                                step="0.1"
                                            />
                                            <span className={isDark ? 'text-dark-500' : 'text-gray-400'}>×</span>
                                        </div>
                                    ) : (
                                        <span className={`font-bold ${getMultiplierColor(tech.bonusMultiplier || 1)}`}>
                                            {(tech.bonusMultiplier || 1).toFixed(1)}×
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        {editingTech === tech._id ? (
                                            <>
                                                <button
                                                    onClick={() => handleSave(tech._id)}
                                                    disabled={saving[tech._id]}
                                                    className="btn-primary text-sm py-1 px-3"
                                                >
                                                    {saving[tech._id] ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Save className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => setEditingTech(null)}
                                                    className="btn-secondary text-sm py-1 px-3"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(tech)}
                                                    className="btn-secondary text-sm py-1 px-3 flex items-center gap-1"
                                                >
                                                    <Sliders className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleResetWeekly(tech._id)}
                                                    disabled={saving[tech._id]}
                                                    className="btn-secondary text-sm py-1 px-3 text-yellow-400 hover:text-yellow-300"
                                                    title="Reset weekly earnings"
                                                >
                                                    {saving[tech._id] ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Multiplier Legend */}
            <div className="glass-card p-4">
                <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>Bonus Multiplier Guide</h4>
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-400" />
                        <span className={isDark ? 'text-dark-400' : 'text-gray-500'}>0-0.5× Reduced</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-400" />
                        <span className={isDark ? 'text-dark-400' : 'text-gray-500'}>0.5-1× Below Standard</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary-400" />
                        <span className={isDark ? 'text-dark-400' : 'text-gray-500'}>1× Standard</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-400" />
                        <span className={isDark ? 'text-dark-400' : 'text-gray-500'}>1.5-3× High Performer</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TechnicianSettings;

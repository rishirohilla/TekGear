import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import { GraduationCap, AlertCircle, User, Loader2, BookOpen, TrendingUp } from 'lucide-react';

const TrainingSuggester = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSuggestions();
    }, []);

    const loadSuggestions = async () => {
        try {
            const response = await analyticsAPI.getTrainingSuggestions();
            setSuggestions(response.data.data);
        } catch (error) {
            console.error('Failed to load training suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
            case 'Medium': return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' };
            case 'Low': return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' };
            default: return { bg: 'bg-dark-600', text: 'text-dark-300', border: 'border-dark-500' };
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
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <GraduationCap className="w-7 h-7 text-primary-500" />
                    Training Suggester
                </h1>
                <p className="text-dark-400 mt-1">Technicians who are certified but need skill improvement</p>
            </div>

            {suggestions.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">All Technicians Performing Well!</h3>
                    <p className="text-dark-400 mt-2">No training needs identified at this time.</p>
                </div>
            ) : (
                <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="glass-card p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {suggestions.filter(s => s.priority === 'High').length}
                                    </p>
                                    <p className="text-xs text-dark-400">High Priority</p>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {suggestions.filter(s => s.priority === 'Medium').length}
                                    </p>
                                    <p className="text-xs text-dark-400">Medium Priority</p>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                                    <GraduationCap className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {suggestions.filter(s => s.priority === 'Low').length}
                                    </p>
                                    <p className="text-xs text-dark-400">Low Priority</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Suggestion Cards */}
                    <div className="space-y-4">
                        {suggestions.map((suggestion, index) => {
                            const colors = getPriorityColor(suggestion.priority);
                            return (
                                <div
                                    key={`${suggestion.techId}-${suggestion.certification}`}
                                    className={`glass-card p-5 border ${colors.border}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <User className="w-6 h-6 text-primary-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white text-lg">{suggestion.techName}</h3>
                                                <p className="text-dark-400 text-sm mt-1">
                                                    Needs improvement in <span className="text-primary-400 font-medium">{suggestion.certification}</span> tasks
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`badge ${colors.bg} ${colors.text}`}>
                                            {suggestion.priority} Priority
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                                        <div>
                                            <p className="text-xs text-dark-400">Jobs Analyzed</p>
                                            <p className="text-lg font-semibold text-white">{suggestion.jobsAnalyzed}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-dark-400">Avg Efficiency</p>
                                            <p className={`text-lg font-semibold ${colors.text}`}>
                                                {(suggestion.avgEfficiency * 100).toFixed(0)}%
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-dark-400">Over-time Rate</p>
                                            <p className="text-lg font-semibold text-orange-400">{suggestion.overTimePercentage}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-dark-400">Potential Savings</p>
                                            <p className="text-lg font-semibold text-green-400">{suggestion.potentialTimeSavings}m</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-dark-700">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm">
                                                <BookOpen className="w-4 h-4 text-primary-400" />
                                                <span className="text-dark-300">Recommended:</span>
                                                <span className="text-primary-400 font-medium">{suggestion.suggestedTraining}</span>
                                            </div>
                                            <button className="btn-secondary text-sm py-2 px-4">
                                                Schedule Training
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default TrainingSuggester;

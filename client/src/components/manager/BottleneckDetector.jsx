import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import { AlertTriangle, Clock, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const BottleneckDetector = () => {
    const [bottlenecks, setBottlenecks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBottlenecks();
    }, []);

    const loadBottlenecks = async () => {
        try {
            const response = await analyticsAPI.getBottlenecks();
            setBottlenecks(response.data.data);
        } catch (error) {
            console.error('Failed to load bottlenecks:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (percentage) => {
        if (percentage >= 60) return { bg: 'bg-red-500/20', text: 'text-red-400', bar: '#ef4444' };
        if (percentage >= 40) return { bg: 'bg-orange-500/20', text: 'text-orange-400', bar: '#f97316' };
        if (percentage >= 20) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', bar: '#eab308' };
        return { bg: 'bg-primary-500/20', text: 'text-primary-400', bar: '#4cad9a' };
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
                    <AlertTriangle className="w-7 h-7 text-orange-500" />
                    Bottleneck Detector
                </h1>
                <p className="text-dark-400 mt-1">Job types consistently exceeding book time (Loss makers)</p>
            </div>

            {bottlenecks.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingDown className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">No Bottlenecks Detected!</h3>
                    <p className="text-dark-400 mt-2">All job types are performing within or under book time.</p>
                </div>
            ) : (
                <>
                    {/* Overview Alert */}
                    <div className="glass-card p-5 border-orange-500/30 bg-orange-500/5">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Attention Required</h3>
                                <p className="text-dark-300 text-sm mt-1">
                                    {bottlenecks.length} job type{bottlenecks.length > 1 ? 's are' : ' is'} consistently exceeding book time.
                                    Total time loss: <span className="text-orange-400 font-semibold">
                                        {bottlenecks.reduce((acc, b) => acc + b.timeLoss, 0)} minutes
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Time Loss Chart */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Time Loss by Certification</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={bottlenecks}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="certification" stroke="#666" fontSize={12} />
                                <YAxis stroke="#666" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #333',
                                        borderRadius: '8px'
                                    }}
                                    formatter={(value, name) => [
                                        name === 'timeLoss' ? `${value} mins` : `${value}%`,
                                        name === 'timeLoss' ? 'Time Loss' : 'Over-time %'
                                    ]}
                                />
                                <Bar dataKey="timeLoss" radius={[4, 4, 0, 0]}>
                                    {bottlenecks.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={getSeverityColor(entry.overTimePercentage).bar}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Bottleneck Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bottlenecks.map((bottleneck) => {
                            const colors = getSeverityColor(bottleneck.overTimePercentage);
                            return (
                                <div key={bottleneck.certification} className="glass-card p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`badge text-sm ${colors.bg} ${colors.text}`}>
                                            {bottleneck.certification}
                                        </span>
                                        <span className={`text-xs ${colors.text}`}>
                                            {bottleneck.overTimePercentage}% over time
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-dark-400">Total Jobs</span>
                                            <span className="text-white font-medium">{bottleneck.totalJobs}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-dark-400">Avg Book Time</span>
                                            <span className="text-white font-medium">{bottleneck.avgBookTime}m</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-dark-400">Avg Actual Time</span>
                                            <span className={`font-medium ${colors.text}`}>{bottleneck.avgActualTime}m</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-dark-400">Time Loss</span>
                                            <span className="text-orange-400 font-semibold">+{bottleneck.timeLoss}m</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-dark-700">
                                        <div className="flex items-center gap-2 text-xs text-dark-400">
                                            <Clock className="w-3 h-3" />
                                            <span>Consider reviewing book time estimates</span>
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

export default BottleneckDetector;

import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { Trophy, TrendingUp, Clock, DollarSign, Award, Loader2 } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const Leaderboard = () => {
    const { isDark } = useTheme();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            const response = await analyticsAPI.getLeaderboard();
            setLeaderboard(response.data.data);
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankColor = (rank) => {
        if (rank === 1) return 'bg-yellow-500';
        if (rank === 2) return 'bg-gray-400';
        if (rank === 3) return 'bg-amber-600';
        return isDark ? 'bg-dark-600' : 'bg-gray-200';
    };

    const getRankEmoji = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
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
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-3`}>
                    <Trophy className="w-7 h-7 text-yellow-500" />
                    Efficiency Leaderboard
                </h1>
                <p className={`mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Technicians ranked by Flagged Hours / Clocked Hours ratio</p>
            </div>

            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {/* Second Place */}
                    <div className="glass-card p-6 text-center mt-8">
                        <div className="w-16 h-16 bg-gray-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-3xl">🥈</span>
                        </div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{leaderboard[1]?.name}</h3>
                        <p className="text-2xl font-bold text-gray-400 mt-2">
                            {leaderboard[1]?.efficiencyRatio}x
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Efficiency Ratio</p>
                    </div>

                    {/* First Place */}
                    <div className="glass-card p-6 text-center border-primary-500/50 bg-primary-500/5">
                        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3 ring-4 ring-yellow-500/30">
                            <span className="text-4xl">🥇</span>
                        </div>
                        <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{leaderboard[0]?.name}</h3>
                        <p className="text-3xl font-bold text-primary-400 mt-2">
                            {leaderboard[0]?.efficiencyRatio}x
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Efficiency Ratio</p>
                        <div className="mt-3 flex items-center justify-center gap-2">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs text-yellow-500">Top Performer</span>
                        </div>
                    </div>

                    {/* Third Place */}
                    <div className="glass-card p-6 text-center mt-8">
                        <div className="w-16 h-16 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-3xl">🥉</span>
                        </div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{leaderboard[2]?.name}</h3>
                        <p className="text-2xl font-bold text-amber-500 mt-2">
                            {leaderboard[2]?.efficiencyRatio}x
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Efficiency Ratio</p>
                    </div>
                </div>
            )}

            {/* Efficiency Chart */}
            <div className="glass-card p-6">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Efficiency Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={leaderboard.slice(0, 10)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#e5e7eb'} horizontal={false} />
                        <XAxis type="number" stroke={isDark ? '#666' : '#9ca3af'} fontSize={12} domain={[0, 'auto']} />
                        <YAxis
                            type="category"
                            dataKey="name"
                            stroke={isDark ? '#666' : '#9ca3af'}
                            fontSize={12}
                            width={100}
                            tickFormatter={(value) => value.split(' ')[0]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                                border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`,
                                borderRadius: '8px',
                                color: isDark ? '#fff' : '#111'
                            }}
                            formatter={(value, name) => [
                                name === 'efficiencyRatio' ? `${value}x` : value,
                                name === 'efficiencyRatio' ? 'Efficiency Ratio' : name
                            ]}
                        />
                        <Bar dataKey="efficiencyRatio" radius={[0, 4, 4, 0]}>
                            {leaderboard.slice(0, 10).map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={index === 0 ? '#4cad9a' : index === 1 ? '#9ca3af' : index === 2 ? '#d97706' : '#3d9c8b'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Full Ranking Table */}
            <div className="glass-card overflow-hidden">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Technician</th>
                            <th>Certifications</th>
                            <th>Jobs</th>
                            <th>Time Saved</th>
                            <th>Incentives</th>
                            <th>Efficiency</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((tech, index) => (
                            <tr key={tech.techId}>
                                <td>
                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${index < 3 ? 'text-white' : isDark ? 'text-dark-400' : 'text-gray-500'} ${getRankColor(index + 1)}`}>
                                        {index < 3 ? getRankEmoji(index + 1) : index + 1}
                                    </span>
                                </td>
                                <td className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{tech.name}</td>
                                <td>
                                    <div className="flex flex-wrap gap-1">
                                        {tech.certifications.slice(0, 3).map(cert => (
                                            <span key={cert} className="badge-primary text-xs">
                                                {cert}
                                            </span>
                                        ))}
                                        {tech.certifications.length > 3 && (
                                            <span className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>+{tech.certifications.length - 3}</span>
                                        )}
                                    </div>
                                </td>
                                <td className={isDark ? 'text-dark-300' : 'text-gray-600'}>{tech.jobsCompleted}</td>
                                <td>
                                    <span className="flex items-center gap-1 text-green-400">
                                        <Clock className="w-3 h-3" />
                                        {tech.totalTimeSaved}m
                                    </span>
                                </td>
                                <td>
                                    <span className="flex items-center gap-1 text-yellow-400">
                                        <DollarSign className="w-3 h-3" />
                                        {tech.totalIncentive.toFixed(2)}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-20 h-2 ${isDark ? 'bg-dark-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                                            <div
                                                className="h-full bg-primary-500 rounded-full"
                                                style={{ width: `${Math.min(tech.efficiencyRatio * 100, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-semibold text-primary-400">
                                            {tech.efficiencyRatio}x
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;

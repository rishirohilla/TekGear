import { useState, useEffect } from 'react';
import {
    Users, Briefcase, Clock, DollarSign, TrendingUp,
    AlertTriangle, GraduationCap, Award, BarChart3,
    ChevronRight, Settings, Plus, Zap
} from 'lucide-react';
import { analyticsAPI, jobsAPI, usersAPI, incentiveRulesAPI } from '../services/api';
import Navbar from '../components/common/Navbar';
import Leaderboard from '../components/manager/Leaderboard';
import BottleneckDetector from '../components/manager/BottleneckDetector';
import TrainingSuggester from '../components/manager/TrainingSuggester';
import IncentiveRulesManager from '../components/manager/IncentiveRulesManager';
import JobsManager from '../components/manager/JobsManager';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const ManagerDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [overview, setOverview] = useState(null);
    const [weeklyTrends, setWeeklyTrends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [overviewRes, trendsRes] = await Promise.all([
                analyticsAPI.getOverview(),
                analyticsAPI.getWeeklyTrends()
            ]);
            setOverview(overviewRes.data.data);
            setWeeklyTrends(trendsRes.data.data);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'leaderboard', label: 'Leaderboard', icon: Award },
        { id: 'bottlenecks', label: 'Bottlenecks', icon: AlertTriangle },
        { id: 'training', label: 'Training', icon: GraduationCap },
        { id: 'jobs', label: 'Jobs', icon: Briefcase },
        { id: 'incentives', label: 'Incentive Rules', icon: DollarSign },
    ];

    const COLORS = ['#4cad9a', '#3d9c8b', '#2e7a6d', '#75d2bd', '#a3e1d3'];

    const pieData = overview ? [
        { name: 'Completed', value: overview.completedJobs },
        { name: 'In Progress', value: overview.inProgressJobs },
        { name: 'Available', value: overview.availableJobs }
    ] : [];

    return (
        <div className="min-h-screen bg-dark-900">
            <Navbar />

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 min-h-[calc(100vh-64px)] bg-dark-800/50 border-r border-dark-700 p-4">
                    <div className="mb-6 px-4">
                        <h2 className="text-xs font-semibold text-dark-400 uppercase tracking-wider">
                            Command Center
                        </h2>
                    </div>

                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`sidebar-link w-full ${activeTab === tab.id ? 'active' : ''}`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
                                    <p className="text-dark-400 mt-1">Monitor your dealership's performance</p>
                                </div>
                                <button
                                    onClick={loadData}
                                    className="btn-secondary"
                                >
                                    Refresh Data
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <>
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <StatCard
                                            icon={Users}
                                            label="Active Technicians"
                                            value={overview?.totalTechs || 0}
                                            trend="+2 this week"
                                            color="primary"
                                        />
                                        <StatCard
                                            icon={Briefcase}
                                            label="Jobs Completed"
                                            value={overview?.completedJobs || 0}
                                            trend={`${overview?.inProgressJobs || 0} in progress`}
                                            color="green"
                                        />
                                        <StatCard
                                            icon={Clock}
                                            label="Time Saved"
                                            value={`${overview?.totalTimeSaved || 0}m`}
                                            trend="Total efficiency gains"
                                            color="blue"
                                        />
                                        <StatCard
                                            icon={DollarSign}
                                            label="Incentives Paid"
                                            value={`$${(overview?.totalIncentivesPaid || 0).toFixed(0)}`}
                                            trend="This period"
                                            color="yellow"
                                        />
                                    </div>

                                    {/* Charts Row */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Weekly Trends Chart */}
                                        <div className="lg:col-span-2 glass-card p-6">
                                            <h3 className="text-lg font-semibold text-white mb-4">Weekly Performance</h3>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <LineChart data={weeklyTrends}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                                    <XAxis
                                                        dataKey="weekStart"
                                                        stroke="#666"
                                                        fontSize={12}
                                                        tickFormatter={(value) => value.slice(5)}
                                                    />
                                                    <YAxis stroke="#666" fontSize={12} />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: '#1a1a1a',
                                                            border: '1px solid #333',
                                                            borderRadius: '8px'
                                                        }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="jobsCompleted"
                                                        stroke="#4cad9a"
                                                        strokeWidth={2}
                                                        dot={{ fill: '#4cad9a' }}
                                                        name="Jobs Completed"
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="incentivesPaid"
                                                        stroke="#75d2bd"
                                                        strokeWidth={2}
                                                        dot={{ fill: '#75d2bd' }}
                                                        name="Incentives ($)"
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* Job Status Pie */}
                                        <div className="glass-card p-6">
                                            <h3 className="text-lg font-semibold text-white mb-4">Job Status</h3>
                                            <ResponsiveContainer width="100%" height={250}>
                                                <PieChart>
                                                    <Pie
                                                        data={pieData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={90}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {pieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: '#1a1a1a',
                                                            border: '1px solid #333',
                                                            borderRadius: '8px'
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="flex justify-center gap-4 mt-4">
                                                {pieData.map((entry, index) => (
                                                    <div key={entry.name} className="flex items-center gap-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: COLORS[index] }}
                                                        />
                                                        <span className="text-xs text-dark-400">{entry.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Efficiency Gauge */}
                                    <div className="glass-card p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-white">Overall Efficiency</h3>
                                            <span className="badge-primary">
                                                <TrendingUp className="w-3 h-3 mr-1" />
                                                {((overview?.overallEfficiency || 1) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="relative h-4 bg-dark-700 rounded-full overflow-hidden">
                                            <div
                                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-1000"
                                                style={{ width: `${Math.min((overview?.overallEfficiency || 1) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-sm text-dark-400 mt-2">
                                            Flagged hours vs clocked hours ratio across all technicians
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'leaderboard' && <Leaderboard />}
                    {activeTab === 'bottlenecks' && <BottleneckDetector />}
                    {activeTab === 'training' && <TrainingSuggester />}
                    {activeTab === 'jobs' && <JobsManager />}
                    {activeTab === 'incentives' && <IncentiveRulesManager />}
                </main>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, trend, color }) => {
    const colorClasses = {
        primary: 'bg-primary-500/20 text-primary-400',
        green: 'bg-green-500/20 text-green-400',
        blue: 'bg-blue-500/20 text-blue-400',
        yellow: 'bg-yellow-500/20 text-yellow-400'
    };

    return (
        <div className="glass-card p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-dark-400">{label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{value}</p>
                    <p className="text-xs text-dark-500 mt-1">{trend}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;

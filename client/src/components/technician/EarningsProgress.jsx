import { DollarSign, Target, TrendingUp, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const EarningsProgress = ({ weeklyEarnings, weeklyGoal, progressToGoal }) => {
    const { isDark } = useTheme();
    const milestone25 = weeklyGoal * 0.25;
    const milestone50 = weeklyGoal * 0.50;
    const milestone75 = weeklyGoal * 0.75;

    const getMilestoneStatus = (milestone) => {
        return weeklyEarnings >= milestone;
    };

    return (
        <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Weekly Pulse
                </h3>
                <span className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                    This Week
                </span>
            </div>

            {/* Current Earnings */}
            <div className="text-center mb-6">
                <p className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${weeklyEarnings.toFixed(2)}
                </p>
                <p className={`text-sm mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                    of ${weeklyGoal.toFixed(0)} goal
                </p>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-6">
                <div className={`h-4 ${isDark ? 'bg-dark-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 via-primary-400 to-green-400 rounded-full transition-all duration-1000 relative"
                        style={{ width: `${Math.min(progressToGoal, 100)}%` }}
                    >
                        {progressToGoal > 10 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Zap className="w-3 h-3 text-white animate-pulse" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Milestone Markers */}
                <div className="absolute top-0 left-0 right-0 h-4 flex">
                    <div className={`absolute left-1/4 top-0 bottom-0 w-0.5 ${isDark ? 'bg-dark-500' : 'bg-gray-300'}`} />
                    <div className={`absolute left-1/2 top-0 bottom-0 w-0.5 ${isDark ? 'bg-dark-500' : 'bg-gray-300'}`} />
                    <div className={`absolute left-3/4 top-0 bottom-0 w-0.5 ${isDark ? 'bg-dark-500' : 'bg-gray-300'}`} />
                </div>
            </div>

            {/* Milestones */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                <Milestone
                    value={0}
                    label="Start"
                    achieved={true}
                    isDark={isDark}
                />
                <Milestone
                    value={25}
                    label={`$${milestone25.toFixed(0)}`}
                    achieved={getMilestoneStatus(milestone25)}
                    isDark={isDark}
                />
                <Milestone
                    value={50}
                    label={`$${milestone50.toFixed(0)}`}
                    achieved={getMilestoneStatus(milestone50)}
                    isDark={isDark}
                />
                <Milestone
                    value={75}
                    label={`$${milestone75.toFixed(0)}`}
                    achieved={getMilestoneStatus(milestone75)}
                    isDark={isDark}
                />
            </div>

            {/* Goal Status */}
            {progressToGoal >= 100 ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Target className="w-5 h-5 text-green-400" />
                        <span className="font-semibold text-green-400">Goal Achieved!</span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Keep going to exceed your goal</p>
                </div>
            ) : (
                <div className={`${isDark ? 'bg-dark-800' : 'bg-gray-100'} rounded-xl p-4`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary-400" />
                            <span className={`text-sm ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>To reach goal:</span>
                        </div>
                        <span className="font-semibold text-primary-400">
                            ${(weeklyGoal - weeklyEarnings).toFixed(2)}
                        </span>
                    </div>
                </div>
            )}

            {/* Motivation Message */}
            <p className={`text-center text-xs mt-4 ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                {progressToGoal < 25 && "Start strong! Every job counts towards your bonus goal."}
                {progressToGoal >= 25 && progressToGoal < 50 && "Great start! You're building momentum."}
                {progressToGoal >= 50 && progressToGoal < 75 && "Halfway there! Keep pushing!"}
                {progressToGoal >= 75 && progressToGoal < 100 && "Almost there! The finish line is in sight!"}
                {progressToGoal >= 100 && "You're a champion! Every extra dollar is a bonus now!"}
            </p>
        </div>
    );
};

// Milestone Component
const Milestone = ({ value, label, achieved, isDark }) => {
    return (
        <div className="text-center">
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 text-xs font-bold ${achieved
                    ? 'bg-primary-500 text-white'
                    : isDark ? 'bg-dark-700 text-dark-500' : 'bg-gray-200 text-gray-400'}`}
            >
                {achieved ? '✓' : value}
            </div>
            <p className={`text-xs ${achieved ? 'text-primary-400' : isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                {label}
            </p>
        </div>
    );
};

export default EarningsProgress;

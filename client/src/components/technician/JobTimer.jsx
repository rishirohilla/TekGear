import { useState, useEffect, useRef } from 'react';
import {
    Clock, Play, Pause, CheckCircle, Zap,
    AlertTriangle, Timer, DollarSign
} from 'lucide-react';

const JobTimer = ({ job, onComplete, incentiveRule }) => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [showComplete, setShowComplete] = useState(false);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    useEffect(() => {
        if (job.startedAt) {
            const startTime = new Date(job.startedAt).getTime();
            startTimeRef.current = startTime;

            const updateTimer = () => {
                if (!isPaused) {
                    const now = Date.now();
                    const elapsed = Math.floor((now - startTime) / 1000);
                    setElapsedTime(elapsed);
                }
            };

            updateTimer();
            timerRef.current = setInterval(updateTimer, 1000);

            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
        }
    }, [job.startedAt, isPaused]);

    const bookTimeSeconds = job.bookTime * 60;
    const isOvertime = elapsedTime > bookTimeSeconds;
    const timeDiff = bookTimeSeconds - elapsedTime;
    const progress = Math.min((elapsedTime / bookTimeSeconds) * 100, 100);

    // Calculate potential bonus
    const calculatePotentialBonus = () => {
        if (!incentiveRule || elapsedTime >= bookTimeSeconds) return 0;
        const timeSavedMins = Math.floor(timeDiff / 60);
        const bonusUnits = Math.floor(timeSavedMins / incentiveRule.timeSavedThreshold);
        return bonusUnits * incentiveRule.bonusPerUnit;
    };

    const potentialBonus = calculatePotentialBonus();

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleComplete = () => {
        const actualTimeMinutes = Math.ceil(elapsedTime / 60);
        onComplete(actualTimeMinutes);
    };

    return (
        <div className="glass-card overflow-hidden">
            {/* Header */}
            <div className={`p-4 ${isOvertime ? 'bg-red-500/10' : 'bg-primary-500/10'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOvertime ? 'bg-red-500/20' : 'bg-primary-500/20'}`}>
                            <Timer className={`w-5 h-5 ${isOvertime ? 'text-red-400' : 'text-primary-400'}`} />
                        </div>
                        <div>
                            <p className="text-sm text-dark-400">Currently Working On</p>
                            <h2 className="font-semibold text-white">{job.title}</h2>
                        </div>
                    </div>
                    <span className="badge-primary">{job.requiredCert}</span>
                </div>
            </div>

            {/* Timer Display */}
            <div className="p-6 text-center">
                <div className="relative inline-flex items-center justify-center mb-6">
                    {/* Circular Progress */}
                    <svg className="w-48 h-48 -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-dark-700"
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={2 * Math.PI * 88}
                            strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
                            strokeLinecap="round"
                            className={`transition-all duration-1000 ${isOvertime ? 'text-red-500' : 'text-primary-500'}`}
                        />
                    </svg>

                    <div className="absolute flex flex-col items-center">
                        <span className={`text-4xl font-bold ${isOvertime ? 'text-red-400' : 'text-white'}`}>
                            {formatTime(elapsedTime)}
                        </span>
                        <span className="text-sm text-dark-400 mt-1">
                            {isOvertime ? 'Overtime' : 'Elapsed'}
                        </span>
                    </div>
                </div>

                {/* Time Comparison */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-dark-800 rounded-xl p-4">
                        <p className="text-dark-400 text-sm">Book Time</p>
                        <p className="text-xl font-bold text-white mt-1">{job.bookTime} min</p>
                    </div>
                    <div className={`rounded-xl p-4 ${isOvertime ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                        <p className="text-dark-400 text-sm">Time {isOvertime ? 'Over' : 'Remaining'}</p>
                        <p className={`text-xl font-bold mt-1 ${isOvertime ? 'text-red-400' : 'text-green-400'}`}>
                            {isOvertime ? '+' : ''}{formatTime(Math.abs(timeDiff))}
                        </p>
                    </div>
                </div>

                {/* Potential Bonus */}
                {!isOvertime && incentiveRule && (
                    <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-center gap-2">
                            <Zap className="w-5 h-5 text-primary-400" />
                            <span className="text-dark-300">Potential Bonus:</span>
                            <span className="text-xl font-bold text-primary-400">${potentialBonus.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-dark-500 mt-1">
                            Complete now to earn this bonus!
                        </p>
                    </div>
                )}

                {/* Overtime Warning */}
                {isOvertime && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            <span className="text-red-400 font-medium">Over Book Time</span>
                        </div>
                        <p className="text-xs text-dark-400 mt-1">
                            No bonus available for this job
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        className="btn-secondary flex-1"
                    >
                        {isPaused ? (
                            <>
                                <Play className="w-5 h-5 mr-2" />
                                Resume
                            </>
                        ) : (
                            <>
                                <Pause className="w-5 h-5 mr-2" />
                                Pause
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => setShowComplete(true)}
                        className="btn-primary flex-1"
                    >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Complete Job
                    </button>
                </div>
            </div>

            {/* Complete Confirmation Modal */}
            {showComplete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-6 w-full max-w-md animate-slide-up">
                        <h3 className="text-xl font-semibold text-white mb-4">Complete Job?</h3>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-dark-400">Actual Time:</span>
                                <span className="text-white font-medium">{Math.ceil(elapsedTime / 60)} minutes</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-dark-400">Book Time:</span>
                                <span className="text-white font-medium">{job.bookTime} minutes</span>
                            </div>
                            {!isOvertime && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-dark-400">Bonus Earned:</span>
                                    <span className="text-primary-400 font-bold">${potentialBonus.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowComplete(false)} className="btn-secondary flex-1">
                                Cancel
                            </button>
                            <button onClick={handleComplete} className="btn-primary flex-1">
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobTimer;

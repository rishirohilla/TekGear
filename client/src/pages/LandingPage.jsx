import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
    Zap, ChevronRight, Clock, DollarSign, TrendingUp, Users,
    BarChart3, Award, Shield, Wrench, ArrowRight, Play, Star,
    CheckCircle, Sparkles, Timer, Target, Gauge, LayoutDashboard, LogOut
} from 'lucide-react';

// Generate initials from name
const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Generate consistent color based on name
const getAvatarColor = (name) => {
    const colors = [
        'from-primary-400 to-primary-600',
        'from-blue-400 to-blue-600',
        'from-purple-400 to-purple-600',
        'from-pink-400 to-pink-600',
        'from-orange-400 to-orange-600',
        'from-emerald-400 to-emerald-600'
    ];
    if (!name) return colors[0];
    return colors[name.charCodeAt(0) % colors.length];
};

const LandingPage = () => {
    const { isDark } = useTheme();
    const { user, isManager, logout } = useAuth();
    const [isVisible, setIsVisible] = useState({});
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [scrollY, setScrollY] = useState(0);
    const heroRef = useRef(null);

    // Track mouse for parallax effects
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 30,
                y: (e.clientY / window.innerHeight - 0.5) * 30
            });
        };

        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Intersection observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('[data-animate]').forEach((el) => {
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const features = [
        {
            icon: Timer,
            title: 'Real-Time Job Timer',
            description: 'Track work against book time with precision. Every second counts towards your bonus.',
            color: 'from-primary-500 to-emerald-500'
        },
        {
            icon: DollarSign,
            title: 'Instant Bonus Calculation',
            description: 'Watch your earnings grow in real-time as you beat the clock on every job.',
            color: 'from-yellow-500 to-orange-500'
        },
        {
            icon: BarChart3,
            title: 'AI-Powered Analytics',
            description: 'Identify bottlenecks, optimize scheduling, and maximize shop efficiency.',
            color: 'from-blue-500 to-purple-500'
        },
        {
            icon: Award,
            title: 'Gamified Leaderboards',
            description: 'Foster healthy competition with real-time rankings and achievements.',
            color: 'from-pink-500 to-rose-500'
        }
    ];

    const stats = [
        { value: '35%', label: 'Average Efficiency Increase' },
        { value: '$2,400', label: 'Avg Monthly Tech Bonus' },
        { value: '50%', label: 'Faster Job Turnaround' },
        { value: '99%', label: 'Technician Satisfaction' }
    ];

    return (
        <div className={`min-h-screen ${isDark ? 'bg-dark-900' : 'bg-gray-50'} overflow-hidden`}>
            {/* Animated Background Grid */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark ? '#4cad9a' : '#4cad9a'} 1px, transparent 0)`,
                        backgroundSize: '50px 50px',
                        transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
                    }}
                />
            </div>

            {/* Floating Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[120px]"
                    style={{
                        top: '-200px',
                        right: '-100px',
                        transform: `translate(${mousePosition.x * -0.5}px, ${mousePosition.y * -0.5}px)`
                    }}
                />
                <div
                    className="absolute w-[400px] h-[400px] bg-blue-500/15 rounded-full blur-[100px]"
                    style={{
                        bottom: '10%',
                        left: '-100px',
                        transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`
                    }}
                />
                <div
                    className="absolute w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px]"
                    style={{
                        top: '40%',
                        right: '10%',
                        transform: `translate(${mousePosition.x * 0.4}px, ${mousePosition.y * 0.4}px)`
                    }}
                />
            </div>

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50
                ? isDark ? 'bg-dark-900/80 backdrop-blur-xl border-b border-dark-700' : 'bg-white/80 backdrop-blur-xl border-b border-gray-200'
                : 'bg-transparent'
                }`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div className="absolute -inset-1 bg-primary-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Tek<span className="font-light text-primary-400">Gear</span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {user ? (
                            /* Logged-in user navigation */
                            <>
                                <Link
                                    to={isManager ? '/manager' : '/technician'}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isDark ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span className="hidden sm:inline">Dashboard</span>
                                </Link>

                                <Link
                                    to={isManager ? '/manager' : '/technician'}
                                    className="flex items-center gap-3 group"
                                >
                                    {/* User Avatar */}
                                    <div className="relative">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-primary-500/50 group-hover:border-primary-400 transition-colors"
                                            />
                                        ) : (
                                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(user.name)} flex items-center justify-center text-white font-semibold text-sm border-2 border-white/20 group-hover:scale-105 transition-transform`}>
                                                {getInitials(user.name)}
                                            </div>
                                        )}
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-800" />
                                    </div>

                                    {/* User Name (hidden on mobile) */}
                                    <div className="hidden md:flex flex-col items-start">
                                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {user.name?.split(' ')[0]}
                                        </span>
                                        <span className={`text-xs capitalize ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </Link>

                                <button
                                    onClick={() => logout()}
                                    className={`p-2 rounded-lg transition-all text-red-400 hover:text-red-300 ${isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                                        }`}
                                    title="Log Out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            /* Guest navigation */
                            <>
                                <Link
                                    to="/login"
                                    className={`px-5 py-2 rounded-lg font-medium transition-all ${isDark ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="relative group px-5 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-lg shadow-glow hover:shadow-glow-lg transition-all hover:scale-105"
                                >
                                    <span className="relative z-10">Get Started</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20">
                <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                    {/* Floating Badge */}
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 mb-8 animate-fade-in-up"
                        style={{ animationDelay: '0.1s' }}
                    >
                        <Sparkles className="w-4 h-4 text-primary-400" />
                        <span className={`text-sm ${isDark ? 'text-primary-300' : 'text-primary-600'}`}>
                            The Future of Dealership Productivity
                        </span>
                    </div>

                    {/* Main Headline */}
                    <h1
                        className={`text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ animationDelay: '0.2s' }}
                    >
                        Turn Speed Into
                        <br />
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-primary-400 via-emerald-400 to-primary-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                                Real Money
                            </span>
                            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                                <path
                                    d="M2 10C50 4 100 2 150 4C200 6 250 10 298 4"
                                    stroke="url(#underline-gradient)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    className="animate-draw-line"
                                />
                                <defs>
                                    <linearGradient id="underline-gradient" x1="0" y1="0" x2="300" y2="0">
                                        <stop offset="0%" stopColor="#4cad9a" />
                                        <stop offset="50%" stopColor="#34d399" />
                                        <stop offset="100%" stopColor="#4cad9a" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p
                        className={`text-xl md:text-2xl max-w-3xl mx-auto mb-12 animate-fade-in-up ${isDark ? 'text-dark-300' : 'text-gray-600'}`}
                        style={{ animationDelay: '0.3s' }}
                    >
                        Gamify your service bay. Track efficiency in real-time.
                        <span className="text-primary-400"> Reward technicians instantly.</span>
                    </p>

                    {/* CTA Buttons */}
                    <div
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
                        style={{ animationDelay: '0.4s' }}
                    >
                        <Link
                            to="/signup"
                            className="group relative px-8 py-4 bg-gradient-to-r from-primary-500 to-emerald-500 text-white font-semibold rounded-2xl shadow-glow hover:shadow-glow-lg transition-all hover:scale-105 flex items-center gap-2"
                        >
                            <span>Start Free Trial</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button className={`group px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 transition-all ${isDark
                            ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                            : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'
                            }`}>
                            <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Play className="w-4 h-4 text-primary-400 ml-0.5" />
                            </div>
                            <span>Watch Demo</span>
                        </button>
                    </div>

                    {/* Hero Visual - Floating Dashboard Preview */}
                    <div
                        className="relative mt-20 animate-fade-in-up"
                        style={{
                            animationDelay: '0.5s',
                            transform: `translateY(${scrollY * 0.1}px)`
                        }}
                    >
                        <div className={`relative max-w-4xl mx-auto rounded-2xl overflow-hidden border ${isDark ? 'border-dark-600 bg-dark-800/50' : 'border-gray-200 bg-white/80'
                            } backdrop-blur-xl shadow-2xl`}>
                            {/* Mock Dashboard Header */}
                            <div className={`flex items-center gap-2 px-4 py-3 border-b ${isDark ? 'border-dark-600 bg-dark-800' : 'border-gray-200 bg-gray-50'}`}>
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                </div>
                                <div className={`flex-1 text-center text-sm ${isDark ? 'text-dark-400' : 'text-gray-400'}`}>
                                    TekGear Dashboard
                                </div>
                            </div>

                            {/* Mock Dashboard Content */}
                            <div className="p-6">
                                <div className="grid grid-cols-4 gap-4 mb-6">
                                    {[
                                        { label: 'Jobs Today', value: '12', color: 'primary' },
                                        { label: 'Time Saved', value: '2.4h', color: 'green' },
                                        { label: 'Bonuses Earned', value: '$847', color: 'yellow' },
                                        { label: 'Efficiency', value: '128%', color: 'blue' }
                                    ].map((stat, i) => (
                                        <div
                                            key={i}
                                            className={`p-4 rounded-xl ${isDark ? 'bg-dark-700/50' : 'bg-gray-50'} animate-pulse-slow`}
                                            style={{ animationDelay: `${i * 0.2}s` }}
                                        >
                                            <div className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</div>
                                            <div className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{stat.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Mock Job Timer */}
                                <div className={`p-6 rounded-xl border ${isDark ? 'border-primary-500/30 bg-primary-500/5' : 'border-primary-200 bg-primary-50'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Active Job</div>
                                            <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Engine Oil Change - 2024 Tesla Model 3</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-primary-400 tabular-nums">18:42</div>
                                            <div className="text-xs text-green-400">3 min ahead of book time</div>
                                        </div>
                                    </div>
                                    <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                                        <div className="h-full w-3/4 bg-gradient-to-r from-primary-500 to-green-400 rounded-full animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <div
                            className="absolute -left-10 top-1/4 animate-float"
                            style={{ animationDelay: '0.5s' }}
                        >
                            <div className={`p-4 rounded-2xl ${isDark ? 'bg-dark-800/90' : 'bg-white/90'} backdrop-blur-xl border ${isDark ? 'border-dark-600' : 'border-gray-200'} shadow-xl`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <div className="text-green-400 font-bold">+$42.50</div>
                                        <div className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Bonus Earned!</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            className="absolute -right-10 top-1/3 animate-float"
                            style={{ animationDelay: '1s' }}
                        >
                            <div className={`p-4 rounded-2xl ${isDark ? 'bg-dark-800/90' : 'bg-white/90'} backdrop-blur-xl border ${isDark ? 'border-dark-600' : 'border-gray-200'} shadow-xl`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-primary-400" />
                                    </div>
                                    <div>
                                        <div className="text-primary-400 font-bold">128% Efficiency</div>
                                        <div className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Top Performer</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className={`w-6 h-10 rounded-full border-2 ${isDark ? 'border-dark-500' : 'border-gray-400'} flex items-start justify-center p-1`}>
                        <div className="w-1.5 h-3 bg-primary-400 rounded-full animate-scroll-down" />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div
                        id="stats"
                        data-animate
                        className={`grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-1000 ${isVisible.stats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                            }`}
                    >
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center group">
                                <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-400 to-emerald-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform`}>
                                    {stat.value}
                                </div>
                                <div className={isDark ? 'text-dark-400' : 'text-gray-500'}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Everything You Need to
                            <span className="text-primary-400"> Supercharge</span> Your Shop
                        </h2>
                        <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                            Built by dealership experts. Designed for maximum efficiency and earnings.
                        </p>
                    </div>

                    <div
                        id="features"
                        data-animate
                        className={`grid md:grid-cols-2 gap-6 transition-all duration-1000 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                            }`}
                    >
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className={`group p-8 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${isDark
                                    ? 'bg-dark-800/50 border-dark-600 hover:border-primary-500/50'
                                    : 'bg-white/80 border-gray-200 hover:border-primary-400'
                                    } hover:shadow-xl`}
                                style={{ transitionDelay: `${i * 100}ms` }}
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {feature.title}
                                </h3>
                                <p className={isDark ? 'text-dark-400' : 'text-gray-600'}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className={`relative py-20 ${isDark ? 'bg-dark-800/30' : 'bg-gray-100/50'}`}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            How It Works
                        </h2>
                        <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                            Get started in minutes. Transform your shop in days.
                        </p>
                    </div>

                    <div
                        id="how-it-works"
                        data-animate
                        className={`grid md:grid-cols-3 gap-8 transition-all duration-1000 ${isVisible['how-it-works'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                            }`}
                    >
                        {[
                            { step: '01', title: 'Create Your Shop', description: 'Sign up as a manager, set your incentive rules, and invite your technicians.', icon: Shield },
                            { step: '02', title: 'Assign Jobs', description: 'Create jobs with book times. Technicians request and get approved to work.', icon: Wrench },
                            { step: '03', title: 'Watch Earnings Grow', description: 'Technicians beat the clock, earn bonuses, and your shop efficiency skyrockets.', icon: TrendingUp }
                        ].map((item, i) => (
                            <div key={i} className="relative text-center">
                                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${isDark ? 'bg-dark-700' : 'bg-white'
                                    } border ${isDark ? 'border-dark-600' : 'border-gray-200'} shadow-lg`}>
                                    <item.icon className="w-8 h-8 text-primary-400" />
                                </div>
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-bold">
                                    {item.step}
                                </div>
                                <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {item.title}
                                </h3>
                                <p className={isDark ? 'text-dark-400' : 'text-gray-600'}>
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div
                        id="cta"
                        data-animate
                        className={`relative p-12 rounded-3xl overflow-hidden transition-all duration-1000 ${isVisible.cta ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                            }`}
                    >
                        {/* CTA Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-emerald-500" />
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYtMmgtNHY2aDR2NGgtMnYyaDR2LTZoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                Ready to Transform Your Shop?
                            </h2>
                            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                                Join hundreds of dealerships already using TekGear to boost efficiency and technician earnings.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    to="/signup"
                                    className="group px-8 py-4 bg-white text-primary-600 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
                                >
                                    <span>Get Started Free</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="px-8 py-4 bg-white/10 text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={`py-12 border-t ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Tek<span className="font-light text-primary-400">Gear</span>
                            </span>
                        </div>

                        <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                            © 2025 TekGear. Built for dealership excellence.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Custom Styles */}
            <style jsx>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }

                @keyframes draw-line {
                    from { stroke-dasharray: 0 1000; }
                    to { stroke-dasharray: 1000 0; }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes scroll-down {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(6px); opacity: 0; }
                }

                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                    opacity: 0;
                }

                .animate-gradient {
                    animation: gradient 3s ease-in-out infinite;
                }

                .animate-draw-line {
                    animation: draw-line 1.5s ease-out forwards;
                    animation-delay: 0.5s;
                }

                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }

                .animate-scroll-down {
                    animation: scroll-down 1.5s ease-in-out infinite;
                }

                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default LandingPage;

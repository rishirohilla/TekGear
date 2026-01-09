import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    Zap,
    LogOut,
    User,
    LayoutDashboard,
    Sun,
    Moon,
    Camera,
    ChevronDown,
    Home
} from 'lucide-react';

// Generate initials from name
const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

// Generate consistent color based on name
const getAvatarColor = (name) => {
    const colors = [
        'from-primary-400 to-primary-600',
        'from-blue-400 to-blue-600',
        'from-purple-400 to-purple-600',
        'from-pink-400 to-pink-600',
        'from-orange-400 to-orange-600',
        'from-emerald-400 to-emerald-600',
        'from-cyan-400 to-cyan-600',
        'from-rose-400 to-rose-600'
    ];
    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
};

const Navbar = () => {
    const { user, logout, isManager, updateUser } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('Image must be less than 2MB');
            return;
        }

        setUploading(true);
        try {
            // Convert to base64 for simple storage
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result;
                // Update user avatar in context and storage
                if (updateUser) {
                    await updateUser({ avatar: base64 });
                }
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Failed to upload avatar:', error);
            setUploading(false);
        }
    };

    return (
        <nav className={`${isDark ? 'bg-dark-800/80' : 'bg-white/80'} backdrop-blur-xl border-b ${isDark ? 'border-dark-700' : 'border-gray-200'} sticky top-0 z-50`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo - links to landing page */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 group"
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-glow">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Tek<span className="font-light text-primary-400">Gear</span></span>
                        </div>
                    </Link>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {/* Home Link */}
                        <Link
                            to="/"
                            className={`p-2 rounded-lg transition-all ${isDark ? 'text-dark-300 hover:text-white hover:bg-dark-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                            title="Home"
                        >
                            <Home className="w-5 h-5" />
                        </Link>

                        {/* Dashboard link */}
                        <Link
                            to={isManager ? '/manager' : '/technician'}
                            className={`p-2 rounded-lg transition-all ${isDark ? 'text-dark-300 hover:text-white hover:bg-dark-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                            title="Dashboard"
                        >
                            <LayoutDashboard className="w-5 h-5" />
                        </Link>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-lg transition-all duration-200 ${isDark ? 'bg-dark-700 hover:bg-dark-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* User Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all ${isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-100'
                                    }`}
                            >
                                {/* Avatar */}
                                <div className="relative group">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-9 h-9 rounded-full object-cover border-2 border-primary-500/50"
                                        />
                                    ) : (
                                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(user?.name)} flex items-center justify-center text-white font-semibold text-sm border-2 border-white/20`}>
                                            {getInitials(user?.name)}
                                        </div>
                                    )}
                                    {/* Online indicator */}
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-800" />
                                </div>

                                {/* Name (hidden on mobile) */}
                                <div className="hidden md:flex flex-col items-start">
                                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {user?.name?.split(' ')[0]}
                                    </span>
                                    <span className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'} capitalize`}>
                                        {user?.role}
                                    </span>
                                </div>

                                <ChevronDown className={`w-4 h-4 hidden md:block transition-transform ${showDropdown ? 'rotate-180' : ''} ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {showDropdown && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowDropdown(false)}
                                    />
                                    <div className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-xl z-50 overflow-hidden ${isDark ? 'bg-dark-800 border border-dark-600' : 'bg-white border border-gray-200'
                                        }`}>
                                        {/* User Info Header */}
                                        <div className={`p-4 border-b ${isDark ? 'border-dark-600' : 'border-gray-100'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    {user?.avatar ? (
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.name}
                                                            className="w-12 h-12 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(user?.name)} flex items-center justify-center text-white font-semibold`}>
                                                            {getInitials(user?.name)}
                                                        </div>
                                                    )}
                                                    {/* Camera button overlay */}
                                                    <button
                                                        onClick={handleAvatarClick}
                                                        disabled={uploading}
                                                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                                                    >
                                                        <Camera className="w-4 h-4 text-white" />
                                                    </button>
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                        {user?.name}
                                                    </p>
                                                    <p className={`text-sm truncate ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                                        {user?.email}
                                                    </p>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${user?.role === 'manager'
                                                            ? 'bg-purple-500/20 text-purple-400'
                                                            : 'bg-primary-500/20 text-primary-400'
                                                        }`}>
                                                        {user?.role}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className={`text-xs mt-3 ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                                                Click avatar to change photo
                                            </p>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="p-2">
                                            <Link
                                                to={isManager ? '/manager' : '/technician'}
                                                onClick={() => setShowDropdown(false)}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isDark ? 'hover:bg-dark-700 text-dark-300 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                                                    }`}
                                            >
                                                <LayoutDashboard className="w-4 h-4" />
                                                <span>Dashboard</span>
                                            </Link>

                                            <button
                                                onClick={() => {
                                                    setShowDropdown(false);
                                                    handleLogout();
                                                }}
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-red-400 ${isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                                                    }`}
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Log Out</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

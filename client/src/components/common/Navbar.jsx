import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    Zap,
    LogOut,
    User,
    LayoutDashboard,
    Settings,
    Sun,
    Moon
} from 'lucide-react';

const Navbar = () => {
    const { user, logout, isManager } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className={`${isDark ? 'bg-dark-800/80' : 'bg-white/80'} backdrop-blur-xl border-b ${isDark ? 'border-dark-700' : 'border-gray-200'} sticky top-0 z-50`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        to={isManager ? '/manager' : '/technician'}
                        className="flex items-center gap-2"
                    >
                        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Tek<span className="font-light text-primary-400">Gear</span></span>
                        </div>
                    </Link>

                    {/* Right side */}
                    <div className="flex items-center gap-4">
                        {/* User info */}
                        <div className={`hidden md:flex items-center gap-3 px-4 py-2 ${isDark ? 'bg-dark-700/50' : 'bg-gray-100'} rounded-xl`}>
                            <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-primary-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.name}</span>
                                <span className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'} capitalize`}>{user?.role}</span>
                            </div>
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-lg transition-all duration-200 ${isDark ? 'bg-dark-700 hover:bg-dark-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* Dashboard link */}
                        <Link
                            to={isManager ? '/manager' : '/technician'}
                            className={`p-2 rounded-lg transition-all ${isDark ? 'text-dark-300 hover:text-white hover:bg-dark-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                        </Link>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className={`p-2 rounded-lg transition-all text-red-400 hover:text-red-300 ${isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;


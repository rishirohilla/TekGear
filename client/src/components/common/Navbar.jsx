import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Zap,
    LogOut,
    User,
    LayoutDashboard,
    Settings
} from 'lucide-react';

const Navbar = () => {
    const { user, logout, isManager } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-dark-800/80 backdrop-blur-xl border-b border-dark-700 sticky top-0 z-50">
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
                            <span className="text-xl font-bold text-white">GearGain</span>
                            <span className="text-xl font-light text-primary-400"> Pro</span>
                        </div>
                    </Link>

                    {/* Right side */}
                    <div className="flex items-center gap-4">
                        {/* User info */}
                        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-dark-700/50 rounded-xl">
                            <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-primary-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-white">{user?.name}</span>
                                <span className="text-xs text-dark-400 capitalize">{user?.role}</span>
                            </div>
                        </div>

                        {/* Dashboard link (for technicians on other pages) */}
                        <Link
                            to={isManager ? '/manager' : '/technician'}
                            className="btn-ghost"
                        >
                            <LayoutDashboard className="w-5 h-5" />
                        </Link>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10"
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

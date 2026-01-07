import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(formData.email, formData.password);

        if (result.success) {
            const redirectPath = result.user.role === 'manager' ? '/manager' : '/technician';
            navigate(redirectPath);
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-96 h-96 bg-primary-500/20 rounded-full blur-3xl -top-48 -left-48" />
                <div className="absolute w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -bottom-48 -right-48" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4 shadow-glow">
                        <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">
                        Tek<span className="font-light text-primary-400">Gear</span>
                    </h1>
                    <p className="text-dark-400 mt-2">Dealership Productivity Platform</p>
                </div>

                {/* Login Card */}
                <div className="glass-card p-8">
                    <h2 className="text-xl font-semibold text-white mb-6">Welcome back</h2>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field pl-12"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input-field pl-12 pr-12"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-dark-400">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    {/* Demo credentials */}
                    <div className="mt-6 p-4 bg-dark-700/50 rounded-xl">
                        <p className="text-xs text-dark-400 mb-2">Demo Credentials:</p>
                        <div className="space-y-1 text-xs">
                            <p className="text-dark-300">
                                <span className="text-primary-400">Manager:</span> manager@tekgear.com / manager123
                            </p>
                            <p className="text-dark-300">
                                <span className="text-primary-400">Technician:</span> tech1@tekgear.com / tech123
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

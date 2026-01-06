import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Zap, Mail, Lock, Loader2, Eye, EyeOff, User,
    Shield, Wrench, Check
} from 'lucide-react';

const certificationOptions = [
    { id: 'EV', label: 'EV Systems', icon: '⚡' },
    { id: 'Engine', label: 'Engine', icon: '🔧' },
    { id: 'Brakes', label: 'Brakes', icon: '🛑' },
    { id: 'Transmission', label: 'Transmission', icon: '⚙️' },
    { id: 'Electrical', label: 'Electrical', icon: '🔌' },
    { id: 'HVAC', label: 'HVAC', icon: '❄️' },
    { id: 'Diagnostics', label: 'Diagnostics', icon: '🔍' }
];

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'technician',
        certifications: []
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const toggleCertification = (certId) => {
        setFormData(prev => ({
            ...prev,
            certifications: prev.certifications.includes(certId)
                ? prev.certifications.filter(c => c !== certId)
                : [...prev.certifications, certId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.role === 'technician' && formData.certifications.length === 0) {
            setError('Please select at least one certification');
            return;
        }

        setLoading(true);

        const result = await signup({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            certifications: formData.role === 'technician' ? formData.certifications : []
        });

        if (result.success) {
            const redirectPath = result.user.role === 'manager' ? '/manager' : '/technician';
            navigate(redirectPath);
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 py-12">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-96 h-96 bg-primary-500/20 rounded-full blur-3xl -top-48 -right-48" />
                <div className="absolute w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -bottom-48 -left-48" />
            </div>

            <div className="relative w-full max-w-lg">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4 shadow-glow">
                        <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">
                        GearGain<span className="font-light text-primary-400"> Pro</span>
                    </h1>
                    <p className="text-dark-400 mt-2">Create your account</p>
                </div>

                {/* Signup Card */}
                <div className="glass-card p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field pl-12"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
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

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                I am a...
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'manager', certifications: [] })}
                                    className={`
                    flex items-center gap-3 p-4 rounded-xl border transition-all
                    ${formData.role === 'manager'
                                            ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                            : 'bg-dark-800 border-dark-600 text-dark-400 hover:border-dark-500'}
                  `}
                                >
                                    <Shield className="w-5 h-5" />
                                    <span className="font-medium">Manager</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'technician' })}
                                    className={`
                    flex items-center gap-3 p-4 rounded-xl border transition-all
                    ${formData.role === 'technician'
                                            ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                            : 'bg-dark-800 border-dark-600 text-dark-400 hover:border-dark-500'}
                  `}
                                >
                                    <Wrench className="w-5 h-5" />
                                    <span className="font-medium">Technician</span>
                                </button>
                            </div>
                        </div>

                        {/* Certifications (only for technicians) */}
                        {formData.role === 'technician' && (
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">
                                    Certifications
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {certificationOptions.map((cert) => (
                                        <button
                                            key={cert.id}
                                            type="button"
                                            onClick={() => toggleCertification(cert.id)}
                                            className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all
                        ${formData.certifications.includes(cert.id)
                                                    ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                                    : 'bg-dark-800 border-dark-600 text-dark-400 hover:border-dark-500'}
                      `}
                                        >
                                            <span>{cert.icon}</span>
                                            <span>{cert.label}</span>
                                            {formData.certifications.includes(cert.id) && (
                                                <Check className="w-4 h-4 ml-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Passwords */}
                        <div className="grid grid-cols-2 gap-4">
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
                                        className="input-field pl-12"
                                        placeholder="Password"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">
                                    Confirm
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="input-field pl-12"
                                        placeholder="Confirm"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-xs text-dark-400 hover:text-dark-300"
                            >
                                {showPassword ? 'Hide' : 'Show'} passwords
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-dark-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ManagerDashboard from './pages/ManagerDashboard';
import TechDashboard from './pages/TechDashboard';

// Redirect component for login/signup pages only (not landing)
const AuthRedirect = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // If user is logged in, redirect to their dashboard (only for login/signup)
    if (user) {
        return <Navigate to={user.role === 'manager' ? '/manager' : '/technician'} replace />;
    }

    // Otherwise, show the public page
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Landing page - accessible to everyone (logged in or not) */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Login/Signup - redirect to dashboard if already logged in */}
                    <Route
                        path="/login"
                        element={
                            <AuthRedirect>
                                <Login />
                            </AuthRedirect>
                        }
                    />
                    <Route
                        path="/signup"
                        element={
                            <AuthRedirect>
                                <Signup />
                            </AuthRedirect>
                        }
                    />

                    {/* Protected Routes */}
                    <Route
                        path="/manager/*"
                        element={
                            <ProtectedRoute allowedRoles={['manager']}>
                                <ManagerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/technician/*"
                        element={
                            <ProtectedRoute allowedRoles={['technician']}>
                                <TechDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;

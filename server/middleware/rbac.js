// Role-Based Access Control Middleware

// Require specific roles
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Access denied. Required role(s): ${roles.join(', ')}`
            });
        }

        next();
    };
};

// Manager only access
const managerOnly = requireRole('manager');

// Technician only access
const technicianOnly = requireRole('technician');

// Both managers and technicians
const authenticated = requireRole('manager', 'technician');

module.exports = {
    requireRole,
    managerOnly,
    technicianOnly,
    authenticated
};

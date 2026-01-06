import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X, DollarSign } from 'lucide-react';

const NotificationToast = ({ notifications, onDismiss }) => {
    return (
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-md">
            {notifications.map((notification) => (
                <Toast
                    key={notification.id}
                    notification={notification}
                    onDismiss={() => onDismiss(notification.id)}
                />
            ))}
        </div>
    );
};

const Toast = ({ notification, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);

        if (notification.autoClose !== false) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onDismiss, 300);
            }, notification.duration || 5000);

            return () => clearTimeout(timer);
        }
    }, [notification, onDismiss]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-400" />,
        error: <XCircle className="w-5 h-5 text-red-400" />,
        warning: <AlertCircle className="w-5 h-5 text-yellow-400" />,
        bonus: <DollarSign className="w-5 h-5 text-primary-400" />
    };

    const bgColors = {
        success: 'border-green-500/30 bg-green-500/10',
        error: 'border-red-500/30 bg-red-500/10',
        warning: 'border-yellow-500/30 bg-yellow-500/10',
        bonus: 'border-primary-500/30 bg-primary-500/10'
    };

    return (
        <div
            className={`
        flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl
        transition-all duration-300 transform
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${bgColors[notification.type] || bgColors.success}
      `}
        >
            <div className="flex-shrink-0 mt-0.5">
                {icons[notification.type] || icons.success}
            </div>

            <div className="flex-1 min-w-0">
                {notification.title && (
                    <p className="text-sm font-semibold text-white">{notification.title}</p>
                )}
                <p className="text-sm text-dark-200">{notification.message}</p>

                {notification.type === 'bonus' && notification.amount && (
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary-400">
                            +${notification.amount.toFixed(2)}
                        </span>
                        <span className="text-xs text-dark-400">added to weekly pulse</span>
                    </div>
                )}
            </div>

            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onDismiss, 300);
                }}
                className="flex-shrink-0 text-dark-400 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

// Hook to manage notifications
export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (notification) => {
        const id = Date.now() + Math.random();
        setNotifications(prev => [...prev, { ...notification, id }]);
        return id;
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const showSuccess = (message, title = 'Success') => {
        return addNotification({ type: 'success', message, title });
    };

    const showError = (message, title = 'Error') => {
        return addNotification({ type: 'error', message, title });
    };

    const showBonus = (amount, timeSaved, message = '') => {
        return addNotification({
            type: 'bonus',
            title: '🎉 Efficiency Bonus Earned!',
            message: message || `You beat the clock by ${timeSaved} mins!`,
            amount,
            duration: 8000
        });
    };

    return {
        notifications,
        addNotification,
        removeNotification,
        showSuccess,
        showError,
        showBonus
    };
};

export default NotificationToast;

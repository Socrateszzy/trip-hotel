import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  type: ToastType;
  message: string;
  duration?: number;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ type, message, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      bg: 'bg-green-500',
      border: 'border-green-600',
      icon: '✅',
    },
    error: {
      bg: 'bg-red-500',
      border: 'border-red-600',
      icon: '❌',
    },
    warning: {
      bg: 'bg-yellow-500',
      border: 'border-yellow-600',
      icon: '⚠️',
    },
  };

  const config = typeConfig[type];

  if (!isVisible) return null;

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-in-right">
      <div
        className={`${config.bg} ${config.border} border-l-4 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md`}
        role="alert"
      >
        <span className="text-xl">{config.icon}</span>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
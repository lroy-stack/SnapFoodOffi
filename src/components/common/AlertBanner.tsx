import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface AlertBannerProps {
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  onClose?: () => void;
  className?: string;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ 
  message, 
  type = 'error', 
  onClose,
  className = ''
}) => {
  // Enhanced styling based on the type
  const getBgStyle = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200 border-l-4 border-l-red-500';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 border-l-4 border-l-yellow-500';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200 border-l-4 border-l-blue-500';
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200 border-l-4 border-l-green-500';
      default:
        return 'bg-red-50 text-red-700 border-red-200 border-l-4 border-l-red-500';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      case 'success':
        return 'text-green-500';
      default:
        return 'text-red-500';
    }
  };

  return (
    <div className={`rounded-md shadow-sm p-4 mb-4 ${getBgStyle()} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className={getIconColor()} size={20} />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium leading-5">{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-white/30 transition-colors"
              aria-label="Dismiss"
            >
              <X size={16} className={getIconColor()} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertBanner;

import React from 'react';
import { useToast } from '../../context/ToastContext';

// This component renders a single toast notification.
const Toast = ({ message, type, onClose }) => {
  const baseClasses =
    'flex items-center justify-between w-full max-w-xs p-4 my-2 text-white rounded-lg shadow-lg animate-fade-in';
  // The variable is named iconTypeClasses
  const iconTypeClasses = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500',
  };

  const Icon = () => {
    if (type === 'success')
      return (
        // Success icon
        <svg
          // Corrected variable name
          className={`w-6 h-6 ${iconTypeClasses[type]}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    if (type === 'error')
      return (
        // Error icon
        <svg
          // Corrected variable name
          className={`w-6 h-6 ${iconTypeClasses[type]}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    return (
      <svg // Info icon (default)
        // Corrected variable name
        className={`w-6 h-6 ${iconTypeClasses[type]}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'warning':
        return 'bg-yellow-600'; // Added warning type
      default:
        return 'bg-blue-600'; // Default to info/blue
    }
  };

  return (
    <div className={`${baseClasses} ${getBackgroundColor()}`}>
      <div className="flex items-center">
        <Icon />
        <div className="ml-3 text-sm font-normal">{message}</div>
      </div>
      <button
        onClick={onClose}
        className="ml-4 -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8"
      >
        &times;
      </button>
    </div>
  );
};

// This container holds all the active toasts.
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    // Updated classes to position the container in the top-center
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;

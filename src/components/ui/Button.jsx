import React from 'react';

// This is a more flexible Button component for Tailwind.
// Instead of variants, we pass the specific styles we need directly.
const Button = ({ title, onClick, disabled = false, className = '' }) => {
  // We combine base styles with any custom styles passed in.
  const baseClasses =
    'w-full p-3 rounded-lg text-left font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500';

  return (
    <button
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {title}
    </button>
  );
};

export default Button;

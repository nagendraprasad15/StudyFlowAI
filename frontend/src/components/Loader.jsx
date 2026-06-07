import React from 'react';

/**
 * Premium glassmorphic loading spinner with glowing text feedback.
 */
const Loader = ({ size = 'md', text = 'Processing data...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-20 h-20 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative flex items-center justify-center">
        {/* Glowing aura background */}
        <div className="absolute inset-0 bg-brandPrimary/20 rounded-full blur-xl animate-pulse"></div>
        
        {/* Ring spinner */}
        <div
          className={`${sizeClasses[size]} rounded-full border-t-brandPrimary border-r-brandSecondary border-b-transparent border-l-transparent animate-spin`}
        ></div>
      </div>
      
      {text && (
        <p className="text-sm font-medium tracking-wide text-textSecondary animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;

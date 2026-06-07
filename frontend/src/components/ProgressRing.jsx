import React from 'react';

/**
 * Premium SVG Circular Progress Ring.
 * Used for Focus timers, level sliders, and percentage dashboard metrics.
 */
const ProgressRing = ({
  radius = 60,
  stroke = 8,
  progress = 0, // 0 to 100
  colorClass = 'stroke-brandPrimary',
  trailColorClass = 'stroke-white/5',
  children,
}) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 select-none"
      >
        {/* Background Track */}
        <circle
          className={trailColorClass}
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Foreground Progress Indicator */}
        <circle
          className={`transition-all duration-300 ease-out ${colorClass}`}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      {/* Absolute centered slots/labels */}
      {children && <div className="absolute flex flex-col items-center justify-center">{children}</div>}
    </div>
  );
};

export default ProgressRing;

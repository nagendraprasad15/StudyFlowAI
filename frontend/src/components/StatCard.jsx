import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * Reusable stat metric dashboard card with glassmorphic properties.
 */
const StatCard = ({
  title,
  value,
  icon: Icon,
  changeText,
  trend = 'neutral', // 'up' | 'down' | 'neutral'
}) => {
  return (
    <div className="glass-panel glass-panel-hover p-6 relative overflow-hidden group">
      {/* Background glow hover animation */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-brandPrimary/5 rounded-full blur-xl group-hover:bg-brandPrimary/10 transition-all duration-500"></div>

      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-3xl font-bold tracking-tight text-textPrimary">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-brandPrimary group-hover:text-brandSecondary transition-colors duration-300">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {changeText && (
        <div className="flex items-center mt-4 space-x-1">
          {trend === 'up' && (
            <span className="flex items-center text-brandAccent text-xs font-medium">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            </span>
          )}
          {trend === 'down' && (
            <span className="flex items-center text-brandAlert text-xs font-medium">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            </span>
          )}
          <span className="text-xs text-textSecondary">{changeText}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;

import React from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * Reusable empty state placeholder component for listing pages.
 */
const EmptyState = ({
  icon: Icon = HelpCircle,
  title = 'No records found',
  description = 'Start generating contents using the AI modules to populate this list.',
  actionText,
  onAction,
}) => {
  return (
    <div className="glass-panel p-8 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-textSecondary">
        <Icon className="w-8 h-8 stroke-[1.5]" />
      </div>
      
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-textPrimary">{title}</h3>
        <p className="text-sm text-textSecondary leading-relaxed">{description}</p>
      </div>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2 bg-gradient-to-r from-brandPrimary to-brandSecondary hover:from-brandPrimary/90 hover:to-brandSecondary/90 text-white font-medium text-sm rounded-xl transition duration-300 shadow-glowPrimary"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

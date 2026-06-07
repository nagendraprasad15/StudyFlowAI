import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Sparkles, Zap, Award } from 'lucide-react';

/**
 * Top dashboard header navbar containing page labels, user metadata highlights, and mobile menu toggles.
 */
const Navbar = ({ onMenuClick }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Dynamically map page titles from routing endpoints
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Study Dashboard';
      case '/planner':
        return 'AI Study Planner';
      case '/notes':
        return 'AI Notes Summarizer';
      case '/quiz':
        return 'AI Quiz Generator';
      case '/assistant':
        return 'AI Study Assistant';
      case '/focus':
        return 'Focus Timer (Pomodoro)';
      default:
        return 'StudyFlow AI';
    }
  };

  return (
    <header className="h-16 border-b border-darkBorder bg-darkBg/50 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6">
      {/* Page Title & Hamburger Trigger */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg border border-white/5 bg-white/5 text-textSecondary hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-textPrimary bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
          {getPageTitle()}
        </h1>
      </div>

      {/* Meta Indicators (XP, AI limits token status) */}
      {user && (
        <div className="flex items-center space-x-4">
          {/* Level Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brandPrimary/10 to-brandSecondary/10 border border-brandPrimary/20 text-white font-medium text-xs">
            <Award className="w-3.5 h-3.5 text-brandSecondary" />
            <span>Level {user.level}</span>
          </div>

          {/* AI Usage Quota Tracking */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <Zap className="w-3.5 h-3.5 text-brandAccent animate-pulse" />
            <span className="text-textSecondary hidden xs:inline">AI Limit:</span>
            <span className="font-semibold text-textPrimary">
              {20 - (user.dailyAiRequests || 0)} / 20 Left
            </span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

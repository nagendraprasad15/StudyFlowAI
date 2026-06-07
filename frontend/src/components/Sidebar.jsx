import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  HelpCircle,
  MessageSquare,
  Clock,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

/**
 * Collapsible responsive sidebar navigating features list.
 */
const Sidebar = ({ isOpen, toggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Planner', path: '/planner', icon: Calendar },
    { name: 'Notes Summarizer', path: '/notes', icon: FileText },
    { name: 'Quiz Generator', path: '/quiz', icon: HelpCircle },
    { name: 'Study Assistant', path: '/assistant', icon: MessageSquare },
    { name: 'Focus Mode', path: '/focus', icon: Clock },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-30 transition-all duration-300 ease-in-out border-r border-darkBorder bg-darkBg/95 backdrop-blur-md flex flex-col justify-between
        ${isOpen ? 'w-64' : 'w-20'} 
        md:translate-x-0 
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-6 border-b border-darkBorder">
          <div className="flex items-center space-x-3 overflow-hidden select-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brandPrimary to-brandSecondary flex items-center justify-center text-white font-black text-lg shadow-glowPrimary flex-shrink-0 animate-pulse">
              S
            </div>
            {isOpen && (
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent truncate glow-text-primary">
                StudyFlow<span className="text-brandSecondary">AI</span>
              </span>
            )}
          </div>
          
          {/* Sidebar Collapse Toggle Button */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg border border-white/5 bg-white/5 text-textSecondary hover:text-white hover:bg-white/10 transition-colors"
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center space-x-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative
                ${
                  isActive
                    ? 'bg-gradient-to-r from-brandPrimary/20 to-brandSecondary/10 text-white border-l-4 border-brandPrimary shadow-sm'
                    : 'text-textSecondary hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                }
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="truncate">{item.name}</span>}
              {!isOpen && (
                <div className="absolute left-16 bg-darkBg border border-darkBorder px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-glass">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Footer Profile & Action info */}
      <div className="p-4 border-t border-darkBorder space-y-4">
        {user && (
          <div className={`flex items-center space-x-3 ${isOpen ? '' : 'justify-center'}`}>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brandSecondary font-bold shadow-sm relative flex-shrink-0 select-none">
              {user.username.charAt(0).toUpperCase()}
              {/* Level indicator bubble */}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brandPrimary border border-darkBg flex items-center justify-center text-[10px] font-black text-white">
                {user.level}
              </span>
            </div>
            
            {isOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-textPrimary truncate">{user.username}</p>
                <div className="flex items-center space-x-1 text-[10px] text-brandAccent font-semibold truncate bg-brandAccent/10 px-1.5 py-0.5 rounded-md w-fit">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>XP: {user.xpPoints}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`flex items-center space-x-3.5 px-4 py-3 rounded-xl font-medium text-sm text-brandAlert hover:bg-brandAlert/10 transition-all duration-200 w-full
            ${isOpen ? '' : 'justify-center'}
          `}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>Logout</span>}
          {!isOpen && (
            <div className="absolute left-16 bg-darkBg border border-brandAlert/20 px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-glass text-brandAlert">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

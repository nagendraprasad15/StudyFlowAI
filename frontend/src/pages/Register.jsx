import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      return toast.error('Please fill in all registration fields');
    }

    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setSubmitting(true);
    const result = await register(username, email, password);
    setSubmitting(false);

    if (result && result.success) {
      navigate('/dashboard');
    }
  };

  const handleDemoBypass = async () => {
    setSubmitting(true);
    // Direct bypass using login mock handler
    const result = await login('DemoScholar', 'demopass123');
    setSubmitting(false);
    if (result && result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-textPrimary flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      {/* Background aura glow */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brandPrimary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brandSecondary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

      {/* Main card panel */}
      <div className="w-full max-w-md space-y-8 relative">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2 select-none justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brandPrimary to-brandSecondary flex items-center justify-center text-white font-black text-base shadow-glowPrimary">
              S
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
              StudyFlow<span className="text-brandSecondary">AI</span>
            </span>
          </Link>
          <h2 className="text-3xl font-extrabold tracking-tight">Create Account</h2>
          <p className="text-xs text-textSecondary">
            Sign up to unlock automated study plans, notes summaries, and quizzes.
          </p>
        </div>

        {/* Card Body */}
        <div className="glass-panel p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textSecondary">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  disabled={submitting}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="scholar123"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary text-sm text-textPrimary placeholder-textSecondary/50 transition outline-none"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textSecondary">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  disabled={submitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scholar@studyflow.ai"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary text-sm text-textPrimary placeholder-textSecondary/50 transition outline-none"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textSecondary">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  disabled={submitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary text-sm text-textPrimary placeholder-textSecondary/50 transition outline-none"
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textSecondary">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  disabled={submitting}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary text-sm text-textPrimary placeholder-textSecondary/50 transition outline-none"
                />
              </div>
            </div>

            {/* Register button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-brandPrimary to-brandSecondary hover:from-brandPrimary/90 hover:to-brandSecondary/90 text-white font-bold rounded-xl transition duration-300 shadow-glowPrimary flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
            >
              <span>{submitting ? 'Registering Account...' : 'Sign Up'}</span>
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Demo Bypass button for hackathon judges */}
          <div className="border-t border-white/5 pt-4 space-y-3">
            <div className="text-[10px] text-center text-brandAccent uppercase tracking-widest font-bold flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Hackathon Presentation Bypass</span>
            </div>
            
            <button
              onClick={handleDemoBypass}
              disabled={submitting}
              className="w-full py-2.5 bg-brandAccent/10 hover:bg-brandAccent/20 border border-brandAccent/30 text-brandAccent font-bold rounded-xl transition text-xs flex items-center justify-center"
            >
              Skip & Launch Seeded Demo Mode
            </button>
          </div>
        </div>

        {/* Footer links */}
        <p className="text-center text-xs text-textSecondary">
          Already have an account?{' '}
          <Link to="/login" className="text-brandPrimary hover:underline font-semibold">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;

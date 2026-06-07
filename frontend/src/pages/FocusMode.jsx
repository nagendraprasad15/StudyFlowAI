import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import ProgressRing from '../components/ProgressRing';
import { logFocusSession } from '../api/focusApi';
import toast from 'react-hot-toast';

const FocusMode = () => {
  const { user, setUser } = useAuth();
  
  // Timer states: 'work' (25m) | 'short' (5m) | 'long' (15m)
  const [mode, setMode] = useState('work');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [loggingSession, setLoggingSession] = useState(false);
  
  const modeTimers = {
    work: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'work':
        return 'Study block';
      case 'short':
        return 'Short break';
      case 'long':
        return 'Long break';
      default:
        return 'Timer';
    }
  };

  // Timer tick loops
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            handleTimerComplete();
            return modeTimers[mode];
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const handleTimerComplete = async () => {
    // Play HTML5 sound chime
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.warn('Audio context blocked by browser restrictions', e);
    }

    if (mode === 'work') {
      setLoggingSession(true);
      const toastId = toast.loading('Logging study session & awarding XP points...');
      
      try {
        const res = await logFocusSession(25);
        if (res && res.success) {
          // Sync Auth Context User state with server responses
          setUser(prev => ({
            ...prev,
            xpPoints: res.xpPoints,
            level: res.level,
            completedSessions: res.completedSessions,
            badges: res.badges
          }));

          toast.success(`🎉 Focus block completed! +${res.xpGained} XP awarded!`, { id: toastId, duration: 5000 });
          if (res.levelUp) {
            toast.success(`🎉 Level Up! You reached Level ${res.level}!`, { duration: 6000 });
          }

          // Switch automatically to break mode
          setMode('short');
          setSecondsLeft(modeTimers.short);
        }
      } catch (err) {
        console.error('Failed to log focus block in DB:', err);
        toast.error('Could not sync focus progress with database. Operating locally.', { id: toastId });
        
        // Fallback local updates if server error
        setMode('short');
        setSecondsLeft(modeTimers.short);
      } finally {
        setLoggingSession(false);
      }
    } else {
      toast.success('Break finished! Ready to lock in the next study block?');
      setMode('work');
      setSecondsLeft(modeTimers.work);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    toast.success(isRunning ? 'Focus timer paused' : 'Focus block activated!');
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(modeTimers[mode]);
    toast.error('Focus timer reset');
  };

  const handleModeChange = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setSecondsLeft(modeTimers[newMode]);
    toast.success(`Switched to: ${newMode === 'work' ? 'Study mode' : 'Break mode'}`);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalModeDuration = modeTimers[mode];
  const progressPercentage = ((totalModeDuration - secondsLeft) / totalModeDuration) * 100;

  const displayUser = user || {
    completedSessions: 0,
    xpPoints: 0,
    level: 1,
    badges: []
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Timer Interface Card */}
        <div className="glass-panel p-8 md:col-span-2 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-brandPrimary/10 rounded-full blur-2xl -z-10"></div>
          
          {/* Mode Navigation Toggle */}
          <div className="flex space-x-1.5 p-1 bg-white/5 border border-white/5 rounded-2xl">
            {['work', 'short', 'long'].map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all
                  ${
                    mode === m
                      ? 'bg-brandPrimary text-white shadow-glowPrimary'
                      : 'text-textSecondary hover:text-white'
                  }
                `}
              >
                {m === 'work' && 'Study'}
                {m === 'short' && 'Short Recess'}
                {m === 'long' && 'Long Recess'}
              </button>
            ))}
          </div>

          {/* SVG Progress Clock Ring */}
          <div className="py-4">
            <ProgressRing
              radius={110}
              stroke={10}
              progress={progressPercentage}
              colorClass={mode === 'work' ? 'stroke-brandPrimary' : 'stroke-brandAccent'}
            >
              <div className="text-center space-y-1">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tighter">
                  {formatTime(secondsLeft)}
                </span>
                <p className="text-[10px] text-textSecondary uppercase tracking-widest font-semibold block">
                  {getModeLabel()}
                </p>
              </div>
            </ProgressRing>
          </div>

          {/* Timer controls */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={resetTimer}
              disabled={loggingSession}
              className="p-3 bg-white/5 border border-white/10 hover:border-brandAlert hover:text-brandAlert text-textSecondary rounded-2xl transition duration-300"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleTimer}
              disabled={loggingSession}
              className={`p-5 rounded-2xl text-white transition-all duration-300 shadow-glowPrimary flex items-center justify-center
                ${
                  isRunning
                    ? 'bg-brandSecondary hover:bg-brandSecondary/90'
                    : 'bg-brandPrimary hover:bg-brandPrimary/90'
                }
              `}
              title={isRunning ? 'Pause Timer' : 'Start Timer'}
            >
              {isRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>

            {/* simulated quick complete triggers (for testing and judges demos!) */}
            <button
              onClick={handleTimerComplete}
              disabled={loggingSession}
              className="p-3 bg-white/5 border border-white/10 hover:border-brandAccent hover:text-brandAccent text-textSecondary rounded-2xl transition duration-300"
              title="Complete Focus Block (Mock)"
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
            </button>
          </div>
        </div>

        {/* Sidebar logs / achievements panels */}
        <div className="space-y-4">
          
          {/* Stats Logging Panel */}
          <div className="glass-panel p-5 space-y-4">
            <h4 className="text-xs font-bold text-textSecondary uppercase tracking-widest border-b border-white/5 pb-2">Today's Focus</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-textSecondary">Completed blocks:</span>
                <span className="font-bold text-textPrimary">{displayUser.completedSessions} sessions</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-textSecondary">Accumulated time:</span>
                <span className="font-bold text-brandPrimary">{displayUser.completedSessions * 25} minutes</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-textSecondary">Scholar Badges count:</span>
                <span className="font-bold text-brandAccent">{displayUser.badges.length} badges</span>
              </div>
            </div>
          </div>

          {/* Gamification tips card */}
          <div className="glass-panel p-5 space-y-2 relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-20 h-20 bg-brandPrimary/5 rounded-full blur-xl"></div>
            
            <h4 className="text-xs font-bold text-brandPrimary uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-4 h-4" />
              <span>Streak Incentives</span>
            </h4>
            <p className="text-[10px] text-textSecondary leading-relaxed">
              Completing study blocks regularly locks in your study streak logs. Log focus segments daily to trigger multipliers!
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default FocusMode;

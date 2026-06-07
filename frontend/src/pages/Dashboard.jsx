import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Zap,
  Calendar,
  FileText,
  Clock,
  MessageSquare,
  Award,
  ArrowRight,
  TrendingUp,
  Flame,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ProgressRing from '../components/ProgressRing';
import Loader from '../components/Loader';
import { fetchDashboardStats } from '../api/statsApi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  // Fetch stats from server on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const res = await fetchDashboardStats();
        if (res && res.success) {
          setDashboardData(res);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics from backend:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader size="lg" text="Syncing user curriculum progress & charts data..." />
      </div>
    );
  }

  const { user, analytics } = dashboardData;
  const levelProgress = ((user.xpPoints % 500) / 500) * 100;
  const nextLevelThreshold = user.level * 500;
  const remainingXp = nextLevelThreshold - user.xpPoints;

  const quickActions = [
    { name: 'Create Plan', desc: 'AI Study Planner', path: '/planner', icon: Calendar, color: 'from-indigo-500/20 to-indigo-600/10 hover:border-indigo-500/30' },
    { name: 'Summarize Notes', desc: 'AI PDF Condenser', path: '/notes', icon: FileText, color: 'from-emerald-500/20 to-emerald-600/10 hover:border-emerald-500/30' },
    { name: 'Start Focus', desc: 'Pomodoro Timer', path: '/focus', icon: Clock, color: 'from-pink-500/20 to-pink-600/10 hover:border-pink-500/30' },
    { name: 'Ask AI Tutor', desc: 'Study Assistant', path: '/assistant', icon: MessageSquare, color: 'from-teal-500/20 to-teal-600/10 hover:border-teal-500/30' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Quick Actions Row */}
      <section>
        <h2 className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-4">Quick Workflows</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={() => navigate(action.path)}
              className={`p-5 text-left border border-darkBorder bg-gradient-to-tr rounded-2xl transition duration-300 flex flex-col justify-between h-32 group shadow-sm ${action.color}`}
            >
              <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-textPrimary group-hover:scale-105 transition-transform w-fit">
                <action.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-textPrimary flex items-center group-hover:text-brandPrimary transition-colors">
                  <span>{action.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </h3>
                <p className="text-[10px] text-textSecondary mt-0.5">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Stat Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Daily Study Streak"
          value={`${analytics.streak} Days`}
          icon={Flame}
          changeText="Active calendar streak"
          trend="up"
        />
        <StatCard
          title="Saved note summaries"
          value={analytics.notesCount}
          icon={FileText}
          changeText="Processed documents"
          trend="neutral"
        />
        <StatCard
          title="Quizzes Attempted"
          value={analytics.totalQuizzesAttempted}
          icon={CheckCircle}
          changeText="Practice tests completed"
          trend="up"
        />
        <StatCard
          title="Average Quiz Score"
          value={`${analytics.averageQuizScore}%`}
          icon={Award}
          changeText="Average MCQ accuracy"
          trend="up"
        />
      </section>

      {/* 3. Level Progression & Study Time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User level progression slider */}
        <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -top-10 -left-10 w-24 h-24 bg-brandSecondary/5 rounded-full blur-xl"></div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-textPrimary text-base flex items-center space-x-1.5">
                <Award className="w-4.5 h-4.5 text-brandSecondary" />
                <span>Scholar Progression</span>
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-widest text-brandSecondary bg-brandSecondary/15 px-2 py-0.5 rounded">
                Level {user.level}
              </span>
            </div>

            <div className="flex items-center space-x-4 pt-2">
              <ProgressRing radius={45} stroke={6} progress={levelProgress} colorClass="stroke-brandSecondary">
                <span className="text-lg font-black text-white">{user.level}</span>
              </ProgressRing>
              
              <div className="space-y-1">
                <p className="text-xs text-textSecondary font-medium">Progress to Level {user.level + 1}</p>
                <div className="text-lg font-extrabold text-textPrimary">
                  {user.xpPoints % 500} <span className="text-xs text-textSecondary">/ 500 XP</span>
                </div>
                <p className="text-[10px] text-textSecondary">{remainingXp} XP remaining</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-6">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-textSecondary mb-3">Earned Badges</h4>
            <div className="flex flex-wrap gap-1.5">
              {user.badges.map((badge) => (
                <span
                  key={badge}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-textPrimary text-[10px] font-semibold flex items-center space-x-1 hover:border-brandPrimary/30 transition-colors"
                >
                  <Sparkles className="w-2.5 h-2.5 text-brandSecondary" />
                  <span>{badge}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Study Hours Bar Chart */}
        <div className="glass-panel p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-textPrimary text-base flex items-center space-x-1.5">
              <TrendingUp className="w-4.5 h-4.5 text-brandPrimary" />
              <span>Study Hours Distribution (Mins)</span>
            </h3>
            <span className="text-[10px] text-textSecondary font-semibold">Weekly View</span>
          </div>
          
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.weeklyHoursData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f0f19', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Bar dataKey="Study" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Focus" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. Quiz Performance & Weak Topics Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quiz Scores Line Chart */}
        <div className="glass-panel p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-textPrimary text-base flex items-center space-x-1.5">
              <TrendingUp className="w-4.5 h-4.5 text-brandSecondary" />
              <span>Quiz Performance Accuracy (%)</span>
            </h3>
            <span className="text-[10px] text-textSecondary font-semibold font-mono">Attempts log</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.quizScoresData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#6b7280" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: '#0f0f19', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="Score" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weak Topics Analysis Card */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="font-bold text-textPrimary text-base flex items-center space-x-1.5 border-b border-white/5 pb-3">
            <AlertTriangle className="w-4.5 h-4.5 text-brandAlert" />
            <span>Weak Topics Targets</span>
          </h3>
          <p className="text-xs text-textSecondary leading-relaxed">
            AI has flagged these topics based on incorrect quiz answers. Review summaries or chat with the Tutor to resolve concepts!
          </p>
          
          <div className="space-y-2 pt-2">
            {analytics.weakTopics.map((topic, index) => (
              <div
                key={index}
                className="flex items-center space-x-2.5 p-3 bg-brandAlert/5 border border-brandAlert/15 rounded-xl text-xs"
              >
                <div className="w-2 h-2 rounded-full bg-brandAlert animate-pulse"></div>
                <span className="font-bold text-textPrimary">{topic}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Continue Studying & Activity logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Continue Studying */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-textSecondary uppercase tracking-widest">Continue Studying</h2>
          <div className="space-y-3">
            {analytics.activePlan ? (
              <div className="glass-panel p-5 relative overflow-hidden group border-l-4 border-l-brandPrimary">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-brandPrimary">Active Schedule</span>
                    <h4 className="font-bold text-sm text-textPrimary truncate max-w-[200px]">
                      Syllabus: {analytics.activePlan.subjects.join(', ')}
                    </h4>
                    <p className="text-xs text-textSecondary">
                      Due: {new Date(analytics.activePlan.examDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/planner')}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-textSecondary hover:text-white transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-5 text-center text-xs text-textSecondary italic py-8">
                No active AI Study Plan found. Navigate to Planner to generate one.
              </div>
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-textSecondary uppercase tracking-widest">Recent Activity</h2>
          <div className="glass-panel p-5 space-y-4 h-fit">
            {analytics.recentActivities && analytics.recentActivities.length > 0 ? (
              analytics.recentActivities.map((act, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs border-b border-white/5 last:border-b-0 pb-3 last:pb-0">
                  <div className="flex items-center space-x-3 truncate mr-2">
                    <div className={`p-2 rounded-xl bg-white/5 border border-white/5 flex-shrink-0`}>
                      {act.type === 'quiz' ? (
                        <Award className="w-4 h-4 text-brandSecondary" />
                      ) : (
                        <FileText className="w-4 h-4 text-brandAccent" />
                      )}
                    </div>
                    <div className="truncate">
                      <h5 className="font-bold text-textPrimary truncate">{act.title}</h5>
                      <p className="text-[10px] text-textSecondary truncate">{act.detail}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-textSecondary whitespace-nowrap">
                    {new Date(act.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-xs text-textSecondary italic py-8">
                No recent study activity logged.
              </div>
            )}
          </div>
        </section>

      </div>

    </div>
  );
};

export default Dashboard;

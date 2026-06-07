import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  FileText,
  HelpCircle,
  Clock,
  ArrowRight,
  MessageSquare,
  Zap,
  Play,
} from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  const [activeDemo, setActiveDemo] = useState('planner');

  const demoTabs = [
    { id: 'planner', name: 'AI Planner', icon: Calendar },
    { id: 'notes', name: 'PDF Summarizer', icon: FileText },
    { id: 'quiz', name: 'Quiz Generator', icon: HelpCircle },
    { id: 'assistant', name: 'AI Study Assistant', icon: MessageSquare },
  ];

  const featuresList = [
    {
      title: 'AI Study Planner',
      desc: 'Get customized schedules, revision timings, and topic lists mapped directly around your exam dates and hours.',
      icon: Calendar,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    },
    {
      title: 'Notes Summarizer',
      desc: 'Upload heavy lecture PDFs or paste raw text. Receive rich markdown summaries, quick takeaways, and active-recall flashcards.',
      icon: FileText,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Quiz Generator',
      desc: 'Turn any syllabus topic into dynamic MCQs or short-answers with selectable difficulties to test your conceptual depth.',
      icon: HelpCircle,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    },
    {
      title: 'AI Study Assistant',
      desc: 'Stuck on a formula or concept? Chat with a dedicated tutor. Get explanations, simplified analogies, and custom mnemonics.',
      icon: MessageSquare,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20'
    },
    {
      title: 'Pomodoro Focus Mode',
      desc: 'Maximize study blocks using the gamified timer. Log focus periods to earn levels, unlock XP points, and collect achievements.',
      icon: Clock,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/20'
    },
    {
      title: 'Gamified Dashboard',
      desc: 'Track metrics like study minutes, streaks, and quiz scoring accuracy to map your academic progress visually.',
      icon: Zap,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-darkBg text-textPrimary relative overflow-hidden">
      {/* Decorative Aura background elements */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-brandPrimary/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-brandSecondary/10 rounded-full blur-3xl -z-10"></div>

      {/* Landing Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-white/5 bg-darkBg/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-3 select-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brandPrimary to-brandSecondary flex items-center justify-center text-white font-black shadow-glowPrimary">
            S
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
            StudyFlow<span className="text-brandSecondary">AI</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-textSecondary hover:text-white transition-colors px-3 py-1.5"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brandPrimary to-brandSecondary hover:from-brandPrimary/90 hover:to-brandSecondary/90 rounded-xl transition duration-300 shadow-glowPrimary"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Tag badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-brandPrimary font-semibold shadow-sm mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Academic Co-Pilot</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
            Supercharge Your Study Output With{' '}
            <span className="bg-gradient-to-r from-brandPrimary via-brandSecondary to-brandAccent bg-clip-text text-transparent glow-text-primary">
              StudyFlow AI
            </span>
          </h1>

          <p className="text-base sm:text-xl text-textSecondary max-w-2xl mx-auto leading-relaxed">
            Plan exams dynamically, summarize lecture notes in seconds, generate interactive practice quizzes, and track focus timings with our gamified platform.
          </p>

          {/* Action Call buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brandPrimary to-brandSecondary hover:from-brandPrimary/90 hover:to-brandSecondary/90 text-white font-bold rounded-2xl transition duration-300 shadow-glowPrimary flex items-center justify-center space-x-2 group text-base"
            >
              <span>Build My Study Plan</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-textPrimary font-semibold rounded-2xl transition duration-300 flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current text-brandAccent" />
              <span>Demo Login</span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Interactive Feature Demo Area */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="glass-panel p-6 md:p-8 relative">
          <div className="flex flex-wrap gap-2 mb-6 border-b border-white/5 pb-4">
            {demoTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDemo(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                  ${
                    activeDemo === tab.id
                      ? 'bg-gradient-to-r from-brandPrimary to-brandSecondary text-white shadow-glowPrimary'
                      : 'bg-white/5 border border-white/5 text-textSecondary hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Demo Content Cards */}
          <div className="min-h-[300px] bg-darkBg/60 border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
            {activeDemo === 'planner' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h4 className="font-bold text-base text-textPrimary">Semester Study Plan: Data Structures</h4>
                  <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-md font-semibold">Active Plan</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass-panel p-4 border-l-4 border-indigo-500 space-y-2">
                    <div className="text-xs text-textSecondary font-bold">DAY 1: RECURSION</div>
                    <p className="text-sm font-medium text-textPrimary">Analyze Call Stacks & Base Case validation rules.</p>
                    <div className="text-xs text-brandAccent font-bold">Duration: 2 Hours</div>
                  </div>
                  <div className="glass-panel p-4 border-l-4 border-purple-500 space-y-2">
                    <div className="text-xs text-textSecondary font-bold">DAY 2: LINKED LISTS</div>
                    <p className="text-sm font-medium text-textPrimary">Review Double Linked List nodes deletion mechanics.</p>
                    <div className="text-xs text-brandAccent font-bold">Duration: 3 Hours</div>
                  </div>
                  <div className="glass-panel p-4 border-l-4 border-emerald-500 space-y-2">
                    <div className="text-xs text-textSecondary font-bold">DAY 3: SORTING</div>
                    <p className="text-sm font-medium text-textPrimary">Solve Merge Sort recursion tree partitions.</p>
                    <div className="text-xs text-brandAccent font-bold">Duration: 2.5 Hours</div>
                  </div>
                </div>

                <div className="p-4 bg-brandPrimary/5 border border-brandPrimary/10 rounded-xl space-y-1">
                  <div className="text-xs font-bold text-brandPrimary uppercase tracking-wider">Revision Recommendation:</div>
                  <p className="text-xs text-textSecondary">Review Day 1 Call Stacks on Friday before generating practice quizzes.</p>
                </div>
              </div>
            )}

            {activeDemo === 'notes' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h4 className="font-bold text-base text-textPrimary">PDF Notes Summary: Quantum Physics Basics</h4>
                  <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md font-semibold">Summarized</span>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-bold text-textPrimary">### Core Quantum Superposition</div>
                  <p className="text-xs text-textSecondary leading-relaxed">
                    A physical system exists in multiple states simultaneously until a measurement collapses the wave function.
                  </p>
                  
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-emerald-400">Key Takeaway Point:</div>
                    <ul className="list-disc pl-5 text-xs text-textSecondary space-y-1">
                      <li>The wave function is represented mathematically by the Schrödinger Equation.</li>
                      <li>Observation causes immediate quantum decoherence.</li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                    <div className="text-[10px] text-textSecondary font-bold">Active Flashcard Question:</div>
                    <p className="text-xs font-semibold mt-1">What triggers wave function collapse?</p>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                    <div className="text-[10px] text-brandAccent font-bold">Reveal Answer:</div>
                    <p className="text-xs font-semibold mt-1">Measurement or interaction with external environment.</p>
                  </div>
                </div>
              </div>
            )}

            {activeDemo === 'quiz' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h4 className="font-bold text-base text-textPrimary">Quiz Topic: Javascript Async Programming</h4>
                  <span className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2.5 py-1 rounded-md font-semibold">Medium</span>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-textPrimary">Question 2 of 5: What is the main purpose of the Event Loop?</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <button className="p-3 text-left bg-white/5 border border-white/10 rounded-xl text-xs hover:border-brandPrimary transition-colors font-medium">A) Exposing database APIs to client-side browsers</button>
                    <button className="p-3 text-left bg-brandPrimary/20 border border-brandPrimary/50 rounded-xl text-xs text-white font-medium">B) Monitoring call stack and executing queued callbacks</button>
                    <button className="p-3 text-left bg-white/5 border border-white/10 rounded-xl text-xs hover:border-brandPrimary transition-colors font-medium">C) Compiling JS scripts into CPU assembler commands</button>
                    <button className="p-3 text-left bg-white/5 border border-white/10 rounded-xl text-xs hover:border-brandPrimary transition-colors font-medium">D) Terminating unhandled HTTP query response blocks</button>
                  </div>
                </div>
              </div>
            )}

            {activeDemo === 'assistant' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h4 className="font-bold text-base text-textPrimary">StudyFlow AI Tutor Chat</h4>
                  <span className="text-xs text-textSecondary font-semibold">Context: React state rules</span>
                </div>

                <div className="space-y-3 max-w-2xl">
                  <div className="flex justify-start">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none text-xs text-textSecondary">
                      Can you generate a mnemonic to remember the standard REST methods?
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="p-3.5 bg-gradient-to-r from-brandPrimary/20 to-brandSecondary/20 border border-brandPrimary/30 rounded-2xl rounded-tr-none text-xs text-textPrimary space-y-2">
                      <p>Sure! Use the mnemonic **"GPDD"** (Grandma Prefers Delicious Donuts) to recall REST protocols:</p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li>**G** - GET (Retrieve resource)</li>
                        <li>**P** - POST (Create resource)</li>
                        <li>**D** - PUT (Update/Replace resource)</li>
                        <li>**D** - DELETE (Remove resource)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-textPrimary">
            Designed to Optimize Your Academic Operations
          </h2>
          <p className="text-sm sm:text-base text-textSecondary">
            StudyFlow AI brings six specialized core features built into a single, cohesive, unified workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresList.map((feat) => (
            <div
              key={feat.title}
              className="glass-panel glass-panel-hover p-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${feat.color}`}>
                  <feat.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-textPrimary">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-darkBg/80 py-12 text-center text-textSecondary text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brandPrimary to-brandSecondary flex items-center justify-center text-white font-black text-sm">
              S
            </div>
            <span className="font-extrabold tracking-tight text-textPrimary">StudyFlow AI</span>
          </div>

          <p>© 2026 StudyFlow AI. Designed for Hackathon Demo Excellence.</p>
          
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors flex items-center space-x-1">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>Github</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

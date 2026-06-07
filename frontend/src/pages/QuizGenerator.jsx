import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Award,
  CheckCircle,
  XCircle,
  ChevronRight,
  FileText,
} from 'lucide-react';
import ProgressRing from '../components/ProgressRing';
import { generateQuiz, submitQuizAnswers } from '../api/quizApi';
import { fetchNotes } from '../api/notesApi';
import toast from 'react-hot-toast';

const QuizGenerator = () => {
  const { gainXp } = useAuth();
  
  // Quiz parameters
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);
  const [useTimer, setUseTimer] = useState(true);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  
  // Available notes for context Q&A
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  
  // Game States: 'config' | 'loading' | 'quiz' | 'result'
  const [gameState, setGameState] = useState('config');
  const [quizData, setQuizData] = useState(null);
  
  // Running Quiz states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timerSeconds, setTimerSeconds] = useState(30);

  // Submit states
  const [submittingAnswers, setSubmittingAnswers] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Load saved notes on mount to populate notes dropdown
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoadingNotes(true);
        const res = await fetchNotes();
        if (res && res.notes) {
          setNotes(res.notes);
        }
      } catch (err) {
        console.error('Failed to load notes for context:', err);
      } finally {
        setLoadingNotes(false);
      }
    };
    loadNotes();
  }, []);

  // Timer loop
  useEffect(() => {
    let interval = null;
    if (gameState === 'quiz' && useTimer) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            toast.error('Question timeout! Counting as wrong.');
            // Save empty choice
            setAnswers(curr => ({ ...curr, [currentIndex]: 'TIMED_OUT' }));
            handleNextQuestion();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
}, [gameState, currentIndex, useTimer]);

  const handleStartConfig = async (e) => {
    e.preventDefault();

    if (gameState === 'loading') return;

    if (!topic.trim()) {
      return toast.error('Please input a study topic or chapter title');
    }

    if (topic.length > 100) {
      return toast.error('Topic too long');
    }

    setGameState('loading');
    const toastId = toast.loading('AI is formulating multiple-choice questions & answer configurations...');

    try {
      const response = await generateQuiz(topic, difficulty, count, selectedNoteId || null);
      if (response && response.quiz) {
        setQuizData(response.quiz);
        setAnswers({});
        setCurrentIndex(0);
        setGameState('quiz');
        setTimerSeconds(30);
        toast.success('Practice Quiz generated successfully!', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      const msg =
      err.response?.data?.message ||
      'Failed to connect to AI service';
      toast.error(msg, { id: toastId });
      setGameState('config');
    }
  };

  const selectOption = (opt) => {
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: opt
    }));
  };

  const handleNextQuestion = () => {

    if (!quizData || !quizData.questions) {
      return toast.error('Invalid quiz data');
    }
    if (!quizData || !quizData.questions) {
      return toast.error('Invalid quiz data');
    }
    if (currentIndex < quizData.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimerSeconds(30);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setSubmittingAnswers(true);
    const toastId = toast.loading('Grading responses & syncing progression metrics...');
    
    // Fill in missing answers with empty strings
    const answersArray = [];
    for (let i = 0; i < quizData.questions.length; i++) {
      answersArray.push(answers[i] || '');
    }

    try {
      const res = await submitQuizAnswers(quizData._id, answersArray);
      if (res && res.success) {
        setQuizResult(res);
        setGameState('result');
        gainXp(res.xpGained); // Sync XP visually
        toast.success(`Graded: ${res.score}/${res.totalQuestions}! +${res.xpGained} XP awarded!`, { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit quiz results', { id: toastId });
    } finally {
      setSubmittingAnswers(false);
    }
  };

  const restartQuiz = () => {
    setGameState('config');
    setTopic('');
    setSelectedNoteId('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* 1. Configuration Screen */}
      {gameState === 'config' && (
        <div className="glass-panel p-8 space-y-6">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-textPrimary">Generate Dynamic Practice Quiz</h3>
            <p className="text-xs text-textSecondary">
              Enter a topic or attach saved document notes context to formulate a personalized exam.
            </p>
          </div>

          <form onSubmit={handleStartConfig} className="max-w-lg mx-auto space-y-5">
            {/* Topic Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
                Quiz Syllabus Topic
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Data Structures, Cell Division, REST APIs..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-brandPrimary outline-none text-textPrimary placeholder-textSecondary/30 transition"
              />
            </div>

            {/* Note Selector Context (RAG) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-brandAccent" />
                <span>Reference Document Notes (Optional)</span>
              </label>
              <select
                value={selectedNoteId}
                onChange={(e) => setSelectedNoteId(e.target.value)}
                className="w-full px-3 py-3 bg-darkBg border border-white/10 rounded-xl text-xs focus:border-brandPrimary outline-none text-textPrimary transition"
              >
                <option value="">No reference note (general knowledge only)</option>
                {notes.map((note) => {
                  let title = 'Lecture Notes';
                  const match = note.summary.match(/#+\s+(.*)/);
                  if (match && match[1]) title = match[1].trim();
                  return (
                    <option key={note._id} value={note._id}>
                      Context: {title}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Difficulty */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-3 bg-darkBg border border-white/10 rounded-xl text-sm focus:border-brandPrimary outline-none text-textPrimary transition"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Question count */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
                  Question Count
                </label>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full px-3 py-3 bg-darkBg border border-white/10 rounded-xl text-sm focus:border-brandPrimary outline-none text-textPrimary transition"
                >
                  <option value="3">3 Questions</option>
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                </select>
              </div>
            </div>

            {/* Timer checkbox */}
            <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-xl">
              <div>
                <label className="text-xs font-bold text-textPrimary">Enable Question Timer</label>
                <p className="text-[10px] text-textSecondary mt-0.5">30 seconds limit per question</p>
              </div>
              <input
                type="checkbox"
                checked={useTimer}
                onChange={(e) => setUseTimer(e.target.checked)}
                className="w-4 h-4 rounded text-brandPrimary bg-darkBg border-white/10 accent-brandPrimary cursor-pointer"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={gameState === 'loading'}
              className="w-full py-3.5 bg-gradient-to-r from-brandPrimary to-brandSecondary disabled:opacity-50 disabled:cursor-not-allowed ..."
            >
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              <span>Generate Practice Quiz</span>
            </button>
          </form>
        </div>
      )}

      {/* 2. Loading State */}
      {gameState === 'loading' && (
        <div className="glass-panel p-16 text-center space-y-4">
          <div className="relative flex items-center justify-center mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-brandPrimary/20 rounded-full blur-xl animate-pulse"></div>
            <HelpCircle className="w-12 h-12 text-brandPrimary animate-bounce" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-textPrimary text-base animate-pulse">AI Quiz Builder Active</h4>
            <p className="text-xs text-textSecondary">Structuring multiple choice questions, hold tight...</p>
          </div>
        </div>
      )}

      {/* 3. Live Active Quiz Runner */}
      {gameState === 'quiz' && quizData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 md:col-span-2 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-[10px] uppercase font-black tracking-widest text-brandPrimary">
                Question {currentIndex + 1} of {quizData.questions.length}
              </span>
              <span className="text-[10px] uppercase bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2.5 py-0.5 rounded font-bold">
                {quizData.difficulty}
              </span>
            </div>

            <div className="space-y-4">
              <p className="text-base font-bold text-textPrimary leading-relaxed">
                {quizData.questions[currentIndex].question}
              </p>

              {/* Options list */}
              <div className="grid grid-cols-1 gap-2.5">
                {quizData.questions[currentIndex].options.map((opt, oIdx) => {
                  const isSelected = answers[currentIndex] === opt;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => selectOption(opt)}
                      className={`w-full p-4 text-left rounded-xl text-xs font-semibold border transition duration-200
                        ${
                          isSelected
                            ? 'bg-brandPrimary/20 border-brandPrimary text-white shadow-glowPrimary'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-brandPrimary/30 text-textSecondary hover:text-white'
                        }
                      `}
                    >
                      <span className="inline-block w-5 h-5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-center leading-5 mr-3 font-bold">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5">
              <button
                onClick={handleNextQuestion}
                disabled={!answers[currentIndex] || submittingAnswers}
                className="px-5 py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition"
              >
                <span>
                  {currentIndex === quizData.questions.length - 1
                    ? submittingAnswers ? 'Submitting...' : 'Finish Quiz'
                    : 'Next Question'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {useTimer && (
              <div className="glass-panel p-6 text-center space-y-4 flex flex-col items-center">
                <h4 className="text-xs font-bold text-textSecondary uppercase tracking-widest">Question Timer</h4>
                <ProgressRing
                  radius={50}
                  stroke={6}
                  progress={(timerSeconds / 30) * 100}
                  colorClass={timerSeconds <= 8 ? 'stroke-brandAlert' : 'stroke-brandPrimary'}
                >
                  <span className={`text-xl font-black ${timerSeconds <= 8 ? 'text-brandAlert animate-pulse' : 'text-white'}`}>
                    {timerSeconds}s
                  </span>
                </ProgressRing>
                <p className="text-[10px] text-textSecondary">Time limit left</p>
              </div>
            )}

            <div className="glass-panel p-5 space-y-2">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-textSecondary">Syllabus Topic:</h4>
              <p className="text-xs font-bold text-textPrimary">{quizData.title}</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Result breakdown screen */}
      {gameState === 'result' && quizData && quizResult && (
        <div className="glass-panel p-8 space-y-8 animate-fadeIn">
          
          <div className="text-center max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 bg-brandPrimary/15 border border-brandPrimary/30 rounded-full flex items-center justify-center mx-auto text-brandPrimary shadow-glowPrimary animate-pulse">
              <Award className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-textPrimary">Quiz Completed!</h3>
              <p className="text-sm text-textSecondary">Report card synced to performance analytics.</p>
            </div>

            <div className="text-4xl font-extrabold text-white pt-2">
              {quizResult.score}
              <span className="text-xl text-textSecondary"> / {quizResult.totalQuestions} Correct</span>
            </div>
          </div>

          {/* Question Breakdown list */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-textSecondary uppercase tracking-widest border-b border-white/5 pb-2">Questions Review</h4>
            
            <div className="space-y-3">
              {quizData.questions.map((q, idx) => {
                const isCorrect = answers[idx] === q.correctAnswer;
                return (
                  <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2.5 text-xs">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-textPrimary max-w-[85%]">{idx + 1}. {q.question}</p>
                      {isCorrect ? (
                        <span className="flex items-center text-brandAccent font-bold">
                          <CheckCircle className="w-4.5 h-4.5 mr-1" />
                          <span>Correct</span>
                        </span>
                      ) : (
                        <span className="flex items-center text-brandAlert font-bold">
                          <XCircle className="w-4.5 h-4.5 mr-1" />
                          <span>Incorrect</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-textSecondary border-t border-white/5 pt-2">
                      <p>Your choice: <span className={isCorrect ? 'text-brandAccent' : 'text-brandAlert font-semibold'}>{answers[idx] || 'Timed Out / Skipped'}</span></p>
                      {!isCorrect && <p>Correct answer: <span className="text-brandAccent font-semibold">{q.correctAnswer}</span></p>}
                      <p className="bg-white/5 p-2.5 rounded-lg border border-white/5 text-[11px] leading-relaxed italic text-textSecondary">
                        <span className="font-bold not-italic text-textPrimary block mb-0.5">Explanation:</span>
                        {q.explanation || 'No explanation provided.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center border-t border-white/5 pt-6">
            <button
              onClick={restartQuiz}
              className="px-6 py-3 bg-gradient-to-r from-brandPrimary to-brandSecondary hover:from-brandPrimary/90 hover:to-brandSecondary/90 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-glowPrimary"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Generate New Quiz</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default QuizGenerator;

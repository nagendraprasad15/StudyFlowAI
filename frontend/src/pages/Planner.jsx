import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import {
  Calendar,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Download,
  CheckSquare,
  Square,
  CheckCircle,
  PlusCircle,
  ListTodo,
} from 'lucide-react';
import {
  generateStudyPlan,
  fetchActiveStudyPlan,
  updateActiveStudyPlanProgress
} from '../api/aiApi';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from '../api/plannerApi';
import toast from 'react-hot-toast';

const Planner = () => {
  // AI Study Plan States
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [dailyHours, setDailyHours] = useState(4);
  const [generating, setGenerating] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  useEffect(() => {
    if (subjects.length === 0) {
      setActivePlan(null);
    }
  }, [subjects]);

  // CRUD Personal Tasks Checklist States
  const [personalTasks, setPersonalTasks] = useState([]);
  const [todoTitle, setTodoTitle] = useState('');
  const [todoDeadline, setTodoDeadline] = useState('');
  const [todoPriority, setTodoPriority] = useState('medium');
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Tab State: 'aiPlan' | 'checklist'
  const [activeTab, setActiveTab] = useState('aiPlan');

  // Load Active AI Study Plan and Personal Checklist Tasks on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingTasks(true);
        
        // 1. Fetch AI Study Plan
        const planRes = await fetchActiveStudyPlan();
        if (planRes && planRes.studyPlan) {
          setActivePlan(planRes.studyPlan);
          //setSubjects(planRes.studyPlan.subjects);
          setDailyHours(planRes.studyPlan.dailyHours);
          const dateString = new Date(planRes.studyPlan.examDate).toISOString().split('T')[0];
          setExamDate(dateString);
        }

        // 2. Fetch Personal Tasks Checklist
        const tasksRes = await getTasks();
        if (tasksRes && tasksRes.tasks) {
          setPersonalTasks(tasksRes.tasks);
        }
      } catch (err) {
        console.error('Error fetching planner details:', err.message);
        toast.error('Could not load plan details from server. Operating in local mode.');
      } finally {
        setLoadingTasks(false);
      }
    };

    loadData();
  }, []);

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    if (subjects.includes(newSubject.trim())) {
      return toast.error('Subject already added');
    }
    setSubjects([...subjects, newSubject.trim()]);
    setNewSubject('');
  };

  const handleRemoveSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleGenerateAIPlan = async (e) => {
    e.preventDefault();
    
    let activeSubjects = [...subjects];
    if (newSubject.trim()) {
      if (!activeSubjects.includes(newSubject.trim())) {
        activeSubjects.push(newSubject.trim());
        setSubjects(activeSubjects);
      }
      setNewSubject('');
    }

    if (activeSubjects.length === 0) {
      return toast.error('Please add at least one subject');
    }
    if (!examDate) {
      return toast.error('Please select a target exam date');
    }

    setGenerating(true);
    const toastId = toast.loading('AI is calculating study cycles & curriculum schedule...');
    
    try {
      const result = await generateStudyPlan(activeSubjects, examDate, dailyHours);
      if (result && result.studyPlan) {
        setActivePlan(result.studyPlan);
        toast.success('AI Study Plan generated and saved successfully!', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to connect to Gemini API';
      toast.error(msg, { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  // Toggle AI generated task item completion status (in schedule array)
  const toggleAIScheduleTask = async (day, taskText, currentCompleted) => {
    const isCompleted = !currentCompleted;
    
    // Optimistic UI updates
    setActivePlan((prev) => {
      const updatedSchedule = prev.schedule.map((d) => {
        if (d.day === day) {
          let list = [...(d.completedTasks || [])];
          if (isCompleted) {
            list.push(taskText);
          } else {
            list = list.filter((t) => t !== taskText);
          }
          return { ...d, completedTasks: list };
        }
        return d;
      });
      return { ...prev, schedule: updatedSchedule };
    });

    try {
      await updateActiveStudyPlanProgress(day, taskText, isCompleted);
      if (isCompleted) {
        toast.success('+10 XP gained for study progress!');
      }
    } catch (err) {
      console.error('Error toggling AI task checklist:', err);
      toast.error('Failed to sync progress with database');
    }
  };

  // CRUD Tasks Checklist Handlers
  const handleAddPersonalTask = async (e) => {
    e.preventDefault();
    if (!todoTitle.trim()) {
      return toast.error('Please enter a task title');
    }
    if (!todoDeadline) {
      return toast.error('Please select a deadline');
    }

    try {
      const response = await createTask({
        title: todoTitle,
        deadline: todoDeadline,
        priority: todoPriority
      });

      if (response && response.task) {
        setPersonalTasks([...personalTasks, response.task]);
        setTodoTitle('');
        setTodoDeadline('');
        setTodoPriority('medium');
        toast.success('Personal task added to checklist!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save personal task');
    }
  };

  const togglePersonalTask = async (taskId, currentCompleted) => {
    const isCompleted = !currentCompleted;

    // Optimistic Update
    setPersonalTasks(prev =>
      prev.map(t => (t._id === taskId ? { ...t, completed: isCompleted } : t))
    );

    try {
      await updateTask(taskId, { completed: isCompleted });
      if (isCompleted) {
        toast.success('Task checked off! +10 XP gained!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update task completion');
    }
  };

  const handleRemovePersonalTask = async (taskId) => {
    const originalList = [...personalTasks];
    
    // Optimistic Update
    setPersonalTasks(prev => prev.filter(t => t._id !== taskId));

    try {
      await deleteTask(taskId);
      toast.success('Task deleted from checklist');
    } catch (err) {
      console.error(err);
      setPersonalTasks(originalList);
      toast.error('Failed to delete task');
    }
  };


  const handleExportPDF = () => {
    if (!activePlan) return;

    try {
      const doc = new jsPDF();
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(99, 102, 241);
      doc.text('StudyFlow AI - Customized Study Plan', 20, 20);

      doc.setFontSize(11);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 28);
      doc.text(`Daily study duration quota: ${dailyHours} Hours/Day`, 20, 34);

      let cursorY = 45;

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(30, 30, 30);
      doc.text('DAILY SCHEDULE TIMELINE', 20, cursorY);
      cursorY += 10;

      activePlan.schedule.forEach((day) => {
        if (cursorY > 270) {
          doc.addPage();
          cursorY = 20;
        }

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`Day ${day.day}: ${day.subject} - ${day.topic}`, 20, cursorY);
        cursorY += 6;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Duration: ${day.duration} Hours`, 22, cursorY);
        cursorY += 6;

        const tasks = day.tasks || [];
        const completedList = day.completedTasks || [];
        
        tasks.forEach((task) => {
          const isDone = completedList.includes(task);
          doc.text(`${isDone ? '[x]' : '[ ]'} ${task}`, 24, cursorY);
          cursorY += 6;
        });

        cursorY += 4;
      });

      doc.save('studyflow_plan.pdf');
      toast.success('Study plan PDF downloaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Tab Switcher Toolbar */}
      <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('aiPlan')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all
            ${
              activeTab === 'aiPlan'
                ? 'bg-brandPrimary text-white shadow-glowPrimary'
                : 'text-textSecondary hover:text-white'
            }
          `}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Study Plan</span>
        </button>
        
        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all
            ${
              activeTab === 'checklist'
                ? 'bg-brandPrimary text-white shadow-glowPrimary'
                : 'text-textSecondary hover:text-white'
            }
          `}
        >
          <ListTodo className="w-4 h-4" />
          <span>Personal Checklist ({personalTasks.filter(t => !t.completed).length})</span>
        </button>
      </div>

      {activeTab === 'aiPlan' ? (
        /* AI STUDY PLAN GENERATOR TAB */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Planner Controls Form */}
          <div className="glass-panel p-6 h-fit space-y-6">
            <h3 className="font-bold text-textPrimary text-base flex items-center space-x-1.5 border-b border-white/5 pb-3">
              <Sparkles className="w-4.5 h-4.5 text-brandPrimary" />
              <span>Generate Study Plan</span>
            </h3>

            <form onSubmit={handleGenerateAIPlan} className="space-y-4">
              {/* Subjects Input List */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
                  List of Subjects
                </label>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Algorithms"
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-brandPrimary outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="p-2.5 bg-brandPrimary hover:bg-brandPrimary/90 rounded-xl text-white transition flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Subject Chips */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {subjects.map((sub, idx) => (
                    <span
                      key={idx}
                      className="pl-2.5 pr-1.5 py-1 rounded-lg bg-white/5 border border-white/5 text-xs text-textPrimary flex items-center space-x-1"
                    >
                      <span>{sub}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(idx)}
                        className="p-0.5 rounded text-textSecondary hover:text-brandAlert hover:bg-white/5 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {subjects.length === 0 && (
                    <span className="text-xs text-textSecondary italic">No subjects added.</span>
                  )}
                </div>
              </div>

              {/* Target Date Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
                  Target Exam Date
                </label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-brandPrimary outline-none text-textPrimary transition"
                />
              </div>

              {/* Daily Study Hours Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
                  Daily Study Hours ({dailyHours} hrs)
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brandPrimary"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={generating}
                className="w-full py-3 bg-gradient-to-r from-brandPrimary to-brandSecondary hover:from-brandPrimary/90 hover:to-brandSecondary/90 text-white font-bold rounded-xl transition duration-300 shadow-glowPrimary flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
                <span>{generating ? 'AI Planner Working...' : 'Generate Plan'}</span>
              </button>
            </form>
          </div>

          {/* Planner Dashboard Outputs */}
          <div className="lg:col-span-2 space-y-6">
            
            {activePlan && (
              <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-2xl">
                <div>
                  <h4 className="font-bold text-textPrimary text-sm">Active Timeline Plan</h4>
                  <p className="text-[10px] text-textSecondary mt-0.5">Exam target: {new Date(activePlan.examDate).toLocaleDateString()}</p>
                </div>
                
                <button
                  onClick={handleExportPDF}
                  className="px-4 py-2 border border-white/10 hover:border-brandPrimary hover:text-brandPrimary bg-white/5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition duration-300"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </button>
                

              </div>
            )}

            {subjects.length > 0 && activePlan ? (
              <div className="space-y-6">
                {/* Daily Schedule Cards */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-textSecondary uppercase tracking-widest">Daily Schedule</h3>
                  
                  {activePlan.schedule.map((day, dayIdx) => (
                    <div key={dayIdx} className="glass-panel p-5 space-y-3 relative overflow-hidden group">
                      <div className="flex justify-between items-start border-b border-white/5 pb-2">
                        <div>
                          <span className="text-[10px] uppercase font-black tracking-widest text-brandPrimary">Day {day.day}</span>
                          <h4 className="font-bold text-sm text-textPrimary mt-0.5">{day.subject} - {day.topic}</h4>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-brandAccent font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{day.duration || planRes.dailyHours} Hrs</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Tasks Checklist:</p>
                        <div className="space-y-1.5">
                          {day.tasks.map((task, tIdx) => {
                            const isCompleted = (day.completedTasks || []).includes(task);
                            return (
                              <button
                                key={tIdx}
                                onClick={() => toggleAIScheduleTask(day.day, task, isCompleted)}
                                className="flex items-center space-x-2.5 text-left text-xs text-textSecondary hover:text-textPrimary transition w-full"
                              >
                                {isCompleted ? (
                                  <CheckSquare className="w-4 h-4 text-brandPrimary flex-shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-white/20 hover:text-brandPrimary flex-shrink-0" />
                                )}
                                <span className={isCompleted ? 'line-through text-textSecondary/50' : ''}>
                                  {task}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Revision & Priorities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Revision Intervals */}
                  <div className="glass-panel p-5 space-y-3">
                    <h4 className="text-xs font-bold text-textSecondary uppercase tracking-widest border-b border-white/5 pb-2">Revision Intervals</h4>
                    <div className="space-y-2.5">
                      {activePlan.revisionPlan.map((rev, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-textPrimary">{rev.subject}</p>
                            <p className="text-[10px] text-textSecondary mt-0.5">Revise: {Array.isArray(rev.topics) ? rev.topics.join(', ') : rev.topics}</p>
                          </div>
                          <span className="text-[10px] bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary font-semibold px-2 py-0.5 rounded">
                            {new Date(rev.suggestedDate).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Priority Targets */}
                  <div className="glass-panel p-5 space-y-3">
                    <h4 className="text-xs font-bold text-textSecondary uppercase tracking-widest border-b border-white/5 pb-2">Priority Targets</h4>
                    <div className="space-y-2.5">
                      {activePlan.priorityTopics.map((topic, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-textPrimary">{topic.topic}</p>
                            <p className="text-[10px] text-textSecondary mt-0.5">{topic.subject}</p>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border
                              ${
                                topic.priority === 'High'
                                  ? 'bg-brandAlert/10 border-brandAlert/20 text-brandAlert'
                                  : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                              }
                            `}
                          >
                            {topic.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="glass-panel p-8 text-center text-textSecondary italic">
                Set subjects and exam parameters on the left to compile your first AI Study Schedule.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* CRUD PERSONAL CHECKLIST TASKS TAB */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Task Form */}
          <div className="glass-panel p-6 h-fit space-y-6">
            <h3 className="font-bold text-textPrimary text-base flex items-center space-x-1.5 border-b border-white/5 pb-3">
              <PlusCircle className="w-4.5 h-4.5 text-brandPrimary" />
              <span>Create Checklist Task</span>
            </h3>

            <form onSubmit={handleAddPersonalTask} className="space-y-4">
              {/* Task Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={todoTitle}
                  onChange={(e) => setTodoTitle(e.target.value)}
                  placeholder="e.g. Complete math exercises"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-brandPrimary outline-none text-textPrimary transition"
                />
              </div>

              {/* Deadline */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
                  Deadline Date
                </label>
                <input
                  type="date"
                  required
                  value={todoDeadline}
                  onChange={(e) => setTodoDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-brandPrimary outline-none text-textPrimary transition"
                />
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
                  Priority
                </label>
                <select
                  value={todoPriority}
                  onChange={(e) => setTodoPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-darkBg border border-white/10 rounded-xl text-sm focus:border-brandPrimary outline-none text-textPrimary transition"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white font-bold rounded-xl transition text-sm shadow-glowPrimary"
              >
                Add to Checklist
              </button>
            </form>
          </div>

          {/* Checklist Task Logs view */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-widest">My Actions Task Checklist</h3>
            
            <div className="glass-panel p-5 space-y-4 min-h-[300px]">
              {loadingTasks ? (
                <div className="flex items-center justify-center h-44 text-textSecondary text-xs">
                  Loading tasks...
                </div>
              ) : personalTasks.length > 0 ? (
                <div className="space-y-2.5">
                  {personalTasks.map((task) => (
                    <div
                      key={task._id}
                      className="flex justify-between items-center p-3.5 bg-white/5 border border-white/5 rounded-xl hover:border-brandPrimary/30 transition duration-300"
                    >
                      <div className="flex items-center space-x-3.5">
                        <button
                          onClick={() => togglePersonalTask(task._id, task.completed)}
                          className="flex items-center text-textSecondary hover:text-white transition"
                        >
                          {task.completed ? (
                            <CheckSquare className="w-5 h-5 text-brandPrimary" />
                          ) : (
                            <Square className="w-5 h-5 text-white/20" />
                          )}
                        </button>
                        <div>
                          <p className={`text-sm font-bold ${task.completed ? 'line-through text-textSecondary/50' : 'text-textPrimary'}`}>
                            {task.title}
                          </p>
                          <p className="text-[10px] text-textSecondary mt-0.5">
                            Due: {new Date(task.deadline).toLocaleDateString()} | Priority:{' '}
                            <span
                              className={`font-semibold capitalize
                                ${
                                  task.priority === 'high'
                                    ? 'text-brandAlert'
                                    : task.priority === 'medium'
                                    ? 'text-amber-500'
                                    : 'text-brandAccent'
                                }
                              `}
                            >
                              {task.priority}
                            </span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemovePersonalTask(task._id)}
                        className="p-1.5 rounded-lg border border-white/5 text-textSecondary hover:text-brandAlert hover:bg-brandAlert/15 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-44 text-textSecondary space-y-2 text-center p-4">
                  <CheckCircle className="w-8 h-8 text-textSecondary/40 stroke-[1.5]" />
                  <p className="text-xs font-semibold text-textPrimary">Your checklist is complete!</p>
                  <p className="text-[10px]">Add tasks on the left panel to organize your day.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner;

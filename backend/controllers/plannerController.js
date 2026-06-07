const Planner = require('../models/Planner');
const StudyPlan = require('../models/StudyPlan');
const { generateStudyPlanAI } = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all planner checklist tasks for the logged-in user
 * @route   GET /api/planner
 * @access  Private
 */
const getPlannerTasks = asyncHandler(async (req, res) => {
  const tasks = await Planner.find({ user: req.user._id }).sort({ deadline: 1 });
  
  res.json({
    success: true,
    count: tasks.length,
    tasks
  });
});

/**
 * @desc    Create a new planner checklist task
 * @route   POST /api/planner
 * @access  Private
 */
const createPlannerTask = asyncHandler(async (req, res) => {
  const { title, description, deadline, priority } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Task title is required');
  }

  if (!deadline) {
    res.status(400);
    throw new Error('Deadline date is required');
  }

  const task = await Planner.create({
    title,
    description: description || '',
    deadline: new Date(deadline),
    priority: priority || 'medium',
    completed: false,
    user: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    task
  });
});

/**
 * @desc    Update a planner checklist task
 * @route   PUT /api/planner/:id
 * @access  Private
 */
const updatePlannerTask = asyncHandler(async (req, res) => {
  const { title, description, deadline, priority, completed } = req.body;

  let task = await Planner.findOne({ _id: req.params.id, user: req.user._id });

  if (!task) {
    res.status(404);
    throw new Error('Planner task not found or unauthorized');
  }

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (deadline !== undefined) task.deadline = new Date(deadline);
  if (priority !== undefined) task.priority = priority;
  if (completed !== undefined) task.completed = completed;

  const updatedTask = await task.save();

  res.json({
    success: true,
    message: 'Task updated successfully',
    task: updatedTask
  });
});

/**
 * @desc    Delete a planner checklist task
 * @route   DELETE /api/planner/:id
 * @access  Private
 */
const deletePlannerTask = asyncHandler(async (req, res) => {
  const task = await Planner.findOne({ _id: req.params.id, user: req.user._id });

  if (!task) {
    res.status(404);
    throw new Error('Planner task not found or unauthorized');
  }

  await task.deleteOne();

  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
});

/**
 * @desc    Generate a new AI Study Plan using Gemini
 * @route   POST /api/planner/generate
 * @access  Private
 */
const generateActiveStudyPlan = asyncHandler(async (req, res) => {
  const { subjects, examDate, dailyHours } = req.body;

  const today = new Date();

  const targetDate = new Date(examDate);

  const timeDifference = targetDate - today;

  const daysLeft = Math.ceil(
    timeDifference / (1000 * 60 * 60 * 24)
  );

  if (daysLeft <= 0) {
    res.status(400);
    throw new Error('Exam date must be in the future');
  }

  let strategy = '';

  if (daysLeft > 60) {
    strategy = 'Long-term preparation strategy';
  } 
  else if (daysLeft > 15) {
    strategy = 'Balanced preparation strategy';
  } 
  else {
    strategy = 'Crash revision strategy';
  }

  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    res.status(400);
    throw new Error('Please provide an array of subjects');
  }

  if (!examDate) {
    res.status(400);
    throw new Error('Please provide a target exam date');
  }

  if (!dailyHours || dailyHours < 1 || dailyHours > 24) {
    res.status(400);
    throw new Error('Please provide valid daily study hours (1-24)');
  }

  // Deactivate any currently active study plans
  await StudyPlan.updateMany({ user: req.user._id, isActive: true }, { isActive: false });

  // Call Gemini service to compile study plan JSON
  const aiPlan = await generateStudyPlanAI(
    subjects,
    examDate,
    dailyHours,
    daysLeft,
    strategy
  );

  // Inject empty completedTasks array into each schedule day block
  const scheduleWithCompletions = (aiPlan.schedule || []).map(day => ({
    ...day,
    completedTasks: []
  }));

  // Save the new plan in database
  const studyPlan = await StudyPlan.create({
    user: req.user._id,
    subjects,
    examDate: new Date(examDate),
    dailyHours,
    schedule: scheduleWithCompletions,
    revisionPlan: aiPlan.revisionPlan || [],
    priorityTopics: aiPlan.priorityTopics || [],
    isActive: true
  });

  res.status(201).json({
    success: true,
    message: 'AI Study Plan generated and activated successfully',
    studyPlan,
    daysLeft,
    strategy
  });
});

/**
 * @desc    Get currently active AI Study Plan for user
 * @route   GET /api/planner/active
 * @access  Private
 */
const getActiveStudyPlan = asyncHandler(async (req, res) => {
  const activePlan = await StudyPlan.findOne({ user: req.user._id, isActive: true });

  res.json({
    success: true,
    studyPlan: activePlan || null
  });
});

/**
 * @desc    Update AI Study Plan day task completion status
 * @route   PUT /api/planner/active/task
 * @access  Private
 */
const updateActiveStudyPlanSchedule = asyncHandler(async (req, res) => {
  const { day, taskText, completed } = req.body;

  let plan = await StudyPlan.findOne({ user: req.user._id, isActive: true });
  if (!plan) {
    res.status(404);
    throw new Error('No active study plan found');
  }

  // Locate the day block
  const dayIndex = plan.schedule.findIndex(d => d.day === day);
  if (dayIndex !== -1) {
    const updatedSchedule = [...plan.schedule];
    const dayItem = { ...updatedSchedule[dayIndex] };
    
    if (!dayItem.completedTasks) {
      dayItem.completedTasks = [];
    }

    if (completed) {
      if (!dayItem.completedTasks.includes(taskText)) {
        dayItem.completedTasks.push(taskText);
      }
    } else {
      dayItem.completedTasks = dayItem.completedTasks.filter(t => t !== taskText);
    }

    updatedSchedule[dayIndex] = dayItem;
    plan.schedule = updatedSchedule;
    
    plan.markModified('schedule');
    await plan.save();
  }

  res.json({
    success: true,
    message: 'Active study plan progress updated',
    studyPlan: plan
  });
});

module.exports = {
  getPlannerTasks,
  createPlannerTask,
  updatePlannerTask,
  deletePlannerTask,
  generateActiveStudyPlan,
  getActiveStudyPlan,
  updateActiveStudyPlanSchedule
};

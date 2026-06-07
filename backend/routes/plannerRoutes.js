const express = require('express');
const {
  getPlannerTasks,
  createPlannerTask,
  updatePlannerTask,
  deletePlannerTask,
  generateActiveStudyPlan,
  getActiveStudyPlan,
  updateActiveStudyPlanSchedule
} = require('../controllers/plannerController');
const { protect } = require('../middleware/authMiddleware');
const checkAiLimit = require('../middleware/aiLimitMiddleware');

const router = express.Router();

// Apply auth gate on all planner endpoints
router.use(protect);

// AI plan generation endpoints
router.post('/generate', checkAiLimit, generateActiveStudyPlan);
router.get('/active', getActiveStudyPlan);
router.put('/active/task', updateActiveStudyPlanSchedule);

// CRUD planner tasks checklist
router.route('/')
  .get(getPlannerTasks)
  .post(createPlannerTask);

router.route('/:id')
  .put(updatePlannerTask)
  .delete(deletePlannerTask);

module.exports = router;

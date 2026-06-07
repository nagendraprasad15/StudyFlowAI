import apiClient from './axios';

/**
 * AI Services API calls wrapper
 */
export const generateStudyPlan = async (subjects, examDate, dailyHours) => {
  const response = await apiClient.post('/planner/generate', {
    subjects,
    examDate,
    dailyHours,
  });
  return response.data;
};

export const fetchActiveStudyPlan = async () => {
  const response = await apiClient.get('/planner/active');
  return response.data;
};

export const updateActiveStudyPlanProgress = async (day, taskText, completed) => {
  const response = await apiClient.put('/planner/active/task', {
    day,
    taskText,
    completed
  });
  return response.data;
};

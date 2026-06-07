import apiClient from './axios';

/**
 * Planner Task API calls wrapper
 */
export const getTasks = async () => {
  const response = await apiClient.get('/planner');
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await apiClient.post('/planner', taskData);
  return response.data;
};

export const updateTask = async (taskId, updatedData) => {
  const response = await apiClient.put(`/planner/${taskId}`, updatedData);
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await apiClient.delete(`/planner/${taskId}`);
  return response.data;
};

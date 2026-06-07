import apiClient from './axios';

/**
 * Analytics Dashboard API calls wrapper
 */
export const fetchDashboardStats = async () => {
  const response = await apiClient.get('/stats/dashboard');
  return response.data;
};

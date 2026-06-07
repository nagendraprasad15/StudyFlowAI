import apiClient from './axios';

/**
 * Focus Timer API calls wrapper
 */
export const logFocusSession = async (duration) => {
  const response = await apiClient.post('/focus/log-session', { duration });
  return response.data;
};

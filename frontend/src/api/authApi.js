import apiClient from './axios';

/**
 * Authentication API calls wrapper
 */
export const loginUser = async (emailOrUsername, password) => {
  const response = await apiClient.post('/auth/login', { emailOrUsername, password });
  return response.data;
};

export const registerUser = async (username, email, password) => {
  const response = await apiClient.post('/auth/register', { username, email, password });
  return response.data;
};

export const fetchProfile = async () => {
  const response = await apiClient.get('/auth/profile');
  return response.data;
};

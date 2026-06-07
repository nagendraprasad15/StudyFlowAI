import apiClient from './axios';

/**
 * AI Tutor Chat API calls wrapper
 */
export const sendTutorMessage = async (message, sessionId = null, noteId = null) => {
  const response = await apiClient.post('/chat/message', {
    message,
    sessionId,
    noteId
  });
  return response.data;
};

export const fetchChatHistory = async (sessionId) => {
  const response = await apiClient.get(`/chat/history/${sessionId}`);
  return response.data;
};

export const fetchAllChatSessions = async () => {
  const response = await apiClient.get('/chat/history');
  return response.data;
};

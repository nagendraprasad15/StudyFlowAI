import apiClient from './axios';

/**
 * Quiz Engine API calls wrapper
 */
export const getQuizzes = async () => {
  const response = await apiClient.get('/quiz');
  return response.data;
};

export const generateQuiz = async (topic, difficulty, numberOfQuestions, noteId = null) => {
  const response = await apiClient.post('/quiz/generate', {
    topic,
    difficulty,
    numberOfQuestions,
    noteId
  });
  return response.data;
};

export const submitQuizAnswers = async (quizId, selectedAnswers) => {
  const response = await apiClient.post('/quiz/submit', {
    quizId,
    selectedAnswers
  });
  return response.data;
};

export const fetchQuizById = async (quizId) => {
  const response = await apiClient.get(`/quiz/${quizId}`);
  return response.data;
};

export const fetchQuizHistory = async () => {
  const response = await apiClient.get('/quiz/history');
  return response.data;
};

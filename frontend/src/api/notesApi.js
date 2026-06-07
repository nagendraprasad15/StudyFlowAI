import apiClient from './axios';

/**
 * Notes Summarizer API calls wrapper.
 * Payload can be a raw text string or a FormData instance (for file uploads).
 */
export const summarizeNotes = async (payload) => {
  let response;

  if (payload instanceof FormData) {
    response = await apiClient.post('/notes/summarize', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } else {
    response = await apiClient.post('/notes/summarize', {
      originalText: payload,
      summaryType: 'text',
    });
  }

  return response.data;
};

export const fetchNotes = async () => {
  const response = await apiClient.get('/notes');
  return response.data;
};

export const deleteNote = async (noteId) => {
  const response = await apiClient.delete(`/notes/${noteId}`);
  return response.data;
};

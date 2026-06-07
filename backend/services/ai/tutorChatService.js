const axios = require('axios');

const getTutorResponse = async (message, history = [], context = '') => {
  try {
    const formattedHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const messages = [
      {
        role: 'system',
        content: `You are a helpful AI tutor.
        
Use the following context if relevant:
${context}`
      },
      ...formattedHistory,
      {
        role: 'user',
        content: message
      }
    ];

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;

  } catch (error) {
    console.error('OpenRouter Error:', error.response?.data || error.message);

    return 'Could not connect to OpenRouter API';
  }
};

module.exports = {
  getTutorResponse
};
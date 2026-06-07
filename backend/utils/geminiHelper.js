const { GoogleGenerativeAI } = require('@google/generative-ai');
const cleanAndParseJSON = require('./jsonCleaner');

// Initialize Gemini SDK
// Will throw if API Key is not set, which validateEnv.js checks on startup
const getAIModel = () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Using gemini-1.5-flash as default, optimized for speed and structured outputs
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

/**
 * AI Study Planner Generator
 * Produces structured json matching:
 * {
 *   "schedule": [ { "day": 1, "topics": [...], "hours": 4, "tasks": [...] } ],
 *   "revisionPlan": [ { "topic": "", "revDate": "" } ],
 *   "priorityTopics": [ { "subject": "", "topic": "", "priority": "High|Medium|Low" } ]
 * }
 */
const generateStudyPlanAI = async (subjects, examDate, dailyHours) => {
  const model = getAIModel();
  const prompt = `
    You are an expert academic advisor. Generate a complete, highly structured study plan for a student based on these inputs:
    - Subjects: ${JSON.stringify(subjects)}
    - Target Exam Date: ${examDate}
    - Daily available study hours: ${dailyHours} hours/day

    Provide your response as a valid JSON object ONLY. Do not wrap it in formatting comments other than standard JSON format. Ensure all property names are double-quoted.

    JSON schema requirements:
    {
      "schedule": [
        {
          "day": 1,
          "subject": "Name of Subject",
          "topic": "Specific Topic to Study",
          "duration": 2, // hours
          "tasks": ["Read chapter", "Solve practice problems"]
        }
      ],
      "revisionPlan": [
        {
          "subject": "Subject Name",
          "topics": ["List of critical topics"],
          "suggestedDate": "YYYY-MM-DD"
        }
      ],
      "priorityTopics": [
        {
          "subject": "Subject Name",
          "topic": "Topic Name",
          "priority": "High" // High, Medium, or Low
        }
      ]
    }
    Generate at least 7 distinct entries or days of schedule based on the exam timelines. Return ONLY valid JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse response
    const parsed = cleanAndParseJSON(text);
    if (!parsed || !parsed.schedule) {
      throw new Error('Malformed AI response or parsing failed');
    }
    return parsed;
  } catch (error) {
    console.error('❌ Error generating study plan with AI:', error.message);
    // Return standard fallback model to prevent app breaking
    return {
      schedule: [
        {
          day: 1,
          subject: subjects[0] || 'Core Subject',
          topic: 'Introduction & Core Foundations',
          duration: Number(dailyHours),
          tasks: ['Review course overview docs', 'Read introductory chapters']
        }
      ],
      revisionPlan: [
        {
          subject: subjects[0] || 'Core Subject',
          topics: ['Foundational Concepts'],
          suggestedDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
        }
      ],
      priorityTopics: [
        {
          subject: subjects[0] || 'Core Subject',
          topic: 'Foundational Definitions',
          priority: 'High'
        }
      ]
    };
  }
};

/**
 * AI Notes Summarizer
 * Produces structured json matching:
 * {
 *   "summary": "Main markdown formatted summary",
 *   "keyPoints": [ "bullet point 1", ... ],
 *   "flashcards": [ { "question": "", "answer": "" } ]
 * }
 */
const generateNotesSummaryAI = async (notesText) => {
  const model = getAIModel();
  const prompt = `
    You are an AI study assistant specializing in condensing complex study materials.
    Summarize the following notes text. Extract the main insights, list key bullet points, and generate flashcards.
    
    Notes to Summarize:
    """
    ${notesText.substring(0, 15000)}
    """

    Provide your response as a valid JSON object ONLY. Follow this schema:
    {
      "summary": "Provide a comprehensive, clear summary formatted in markdown. Use headings, bold terms, and lists for high readability.",
      "keyPoints": [
        "First key takeaway point",
        "Second key takeaway point",
        "Third key takeaway point"
      ],
      "flashcards": [
        {
          "question": "An active recall question testing a key concept",
          "answer": "Clear, concise answer to the question"
        }
      ]
    }
    Generate at least 4 key points and 4 flashcards. Return ONLY the JSON object.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const parsed = cleanAndParseJSON(text);
    if (!parsed || !parsed.summary) {
      throw new Error('Malformed summary AI response');
    }
    return parsed;
  } catch (error) {
    console.error('❌ Error generating summary with AI:', error.message);
    return {
      summary: `### Core Summary\n\nFailed to fully analyze text due to API processing errors.\n\nRaw Text snippet: ${notesText.substring(0, 200)}...`,
      keyPoints: ['Review original document carefully', 'Summarization API experienced a hiccup'],
      flashcards: [
        { question: 'What is the main topic of these notes?', answer: 'Refer to original document text' }
      ]
    };
  }
};

/**
 * AI Quiz Generator
 * Produces structured json matching:
 * {
 *   "title": "Quiz Title",
 *   "questions": [
 *     { "question": "", "options": [ "A", "B", "C", "D" ], "answer": "correct option value exactly matching list entry" }
 *   ]
 * }
 */
const generateQuizAI = async (topic, difficulty, count = 5) => {
  const model = getAIModel();
  const prompt = `
    You are an automated exam developer. Generate a multiple choice quiz based on:
    - Topic: ${topic}
    - Difficulty: ${difficulty}
    - Total Questions: ${count}

    Provide your response as a valid JSON object ONLY. Follow this schema exactly:
    {
      "title": "${topic} Quiz (${difficulty})",
      "questions": [
        {
          "question": "Question text here?",
          "options": [
            "Option A value",
            "Option B value",
            "Option C value",
            "Option D value"
          ],
          "answer": "The exact option string matching the correct answer from the options array"
        }
      ]
    }
    Ensure all option fields are unique and exactly 4 options. Return ONLY valid JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const parsed = cleanAndParseJSON(text);
    if (!parsed || !parsed.questions || parsed.questions.length === 0) {
      throw new Error('Malformed quiz JSON format');
    }
    return parsed;
  } catch (error) {
    console.error('❌ Error generating quiz with AI:', error.message);
    return {
      title: `${topic} Practice Quiz`,
      questions: [
        {
          question: `Sample Question: What is the main concept of ${topic}?`,
          options: ['Foundational mechanics', 'Irrelevant processes', 'Syntax constructs', 'None of the above'],
          answer: 'Foundational mechanics'
        }
      ]
    };
  }
};

/**
 * AI Study Assistant (Tutor)
 * Produces study answers, mnemonics, and simple explanations.
 * Supports context of user's notes if passed.
 */
const getAssistantResponseAI = async (userMessage, chatHistory = [], notesContext = '') => {
  const model = getAIModel();
  
  // Format conversational flow
  const formattedHistory = chatHistory.slice(-10).map(msg => 
    `${msg.sender === 'user' ? 'Student' : 'Tutor'}: ${msg.text}`
  ).join('\n');

  const prompt = `
    You are "StudyFlow AI Tutor", an empathetic, highly knowledgeable, and friendly personalized academic tutor.
    Your goal is to explain concepts clearly, resolve doubts, create mnemonics, and give illustrative examples.
    
    ${notesContext ? `The student is currently referencing these notes/document:\n"""\n${notesContext.substring(0, 8000)}\n"""\n` : ''}
    
    Conversation History:
    ${formattedHistory}
    
    Student: ${userMessage}
    Tutor:
    
    Explain the concept using standard markdown syntax. Provide detailed steps, clear headers, bullet points, and code blocks or equations if relevant. Ensure the explanation is simplified and includes at least one concrete example or mnemonic device. Keep the tone encouraging and academic.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('❌ Error getting assistant chat response:', error.message);
    return `I apologize, but I am having trouble connecting to my knowledge base right now. Could you please repeat that or try again shortly?`;
  }
};

module.exports = {
  generateStudyPlanAI,
  generateNotesSummaryAI,
  generateQuizAI,
  getAssistantResponseAI
};

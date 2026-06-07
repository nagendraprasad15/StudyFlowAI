// const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const cleanAndParseJSON = require('../utils/jsonCleaner');

// Initialize Gemini API SDK

// const getAIModel = () => {
//   if (!process.env.GEMINI_API_KEY) {
//     throw new Error('GEMINI_API_KEY environment variable is not configured');
//   }
//   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//   return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
// };

const getAIClient = () => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY environment variable is not configured');
  }

  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
  });
};

/**
 * Executes an AI generation request with automatic retry handling on transient issues.
 */
// const runAiRequestWithRetry = async (prompt, retries = 2) => {
//   const model = getAIModel();
//   let lastError = null;

//   for (let attempt = 1; attempt <= retries + 1; attempt++) {
//     try {
//       const result = await model.generateContent(prompt);
//       return result.response.text();
//     } catch (error) {
//       console.warn(`⚠️ Gemini API attempt ${attempt} failed:`, error.message);
//       lastError = error;
//       if (attempt <= retries) {
//         // Linear backoff wait
//         await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
//       }
//     }
//   }

//   throw new Error(`Gemini API connection failed after retry attempts. Last error: ${lastError?.message}`);
// };

const runAiRequestWithRetry = async (prompt, retries = 2) => {
  const client = getAIClient();
  let lastError = null;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI academic assistant.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.warn(`⚠️ OpenRouter API attempt ${attempt} failed:`, error.message);

      lastError = error;

      if (attempt <= retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, attempt * 1000)
        );
      }
    }
  }

  throw new Error(
    `OpenRouter API connection failed after retry attempts. Last error: ${lastError?.message}`
  );
};

/**
 * AI Summarizer & Flashcards Service
 * Input: Raw textbook/lecture text
 * Output: { summary, flashcards }
 */
const summarizeNotesAI = async (originalText) => {
  const prompt = `
    
    You are an expert academic tutor and AI study assistant.

    Your task is to:
    1. Summarize the notes into concise revision points
    2. Extract important concepts
    3. Create active-recall flashcards

    Rules:
    - Use bullet points instead of long paragraphs
    - Keep explanations short and exam-friendly
    - Use markdown formatting
    - Add headings/subheadings where useful
    - Highlight important terms using **bold**
    - Avoid unnecessary details
    - Make the summary easy for quick revision

    Notes to Summarize:
    """
    ${originalText.substring(0, 15000)}
    """

    Provide your response as a valid JSON object ONLY.

    Return strictly in this format:

    {
      "summary": "Markdown formatted bullet-point summary here",
      "flashcards": [
        {
          "question": "Question here",
          "answer": "Answer here"
        }
      ]
    }

    // Also generate:
    //   - Important Exam Questions
    //   - Key Formulas (if applicable)
    //   - Quick Revision Tips

    // "importantQuestions": [],
    // "revisionTips": []

    Generate at least 5 high-quality flashcards.

    Return ONLY the JSON object.
    `;

  try {
    const rawOutput = await runAiRequestWithRetry(prompt, 2);
    const parsed = cleanAndParseJSON(rawOutput);

    if (!parsed || !parsed.summary || !parsed.flashcards) {
      throw new Error('AI returned an invalid response structure');
    }

    return parsed;
  } catch (error) {
    console.error('❌ Error in summarizeNotesAI service:', error.message);
    
    // Fail-safe default fallback
    return {
      summary: `### Core Lecture Summary\n\nUnable to fully analyze notes because the AI service timed out. Please review the text manually.\n\n**Snippet:**\n${originalText.substring(0, 300)}...`,
      flashcards: [
        {
          question: 'What is the main topic of these notes?',
          answer: 'Please review the original uploaded document.'
        }
      ]
    };
  }
};

/**
 * AI Planner Service
 * Generates an active study timeline/plan.
 */
const generateStudyPlanAI = async (
  subjects,
  examDate,
  dailyHours,
  daysLeft,
  strategy
) => {
  console.log("Subjects received:", subjects);
const prompt = `
You are an expert study planner AI.

Generate a study roadmap STRICTLY based on ONLY these subjects:

${subjects.join(', ')}

Exam Date:
${examDate}

Days left for exam: ${daysLeft}

Preparation Strategy: ${strategy}

Create exactly ${daysLeft} days roadmap.

Daily Study Hours:
${dailyHours}

VERY IMPORTANT:
- Every schedule item's subject MUST belong to the provided subjects.
- Never introduce unrelated subjects.
- Never generate generic Computer Science plans.
- Generate realistic subtopics derived from the subject itself.
- Adapt dynamically depending on the subject.
- If user enters "Nodejs", generate Nodejs/backend topics.
- If user enters "React", generate React topics.
- If user enters "DBMS", generate DBMS topics.
- Make the plan practical and progressive from beginner to advanced.
- Return ONLY valid JSON.
- No markdown.
- No explanations.

JSON format:

{
  "schedule": [
    {
      "day": 1,
      "subject": "Subject Name",
      "topic": "Relevant Topic",
      "duration": 3,
      "tasks": [
        "Task 1",
        "Task 2"
      ]
    }
  ],
  "revisionPlan": [],
  "priorityTopics": []
}
`;


  try {
    const rawOutput = await runAiRequestWithRetry(prompt, 2);
    const parsed = cleanAndParseJSON(rawOutput);

  
    parsed.schedule = parsed.schedule.filter(item =>
      subjects.some(subject =>
        item.subject.toLowerCase().trim() ===
        subject.toLowerCase().trim()
      )
    );



    if (!parsed || !parsed.schedule) {
      throw new Error('AI returned an invalid study schedule structure');
    }

    return parsed;
  } catch (error) {
    console.error('❌ Error in generateStudyPlanAI service:', error.message);
    return {
      schedule: [
        {
          day: 1,
          subject: subjects[0] || 'Core Subject',
          topic: 'Introduction & Foundations',
          duration: Number(dailyHours),
          tasks: ['Outline syllabus indexes', 'Review course introductory slides']
        }
      ],
      revisionPlan: [],
      priorityTopics: []
    };
  }
};

module.exports = {
  summarizeNotesAI,
  generateStudyPlanAI
};

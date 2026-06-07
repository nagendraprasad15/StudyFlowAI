// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const cleanAndParseJSON = require('../../utils/jsonCleaner');

// const getAIModel = () => {
//   if (!process.env.GEMINI_API_KEY) {
//     throw new Error('GEMINI_API_KEY not configured');
//   }
//   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//   return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
// };

// /**
//  * AI Quiz Generator Service
//  * Returns a validated quiz object matching schemas.
//  */
// const generateQuizAI = async (topic, difficulty, numberOfQuestions = 5, notesText = '') => {
//   const model = getAIModel();
  
//   const prompt = `
//     You are an expert exam developer. Generate a practice quiz based on:
//     - Topic: ${topic}
//     - Difficulty: ${difficulty} (easy, medium, or hard)
//     - Total Questions: ${numberOfQuestions}
//     ${notesText ? `- Context notes reference study materials:\n"""\n${notesText.substring(0, 10000)}\n"""\n` : ''}

//     Provide your response as a valid JSON object ONLY. Do not wrap the JSON in formatting comments other than standard JSON format. Ensure all property names are double-quoted.

//     JSON Schema:
//     {
//       "title": "${topic} MCQ Practice",
//       "questions": [
//         {
//           "question": "Question text here?",
//           "options": [
//             "Option A",
//             "Option B",
//             "Option C",
//             "Option D"
//           ],
//           "correctAnswer": "The exact option string matching the correct answer from the options array",
//           "explanation": "Provide a brief explanation of why this answer is correct",
//           "type": "MCQ" // Can be "MCQ" or "TRUE_FALSE"
//         }
//       ]
//     }
    
//     If type is "TRUE_FALSE", options must be exactly ["True", "False"].
//     Return ONLY valid JSON. Ensure there are no trailing commas.
//   `;

//   let lastError = null;
//   const retries = 2;

//   for (let attempt = 1; attempt <= retries + 1; attempt++) {
//     try {
//       const result = await model.generateContent(prompt);
//       const text = result.response.text();
      
//       const parsed = cleanAndParseJSON(text);

//       // JSON Validation
//       if (!parsed || !parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
//         throw new Error('AI returned malformed quiz JSON structure');
//       }

//       // Validate individual fields on questions
//       const validatedQuestions = parsed.questions.map((q, idx) => {
//         if (!q.question || !q.correctAnswer) {
//           throw new Error(`Question at index ${idx} is missing required properties`);
//         }
        
//         // Ensure options exist
//         let options = q.options || [];
//         if (q.type === 'TRUE_FALSE') {
//           options = ['True', 'False'];
//         } else if (options.length === 0) {
//           options = [q.correctAnswer, 'Distractor A', 'Distractor B', 'Distractor C'];
//         }

//         // Ensure correctAnswer is in options array
//         if (!options.includes(q.correctAnswer)) {
//           options[0] = q.correctAnswer;
//         }

//         return {
//           question: q.question,
//           options,
//           correctAnswer: q.correctAnswer,
//           explanation: q.explanation || 'No explanation provided.',
//           type: q.type || 'MCQ'
//         };
//       });

//       return {
//         title: parsed.title || `${topic} Quiz`,
//         questions: validatedQuestions
//       };

//     } catch (err) {
//       console.warn(`⚠️ Quiz Generation attempt ${attempt} failed:`, err.message);
//       lastError = err;
//       if (attempt <= retries) {
//         await new Promise(resolve => setTimeout(resolve, attempt * 1000));
//       }
//     }
//   }

//   // Backup quiz fallback if AI service fails completely
//   console.error('❌ Quiz Generation failed completely. Returning fallback practice quiz.');
//   return {
//     title: `${topic} - Practice Quiz`,
//     questions: [
//       {
//         question: `What is the primary concept behind ${topic}?`,
//         options: ['Foundational core structure', 'Secondary dependencies', 'Abstract formatting syntax', 'None of the above'],
//         correctAnswer: 'Foundational core structure',
//         explanation: `The primary concept of ${topic} relates to its foundational core structures.`,
//         type: 'MCQ'
//       },
//       {
//         question: `True or False: Enforcing constraints improves the overall execution speed in ${topic}.`,
//         options: ['True', 'False'],
//         correctAnswer: 'True',
//         explanation: 'Enforcing constraints mitigates latency risks and improves processing efficiency.',
//         type: 'TRUE_FALSE'
//       }
//     ]
//   };
// };

// module.exports = {
//   generateQuizAI
// };


const axios = require('axios');
const cleanAndParseJSON = require('../../utils/jsonCleaner');

const openRouterClient = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  timeout: 30000,
  headers: {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

const generateQuizAI = async (
  topic,
  difficulty,
  numberOfQuestions = 5,
  notesText = ''
) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  const prompt = `
You are an expert exam developer.

Generate a UNIQUE multiple-choice quiz on ${topic}.

Requirements:
- Never repeat common questions
- Use fresh concepts
- Mix conceptual and practical questions
- Shuffle difficulty patterns
- Include reasoning-based MCQs
- Avoid duplicate structures
- Difficulty: ${difficulty}
- Total Questions: ${numberOfQuestions}
- IMPORTANT: You MUST generate exactly ${numberOfQuestions} unique questions. The "questions" array in your JSON output MUST contain exactly ${numberOfQuestions} question objects. Do not generate only 1 question.

${notesText ? `
Reference Notes:
"""
${notesText.substring(0, 10000)}
"""
` : ''}

Return ONLY valid JSON.

Schema:
{
  "title": "Quiz title",
  "questions": [
    {
      "question": "Question 1 text here",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": "Correct option",
      "explanation": "Why the answer is correct",
      "type": "MCQ"
    },
    {
      "question": "Question 2 text here",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": "Correct option",
      "explanation": "Why the answer is correct",
      "type": "MCQ"
    }
  ]
}

Rules:
- Your response must contain exactly ${numberOfQuestions} questions in the "questions" array.
- No markdown formatting.
- No code blocks.
- No comments.
- Valid JSON only.
`;

  let lastError = null;
  const retries = 2;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const response = await openRouterClient.post('/chat/completions', {
        model:
          process.env.OPENROUTER_MODEL ||
          'openai/gpt-4o-mini',

          response_format: {
            type: "json_object"
          },

        messages: [
          {
            role: 'system',
            content: 'You are a strict JSON quiz generator.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],

        temperature: 0.7,
        max_tokens: 2500,
      });

      const text =
        response.data.choices[0].message.content;

      const parsed = cleanAndParseJSON(text);

      if (
        !parsed ||
        !parsed.questions ||
        !Array.isArray(parsed.questions)
      ) {
        throw new Error(
          'AI returned malformed quiz JSON structure'
        );
      }

      const validatedQuestions = parsed.questions.map(
        (q, idx) => {
          if (!q.question || !q.correctAnswer) {
            throw new Error(
              `Question at index ${idx} missing required fields`
            );
          }

          let options = q.options || [];

          if (q.type === 'TRUE_FALSE') {
            options = ['True', 'False'];
          }

          if (!options.includes(q.correctAnswer)) {
            options[0] = q.correctAnswer;
          }
          options = [...new Set(options)].slice(0, 4);

          return {
            question: q.question,
            options,
            correctAnswer: q.correctAnswer,
            explanation:
              q.explanation || 'No explanation provided.',
            type: q.type || 'MCQ',
          };
        }
      );

      return {
        title: parsed.title || `${topic} Quiz`,
        questions: validatedQuestions,
      };
    } catch (err) {
      console.warn(
        `⚠️ Quiz Generation attempt ${attempt} failed:`,
        err.response?.data || err.message
      );

      lastError = err;

      if (attempt <= retries) {
        const retryDelay =
          err.response?.status === 429
            ? attempt * 5000
            : attempt * 1000;

        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay)
        );
      }
    }
  }

  console.error(
    '❌ Quiz generation failed completely.'
  );

  const fallbackQuestions = [];
  for (let i = 1; i <= numberOfQuestions; i++) {
    fallbackQuestions.push({
      question: `Practice Question ${i}: What is a key concept behind ${topic}?`,
      options: [
        `Foundational architecture of ${topic}`,
        `Secondary component of ${topic}`,
        `Styling library for ${topic}`,
        'None of the above',
      ],
      correctAnswer: `Foundational architecture of ${topic}`,
      explanation: `This is a fallback question designed to test your knowledge of ${topic}.`,
      type: 'MCQ',
    });
  }

  return {
    title: `${topic} Practice Quiz (Fallback)`,
    questions: fallbackQuestions,
  };
};

module.exports = {
  generateQuizAI,
};


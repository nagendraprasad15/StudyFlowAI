/**
 * Utility to parse JSON from AI outputs, removing any potential markdown tags
 * and providing robust fallback structures to prevent application crashes.
 */
const cleanAndParseJSON = (text, fallback = null) => {
  if (!text || typeof text !== 'string') {
    return fallback;
  }

  let cleaned = text.trim();

  // Remove markdown code fences if present
  if (cleaned.includes('```json')) {
    cleaned = cleaned.split('```json')[1].split('```')[0].trim();
  } else if (cleaned.includes('```')) {
    cleaned = cleaned.split('```')[1].split('```')[0].trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('❌ JSON parsing error: failed to parse AI response.', error.message);
    
    // Attempt to extract anything between { ... } or [ ... ]
    const jsonMatch = cleaned.match(/[\{\[]([\s\S]*)[\}\]]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (nestedError) {
        console.error('❌ Nested JSON extraction failed.', nestedError.message);
      }
    }
    
    return fallback;
  }
};

module.exports = cleanAndParseJSON;

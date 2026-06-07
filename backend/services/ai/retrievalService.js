const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Text Chunking helper function
 * Splits note text into clean segments of maximum size with overlapping characters.
 */
const chunkText = (text, maxLength = 1000, overlap = 200) => {
  if (!text) return [];
  
  const chunks = [];
  let index = 0;

  while (index < text.length) {
    const chunk = text.substring(index, index + maxLength).trim();
    if (chunk) {
      chunks.push(chunk);
    }
    index += (maxLength - overlap);
  }

  return chunks;
};

/**
 * Gets vector embedding from Gemini API for a given string.
 */
const getEmbedding = async (text) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

  try {
    const result = await model.embedContent(text);
    if (result && result.embedding && result.embedding.values) {
      return result.embedding.values;
    }
    throw new Error('Invalid embedding response format');
  } catch (error) {
    console.error('❌ Embedding generation failed:', error.message);
    throw error;
  }
};

/**
 * Calculates cosine similarity between two float arrays
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Lightweight local TF-IDF keyword overlap similarity fallback
 * Used when the Gemini Embedding API throws network or quota limits exceptions.
 */
const localKeywordSimilarity = (query, chunk) => {
  const qWords = new Set(query.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  const cWords = chunk.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  
  if (qWords.size === 0) return 0;
  
  let matchCount = 0;
  qWords.forEach(word => {
    if (cWords.includes(word)) {
      matchCount += 1;
    }
  });

  return matchCount / qWords.size;
};

/**
 * Semantic retrieval algorithm.
 * Splits document text, embeds chunks + query, computes similarity, and returns top contexts.
 */
const retrieveRelevantContext = async (query, documentText, maxChunks = 3) => {
  if (!documentText || !query) return '';

  const chunks = chunkText(documentText, 1200, 250);
  if (chunks.length === 0) return '';
  if (chunks.length <= maxChunks) return chunks.join('\n\n'); // Return entire document if small

  try {
    console.log(`🔍 RAG: Computing embeddings for query and ${chunks.length} chunks...`);
    
    // Embed query
    const queryVector = await getEmbedding(query);

    // Embed all chunks in parallel
    const chunkVectors = await Promise.all(
      chunks.map(async (chunk) => {
        try {
          const vec = await getEmbedding(chunk);
          return { chunk, vector: vec, success: true };
        } catch (e) {
          // If a single chunk fails, return empty vector and flag
          return { chunk, vector: null, success: false };
        }
      })
    );

    // Calculate cosine similarity for successful embeddings
    const similarityResults = chunkVectors.map((item) => {
      let score = 0;
      if (item.success && item.vector) {
        score = cosineSimilarity(queryVector, item.vector);
      } else {
        // Fallback to keyword matching if API threw for this chunk
        score = localKeywordSimilarity(query, item.chunk);
      }
      return { chunk: item.chunk, score };
    });

    // Sort by score descending and return top matches
    similarityResults.sort((a, b) => b.score - a.score);
    const topContexts = similarityResults.slice(0, maxChunks).map(r => r.chunk);
    
    console.log(`✅ RAG Context compiled. Top similarity score: ${similarityResults[0]?.score.toFixed(3)}`);
    return topContexts.join('\n\n---\n\n');

  } catch (error) {
    console.warn('⚠️ Semantic RAG failed, falling back to local keyword search:', error.message);
    
    // Fail-safe keyword fallback
    const fallbackResults = chunks.map(chunk => ({
      chunk,
      score: localKeywordSimilarity(query, chunk)
    }));

    fallbackResults.sort((a, b) => b.score - a.score);
    return fallbackResults.slice(0, maxChunks).map(r => r.chunk).join('\n\n---\n\n');
  }
};

module.exports = {
  chunkText,
  getEmbedding,
  cosineSimilarity,
  retrieveRelevantContext
};

import axios from 'axios'

const EMBEDDING_CONFIG = {
  defaultChunkSize: 500,
  defaultOverlap: 50,
  maxBatchSize: 10,
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
    retryBackoff: 2
  }
}

export async function getEmbedding(text, config) {
  if (!config.apiKey || !config.baseUrl || !config.model) {
    throw new Error('请先配置Embedding API')
  }

  try {
    const response = await axios.post(
      `${config.baseUrl.replace(/\/$/, '')}/embeddings`,
      {
        input: text,
        model: config.model
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        timeout: 30000
      }
    )
    return response.data.data[0].embedding
  } catch (error) {
    console.error('Embedding请求失败:', error)
    if (error.response) {
      throw new Error(`Embedding API错误: ${error.response.status} - ${error.response.data?.error?.message || '未知错误'}`)
    }
    throw error
  }
}

export async function getEmbeddingWithRetry(text, config, attempt = 1) {
  try {
    return await getEmbedding(text, config)
  } catch (error) {
    if (attempt < EMBEDDING_CONFIG.retryConfig.maxRetries) {
      const delay = EMBEDDING_CONFIG.retryConfig.retryDelay * 
                   Math.pow(EMBEDDING_CONFIG.retryConfig.retryBackoff, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
      return getEmbeddingWithRetry(text, config, attempt + 1)
    }
    throw error
  }
}

export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('向量维度不一致')
  }
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }
  
  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)
  
  if (normA === 0 || normB === 0) return 0
  
  return dotProduct / (normA * normB)
}

export function euclideanDistance(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('向量维度不一致')
  }
  
  let sum = 0
  for (let i = 0; i < vecA.length; i++) {
    sum += Math.pow(vecA[i] - vecB[i], 2)
  }
  return Math.sqrt(sum)
}

export function searchSimilar(vector, items, options = {}) {
  const { 
    topK = 5, 
    threshold = 0.0,
    similarityFn = cosineSimilarity 
  } = options
  
  const results = items
    .filter(item => item.embedding && item.embedding.length > 0)
    .map(item => ({
      ...item,
      similarity: similarityFn(vector, item.embedding)
    }))
    .filter(item => item.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
  
  return results.slice(0, topK)
}

export async function batchGetEmbeddings(texts, config) {
  const results = []
  const batches = chunkArray(texts, EMBEDDING_CONFIG.maxBatchSize)
  
  for (const batch of batches) {
    const batchResults = await Promise.all(
      batch.map(text => 
        getEmbeddingWithRetry(text, config).catch(error => {
          console.error(`获取Embedding失败: ${text.substring(0, 50)}...`, error)
          return null
        })
      )
    )
    results.push(...batchResults)
  }
  
  return results
}

export function chunkText(text, chunkSize = EMBEDDING_CONFIG.defaultChunkSize, overlap = EMBEDDING_CONFIG.defaultOverlap) {
  const chunks = []
  let start = 0
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.substring(start, end))
    
    if (end >= text.length) break
    
    start = end - overlap
  }
  
  return chunks
}

export function chunkArray(array, size) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export async function createDocumentEmbeddings(documents, config) {
  const results = []
  
  for (const doc of documents) {
    const text = typeof doc === 'string' ? doc : doc.content
    const chunks = chunkText(text)
    const embeddings = await batchGetEmbeddings(chunks, config)
    
    for (let i = 0; i < chunks.length; i++) {
      results.push({
        id: doc.id ? `${doc.id}-${i}` : `${Date.now()}-${i}`,
        documentId: doc.id,
        content: chunks[i],
        embedding: embeddings[i],
        chunkIndex: i,
        totalChunks: chunks.length,
        metadata: doc.metadata || {}
      })
    }
  }
  
  return results
}

export async function searchDocuments(query, documents, config, options = {}) {
  if (!query || !documents || documents.length === 0) {
    return []
  }
  
  const queryEmbedding = await getEmbeddingWithRetry(query, config)
  const searchableItems = documents.filter(doc => doc.embedding)
  
  return searchSimilar(queryEmbedding, searchableItems, {
    topK: options.topK || 5,
    threshold: options.threshold || 0.3
  })
}

export async function buildContext(query, documents, config, options = {}) {
  const results = await searchDocuments(query, documents, config, options)
  
  const context = results.map((result, index) => {
    return `【参考${index + 1}】\n${result.content}`
  }).join('\n\n')
  
  return {
    context,
    sources: results.map(r => ({
      id: r.documentId || r.id,
      similarity: r.similarity,
      chunkIndex: r.chunkIndex
    }))
  }
}

export function mergeEmbeddings(documents) {
  if (!documents || documents.length === 0) {
    return null
  }
  
  const dimension = documents[0].embedding?.length
  if (!dimension) return null
  
  const merged = new Array(dimension).fill(0)
  
  for (const doc of documents) {
    if (doc.embedding && doc.embedding.length === dimension) {
      for (let i = 0; i < dimension; i++) {
        merged[i] += doc.embedding[i]
      }
    }
  }
  
  const norm = Math.sqrt(merged.reduce((sum, val) => sum + val * val, 0))
  if (norm === 0) return null
  
  return merged.map(val => val / norm)
}

export function normalizeVector(vector) {
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
  if (norm === 0) return vector
  return vector.map(val => val / norm)
}

export function averageVectors(vectors) {
  if (!vectors || vectors.length === 0) return null
  
  const dimension = vectors[0].length
  const result = new Array(dimension).fill(0)
  
  for (const vec of vectors) {
    for (let i = 0; i < dimension; i++) {
      result[i] += vec[i]
    }
  }
  
  return result.map(val => val / vectors.length)
}

export function isValidEmbedding(embedding) {
  if (!embedding || !Array.isArray(embedding)) return false
  if (embedding.length === 0) return false
  return embedding.every(val => typeof val === 'number' && !isNaN(val))
}

export function estimateTokenCount(text) {
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = text.split(/\s+/).filter(w => w.length > 0).length
  const otherChars = text.length - chineseChars
  
  return Math.ceil(chineseChars * 1 + englishWords * 1.3 + otherChars * 0.5)
}
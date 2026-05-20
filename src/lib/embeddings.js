import axios from 'axios'

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
        }
      }
    )
    return response.data.data[0].embedding
  } catch (error) {
    console.error('Embedding请求失败:', error)
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

export function searchSimilar(vector, items, topK = 5) {
  const results = items.map(item => ({
    ...item,
    similarity: cosineSimilarity(vector, item.embedding)
  })).sort((a, b) => b.similarity - a.similarity)
  
  return results.slice(0, topK)
}

export async function batchGetEmbeddings(texts, config) {
  const results = []
  for (const text of texts) {
    try {
      const embedding = await getEmbedding(text, config)
      results.push(embedding)
    } catch (error) {
      console.error(`获取Embedding失败: ${text.substring(0, 50)}...`, error)
      results.push(null)
    }
  }
  return results
}

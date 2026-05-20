import { openDB } from 'idb'

const DB_NAME = 'integrated-author-db'
const DB_VERSION = 1

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('projects')) {
        const projectStore = db.createObjectStore('projects', { keyPath: 'id' })
        projectStore.createIndex('updatedAt', 'updatedAt')
      }
      if (!db.objectStoreNames.contains('snapshots')) {
        const snapshotStore = db.createObjectStore('snapshots', { keyPath: 'id' })
        snapshotStore.createIndex('projectId', 'projectId')
        snapshotStore.createIndex('createdAt', 'createdAt')
      }
      if (!db.objectStoreNames.contains('templates')) {
        db.createObjectStore('templates', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('prompts')) {
        db.createObjectStore('prompts', { keyPath: 'id' })
      }
    }
  })
}

export async function saveProject(project) {
  const db = await getDB()
  const projectData = {
    ...project,
    updatedAt: new Date().toISOString()
  }
  await db.put('projects', projectData)
  return projectData
}

export async function getProject(id) {
  const db = await getDB()
  return await db.get('projects', id)
}

export async function getAllProjects() {
  const db = await getDB()
  return await db.getAll('projects')
}

export async function deleteProject(id) {
  const db = await getDB()
  await db.delete('projects', id)
  await db.delete('snapshots', IDBKeyRange.only(id), 'projectId')
}

export async function createSnapshot(projectId, data) {
  const db = await getDB()
  const snapshot = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    projectId,
    data,
    createdAt: new Date().toISOString(),
    type: 'auto'
  }
  await db.add('snapshots', snapshot)
  
  const snapshots = await db.getAllFromIndex('snapshots', 'projectId', IDBKeyRange.only(projectId))
  if (snapshots.length > 50) {
    snapshots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    const oldSnapshots = snapshots.slice(50)
    for (const snap of oldSnapshots) {
      await db.delete('snapshots', snap.id)
    }
  }
  
  return snapshot
}

export async function getSnapshots(projectId) {
  const db = await getDB()
  const snapshots = await db.getAllFromIndex('snapshots', 'projectId', IDBKeyRange.only(projectId))
  return snapshots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function restoreFromSnapshot(snapshotId) {
  const db = await getDB()
  const snapshot = await db.get('snapshots', snapshotId)
  if (snapshot) {
    await db.put('projects', { ...snapshot.data, updatedAt: new Date().toISOString() })
  }
  return snapshot?.data
}

export async function saveTemplate(template) {
  const db = await getDB()
  await db.put('templates', { ...template, id: template.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` })
}

export async function getAllTemplates() {
  const db = await getDB()
  return await db.getAll('templates')
}

export async function deleteTemplate(id) {
  const db = await getDB()
  await db.delete('templates', id)
}

export async function savePrompt(prompt) {
  const db = await getDB()
  await db.put('prompts', { ...prompt, id: prompt.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` })
}

export async function getAllPrompts() {
  const db = await getDB()
  return await db.getAll('prompts')
}

export async function deletePrompt(id) {
  const db = await getDB()
  await db.delete('prompts', id)
}

export function exportProject(project) {
  const data = JSON.stringify(project, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `project-${project.id}-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importProject(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result)
        const project = await saveProject(data)
        resolve(project)
      } catch (error) {
        reject(new Error('项目文件格式错误'))
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export function exportToMarkdown(project) {
  let md = `# ${project.title || '未命名作品'}\n\n`
  
  if (project.description) {
    md += `## 简介\n${project.description}\n\n`
  }
  
  if (project.chapters && project.chapters.length > 0) {
    md += `## 章节内容\n\n`
    project.chapters.forEach((chapter, index) => {
      md += `### ${index + 1}. ${chapter.title || `章节${index + 1}`}\n\n`
      md += `${chapter.content || chapter.generatedText || ''}\n\n`
    })
  }
  
  const blob = new Blob([md], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.title || 'untitled'}.md`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToTxt(project) {
  let text = `${project.title || '未命名作品'}\n\n`
  
  if (project.description) {
    text += `简介：${project.description}\n\n`
  }
  
  if (project.chapters && project.chapters.length > 0) {
    project.chapters.forEach((chapter, index) => {
      text += `${index + 1}. ${chapter.title || `章节${index + 1}`}\n\n`
      text += `${chapter.content || chapter.generatedText || ''}\n\n`
    })
  }
  
  const blob = new Blob([text], { type: 'text/plain', encoding: 'utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.title || 'untitled'}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

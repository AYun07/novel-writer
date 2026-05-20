import { openDB } from 'idb'

const DB_NAME = 'integrated-author-db'
const DB_VERSION = 2

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (oldVersion < 1) {
        const projectStore = db.createObjectStore('projects', { keyPath: 'id' })
        projectStore.createIndex('updatedAt', 'updatedAt')
        
        const snapshotStore = db.createObjectStore('snapshots', { keyPath: 'id' })
        snapshotStore.createIndex('projectId', 'projectId')
        snapshotStore.createIndex('createdAt', 'createdAt')
        
        db.createObjectStore('templates', { keyPath: 'id' })
        db.createObjectStore('prompts', { keyPath: 'id' })
      }
      
      if (oldVersion < 2) {
        const projectStore = transaction.objectStore('projects')
        if (!projectStore.indexNames.contains('userId')) {
          projectStore.createIndex('userId', 'userId')
        }
      }
    },
    blocked() {
      console.warn('数据库升级被阻止，另一个标签页正在使用')
    },
    blocking() {
      console.warn('数据库正在升级，请刷新页面')
    }
  })
}

export async function saveProject(project) {
  try {
    const db = await getDB()
    const projectData = {
      ...project,
      updatedAt: new Date().toISOString(),
      version: 2
    }
    await db.put('projects', projectData)
    return projectData
  } catch (error) {
    console.error('保存项目失败:', error)
    throw new Error(`保存项目失败: ${error.message}`)
  }
}

export async function getProject(id) {
  try {
    const db = await getDB()
    const project = await db.get('projects', id)
    return project
  } catch (error) {
    console.error('获取项目失败:', error)
    throw new Error(`获取项目失败: ${error.message}`)
  }
}

export async function getAllProjects() {
  try {
    const db = await getDB()
    return await db.getAll('projects')
  } catch (error) {
    console.error('获取所有项目失败:', error)
    throw new Error(`获取所有项目失败: ${error.message}`)
  }
}

export async function getProjectsByUserId(userId) {
  try {
    const db = await getDB()
    const projects = await db.getAllFromIndex('projects', 'userId', userId)
    return projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  } catch (error) {
    console.error('按用户ID获取项目失败:', error)
    throw new Error(`获取项目失败: ${error.message}`)
  }
}

export async function deleteProject(id) {
  try {
    const db = await getDB()
    const tx = db.transaction(['projects', 'snapshots'], 'readwrite')
    await tx.objectStore('projects').delete(id)
    
    const snapshots = await tx.objectStore('snapshots').getAll()
    for (const snap of snapshots) {
      if (snap.projectId === id) {
        await tx.objectStore('snapshots').delete(snap.id)
      }
    }
    
    await tx.done
  } catch (error) {
    console.error('删除项目失败:', error)
    throw new Error(`删除项目失败: ${error.message}`)
  }
}

export async function createSnapshot(projectId, data) {
  try {
    const db = await getDB()
    const snapshot = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      data,
      createdAt: new Date().toISOString(),
      type: 'auto',
      version: 2
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
  } catch (error) {
    console.error('创建快照失败:', error)
    throw new Error(`创建快照失败: ${error.message}`)
  }
}

export async function getSnapshots(projectId) {
  try {
    const db = await getDB()
    const snapshots = await db.getAllFromIndex('snapshots', 'projectId', IDBKeyRange.only(projectId))
    return snapshots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (error) {
    console.error('获取快照失败:', error)
    throw new Error(`获取快照失败: ${error.message}`)
  }
}

export async function restoreFromSnapshot(snapshotId) {
  try {
    const db = await getDB()
    const snapshot = await db.get('snapshots', snapshotId)
    if (!snapshot) {
      throw new Error('快照不存在')
    }
    
    const restoredProject = { 
      ...snapshot.data, 
      updatedAt: new Date().toISOString(),
      restoredFromSnapshot: snapshotId
    }
    await db.put('projects', restoredProject)
    return restoredProject
  } catch (error) {
    console.error('从快照恢复失败:', error)
    throw new Error(`恢复失败: ${error.message}`)
  }
}

export async function deleteSnapshot(snapshotId) {
  try {
    const db = await getDB()
    await db.delete('snapshots', snapshotId)
  } catch (error) {
    console.error('删除快照失败:', error)
    throw new Error(`删除快照失败: ${error.message}`)
  }
}

export async function saveTemplate(template) {
  try {
    const db = await getDB()
    await db.put('templates', { 
      ...template, 
      id: template.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: template.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('保存模板失败:', error)
    throw new Error(`保存模板失败: ${error.message}`)
  }
}

export async function getAllTemplates() {
  try {
    const db = await getDB()
    return await db.getAll('templates')
  } catch (error) {
    console.error('获取所有模板失败:', error)
    throw new Error(`获取模板失败: ${error.message}`)
  }
}

export async function deleteTemplate(id) {
  try {
    const db = await getDB()
    await db.delete('templates', id)
  } catch (error) {
    console.error('删除模板失败:', error)
    throw new Error(`删除模板失败: ${error.message}`)
  }
}

export async function savePrompt(prompt) {
  try {
    const db = await getDB()
    await db.put('prompts', { 
      ...prompt, 
      id: prompt.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: prompt.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('保存提示词失败:', error)
    throw new Error(`保存提示词失败: ${error.message}`)
  }
}

export async function getAllPrompts() {
  try {
    const db = await getDB()
    return await db.getAll('prompts')
  } catch (error) {
    console.error('获取所有提示词失败:', error)
    throw new Error(`获取提示词失败: ${error.message}`)
  }
}

export async function deletePrompt(id) {
  try {
    const db = await getDB()
    await db.delete('prompts', id)
  } catch (error) {
    console.error('删除提示词失败:', error)
    throw new Error(`删除提示词失败: ${error.message}`)
  }
}

export async function exportProject(project) {
  try {
    const data = JSON.stringify(project, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    downloadFile(blob, `project-${project.id}-${new Date().toISOString().split('T')[0]}.json`)
  } catch (error) {
    console.error('导出项目失败:', error)
    throw new Error(`导出项目失败: ${error.message}`)
  }
}

export async function importProject(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result)
        
        if (!data.id || typeof data !== 'object') {
          throw new Error('无效的项目文件格式')
        }
        
        const project = await saveProject(data)
        resolve(project)
      } catch (error) {
        reject(new Error(`导入失败: ${error.message}`))
      }
    }
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsText(file)
  })
}

export function exportToMarkdown(project) {
  try {
    let md = `# ${project.title || '未命名作品'}\n\n`
    
    if (project.description) {
      md += `## 简介\n${project.description}\n\n`
    }
    
    if (project.novelInfo?.genre) {
      md += `**类型**: ${project.novelInfo.genre}\n\n`
    }
    
    if (project.chapters && project.chapters.length > 0) {
      md += `## 章节内容\n\n`
      project.chapters.forEach((chapter, index) => {
        md += `### ${index + 1}. ${chapter.title || `章节${index + 1}`}\n\n`
        md += `${stripHtml(chapter.content || chapter.generatedText || '')}\n\n`
      })
    }
    
    const blob = new Blob([md], { type: 'text/markdown' })
    downloadFile(blob, `${project.title || 'untitled'}.md`)
  } catch (error) {
    console.error('导出Markdown失败:', error)
    throw new Error(`导出失败: ${error.message}`)
  }
}

export function exportToTxt(project) {
  try {
    let text = `${project.title || '未命名作品'}\n\n`
    
    if (project.description) {
      text += `简介：${project.description}\n\n`
    }
    
    if (project.novelInfo?.genre) {
      text += `类型：${project.novelInfo.genre}\n\n`
    }
    
    if (project.chapters && project.chapters.length > 0) {
      project.chapters.forEach((chapter, index) => {
        text += `${index + 1}. ${chapter.title || `章节${index + 1}`}\n\n`
        text += `${stripHtml(chapter.content || chapter.generatedText || '')}\n\n`
      })
    }
    
    const blob = new Blob([text], { type: 'text/plain', encoding: 'utf-8' })
    downloadFile(blob, `${project.title || 'untitled'}.txt`)
  } catch (error) {
    console.error('导出TXT失败:', error)
    throw new Error(`导出失败: ${error.message}`)
  }
}

export function exportToHTML(project) {
  try {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.title || '未命名作品'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.8; }
    h1 { color: #1a1a1a; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
    h2 { color: #2d2d2d; margin-top: 2rem; }
    h3 { color: #3d3d3d; margin-top: 1.5rem; }
    .chapter { margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #f3f4f6; }
    .meta { color: #6b7280; font-size: 0.9rem; }
  </style>
</head>
<body>
  <h1>${project.title || '未命名作品'}</h1>
  ${project.description ? `<p class="meta">${project.description}</p>` : ''}
  ${project.novelInfo?.genre ? `<p class="meta">类型: ${project.novelInfo.genre}</p>` : ''}
  
  <div class="content">
    ${project.chapters?.map((chapter, index) => `
      <div class="chapter">
        <h2>${index + 1}. ${chapter.title || `章节${index + 1}`}</h2>
        <div>${chapter.content || chapter.generatedText || ''}</div>
      </div>
    `).join('') || '<p>暂无章节内容</p>'}
  </div>
</body>
</html>`
    
    const blob = new Blob([html], { type: 'text/html' })
    downloadFile(blob, `${project.title || 'untitled'}.html`)
  } catch (error) {
    console.error('导出HTML失败:', error)
    throw new Error(`导出失败: ${error.message}`)
  }
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function stripHtml(html) {
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export async function backupAllData() {
  try {
    const db = await getDB()
    const projects = await db.getAll('projects')
    const templates = await db.getAll('templates')
    const prompts = await db.getAll('prompts')
    
    const backup = {
      version: 2,
      exportTime: new Date().toISOString(),
      projects,
      templates,
      prompts
    }
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    downloadFile(blob, `backup-${new Date().toISOString().split('T')[0]}.json`)
  } catch (error) {
    console.error('备份失败:', error)
    throw new Error(`备份失败: ${error.message}`)
  }
}

export async function restoreFromBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const backup = JSON.parse(e.target.result)
        
        if (!backup.version) {
          throw new Error('无效的备份文件格式')
        }
        
        const db = await getDB()
        const tx = db.transaction(['projects', 'templates', 'prompts'], 'readwrite')
        
        if (backup.projects) {
          for (const project of backup.projects) {
            await tx.objectStore('projects').put({
              ...project,
              updatedAt: new Date().toISOString(),
              version: 2
            })
          }
        }
        
        if (backup.templates) {
          for (const template of backup.templates) {
            await tx.objectStore('templates').put(template)
          }
        }
        
        if (backup.prompts) {
          for (const prompt of backup.prompts) {
            await tx.objectStore('prompts').put(prompt)
          }
        }
        
        await tx.done
        resolve({
          projects: backup.projects?.length || 0,
          templates: backup.templates?.length || 0,
          prompts: backup.prompts?.length || 0
        })
      } catch (error) {
        reject(new Error(`恢复失败: ${error.message}`))
      }
    }
    reader.onerror = () => reject(new Error('读取备份文件失败'))
    reader.readAsText(file)
  })
}

export async function checkDatabaseHealth() {
  try {
    const db = await getDB()
    const projects = await db.getAll('projects')
    const snapshots = await db.getAll('snapshots')
    
    return {
      status: 'healthy',
      projectCount: projects.length,
      snapshotCount: snapshots.length,
      lastUpdated: projects.length > 0 
        ? Math.max(...projects.map(p => new Date(p.updatedAt).getTime())) 
        : null
    }
  } catch (error) {
    console.error('数据库健康检查失败:', error)
    return { status: 'error', error: error.message }
  }
}
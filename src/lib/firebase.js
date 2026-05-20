import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, onSnapshot, deleteDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)
const googleProvider = new GoogleAuthProvider()

export { auth, db, storage, googleProvider }

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    await ensureUserDocument(result.user)
    return result.user
  } catch (error) {
    console.error('Google登录失败:', error)
    throw error
  }
}

export async function signInWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    await ensureUserDocument(result.user)
    return result.user
  } catch (error) {
    console.error('邮箱登录失败:', error)
    throw error
  }
}

export async function signUpWithEmail(email, password, displayName) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    if (displayName) {
      await result.user.updateProfile({ displayName })
    }
    await ensureUserDocument(result.user)
    return result.user
  } catch (error) {
    console.error('注册失败:', error)
    throw error
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error('重置密码失败:', error)
    throw error
  }
}

export async function signOutUser() {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('登出失败:', error)
    throw error
  }
}

export function onAuthStateChangedHandler(callback) {
  return onAuthStateChanged(auth, callback)
}

async function ensureUserDocument(user) {
  try {
    const docRef = doc(db, 'users', user.uid)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0],
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastActiveAt: serverTimestamp()
      })
    }
  } catch (error) {
    console.error('创建用户文档失败:', error)
  }
}

export async function saveUserData(userId, data) {
  try {
    await setDoc(doc(db, 'users', userId), data, { merge: true })
  } catch (error) {
    console.error('保存用户数据失败:', error)
    throw error
  }
}

export async function getUserData(userId) {
  try {
    const docRef = doc(db, 'users', userId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data()
    }
    return null
  } catch (error) {
    console.error('获取用户数据失败:', error)
    throw error
  }
}

export async function subscribeToUserData(userId, callback) {
  const docRef = doc(db, 'users', userId)
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data())
    }
  })
}

export async function uploadFile(file, userId, path) {
  try {
    const storageRef = ref(storage, `users/${userId}/${path}`)
    const snapshot = await uploadBytes(storageRef, file)
    return await getDownloadURL(snapshot.ref)
  } catch (error) {
    console.error('文件上传失败:', error)
    throw error
  }
}

export async function deleteFile(userId, path) {
  try {
    const storageRef = ref(storage, `users/${userId}/${path}`)
    await deleteObject(storageRef)
  } catch (error) {
    console.error('文件删除失败:', error)
    throw error
  }
}

export async function saveProjectToCloud(userId, project) {
  try {
    const projectData = {
      ...project,
      userId,
      updatedAt: serverTimestamp(),
      syncedAt: serverTimestamp(),
      syncStatus: 'synced'
    }
    await setDoc(doc(db, 'projects', project.id), projectData)
    return projectData
  } catch (error) {
    console.error('保存项目到云端失败:', error)
    throw error
  }
}

export async function getProjectFromCloud(userId, projectId) {
  try {
    const docRef = doc(db, 'projects', projectId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      if (data.userId === userId) {
        return data
      }
      throw new Error('无权访问该项目')
    }
    return null
  } catch (error) {
    console.error('从云端获取项目失败:', error)
    throw error
  }
}

export async function getAllProjectsFromCloud(userId) {
  try {
    const q = query(collection(db, 'projects'), where('userId', '==', userId))
    const querySnapshot = await q.get()
    const projects = []
    
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() })
    })
    
    return projects.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0))
  } catch (error) {
    console.error('从云端获取所有项目失败:', error)
    throw error
  }
}

export async function deleteProjectFromCloud(userId, projectId) {
  try {
    const docRef = doc(db, 'projects', projectId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      if (data.userId !== userId) {
        throw new Error('无权删除该项目')
      }
      await deleteDoc(docRef)
    }
  } catch (error) {
    console.error('从云端删除项目失败:', error)
    throw error
  }
}

export async function syncProject(userId, localProject) {
  try {
    const cloudProject = await getProjectFromCloud(userId, localProject.id)
    
    if (!cloudProject) {
      return await saveProjectToCloud(userId, localProject)
    }
    
    const localTime = new Date(localProject.updatedAt).getTime()
    const cloudTime = cloudProject.updatedAt?.seconds ? 
      cloudProject.updatedAt.seconds * 1000 : 0
    
    if (localTime > cloudTime) {
      return await saveProjectToCloud(userId, localProject)
    } else if (cloudTime > localTime) {
      return cloudProject
    }
    
    return localProject
  } catch (error) {
    console.error('同步项目失败:', error)
    throw error
  }
}

export async function syncAllProjects(userId, localProjects) {
  const results = {
    updated: 0,
    created: 0,
    conflicts: 0,
    skipped: 0
  }
  
  try {
    const cloudProjects = await getAllProjectsFromCloud(userId)
    const cloudProjectMap = new Map(cloudProjects.map(p => [p.id, p]))
    
    for (const localProject of localProjects) {
      const cloudProject = cloudProjectMap.get(localProject.id)
      
      if (!cloudProject) {
        await saveProjectToCloud(userId, localProject)
        results.created++
      } else {
        const localTime = new Date(localProject.updatedAt).getTime()
        const cloudTime = cloudProject.updatedAt?.seconds ? 
          cloudProject.updatedAt.seconds * 1000 : 0
        
        if (localTime > cloudTime) {
          await saveProjectToCloud(userId, localProject)
          results.updated++
        } else if (cloudTime > localTime) {
          results.conflicts++
        } else {
          results.skipped++
        }
      }
    }
    
    return results
  } catch (error) {
    console.error('同步所有项目失败:', error)
    throw error
  }
}

export function subscribeToProjectUpdates(userId, projectId, callback) {
  const docRef = doc(db, 'projects', projectId)
  
  return onSnapshot(docRef, async (doc) => {
    if (doc.exists()) {
      const data = doc.data()
      if (data.userId === userId) {
        callback(data)
      }
    }
  }, (error) => {
    console.error('订阅项目更新失败:', error)
  })
}

export function subscribeToAllProjects(userId, callback) {
  const q = query(collection(db, 'projects'), where('userId', '==', userId))
  
  return onSnapshot(q, (querySnapshot) => {
    const projects = []
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() })
    })
    callback(projects)
  }, (error) => {
    console.error('订阅所有项目失败:', error)
  })
}

export async function resolveConflict(userId, projectId, resolution) {
  try {
    const localProject = await getProjectFromCloud(userId, projectId)
    if (!localProject) throw new Error('项目不存在')
    
    if (resolution === 'keep_local') {
      return await saveProjectToCloud(userId, localProject)
    } else if (resolution === 'keep_cloud') {
      return localProject
    } else if (resolution === 'merge') {
      return localProject
    }
    
    return localProject
  } catch (error) {
    console.error('解决冲突失败:', error)
    throw error
  }
}

export async function getSyncStatus(userId) {
  try {
    const userData = await getUserData(userId)
    const projects = await getAllProjectsFromCloud(userId)
    
    return {
      lastSync: userData?.lastSyncedAt || null,
      projectCount: projects.length,
      storageUsed: 0
    }
  } catch (error) {
    console.error('获取同步状态失败:', error)
    throw error
  }
}

export async function updateUserLastActive(userId) {
  try {
    await updateDoc(doc(db, 'users', userId), {
      lastActiveAt: serverTimestamp()
    })
  } catch (error) {
    console.error('更新最后活跃时间失败:', error)
  }
}
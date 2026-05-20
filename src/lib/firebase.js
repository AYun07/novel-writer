import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

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
    return result.user
  } catch (error) {
    console.error('Google登录失败:', error)
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

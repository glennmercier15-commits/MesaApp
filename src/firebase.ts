import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, updateProfile } from 'firebase/auth';
import { getFirestore, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection, query, where, onSnapshot, Timestamp, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc,
  deleteDoc,
  collection, 
  query, 
  where, 
  onSnapshot, 
  Timestamp,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
  ref,
  uploadBytes,
  getDownloadURL
};
export type { User };

// Helper to ensure user profile exists
export async function ensureUserProfile(user: User) {
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: 'client', // Default role
      createdAt: serverTimestamp(),
      location: 'Renfrew County'
    });
  }
}

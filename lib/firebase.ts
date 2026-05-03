import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDfjmguULJFmw8LZacWK6Maa2vcNN1hhSw",
  authDomain: "interyou-2cf1e.firebaseapp.com",
  projectId: "interyou-2cf1e",
  storageBucket: "interyou-2cf1e.firebasestorage.app",
  messagingSenderId: "836998244663",
  appId: "1:836998244663:web:7d89578e28e55821d512b2",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

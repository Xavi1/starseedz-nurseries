// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBjyxPBFz42Z0t2WNYIAFHuYi1VKjQdc3U",
  authDomain: "starseedz-nurseries.firebaseapp.com",
  projectId: "starseedz-nurseries",
  storageBucket: "starseedz-nurseries.firebasestorage.app",
  messagingSenderId: "492281895671",
  appId: "1:492281895671:web:291f1e0eafcbe09f41d1f2",
  measurementId: "G-686DVWFK7L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Optionally export auth and db if needed
 export const auth = getAuth(app);
 export const db = getFirestore(app);
 export default app;

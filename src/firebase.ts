// src/firebase.ts
import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth'; // Uncomment if you need auth
// import { getFirestore } from 'firebase/firestore'; // Uncomment if you need Firestore

// TODO: Replace with your Firebase project config
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Optionally export auth and db if needed
// export const auth = getAuth(app);
// export const db = getFirestore(app);

export default app;

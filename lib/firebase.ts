// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyCnfz2W91EIpWI0yB46zp5LuiCdtnrgxXA",
  authDomain: "tripmate-b6bc4.firebaseapp.com",
  projectId: "tripmate-b6bc4",
  storageBucket: "tripmate-b6bc4.appspot.com",
  messagingSenderId: "1068730370971",
  appId: "1:1068730370971:web:05a4c5e1f58956869a6f3e",
  measurementId: "G-Q4KGF5W3X1",
};

// Инициализация на Firebase App
const app = initializeApp(firebaseConfig);

// Firebase услуги
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics (по желание)
export const analytics = getAnalytics(app);

export default app;

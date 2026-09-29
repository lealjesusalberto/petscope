import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB5bZOhORAvMMzkKisXI-pm1FdMkbGyEKI",
  authDomain: "qpet-3caba.firebaseapp.com",
  projectId: "qpet-3caba",
  storageBucket: "qpet-3caba.firebasestorage.app",
  messagingSenderId: "757754050584",
  appId: "1:757754050584:web:74e377cd4c6fb6fe33eb6d",
  measurementId: "G-ESCFB9KCVK"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Safe Analytics (browser only)
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

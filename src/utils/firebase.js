import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Додано
import { getFirestore } from "firebase/firestore"; // Додано

const firebaseConfig = {
  apiKey: "AIzaSyBeMc_WQx6iBQZzFgx3TW-Bllvrz5x5ulk",
  authDomain: "e-learning-platform-2d85d.firebaseapp.com",
  projectId: "e-learning-platform-2d85d",
  storageBucket: "e-learning-platform-2d85d.firebasestorage.app",
  messagingSenderId: "919777498619",
  appId: "1:919777498619:web:5e0a4456d6760cdfbaa75e",
  measurementId: "G-5L6R4SD500",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

const analytics = getAnalytics(app);

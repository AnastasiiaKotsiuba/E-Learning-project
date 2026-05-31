// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// ← тільки це зміни
const firebaseConfig = {
  projectId: "e-learning-platform-2d85d", // наприклад: my-test-project-abc123
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

// Тільки локально підключаємо емулятор
if (process.env.NODE_ENV === "development") {
  console.log("→→→ ЙДУ НА ЛОКАЛЬНИЙ EMULATOR ←←←");
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

export { db };

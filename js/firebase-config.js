import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBvkBV36QBM142CU2ZbFneJ2KGeawrD-xw",
  authDomain: "sistema-sos-qr.firebaseapp.com",
  projectId: "sistema-sos-qr",
  storageBucket: "sistema-sos-qr.firebasestorage.app",
  messagingSenderId: "823812237121",
  appId: "1:823812237121:web:1c0e8e3ab14912f291e3c0",
  measurementId: "G-CF8QV79DKB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
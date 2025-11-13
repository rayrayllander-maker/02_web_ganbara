// Firebase initialization for Ganbara web app
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  runTransaction,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAkWU3kLpYVEUG1U5_1UKFTPIawYQbKpR8",
  authDomain: "web-ganbara.firebaseapp.com",
  projectId: "web-ganbara",
  storageBucket: "web-ganbara.firebasestorage.app",
  messagingSenderId: "288421470720",
  appId: "1:288421470720:web:20f5d951acecd47491aee5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");

// Expose auth so other scripts can hook into Firebase Authentication easily
window.firebaseServices = {
  app,
  auth,
  provider: googleProvider,
  googleProvider,
  appleProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  firestore: {
    db,
    doc,
    runTransaction,
    onSnapshot,
    serverTimestamp
  }
};

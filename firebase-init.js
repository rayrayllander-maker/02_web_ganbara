// Firebase initialization for Ganbara web app
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

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
const provider = new GoogleAuthProvider();

// Expose auth so other scripts can hook into Firebase Authentication easily
window.firebaseServices = {
    app,
  auth,
  provider,
  onAuthStateChanged,
  signInWithPopup,
  signOut
};

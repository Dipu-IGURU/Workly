// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDG5l31NWA0K61SEMN7I__K57lSgx8hDhk",
  authDomain: "workly-d2a93.firebaseapp.com",
  projectId: "workly-d2a93",
  storageBucket: "workly-d2a93.firebasestorage.app",
  messagingSenderId: "1068932257538",
  appId: "1:1068932257538:web:752fc0b1f1be724a75541b",
  measurementId: "G-BVHBLMKMQJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };

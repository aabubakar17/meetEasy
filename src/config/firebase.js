// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9pzEGZPBZQNSVks3BYzcxDfa30C-K-SE",
  authDomain: "meeteasy-244a4.firebaseapp.com",
  projectId: "meeteasy-244a4",
  storageBucket: "meeteasy-244a4.appspot.com",
  messagingSenderId: "521560286937",
  appId: "1:521560286937:web:e57e69fcdc97f768efc0c8",
  measurementId: "G-Q8BRFCH0CS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

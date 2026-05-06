// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFzasDzjp7Ds7Gyk9yRTmJLEQjaTJlgG4",
  authDomain: "blog-db9a4.firebaseapp.com",
  projectId: "blog-db9a4",
  storageBucket: "blog-db9a4.firebasestorage.app",
  messagingSenderId: "127827834548",
  appId: "1:127827834548:web:823fe1e7a734f930d7c9e1",
  measurementId: "G-G0T07B5YMX"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage();



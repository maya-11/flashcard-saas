// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBRyS00rebr8gSii1S_d7Vw0REYFUJ3ai0",
  authDomain: "flashcardsaas-d0c3b.firebaseapp.com",
  projectId: "flashcardsaas-d0c3b",
  storageBucket: "flashcardsaas-d0c3b.appspot.com",
  messagingSenderId: "959818697710",
  appId: "1:959818697710:web:33f3111bdeb459ff11dcff",
  measurementId: "G-Q9PCLH306J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

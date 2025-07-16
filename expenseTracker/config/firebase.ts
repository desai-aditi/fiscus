// Import the functions you need from the SDKs you need
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import dotenv from 'dotenv';
dotenv.config();
const apiKey = process.env.FIREBASE_API_KEY;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: apiKey,
  authDomain: "expensetracker-50a69.firebaseapp.com",
  projectId: "expensetracker-50a69",
  storageBucket: "expensetracker-50a69.firebasestorage.app",
  messagingSenderId: "669722309677",
  appId: "1:669722309677:web:863891b3ce6d7d5139f4a4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// auth
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// database
export const firestore = getFirestore(app);
// Import the functions you need from the SDKs you need
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHu_n0FmeaL--ayId5eRfTB8Eu6_ez0xI",
  authDomain: "fiscus-72161.firebaseapp.com",
  projectId: "fiscus-72161",
  storageBucket: "fiscus-72161.firebasestorage.app",
  messagingSenderId: "966951324479",
  appId: "1:966951324479:web:c4fab92b5275278133618a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// auth
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// database
export const firestore = getFirestore(app);
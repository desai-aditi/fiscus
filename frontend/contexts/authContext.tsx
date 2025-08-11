import { auth, firestore } from "@/config/firebase";
import { AuthContextType, UserType } from "@/types/auth";
import axios from "axios";
import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  signInWithCredential,
  GoogleAuthProvider
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Start with true
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setLoading(true); // Set loading when auth state changes
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch user doc to get security preferences
          const userDoc = await getDoc(doc(firestore, "users", firebaseUser.uid));
          const data = userDoc.exists() ? userDoc.data() : {};
          console.log('firebase data: ', data);

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || data.name || "",
            securityMethod: data.securityMethod || null, // 'faceId', 'pin', or null
            emailVerified: data.emailVerified || false,
            pin: data.pin || null, 
          });

          const token = await firebaseUser.getIdToken();
          setToken(token);
          
          // Reset unlocked state when user changes
          setUnlocked(false);
        } else {
          setUser(null);
          setToken(null);
          setUnlocked(false);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("(auth/invalid-credential)")) msg = "Invalid email or password.";
      if (msg.includes("(auth/invalid-email)")) msg = "Invalid email.";
      return { success: false, msg };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      let response = await createUserWithEmailAndPassword(auth, email, password);
      console.log('register response: ', response)
      
      await setDoc(doc(firestore, "users", response.user.uid), {
        name,
        email,
        uid: response.user.uid,
        securityMethod: null,
        pin: null,
        emailVerified: false
      });
      
      return { success: true };
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("(auth/email-already-in-use)")) msg = "Email already in use";
      if (msg.includes("(auth/invalid-email)")) msg = "Invalid email.";
      if (msg.includes("(auth/weak-password")) msg = "Password must be at least 6 characters long.";
      return { success: false, msg };
    }
  };

  // Function to set security method (only for Face ID)
  const setSecurityMethod = async (method: 'faceId') => {
    if (user) {
      try {
        await updateDoc(doc(firestore, "users", user.uid), {
          securityMethod: method
        });
        
        setUser(prev => prev ? { ...prev, securityMethod: method } : null);
      } catch (error) {
        console.error("Error setting security method:", error);
      }
    }
  };

  // logout function
  const logout = async () => {
    await signOut(auth);
    setUnlocked(false);
    router.replace('/(onboarding)')
  };

  // unlock app (after FaceID or PIN success)
  const unlock = () => {
    setUnlocked(true);
  };

  const contextValue: AuthContextType = {
    user,
    setUser,
    login,
    logout,
    register,
    token,
    unlocked,
    unlock,
    loading,
    setSecurityMethod
  };

  // Don't render children until we know the auth state
  if (loading) {
    return null; // or your splash screen component
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
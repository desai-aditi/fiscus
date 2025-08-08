import { auth, firestore } from "@/config/firebase";
import { AuthContextType, UserType } from "@/types/auth";
import { 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsSecurityVerification, setNeedsSecurityVerification] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user doc to get security preferences
        const userDoc = await getDoc(doc(firestore, "users", firebaseUser.uid));
        const data = userDoc.exists() ? userDoc.data() : {};

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || data.name || "",
          securityMethod: data.securityMethod || null, // 'faceId', 'pin', or null
          pin: data.pin || null,
        });

        const token = await firebaseUser.getIdToken();
        setToken(token);
        
        // If user has security method, require verification
        if (data.securityMethod) {
          setNeedsSecurityVerification(true);
        }
      } else {
        setUser(null);
        setToken(null);
        setNeedsSecurityVerification(false);
      }
      setLoading(false);
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
      await setDoc(doc(firestore, "users", response.user.uid), {
        name,
        email,
        uid: response.user.uid,
        totalIncome: 0,
        totalExpense: 0,
        securityMethod: null,
        pin: null,
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

  const setSecurityMethod = async (method: 'faceId' | 'pin', pin?: string) => {
    if (!user) return { success: false, msg: "No user found" };
    
    try {
      await updateDoc(doc(firestore, "users", user.uid), {
        securityMethod: method,
        pin: method === 'pin' ? pin : null,
      });
      
      setUser(prev => prev ? {
        ...prev,
        securityMethod: method,
        pin: method === 'pin' ? pin : null,
      } : null);
      
      return { success: true };
    } catch (error: any) {
      return { success: false, msg: error.message };
    }
  };

  const verifySecurityMethod = async (input?: string) => {
    if (!user || !user.securityMethod) return { success: false, msg: "No security method set" };
    
    if (user.securityMethod === 'pin') {
      if (input === user.pin) {
        setNeedsSecurityVerification(false);
        return { success: true };
      } else {
        return { success: false, msg: "Incorrect PIN" };
      }
    } else if (user.securityMethod === 'faceId') {
      // Handle Face ID verification here (would integrate with biometric library)
      // For now, just simulate success
      setNeedsSecurityVerification(false);
      return { success: true };
    }
    
    return { success: false, msg: "Unknown security method" };
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("(auth/user-not-found)")) msg = "No account found with this email.";
      return { success: false, msg };
    }
  };

  const resetPassword = async (oobCode: string, newPassword: string) => {
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      return { success: true };
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("(auth/invalid-action-code)")) msg = "Invalid or expired reset code.";
      if (msg.includes("(auth/weak-password)")) msg = "Password must be at least 6 characters long.";
      return { success: false, msg };
    }
  };

  const contextValue: AuthContextType = {
    user,
    setUser,
    login,
    register,
    token,
    needsSecurityVerification,
    setSecurityMethod,
    verifySecurityMethod,
    sendPasswordReset,
    resetPassword,
  };

  if (loading) return null; // or splash screen

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
import { auth, firestore } from "@/config/firebase";
import { AuthContextType, UserType } from "@/types/auth";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";

export const getCurrentToken = async (): Promise<string | null> => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      return token;
    }
    return null;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [user, setUser] = useState<UserType | null>(null);
    const [token, setToken] = useState<string | null>("");
    const router = useRouter();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
            // Set user data
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName
            });
            
            // Fetch token immediately while we have the firebaseUser object
            try {
                const token = await firebaseUser.getIdToken();
                setToken(token);
            } catch (error) {
                console.error("Error fetching token:", error);
            }
            
            // updateUserData(firebaseUser.uid);
            router.replace("/(protected)/(tabs)");
            } else {
            setUser(null);
            setToken(null); // Clear token when user logs out
            router.replace("/login");
            }
        });

        return () => unsub();
    }, [router]);
    

    const login = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return {success: true};
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
            await setDoc(doc(firestore, "users", response?.user?.uid), {
                name,
                email,
                uid: response?.user?.uid,
                totalIncome: 0,
                totalExpense: 0,
            });
            return {success: true}
        } catch (error: any) {
            let msg = error.message;
            if (msg.includes("(auth/email-already-in-use)")) msg = "Email already in use";
            if (msg.includes("(auth/invalid-email)")) msg = "Invalid email.";
            if (msg.includes("(auth/weak-password")) msg = "Password must be at least 6 characters long.";
            return { success: false, msg };
        }
    };

    // const updateUserData = async (uid: string) => {
    //     try {
    //         const docRef = doc(firestore, "users", uid);
    //         const docSnap = await getDoc(docRef);

    //         if(docSnap.exists()){
    //             const data = docSnap.data();
    //             const userData: UserType = {
    //                 uid: data?.uid,
    //                 email: data.email || null,
    //                 name: data.name || null,
    //             };
    //             setUser({ ...userData });
    //         }
    //     } catch (error) {
    //         console.error("Error updating user data:", error);
    //     }
    // };

    const contextValue: AuthContextType = {
        user,
        setUser,
        login,
        register,
        // updateUserData,
        token
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = ():AuthContextType => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore"; // Import getDoc

const auth = getAuth(db.app);
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is logged in via Firebase Auth. Now, fetch their profile from Firestore.
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          // Combine Firebase Auth data with Firestore profile data
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...docSnap.data(), // This adds role, name, etc.
          });
        } else {
          // If no profile found, they are just a basic user.
          // Or you could force a logout.
          console.error(
            "No user profile found in Firestore for UID:",
            firebaseUser.uid
          );
          setUser(firebaseUser);
        }
      } else {
        // User is logged out.
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

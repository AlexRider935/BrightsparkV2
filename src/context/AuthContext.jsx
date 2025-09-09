"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";

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
        // Step 1: Always fetch the user's role from the 'users' collection first.
        const roleDocRef = doc(db, "users", firebaseUser.uid);
        const roleDocSnap = await getDoc(roleDocRef);

        if (roleDocSnap.exists()) {
          const { role } = roleDocSnap.data();
          let profileData = {};

          // Step 2: Based on the role, fetch the detailed profile.
          // This correctly handles your hybrid data structure.
          if (role === "admin") {
            // For admins, the 'users' document has all the necessary info.
            profileData = roleDocSnap.data();
          } else {
            // For students and teachers, we need to look in their specific collections.
            // The collection name is the role + 's' (e.g., 'student' -> 'students').
            const profileDocRef = doc(db, `${role}s`, firebaseUser.uid);
            const profileDocSnap = await getDoc(profileDocRef);

            if (profileDocSnap.exists()) {
              profileData = profileDocSnap.data();
            } else {
              // This is a critical error if a student/teacher is missing their profile.
              console.error(
                `Auth Error: Role '${role}' found, but no profile document exists in '${role}s' for UID: ${firebaseUser.uid}`
              );
              setUser(null);
              setLoading(false);
              return; // Exit early
            }
          }

          // Step 3: Combine all data into the final user object with the correct nested structure.
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: role,
            profile: profileData,
          });
        } else {
          console.error(
            `Auth Error: No role document found in 'users' collection for UID: ${firebaseUser.uid}`
          );
          setUser(null);
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

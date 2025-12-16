import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../libs/firebase";

const AuthContext = createContext();

/**
 * Custom hook to access the AuthContext value.
 * Usage: const { currentUser, login } = useAuth();
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * AuthProvider Component
 * Encapsulates Firebase authentication logic and provides the current user state
 * to the rest of the application via Context.
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  // Loading state ensures we don't render the app until the initial auth check completes
  const [loading, setLoading] = useState(true);

  // --- Auth Actions ---

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  // --- State Listener ---

  useEffect(() => {
    // onAuthStateChanged returns an unsubscriber function.
    // This listener fires whenever the user logs in, logs out, or token refreshes.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Prevent premature rendering of protected routes by waiting for loading to finish */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../services/firebase';

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, pass: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signup = async (email: string, pass: string, profile: { fullName: string, bday: string, occupation: string }) => {
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      // Save profile to Firestore
      await setDoc(doc(db, 'users', res.user.uid), {
        ...profile,
        email,
        createdAt: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    resetPassword
  };
}

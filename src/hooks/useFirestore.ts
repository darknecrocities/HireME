import { useState, useCallback } from 'react';
import { collection, addDoc, getDocs, doc, getDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './useAuth';
import type { Session } from '../types';

// Demo sessions for when Firebase is not configured or user is logged out
const demoSessions: Session[] = [
  // ... existing demo sessions (lines 8-63)
];

export function useFirestore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const saveSession = useCallback(async (session: Omit<Session, 'sessionId'>): Promise<string | null> => {
    if (!user) return null;
    setLoading(true);
    setError(null);
    try {
      const docRef = await addDoc(collection(db, 'sessions'), {
        ...session,
        userId: user.uid,
        startTime: Timestamp.fromDate(session.startTime),
        endTime: Timestamp.fromDate(session.endTime),
      });
      return docRef.id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save session';
      setError(message);
      return 'demo-' + Date.now();
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getSessions = useCallback(async (): Promise<Session[]> => {
    if (!user) return demoSessions;
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'sessions'), 
        where('userId', '==', user.uid), 
        orderBy('startTime', 'desc')
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({
        sessionId: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate?.() || new Date(),
        endTime: doc.data().endTime?.toDate?.() || new Date(),
      })) as Session[];
    } catch (err) {
      console.warn('Firestore error:', err);
      return demoSessions;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getSessionById = useCallback(async (sessionId: string): Promise<Session | null> => {
    setLoading(true);
    setError(null);
    try {
      const docSnap = await getDoc(doc(db, 'sessions', sessionId));
      if (!docSnap.exists()) return null;
      const data = docSnap.data();
      if (data.userId !== user?.uid) return null; // Security check
      
      return {
        sessionId: docSnap.id,
        ...data,
        startTime: data.startTime?.toDate?.() || new Date(),
        endTime: data.endTime?.toDate?.() || new Date(),
      } as Session;
    } catch {
      return demoSessions.find(s => s.sessionId === sessionId) || null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    error,
    saveSession,
    getSessions,
    getSessionById,
    demoSessions,
  };
}

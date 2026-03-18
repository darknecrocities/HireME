import { useState, useCallback } from 'react';
import { collection, addDoc, getDocs, doc, getDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Session } from '../types';

// Demo sessions for when Firebase is not configured
const demoSessions: Session[] = [
  {
    sessionId: 'demo-1',
    userId: 'demo-user',
    type: 'interview',
    employerIndustry: 'Technology',
    startTime: new Date('2026-03-10T10:00:00'),
    endTime: new Date('2026-03-10T10:30:00'),
    aiAnalysis: { interviewScore: 78, STARCompleteness: { situation: true, task: true, action: true, result: false } },
    bodyLanguage: { eyeContactScore: 82, postureScore: 75, gesturesScore: 70, crucialMoments: [], confidenceScore: 80, audioScore: 75 },
    feedback: 'Strong eye contact and confident posture. Work on incorporating measurable results in your STAR responses.',
  },
  {
    sessionId: 'demo-2',
    userId: 'demo-user',
    type: 'interview',
    employerIndustry: 'Finance',
    startTime: new Date('2026-03-12T14:00:00'),
    endTime: new Date('2026-03-12T14:45:00'),
    aiAnalysis: { interviewScore: 85, STARCompleteness: { situation: true, task: true, action: true, result: true } },
    bodyLanguage: { eyeContactScore: 88, postureScore: 80, gesturesScore: 78, crucialMoments: [], confidenceScore: 85, audioScore: 82 },
    feedback: 'Great improvement! Your STAR responses are now complete. Continue practicing natural hand gestures.',
  },
  {
    sessionId: 'demo-3',
    userId: 'demo-user',
    type: 'resume',
    employerIndustry: 'Healthcare',
    startTime: new Date('2026-03-14T09:00:00'),
    endTime: new Date('2026-03-14T09:20:00'),
    aiAnalysis: { resumeScore: 72, semanticGaps: ['patient outcomes', 'HIPAA compliance', 'clinical workflows'] },
    bodyLanguage: { eyeContactScore: 0, postureScore: 0, gesturesScore: 0, crucialMoments: [], confidenceScore: 0, audioScore: 0 },
    feedback: 'Resume scored 72/100. Add industry-specific keywords: patient outcomes, HIPAA compliance, EHR systems.',
  },
  {
    sessionId: 'demo-4',
    userId: 'demo-user',
    type: 'interview',
    employerIndustry: 'Technology',
    startTime: new Date('2026-03-15T16:00:00'),
    endTime: new Date('2026-03-15T16:35:00'),
    aiAnalysis: { interviewScore: 91, STARCompleteness: { situation: true, task: true, action: true, result: true } },
    bodyLanguage: { eyeContactScore: 92, postureScore: 88, gesturesScore: 85, crucialMoments: [], confidenceScore: 90, audioScore: 88 },
    feedback: 'Outstanding session! You demonstrated excellent verbal and non-verbal communication skills. You are interview-ready!',
  },
  {
    sessionId: 'demo-5',
    userId: 'demo-user',
    type: 'interview',
    employerIndustry: 'Consulting',
    startTime: new Date('2026-03-16T11:00:00'),
    endTime: new Date('2026-03-16T11:40:00'),
    aiAnalysis: { interviewScore: 83, STARCompleteness: { situation: true, task: true, action: false, result: true } },
    bodyLanguage: { eyeContactScore: 85, postureScore: 82, gesturesScore: 76, crucialMoments: [], confidenceScore: 80, audioScore: 78 },
    feedback: 'Good performance. Make sure to detail the specific actions YOU took, not just the team outcome.',
  },
];

export function useFirestore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveSession = useCallback(async (session: Omit<Session, 'sessionId'>): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const docRef = await addDoc(collection(db, 'sessions'), {
        ...session,
        startTime: Timestamp.fromDate(session.startTime),
        endTime: Timestamp.fromDate(session.endTime),
      });
      return docRef.id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save session';
      setError(message);
      console.warn('Firestore not configured, using demo mode:', message);
      return 'demo-' + Date.now();
    } finally {
      setLoading(false);
    }
  }, []);

  const getSessions = useCallback(async (userId?: string): Promise<Session[]> => {
    setLoading(true);
    setError(null);
    try {
      const q = userId
        ? query(collection(db, 'sessions'), where('userId', '==', userId), orderBy('startTime', 'desc'))
        : query(collection(db, 'sessions'), orderBy('startTime', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        sessionId: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate?.() || new Date(),
        endTime: doc.data().endTime?.toDate?.() || new Date(),
      })) as Session[];
    } catch {
      console.warn('Firestore not configured, returning demo sessions.');
      return demoSessions;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSessionById = useCallback(async (sessionId: string): Promise<Session | null> => {
    setLoading(true);
    setError(null);
    try {
      const docSnap = await getDoc(doc(db, 'sessions', sessionId));
      if (!docSnap.exists()) return null;
      return {
        sessionId: docSnap.id,
        ...docSnap.data(),
        startTime: docSnap.data().startTime?.toDate?.() || new Date(),
        endTime: docSnap.data().endTime?.toDate?.() || new Date(),
      } as Session;
    } catch {
      return demoSessions.find(s => s.sessionId === sessionId) || null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    saveSession,
    getSessions,
    getSessionById,
    demoSessions,
  };
}

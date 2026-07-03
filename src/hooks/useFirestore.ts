import { useState, useCallback } from 'react';
import type { Session } from '../types';

const STORAGE_KEY = 'hireme_local_sessions';

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

  const getSessions = useCallback(async (): Promise<Session[]> => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoSessions));
        return demoSessions;
      }
      const parsed = JSON.parse(data);
      return parsed.map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: new Date(s.endTime),
      })) as Session[];
    } catch (err) {
      console.error('Failed to read local sessions', err);
      return demoSessions;
    }
  }, []);

  const saveSession = useCallback(async (session: Omit<Session, 'sessionId'>): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const existing = await getSessions();
      const newSessionId = 'session_' + Date.now();
      const newSession: Session = {
        ...session,
        sessionId: newSessionId,
      };
      const updated = [newSession, ...existing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return newSessionId;
    } catch (err) {
      setError('Failed to save session');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getSessions]);

  const getSessionById = useCallback(async (sessionId: string): Promise<Session | null> => {
    setLoading(true);
    setError(null);
    try {
      const sessions = await getSessions();
      return sessions.find(s => s.sessionId === sessionId) || null;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [getSessions]);

  return {
    loading,
    error,
    saveSession,
    getSessions,
    getSessionById,
    demoSessions,
  };
}

import { useState, useCallback } from 'react';
import type { ResumeAnalysisResult } from '../types';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInterviewQuestion = useCallback(async (
    role: string,
    previousAnswer: string = '',
    context: string = '',
    questionNumber: number = 1
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const { generateInterviewQuestion } = await import('../services/gemini');
      const question = await generateInterviewQuestion(role, previousAnswer, context, questionNumber);
      return question;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate question';
      setError(message);
      return '';
    } finally {
      setLoading(false);
    }
  }, []);

  const getResumeAnalysis = useCallback(async (
    resumeText: string,
    jobDescription: string
  ): Promise<ResumeAnalysisResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const { analyzeResume } = await import('../services/gemini');
      const result = await analyzeResume(resumeText, jobDescription);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze resume';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFullSessionAnalysis = useCallback(async (
    transcript: { question: string; answer: string }[],
    scores: { eyeContact: number; posture: number; gestures: number; confidence: number; audio: number },
    role: string
  ): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const { analyzeFullSession } = await import('../services/gemini');
      const result = await analyzeFullSession(transcript, scores, role);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate feedback';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getInterviewQuestion,
    getResumeAnalysis,
    getFullSessionAnalysis,
  };
}

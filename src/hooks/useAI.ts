import { useState, useCallback } from 'react';
import { generateInterviewQuestion, analyzeResume, generateSessionFeedback } from '../services/gemini';
import type { ResumeAnalysisResult } from '../types';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInterviewQuestion = useCallback(async (
    role: string,
    previousAnswer: string = '',
    context: string = ''
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const question = await generateInterviewQuestion(role, previousAnswer, context);
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

  const getFeedback = useCallback(async (
    scores: { eyeContact: number; posture: number; gestures: number },
    interviewType: string
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const feedback = await generateSessionFeedback(scores, interviewType);
      return feedback;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate feedback';
      setError(message);
      return '';
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getInterviewQuestion,
    getResumeAnalysis,
    getFeedback,
  };
}

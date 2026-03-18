import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ResumeAnalysisResult, ResumeSuggestion } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_ENABLED = !!API_KEY;

// Initialize the SDK
const genAI = GEMINI_ENABLED ? new GoogleGenerativeAI(API_KEY) : null;
const MODEL_NAME = "gemini-3-flash-preview";

/**
 * Generate an interview question using Gemini API.
 */
export async function generateInterviewQuestion(
  role: string,
  previousAnswer: string,
  context: string,
  questionNumber: number
): Promise<string> {
  if (!genAI) {
    return getMockInterviewQuestion(role);
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `You are an expert interviewer for the ${role} role. Current context: ${context}. This is question number ${questionNumber} of the session. 
    If questionNumber is 1: Ask an introductory behavioral question.
    If questionNumber > 1: Follow up on their previous answer: "${previousAnswer}". 
    Generate ONE focused, professional interview question. Return ONLY the question, no extra text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim() || getMockInterviewQuestion(role);
  } catch (error) {
    console.error('Gemini Question Error:', error);
    return getMockInterviewQuestion(role);
  }
}

/**
 * Analyze a resume against a job description using Gemini API.
 */
export async function analyzeResume(
  resumeText: string,
  jobDescription: string
): Promise<ResumeAnalysisResult> {
  if (!genAI) {
    return getMockResumeAnalysis();
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `Analyze this resume against the job description. Return ONLY valid JSON (no markdown fences) in this exact format:
{
  "score": <0-100>,
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": [{"original": "original text", "improved": "improved text", "reason": "why"}],
  "starFeedback": "feedback on STAR method usage"
}

Resume:
${resumeText}

Job Description:
${jobDescription}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as ResumeAnalysisResult;
  } catch (error) {
    console.error('Gemini Resume Analysis Error:', error);
    return getMockResumeAnalysis();
  }
}

/**
 * Generate session feedback from Gemini.
 */
export async function generateSessionFeedback(
  scores: { eyeContact: number; posture: number; gestures: number; confidence: number; audio: number },
  interviewType: string
): Promise<string> {
  if (!genAI) {
    return getMockFeedback(scores);
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `You are an interview coach. The candidate just completed a ${interviewType} practice session. Their scores (0-100): Eye Contact: ${scores.eyeContact}, Posture: ${scores.posture}, Gestures: ${scores.gestures}, Confidence: ${scores.confidence}, Vocal Performance: ${scores.audio}. Provide 3-4 sentences of constructive feedback with specific improvement tips.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim() || getMockFeedback(scores);
  } catch (error) {
    console.error('Gemini Feedback Error:', error);
    return getMockFeedback(scores);
  }
}

/**
 * Perform a consolidated analysis of the full interview session.
 */
export async function analyzeFullSession(
  transcript: { question: string; answer: string }[],
  scores: { eyeContact: number; posture: number; gestures: number; confidence: number; audio: number },
  role: string
): Promise<any> {
  if (!genAI) return getMockFullAnalysis(scores);

  const modelsToTry = ["gemini-3-flash-preview", "gemini-1.5-flash"];
  let lastError = null;

  for (const modelId of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelId });
      const prompt = `Analyze this interview for ${role}.
      TRANSCRIPT: ${JSON.stringify(transcript)}
      METRICS: ${JSON.stringify(scores)}
      
      Return JSON ONLY:
      {
        "overallScore": 0-100,
        "hiringProbability": 0-100,
        "confidenceScore": 0-100,
        "summary": "short text",
        "technicalFeedback": "text",
        "bodyLanguageFeedback": "text",
        "vocalFeedback": "text",
        "strengths": ["s1", "s2"],
        "improvements": ["i1", "i2"],
        "improvementChecklist": ["task1", "task2"],
        "top3JobRecommendations": [
          {"title": "Job Title 1", "reason": "Why this is a good fit"},
          {"title": "Job Title 2", "reason": "Why this is a good fit"},
          {"title": "Job Title 3", "reason": "Why this is a good fit"}
        ]
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extraction logic: find first { and last }
      const startIdx = text.indexOf('{');
      const endIdx = text.lastIndexOf('}');
      if (startIdx === -1 || endIdx === -1) throw new Error("No JSON found in response");
      
      const cleaned = text.substring(startIdx, endIdx + 1);
      return JSON.parse(cleaned);
    } catch (error) {
      console.warn(`Gemini Model ${modelId} failed:`, error);
      lastError = error;
      continue;
    }
  }

  console.error('All Gemini models failed:', lastError);
  return getMockFullAnalysis(scores);
}

// ===== Mock Data Fallbacks =====

const mockQuestions: Record<string, string[]> = {
  default: [
    "Tell me about a time you had to lead a project under tight deadlines. What was the outcome?",
    "Describe a situation where you had to resolve a conflict within your team.",
    "Walk me through how you approach solving a complex technical problem.",
    "Give me an example of when you received critical feedback. How did you respond?",
    "Tell me about a time you went above and beyond for a customer or stakeholder.",
    "Describe a situation where you had to learn a new technology quickly.",
    "How do you prioritize tasks when everything seems urgent?",
    "How do you handle disagreement with a manager's decision?"
  ],
};

let questionIndex = 0;

function getMockInterviewQuestion(role: string): string {
  const questions = mockQuestions[role] || mockQuestions.default;
  const q = questions[questionIndex % questions.length];
  questionIndex++;
  return q;
}

function getMockFullAnalysis(scores: { eyeContact: number; posture: number; gestures: number; confidence: number; audio: number }) {
  const avg = (scores.eyeContact + scores.posture + scores.gestures + scores.confidence + scores.audio) / 5;
  return {
    overallScore: Math.round(avg),
    hiringProbability: Math.round(avg * 0.9),
    confidenceScore: scores.confidence,
    summary: "A solid session overall with clear communication and professional presence.",
    technicalFeedback: "Your responses were structured and addressed the core of the questions, though adding more metrics would help.",
    bodyLanguageFeedback: "Good posture and engagement. Maintain consistent eye contact during complex explanations.",
    vocalFeedback: "Tone was professional. Watch for fillers during transitions.",
    strengths: ["Clear Communication", "Professional Posture"],
    improvements: ["Eye Contact Consistency", "Metric Quantification"],
    improvementChecklist: ["Increase eye contact duration", "Quantify results in STAR answers", "Reduce filler words"],
    top3JobRecommendations: [
      { title: "Senior Business Analyst", reason: "Strong structured thinking and STAR-compliant examples." },
      { title: "Product Operations Manager", reason: "Excellent articulation of cross-functional processes." },
      { title: "Technical Project Manager", reason: "Balanced professional presence and technical clarity." }
    ]
  };
}

function getMockResumeAnalysis(): ResumeAnalysisResult {
  const suggestions: ResumeSuggestion[] = [
    {
      original: "Responsible for managing team projects",
      improved: "Led cross-functional team of 8 to deliver 3 major product launches, resulting in 25% revenue increase",
      reason: "Use specific metrics and action verbs to quantify impact"
    },
    {
      original: "Good communication skills",
      improved: "Presented technical proposals to C-suite executives, securing $2M in project funding",
      reason: "Replace generic claims with concrete achievements"
    },
    {
      original: "Worked on improving customer satisfaction",
      improved: "Designed and implemented NPS feedback system that improved customer satisfaction scores from 72 to 91 within 6 months",
      reason: "Add measurable outcomes using the STAR method"
    }
  ];

  return {
    score: 68,
    missingKeywords: ['agile', 'stakeholder management', 'data-driven', 'cross-functional', 'KPI', 'ROI'],
    suggestions,
    starFeedback: "Your resume would benefit from more STAR-formatted achievements. Focus on adding specific Situations, Tasks, Actions, and measurable Results to each bullet point. Currently, only 2 of 8 experience bullets follow the STAR framework."
  };
}

function getMockFeedback(scores: { eyeContact: number; posture: number; gestures: number; confidence: number; audio: number }): string {
  const avg = (scores.eyeContact + scores.posture + scores.gestures + scores.confidence + scores.audio) / 5;
  if (avg >= 80) {
    return "Excellent performance! Your eye contact was strong and your posture conveyed confidence. Keep maintaining that natural hand gesture range — it makes your responses feel authentic and engaging. Your vocal pacing and confidence levels were high, projecting authority and preparedness.";
  } else if (avg >= 60) {
    return "Good effort! Your posture was generally upright, but try to maintain more consistent eye contact with the camera. Your confidence dipped occasionally, but your vocal clarity was good. Use hand gestures more purposefully to emphasize key points and boost your perceived confidence.";
  }
  return "There's room for improvement. Focus on maintaining eye contact with the camera lens and speaking with consistent energy (your vocal score suggests some hesitation). Sit upright to boost your confidence score. Try recording yourself and reviewing how your body language shifts when you are thinking vs. answering.";
}

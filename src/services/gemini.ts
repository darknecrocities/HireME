import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ResumeAnalysisResult, ResumeSuggestion, EnhancedResume } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_ENABLED = !!API_KEY;

// Initialize the SDK
const genAI = GEMINI_ENABLED ? new GoogleGenerativeAI(API_KEY) : null;
const MODEL_NAME = "gemini-3-flash-preview";

/**
 * Helper to try multiple models for a prompt.
 */
async function generateWithFallback<T>(prompt: string, models: string[]): Promise<T> {
  if (!genAI) throw new Error("AI not enabled.");
  
  let lastError = null;
  for (const modelId of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelId });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const startIdx = text.indexOf('{');
      const endIdx = text.lastIndexOf('}');
      if (startIdx === -1 || endIdx === -1) throw new Error("Invalid format.");
      
      const cleaned = text.substring(startIdx, endIdx + 1);
      return JSON.parse(cleaned) as T;
    } catch (error: any) {
      console.warn(`Model ${modelId} failed:`, error.message);
      lastError = error;
      if (error.message?.includes('429')) continue;
      continue;
    }
  }
  throw lastError;
}

/**
 * Generate an interview question using Gemini API.
 */
export async function generateInterviewQuestion(
  role: string,
  previousAnswer: string,
  context: string,
  questionNumber: number
): Promise<string> {
  if (!genAI) return getMockInterviewQuestion(role);

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
  if (!genAI) return getMockResumeAnalysis();

  const models = ["gemini-3-flash-preview", "gemini-3.1-flash-preview"];
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

  return await generateWithFallback<ResumeAnalysisResult>(prompt, models);
}

/**
 * Generate session feedback from Gemini.
 */
export async function generateSessionFeedback(
  scores: { eyeContact: number; posture: number; gestures: number; confidence: number; audio: number },
  interviewType: string
): Promise<string> {
  if (!genAI) return getMockFeedback(scores);

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
  const models = ["gemini-3-flash-preview", "gemini-1.5-flash"];
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

  return await generateWithFallback<any>(prompt, models);
}

/**
 * Generate a professional, enhanced resume from raw text.
 */
export async function generateEnhancedResume(resumeText: string, targetJob?: string): Promise<EnhancedResume> {
  if (!genAI) return getMockEnhancedResume();

  const models = ["gemini-3-flash-preview", "gemini-1.5-flash"];
  const prompt = `Enhance resume for job: ${targetJob || 'formalized'}. 
  Return JSON ONLY: { "personalInfo": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "website": "" }, "summary": "", "experience": [{ "role": "", "company": "", "location": "", "duration": "", "bullets": [] }], "education": [{ "degree": "", "school": "", "location": "", "duration": "" }], "skills": [{ "category": "", "items": [] }] }
  Content must be formal, board-ready, STAR bullets. 
  Resume: ${resumeText}`;

  return await generateWithFallback<EnhancedResume>(prompt, models);
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

// Unused mock full analysis removed

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

function getMockEnhancedResume(): EnhancedResume {
  return {
    personalInfo: {
      name: "Arron Kian Parejas",
      email: "arron@example.com",
      phone: "+63 912 345 6789",
      location: "Manila, Philippines",
      linkedin: "linkedin.com/in/arronkian",
      website: "arronkian.dev"
    },
    summary: "Senior Software Engineer and Digital Architect with 6+ years of expertise in building high-concurrency systems and AI-integrated platforms. Specialized in React, Go, and Large Language Model (LLM) orchestration, with a proven track record of delivering 40% performance gains for enterprise clients.",
    experience: [
      {
        role: "Senior Full Stack Engineer",
        company: "HireME (Digital Solutions)",
        location: "Manila, PH",
        duration: "2021 - Present",
        bullets: [
          "Optimized resume analysis throughput by 65% through the implementation of Gemini Pro 1.5-Flash and a distributed caching layer.",
          "Architected a scalable microservices ecosystem using Node.js and PostgreSQL, reducing infrastructure costs by 30% annually.",
          "Led a cross-functional team of 10 engineers to deliver a board-ready hiring platform featured at global tech summits."
        ]
      },
      {
        role: "Full Stack Developer",
        company: "Quantum Tech",
        location: "Singapore",
        duration: "2018 - 2021",
        bullets: [
          "Developed high-fidelity UI components for an AI-driven interview suite, resulting in a 25% increase in user engagement scores.",
          "Resolved critical memory leak issues in the real-time STT engine, improving system stability by 99.9% across production environments.",
          "Collaborated with senior stakeholders to define technical roadmaps for next-generation talent acquisition software."
        ]
      }
    ],
    education: [
      {
        degree: "Bachelor of Science in Computer Science",
        school: "University of the Philippines",
        location: "Quezon City",
        duration: "2014 - 2018"
      }
    ],
    skills: [
      {
        category: "ENGINEERING ARCHITECTURE",
        items: ["React", "TypeScript", "Node.js", "Go", "PostgreSQL", "Redis", "Docker", "Kubernetes"]
      },
      {
        category: "AI & MACHINE LEARNING",
        items: ["Gemini Pro", "OpenAI API", "Vector Databases", "Prompt Engineering", "Fine-tuning"]
      },
      {
        category: "LEADERSHIP & OPERATIONS",
        items: ["Agile/Scrum Master", "CI/CD Implementation", "Technical Mentorship", "Stakeholder Mgmt"]
      }
    ]
  };
}

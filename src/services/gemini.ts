import type { ResumeAnalysisResult, ResumeSuggestion } from '../types';

const GEMINI_ENABLED = !!import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Generate an interview question using Gemini API.
 * Falls back to mock data when API key is not configured.
 */
export async function generateInterviewQuestion(
  role: string,
  previousAnswer: string,
  context: string
): Promise<string> {
  if (!GEMINI_ENABLED) {
    return getMockInterviewQuestion(role);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert interviewer for the ${role} role. The candidate's previous answer was: "${previousAnswer}". Context: ${context}. Generate one focused, behavioral interview question. Return ONLY the question, no extra text.`
            }]
          }]
        })
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || getMockInterviewQuestion(role);
  } catch {
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
  if (!GEMINI_ENABLED) {
    return getMockResumeAnalysis();
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this resume against the job description. Return ONLY valid JSON (no markdown fences) in this exact format:
{
  "score": <0-100>,
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": [{"original": "original text", "improved": "improved text", "reason": "why"}],
  "starFeedback": "feedback on STAR method usage"
}

Resume:
${resumeText}

Job Description:
${jobDescription}`
            }]
          }]
        })
      }
    );
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as ResumeAnalysisResult;
  } catch {
    return getMockResumeAnalysis();
  }
}

/**
 * Generate session feedback from Gemini.
 */
export async function generateSessionFeedback(
  scores: { eyeContact: number; posture: number; gestures: number },
  interviewType: string
): Promise<string> {
  if (!GEMINI_ENABLED) {
    return getMockFeedback(scores);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an interview coach. The candidate just completed a ${interviewType} practice session. Their scores (0-100): Eye Contact: ${scores.eyeContact}, Posture: ${scores.posture}, Gestures: ${scores.gestures}. Provide 3-4 sentences of constructive feedback with specific improvement tips.`
            }]
          }]
        })
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || getMockFeedback(scores);
  } catch {
    return getMockFeedback(scores);
  }
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
  ],
};

let questionIndex = 0;

function getMockInterviewQuestion(role: string): string {
  const questions = mockQuestions[role] || mockQuestions.default;
  const q = questions[questionIndex % questions.length];
  questionIndex++;
  return q;
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

function getMockFeedback(scores: { eyeContact: number; posture: number; gestures: number }): string {
  const avg = (scores.eyeContact + scores.posture + scores.gestures) / 3;
  if (avg >= 80) {
    return "Excellent performance! Your eye contact was strong and your posture conveyed confidence. Keep maintaining that natural hand gesture range — it makes your responses feel authentic and engaging. Practice varying your vocal pacing to add even more impact.";
  } else if (avg >= 60) {
    return "Good effort! Your posture was generally upright, but try to maintain more consistent eye contact with the camera. Your hand gestures could be more purposeful — try using them to emphasize key points rather than keeping your hands still. Consider practicing in front of a mirror.";
  }
  return "There's room for improvement. Focus on maintaining eye contact with the camera lens (imagine it's the interviewer's eyes). Sit upright with shoulders back to project confidence. Use deliberate hand gestures when making key points. Try recording yourself and reviewing the footage to build awareness.";
}

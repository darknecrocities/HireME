import type { ResumeAnalysisResult, ResumeSuggestion, EnhancedResume } from '../types';

// Configuration keys for local storage
const ENDPOINT_KEY = 'hireme_ollama_endpoint';
const MODEL_KEY = 'hireme_ollama_model';

export function getOllamaEndpoint(): string {
  return localStorage.getItem(ENDPOINT_KEY) || 'http://localhost:11434';
}

export function setOllamaEndpoint(endpoint: string): void {
  localStorage.setItem(ENDPOINT_KEY, endpoint.replace(/\/$/, '')); // trim trailing slash
}

export function getSelectedOllamaModel(): string {
  return localStorage.getItem(MODEL_KEY) || 'llama3.2';
}

export function setSelectedOllamaModel(model: string): void {
  localStorage.setItem(MODEL_KEY, model);
}

// Get the actual available model tag matching user preference
export async function getEffectiveOllamaModel(): Promise<string> {
  const selected = getSelectedOllamaModel();
  const status = await checkOllamaStatus();
  if (!status.status || status.models.length === 0) return selected;
  
  if (status.models.includes(selected)) return selected;
  
  // Try matching with :latest suffix or prefix
  const match = status.models.find(m => m === `${selected}:latest` || m.split(':')[0] === selected.split(':')[0]);
  if (match) return match;
  
  return status.models[0];
}

// Check if local Ollama is online and get available models
export async function checkOllamaStatus(): Promise<{ status: boolean; models: string[] }> {
  try {
    const endpoint = getOllamaEndpoint();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout for status checks

    const res = await fetch(`${endpoint}/api/tags`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) return { status: false, models: [] };
    const data = await res.json();
    const models = (data.models || []).map((m: any) => m.name);
    return { status: true, models };
  } catch (error) {
    return { status: false, models: [] };
  }
}

// Pull a model from the registry with progress callback
export async function pullOllamaModel(
  modelName: string, 
  onProgress: (status: string, progress: number) => void
): Promise<void> {
  const endpoint = getOllamaEndpoint();
  const res = await fetch(`${endpoint}/api/pull`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: modelName, stream: true })
  });
  if (!res.ok) throw new Error(`Failed to start pulling model: ${res.statusText}`);

  const reader = res.body?.getReader();
  if (!reader) throw new Error('ReadableStream not supported');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.status) {
            let pct = 0;
            if (parsed.total) {
              pct = Math.round((parsed.completed / parsed.total) * 100);
            }
            onProgress(parsed.status, pct);
          }
        } catch (e) {
          // ignore parsing error for incomplete chunks
        }
      }
    }
  }
}

// Core helper to call Ollama's local generation endpoint
async function queryOllama(prompt: string, systemPrompt?: string, forceJson: boolean = false): Promise<string> {
  const endpoint = getOllamaEndpoint();
  const model = await getEffectiveOllamaModel();

  const payload: any = {
    model: model,
    prompt: prompt,
    stream: false,
    options: {
      temperature: 0.7,
      num_predict: 1000
    }
  };

  if (systemPrompt) {
    payload.system = systemPrompt;
  }

  if (forceJson) {
    payload.format = "json";
  }

  const res = await fetch(`${endpoint}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Ollama generation failed: ${res.statusText}`);
  }

  const data = await res.json();
  return data.response || '';
}

// Robust JSON extraction and parsing
function parseJsonSafe<T>(text: string, fallback: T): T {
  try {
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1) {
      return JSON.parse(text) as T;
    }
    const cleaned = text.substring(startIdx, endIdx + 1);
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error("Ollama JSON parsing error. Raw output:", text, err);
    return fallback;
  }
}

/**
 * Generate an interview question using Ollama API.
 */
export async function generateInterviewQuestion(
  role: string,
  previousAnswer: string,
  context: string,
  questionNumber: number
): Promise<string> {
  const status = await checkOllamaStatus();
  if (!status.status || status.models.length === 0) {
    return getMockInterviewQuestion(role);
  }

  const prompt = `You are an expert interviewer for the ${role} role. Current context: ${context}. This is question number ${questionNumber} of the session. 
    If questionNumber is 1: Ask an introductory behavioral question.
    If questionNumber > 1: Follow up on their previous answer: "${previousAnswer}". 
    Generate ONE focused, professional interview question. Return ONLY the question, no extra text.`;

  try {
    const response = await queryOllama(prompt, `You are an expert interviewer for the ${role} role.`, false);
    return response.trim() || getMockInterviewQuestion(role);
  } catch (error) {
    console.error('Ollama Question Error:', error);
    return getMockInterviewQuestion(role);
  }
}

/**
 * Analyze a resume against a job description using Ollama API.
 */
export async function analyzeResume(
  resumeText: string,
  jobDescription: string
): Promise<ResumeAnalysisResult> {
  const status = await checkOllamaStatus();
  const fallback = getMockResumeAnalysis();
  if (!status.status || status.models.length === 0) {
    return fallback;
  }

  const prompt = `Analyze this resume against the job description. Return ONLY valid JSON in this exact format:
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

  try {
    const response = await queryOllama(prompt, "You are a resume analyzer that outputs valid JSON schemas.", true);
    return parseJsonSafe<ResumeAnalysisResult>(response, fallback);
  } catch (error) {
    console.error('Ollama Resume Analysis Error:', error);
    return fallback;
  }
}

/**
 * Generate session feedback from Ollama.
 */
export async function generateSessionFeedback(
  scores: { eyeContact: number; posture: number; gestures: number; confidence: number; audio: number },
  interviewType: string
): Promise<string> {
  const status = await checkOllamaStatus();
  if (!status.status || status.models.length === 0) {
    return getMockFeedback(scores);
  }

  const prompt = `You are an interview coach. The candidate just completed a ${interviewType} practice session. Their scores (0-100): Eye Contact: ${scores.eyeContact}, Posture: ${scores.posture}, Gestures: ${scores.gestures}, Confidence: ${scores.confidence}, Vocal Performance: ${scores.audio}. Provide 3-4 sentences of constructive feedback with specific improvement tips.`;

  try {
    const response = await queryOllama(prompt, "You are an interview coach.", false);
    return response.trim() || getMockFeedback(scores);
  } catch (error) {
    console.error('Ollama Feedback Error:', error);
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
  const status = await checkOllamaStatus();
  const fallback = {
    overallScore: Math.round((scores.eyeContact + scores.posture + scores.gestures + scores.confidence + scores.audio) / 5),
    hiringProbability: 70,
    confidenceScore: scores.confidence,
    summary: "Great work completing the interview session. Review the checklist below for improvement targets.",
    technicalFeedback: "Clear technical understanding demonstrated, but could benefit from deeper examples.",
    bodyLanguageFeedback: getMockFeedback(scores),
    vocalFeedback: "Vocal pacing was clear and stable throughout the interview.",
    strengths: ["Clear communication", "Structured layout"],
    improvements: ["Incorporate more STAR metrics", "Increase eye contact consistency"],
    improvementChecklist: ["Practice STAR method bullets", "Maintain steady posture during questions"],
    top3JobRecommendations: [
      { "title": `${role} Associate`, "reason": "Good foundational match for your communication skills" }
    ]
  };

  if (!status.status || status.models.length === 0) {
    return fallback;
  }

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

  try {
    const response = await queryOllama(prompt, "You are an AI hiring director analyzing interview recordings.", true);
    return parseJsonSafe<any>(response, fallback);
  } catch (error) {
    console.error('Ollama Full Session Analysis Error:', error);
    return fallback;
  }
}

/**
 * Generate a professional, enhanced resume from raw text.
 */
export async function generateEnhancedResume(resumeText: string, targetJob?: string): Promise<EnhancedResume> {
  const status = await checkOllamaStatus();
  const fallback = getMockEnhancedResume();
  if (!status.status || status.models.length === 0) {
    return fallback;
  }

  const prompt = `Enhance resume for job: ${targetJob || 'formalized'}. 
  Return JSON ONLY: { "personalInfo": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "website": "" }, "summary": "", "experience": [{ "role": "", "company": "", "location": "", "duration": "", "bullets": [] }], "education": [{ "degree": "", "school": "", "location": "", "duration": "" }], "skills": [{ "category": "", "items": [] }] }
  Content must be formal, board-ready, STAR bullets. 
  Resume: ${resumeText}`;

  try {
    const response = await queryOllama(prompt, "You are a professional resume optimization editor.", true);
    return parseJsonSafe<EnhancedResume>(response, fallback);
  } catch (error) {
    console.error('Ollama Resume Enhancement Error:', error);
    return fallback;
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
          "Optimized resume analysis throughput by 65% through the implementation of local Ollama models and a distributed caching layer.",
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
        items: ["Ollama", "Local LLMs", "Vector Databases", "Prompt Engineering", "Fine-tuning"]
      },
      {
        category: "LEADERSHIP & OPERATIONS",
        items: ["Agile/Scrum Master", "CI/CD Implementation", "Technical Mentorship", "Stakeholder Mgmt"]
      }
    ]
  };
}

// ===== User Types =====
export interface User {
  userId: string;
  name: string;
  email: string;
  subscription: 'free' | 'premium';
  createdAt: Date;
}

// ===== Session Types =====
export interface STARCompleteness {
  situation: boolean;
  task: boolean;
  action: boolean;
  result: boolean;
}

export interface AIAnalysis {
  resumeScore?: number;
  semanticGaps?: string[];
  interviewScore?: number;
  STARCompleteness?: STARCompleteness;
}

export interface CrucialMoment {
  timestamp: number;
  snapshotUrl: string;
  highlight: string;
}

export interface BodyLanguageData {
  eyeContactScore: number;
  postureScore: number;
  gesturesScore: number;
  crucialMoments: CrucialMoment[];
  detectedEmotion?: string;
  detectedGesture?: string;
}

export interface Session {
  sessionId: string;
  userId: string;
  type: 'resume' | 'interview';
  employerIndustry: string;
  startTime: Date;
  endTime: Date;
  aiAnalysis: AIAnalysis;
  bodyLanguage: BodyLanguageData;
  feedback: string;
}

// ===== UI State Types =====
export interface ScoreMetric {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  icon: string;
}

export interface InterviewMessage {
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

export interface ResumeAnalysisResult {
  score: number;
  missingKeywords: string[];
  suggestions: ResumeSuggestion[];
  starFeedback: string;
}

export interface ResumeSuggestion {
  original: string;
  improved: string;
  reason: string;
}

// ===== MediaPipe Score Types =====
export interface BodyLanguageScores {
  eyeContact: number;
  posture: number;
  gestures: number;
  overall: number;
}

// ===== Chart Data Types =====
export interface SessionChartData {
  date: string;
  eyeContact: number;
  posture: number;
  gestures: number;
  overall: number;
}

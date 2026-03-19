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
  hiringProbability?: number;
  improvementChecklist?: string[];
  confidenceScore?: number;
  technicalFeedback?: string;
  bodyLanguageFeedback?: string;
  vocalFeedback?: string;
  top3JobRecommendations?: { title: string; reason: string }[];
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
  confidenceScore: number;
  audioScore: number;
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
  fullAnalysis?: any;
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
  confidence: number;
  audio: number;
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

// ===== Resume Enhancement Types =====
export interface ResumePersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
}

export interface ResumeExperience {
  role: string;
  company: string;
  location: string;
  duration: string;
  bullets: string[];
}

export interface ResumeEducation {
  degree: string;
  school: string;
  location: string;
  duration: string;
}

export interface ResumeSkillCategory {
  category: string;
  items: string[];
}

export interface EnhancedResume {
  personalInfo: ResumePersonalInfo;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkillCategory[];
}

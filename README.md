# HireME: Next-Gen AI Interview Coaching Platform

HireME is a futuristic, AI-powered interview coaching application that leverages local neural models and Google's Gemini API to provide real-time, behavioral, and semantic feedback to candidates. Built with modern web technologies, it offers a secure, instant, and privacy-focused training experience directly in the browser.

![Dashboard Preview](docs/dashboard-preview.png)

## Features
- **Virtual Interview Portal**: Real-time behavioral practice powered by Google Gemini.
- **Neural Body Language Tracking**: Local, client-side tracking of eye contact, posture, and hand gestures using MediaPipe (Zero Python/Server dependency!).
- **Resume Optimizer**: AI-driven analysis for ATS keyword matching and STAR method achievement mapping.
- **Dynamic Dashboard**: Comprehensive session logging and emotional quotient analytics.
- **Glassmorphism UI**: High-end, futuristic dark-mode responsive design.

## Architecture Highlights
- **Frontend**: React 18, React Router v6, Tailwind CSS v4, Framer Motion for animations.
- **Computer Vision**: `@mediapipe/face_mesh`, `@mediapipe/hands`, and `@mediapipe/pose` executing securely in the browser via JavaScript.
- **AI/LLM**: Google Generative AI (`gemini-2.5-flash`) for dynamic interview questions and feedback generation.
- **Database/Auth**: Firebase Firestore for session data persistence.
- **Build Tool**: Vite for blazing fast hot module replacement and optimized production builds.

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- A Google Gemini API Key. [Get one here](https://aistudio.google.com/app/apikey).
- (Optional) A Firebase Project for database storage.

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/darknecrocities/HireME.git
cd HireME
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory and add your API credentials. You can copy the provided template:
```bash
cp .env.example .env
```
Inside `.env`, insert your Gemini API Key:
```env
VITE_GEMINI_API_KEY="your_gemini_api_key_here"
```

### 3. Start Development Server
Run the local development server:
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

## Important Note on MediaPipe
This application utilizes highly optimized **JavaScript** implementations of MediaPipe rather than Python. 
1. **Zero Latency**: Models process your webcam feed locally on your machine's CPU/GPU instantly. No round-trip server delay.
2. **Privacy First**: Your video stream never leaves your browser. No frames are sent over the internet for processing.
3. **No Complex Backends**: By avoiding Python (FastAPI/Flask + WebSockets), the application can be deployed statically (e.g., to Vercel, Netlify, or GitHub Pages) for free.

## Build for Production
To generate a production-ready static build:
```bash
npm run build
```
The optimized files will be located in the `dist/` directory.

---
*Built for Excellence ✨ 2026 TAIM TEAM*

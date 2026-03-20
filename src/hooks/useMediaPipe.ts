import { useRef, useCallback, useState, useEffect } from 'react';
import type { BodyLanguageScores } from '../types';

// Accessing MediaPipe from window globals because direct ESM imports
// in Vite 8 are incompatible with these UMD bundles.
const { FaceMesh, FACEMESH_TESSELATION, FACEMESH_RIGHT_EYE, FACEMESH_LEFT_EYE } = (window as any);
const { Pose, POSE_CONNECTIONS } = (window as any);
const { Hands, HAND_CONNECTIONS } = (window as any);
const { Camera } = (window as any);
const { drawConnectors, drawLandmarks } = (window as any);


export function useMediaPipe() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [scores, setScores] = useState<BodyLanguageScores>({
    eyeContact: 0,
    posture: 0,
    gestures: 0,
    confidence: 0,
    audio: 0,
    overall: 0,
  });
  
  const [isActive, setIsActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [showMesh, setShowMesh] = useState(false);
  const [emotion, setEmotion] = useState('Neutral');
  const [gesture, setGesture] = useState('None');

  const faceMeshRef = useRef<any | null>(null);
  const handsRef = useRef<any | null>(null);
  const poseRef = useRef<any | null>(null);
  const cameraRef = useRef<any | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const showMeshRef = useRef(false);
  const lastScoreUpdateRef = useRef(0);

  const scoreHistory = useRef<{ eye: number[]; posture: number[]; gesture: number[]; confidence: number[] }>({
    eye: [],
    posture: [],
    gesture: [],
    confidence: [],
  });

  const smoothScore = useCallback((history: number[], newValue: number, windowSize = 20): number => {
    history.push(newValue);
    if (history.length > windowSize) history.shift();
    const sum = history.reduce((a, b) => a + b, 0);
    return Math.round(sum / history.length);
  }, []);

  const latestResults = useRef({
    image: null as HTMLVideoElement | null,
    face: null as any,
    pose: null as any,
    hands: null as any,
  });

  const updateScores = useCallback(() => {
    const face = latestResults.current.face;
    const pose = latestResults.current.pose;
    const hands = latestResults.current.hands;

    let baseEye = 50;
    let basePosture = 60;
    let baseGesture = 20;
    
    // 1. Eye Contact Analysis (Iris Tracking)
    if (face?.multiFaceLandmarks?.length > 0) {
      const landmarks = face.multiFaceLandmarks[0];
      
      const leftEyeInner = landmarks[362];
      const rightEyeInner = landmarks[133];
      const leftEyeOuter = landmarks[263];
      const noseTip = landmarks[1];
      
      const hasIris = landmarks[468] !== undefined || landmarks[473] !== undefined;
      const eyeCenter = (leftEyeInner.x + rightEyeInner.x) / 2;
      const horizontalOffset = Math.abs(noseTip.x - eyeCenter);
      
      const leftIris = landmarks[468] || { x: (leftEyeInner.x + leftEyeOuter.x) / 2, y: (leftEyeInner.y + leftEyeOuter.y) / 2 };
      const socketLeft = Math.min(leftEyeInner.x, leftEyeOuter.x);
      const socketRight = Math.max(leftEyeInner.x, leftEyeOuter.x);
      const socketWidth = Math.max(0.01, socketRight - socketLeft);
      const irisRelativeX = (leftIris.x - socketLeft) / socketWidth;
      const irisCenterOffset = Math.abs(irisRelativeX - 0.5);
      
      // LIVE METRICS: Mostly 100, but with subtle alignment penalties
      baseEye = 100;
      
      // Alignment Penalty (10-15 as requested)
      if (horizontalOffset > 0.12 || irisCenterOffset > 0.18) {
        baseEye -= (10 + Math.random() * 5); 
      }
      
      // Live Flicker: Tiny randomness so it's not a static number
      // This makes it feel "live" and real-time.
      if (baseEye > 90) {
        baseEye -= (Math.random() * 3); 
      }
      
      if (!hasIris) {
        baseEye = 0;
      } else {
        baseEye = Math.max(0, Math.min(100, baseEye));
      }
      
      // 2. Head expansion/lip check for posture bonus
      const upperLip = landmarks[13];
      const lowerLip = landmarks[14];
      const mouthOpen = Math.abs(upperLip.y - lowerLip.y);
      if (mouthOpen > 0.02) basePosture += 10; 
    } else {
      baseEye = 0; 
    }

    // 2. Posture Analysis
    if (pose?.poseLandmarks) {
      const p = pose.poseLandmarks;
      const leftShoulder = p[11];
      const rightShoulder = p[12];
      const nose = p[0];
      
      const shoulderSlope = Math.abs(leftShoulder.y - rightShoulder.y);
      const shoulderCenter = (leftShoulder.x + rightShoulder.x) / 2;
      const headAlignment = Math.abs(nose.x - shoulderCenter);
      
      // Graded Posture: Starts at 100, drops slowly for slouch/tilt
      basePosture = 100;
      
      // Slope penalty: if shoulders are tilted
      if (shoulderSlope > 0.05) {
        basePosture -= (shoulderSlope - 0.05) * 200; 
      }
      
      // Alignment penalty: if head is not over shoulders
      if (headAlignment > 0.12) {
        basePosture -= (headAlignment - 0.12) * 150; 
      }
      
      // Low shoulder penalty (slouching)
      if (leftShoulder.y > 0.85) {
        basePosture -= 20;
      }
      
      // Live Flicker for Posture
      if (basePosture > 80) {
        basePosture -= (Math.random() * 2); 
      }
    } else {
      basePosture = 70; // Neutral baseline for posture if not fully seen
    }

    // 3. Gesture Analysis
    if (hands?.multiHandLandmarks?.length > 0) {
      const landmarks = hands.multiHandLandmarks[0];
      const palm = landmarks[0];
      const midTip = landmarks[12];
      
      // If hands are seen, start high
      baseGesture = 90 + (Math.random() * 10); 
      
      // Face/Eye touching penalty (Broad detection)
      if (face?.multiFaceLandmarks?.length > 0) {
        const faceLandmarks = face.multiFaceLandmarks[0];
        const chin = faceLandmarks[152];
        const leftEye = faceLandmarks[362];
        const rightEye = faceLandmarks[133];
        const faceCenter = faceLandmarks[1]; // Nose tip as face center
        
        // Check dist from palm AND midTip to eyes and face center
        const distPalmToLeftEye = Math.sqrt(Math.pow(palm.x - leftEye.x, 2) + Math.pow(palm.y - leftEye.y, 2));
        const distPalmToRightEye = Math.sqrt(Math.pow(palm.x - rightEye.x, 2) + Math.pow(palm.y - rightEye.y, 2));
        const distMidToFace = Math.sqrt(Math.pow(midTip.x - faceCenter.x, 2) + Math.pow(midTip.y - faceCenter.y, 2));
        const distPalmToChin = Math.sqrt(Math.pow(palm.x - chin.x, 2) + Math.pow(palm.y - chin.y, 2));
        
        // Eye Coverage Penalty (Wide 0.15 zone)
        if (distPalmToLeftEye < 0.15 || distPalmToRightEye < 0.15) {
          baseGesture -= 80; 
          baseEye = 0; // FORCE Eye score to 0
        } else if (distMidToFace < 0.18 || distPalmToChin < 0.15) {
          // General Face Touching (Less severe but still bad)
          baseGesture -= 30; 
        }
      }
      
      // Height penalties
      if (palm.y < 0.25) baseGesture -= 20; 
      if (palm.y > 0.95) baseGesture -= 20; 
    } else {
      // NEUTRAL GESTURE BASELINE: 60% if hands are off-screen (Passing)
      baseGesture = 60 + (Math.random() * 5); 
    }

    const eyeVal = smoothScore(scoreHistory.current.eye, Math.max(0, Math.min(100, baseEye)));
    const postureVal = smoothScore(scoreHistory.current.posture, Math.max(0, Math.min(100, basePosture)));
    const gestureVal = smoothScore(scoreHistory.current.gesture, Math.max(0, Math.min(100, baseGesture)));
    
    // Confidence is a weighted composite
    const baseConfidence = (eyeVal * 0.4 + postureVal * 0.3 + gestureVal * 0.3);
    const confidenceVal = smoothScore(scoreHistory.current.confidence, Math.max(0, Math.min(100, baseConfidence)));
    
    const audioVal = scores.audio;
    const overall = Math.round((eyeVal + postureVal + gestureVal + confidenceVal + audioVal) / 5);

    const now = Date.now();
    if (now - lastScoreUpdateRef.current > 200) {
      setScores({ eyeContact: eyeVal, posture: postureVal, gestures: gestureVal, confidence: confidenceVal, audio: audioVal, overall });
      lastScoreUpdateRef.current = now;
    }

    const currentEmo = confidenceVal > 80 ? 'Highly Confident' : (eyeVal > 70 ? 'Attentive' : 'Distracted');
    const currentGes = gestureVal > 60 ? 'Engaged' : 'Static';
    
    setEmotion(currentEmo);
    setGesture(currentGes);
  }, [smoothScore, scores.audio]);

  const drawFrame = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const w = canvasRef.current.width = videoRef.current.videoWidth || 1280;
    const h = canvasRef.current.height = videoRef.current.videoHeight || 720;

    ctx.save();
    ctx.clearRect(0, 0, w, h);
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    
    if (latestResults.current.image) {
      ctx.drawImage(latestResults.current.image, 0, 0, w, h);
    } else {
      ctx.drawImage(videoRef.current, 0, 0, w, h);
    }

    if (showMeshRef.current) {
      if (latestResults.current.face?.multiFaceLandmarks) {
        for (const landmarks of latestResults.current.face.multiFaceLandmarks) {
          drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, {color: '#3b82f6', lineWidth: 1 });
          drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, {color: '#10b981', lineWidth: 2 });
          drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, {color: '#10b981', lineWidth: 2 });
        }
      }
      if (latestResults.current.pose?.poseLandmarks) {
        drawConnectors(ctx, latestResults.current.pose.poseLandmarks, POSE_CONNECTIONS, {color: '#8b5cf6', lineWidth: 4});
        drawLandmarks(ctx, latestResults.current.pose.poseLandmarks, {color: '#f59e0b', lineWidth: 2});
      }
      if (latestResults.current.hands?.multiHandLandmarks) {
        for (const landmarks of latestResults.current.hands.multiHandLandmarks) {
          drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {color: '#10b981', lineWidth: 5});
          drawLandmarks(ctx, landmarks, {color: '#3b82f6', lineWidth: 2});
        }
      }
    }
    ctx.restore();

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(w - 180, 20, 160, 40);
    ctx.font = 'bold 12px Inter';
    ctx.fillStyle = '#fff';
    ctx.fillText(`SESSION_ID: LIVE`, w - 170, 38);
    ctx.fillStyle = '#10b981';
    ctx.fillText(`BIOMETRICS ACTIVE`, w - 170, 54);

    animFrameRef.current = requestAnimationFrame(drawFrame);
  }, []); // Remove showMesh from dependencies to prevent loop drift

  const onResults = useCallback((type: 'face' | 'pose' | 'hands', results: any) => {
    latestResults.current.image = results.image;
    if (type === 'face') latestResults.current.face = results;
    if (type === 'pose') latestResults.current.pose = results;
    if (type === 'hands') latestResults.current.hands = results;

    updateScores();
  }, [updateScores]);

  const initMediaPipe = useCallback(async () => {
    if (faceMeshRef.current) return;

    try {
      const faceMesh = new FaceMesh({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
      faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
      faceMesh.onResults((res: any) => onResults('face', res));
      await faceMesh.initialize();
      faceMeshRef.current = faceMesh;

      const pose = new Pose({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
      pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
      pose.onResults((res: any) => onResults('pose', res));
      await pose.initialize();
      poseRef.current = pose;

      const hands = new Hands({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
      hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
      hands.onResults((res: any) => onResults('hands', res));
      await hands.initialize();
      handsRef.current = hands;
    } catch (e) {
      console.error('MediaPipe initialization failed:', e);
    }
  }, [onResults]);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      console.error('Camera access failed', e);
      return;
    }

    setIsActive(true);
    if (!faceMeshRef.current) await initMediaPipe();

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            latestResults.current.image = videoRef.current;
            const pFace = faceMeshRef.current?.send({ image: videoRef.current }).catch(() => {});
            const pPose = poseRef.current?.send({ image: videoRef.current }).catch(() => {});
            const pHands = handsRef.current?.send({ image: videoRef.current }).catch(() => {});
            await Promise.all([pFace, pPose, pHands]);
          }
        },
        width: 1280,
        height: 720
      });
      camera.start();
      cameraRef.current = camera;
      setCameraReady(true);
      animFrameRef.current = requestAnimationFrame(drawFrame);
    }
  }, [initMediaPipe, drawFrame]);

  const stop = useCallback(() => {
    setIsActive(false);
    cameraRef.current?.stop();
    faceMeshRef.current?.close();
    poseRef.current?.close();
    handsRef.current?.close();
    faceMeshRef.current = null;
    poseRef.current = null;
    handsRef.current = null;
    setCameraReady(false);
    
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const toggleMesh = () => {
    showMeshRef.current = !showMeshRef.current;
    setShowMesh(showMeshRef.current);
  };
  
  const setAudioValue = (val: number) => {
    setScores(prev => ({ ...prev, audio: val }));
  };
  
  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { videoRef, canvasRef, scores, isActive, cameraReady, showMesh, emotion, gesture, start, stop, toggleMesh, setAudioValue };
}

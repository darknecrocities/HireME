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
      
      // Face Mesh landmarks 468-472 (Left Iris) & 473-477 (Right Iris)
      // If refineLandmarks is true, these are the iris centers
      const leftIris = landmarks[468] || landmarks[133];
      const noseTip = landmarks[1];
      const leftEyeInner = landmarks[133];
      const leftEyeOuter = landmarks[33];
      
      // Calculate head orientation (yaw)
      const headCenter = (leftEyeInner.x + leftEyeOuter.x) / 2;
      const horizontalOffset = Math.abs(noseTip.x - headCenter);
      
      // Calculate pupil position within the eye (simplified iris-in-eye check)
      // If iris is centered within the x-range of the eye socket, eye contact is better
      const eyeWidth = Math.abs(leftEyeOuter.x - leftEyeInner.x);
      const irisRelativeX = (leftIris.x - leftEyeInner.x) / eyeWidth;
      const isIrisCentered = irisRelativeX > 0.35 && irisRelativeX < 0.65;
      
      // Yaw penalty: if head is turned more than 20% of face width
      const yawPenalty = Math.max(0, (horizontalOffset - 0.08) * 400);
      
      baseEye = 95; 
      if (!isIrisCentered) baseEye -= 40;
      baseEye -= yawPenalty;
      
      // 2. Emotional confidence based on face expansion (smiling/relaxed vs squinting)
      const upperLip = landmarks[13];
      const lowerLip = landmarks[14];
      const mouthOpen = Math.abs(upperLip.y - lowerLip.y);
      if (mouthOpen > 0.02) basePosture += 5; // Slight open mouth/relaxed
    } else {
      baseEye = 0; // User not looking at camera or face not detected
    }

    // 2. Posture Analysis
    if (pose?.poseLandmarks) {
      const p = pose.poseLandmarks;
      const leftShoulder = p[11];
      const rightShoulder = p[12];
      const nose = p[0];
      
      // Shoulder Levelness
      const shoulderSlope = Math.abs(leftShoulder.y - rightShoulder.y);
      const isLevel = shoulderSlope < 0.05;
      
      // Nose-to-Shoulder Center alignment (slouching/tilting check)
      const shoulderCenter = (leftShoulder.x + rightShoulder.x) / 2;
      const headAlignment = Math.abs(nose.x - shoulderCenter);
      
      basePosture = 90;
      if (!isLevel) basePosture -= 20;
      if (headAlignment > 0.1) basePosture -= 30;
      
      // Check if shoulders are visible and high (good posture)
      if (leftShoulder.y > 0.8) basePosture -= 20; // Slumping low out of frame
    }

    // 3. Gesture Analysis
    if (hands?.multiHandLandmarks?.length > 0) {
      const landmarks = hands.multiHandLandmarks[0];
      const wrist = landmarks[0];
      
      // Check for motion (simple delta check could be added, but for now active presence)
      baseGesture = 70;
      
      // Face touching penalty
      if (face?.multiFaceLandmarks?.length > 0) {
        const faceLandmarks = face.multiFaceLandmarks[0];
        const chin = faceLandmarks[152];
        const distToChin = Math.sqrt(Math.pow(wrist.x - chin.x, 2) + Math.pow(wrist.y - chin.y, 2));
        if (distToChin < 0.15) baseGesture -= 40; // Penalty for touching face/chin
      }
      
      // Gesture height (chest level is good)
      if (wrist.y < 0.3) baseGesture -= 20; // Hands too high
      if (wrist.y > 0.9) baseGesture -= 20; // Hands too low
    }

    const eyeVal = smoothScore(scoreHistory.current.eye, Math.max(0, Math.min(100, baseEye)));
    const postureVal = smoothScore(scoreHistory.current.posture, Math.max(0, Math.min(100, basePosture)));
    const gestureVal = smoothScore(scoreHistory.current.gesture, Math.max(0, Math.min(100, baseGesture)));
    
    // Confidence is a composite of others
    const baseConfidence = (eyeVal * 0.4 + postureVal * 0.4 + gestureVal * 0.2);
    const confidenceVal = smoothScore(scoreHistory.current.confidence, Math.max(0, Math.min(100, baseConfidence)));
    
    const audioVal = scores.audio;
    const overall = Math.round((eyeVal + postureVal + gestureVal + confidenceVal + audioVal) / 5);

    setScores({ eyeContact: eyeVal, posture: postureVal, gestures: gestureVal, confidence: confidenceVal, audio: audioVal, overall });

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
    ctx.fillText(`ID: USER_SESSION`, w - 170, 38);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText(`NEURAL LINK ACTIVE`, w - 170, 54);

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

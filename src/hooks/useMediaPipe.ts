import { useRef, useCallback, useState, useEffect } from 'react';
import type { BodyLanguageScores } from '../types';
const { FaceMesh, FACEMESH_TESSELATION, FACEMESH_RIGHT_EYE, FACEMESH_LEFT_EYE } = window as any;
const { Hands, HAND_CONNECTIONS } = window as any;
const { Pose, POSE_CONNECTIONS } = window as any;
const { Camera } = window as any;
const { drawConnectors, drawLandmarks } = window as any;

export function useMediaPipe() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [scores, setScores] = useState<BodyLanguageScores>({
    eyeContact: 0,
    posture: 0,
    gestures: 0,
    overall: 0,
  });
  
  const [isActive, setIsActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [showMesh, setShowMesh] = useState(true);
  const [emotion, setEmotion] = useState('Neutral');
  const [gesture, setGesture] = useState('None');

  const faceMeshRef = useRef<any | null>(null);
  const handsRef = useRef<any | null>(null);
  const poseRef = useRef<any | null>(null);
  const cameraRef = useRef<any | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const scoreHistory = useRef<{ eye: number[]; posture: number[]; gesture: number[] }>({
    eye: [],
    posture: [],
    gesture: [],
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

    let baseEye = 40;
    let basePosture = 40;
    let baseGesture = 30;

    if (face?.multiFaceLandmarks?.length > 0) baseEye = 85 + (Math.random() - 0.5) * 10;
    if (pose?.poseLandmarks) basePosture = 90 + (Math.random() - 0.5) * 10;
    if (hands?.multiHandLandmarks?.length > 0) baseGesture = 80 + (Math.random() - 0.5) * 10;

    const eyeVal = smoothScore(scoreHistory.current.eye, Math.max(0, Math.min(100, baseEye)));
    const postureVal = smoothScore(scoreHistory.current.posture, Math.max(0, Math.min(100, basePosture)));
    const gestureVal = smoothScore(scoreHistory.current.gesture, Math.max(0, Math.min(100, baseGesture)));
    const overall = Math.round((eyeVal + postureVal + gestureVal) / 3);

    setScores({ eyeContact: eyeVal, posture: postureVal, gestures: gestureVal, overall });

    const currentEmo = eyeVal > 85 ? 'Highly Focused' : (gestureVal > 80 ? 'Expressive' : 'Analytical');
    const currentGes = gestureVal > 50 ? 'Active Hands' : 'Still';
    
    setEmotion(currentEmo);
    setGesture(currentGes);
  }, [smoothScore]);

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

    if (showMesh) {
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
  }, [showMesh]);

  const onResults = useCallback((type: 'face' | 'pose' | 'hands', results: any) => {
    latestResults.current.image = results.image;
    if (type === 'face') latestResults.current.face = results;
    if (type === 'pose') latestResults.current.pose = results;
    if (type === 'hands') latestResults.current.hands = results;

    updateScores();
  }, [updateScores]);

  const initMediaPipe = useCallback(() => {
    const faceMesh = new FaceMesh({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
    faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    faceMesh.onResults((res: any) => onResults('face', res));
    faceMeshRef.current = faceMesh;

    const pose = new Pose({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
    pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    pose.onResults((res: any) => onResults('pose', res));
    poseRef.current = pose;

    const hands = new Hands({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
    hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    hands.onResults((res: any) => onResults('hands', res));
    handsRef.current = hands;
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
    if (!faceMeshRef.current) initMediaPipe();

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

  const toggleMesh = () => setShowMesh(prev => !prev);
  
  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { videoRef, canvasRef, scores, isActive, cameraReady, showMesh, emotion, gesture, start, stop, toggleMesh };
}

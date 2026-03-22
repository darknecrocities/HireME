import { useState, useEffect, useRef, useCallback } from 'react';

export function useAudioAnalysis(isActive: boolean) {
  const [audioScore, setAudioScore] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const speakingFramesRef = useRef(0);
  const totalFramesRef = useRef(0);
  const lastUpdateRef = useRef(0);

  const lastAnalysisTimeRef = useRef(0);

  const startAudio = useCallback(async () => {
    try {
      // Improved constraints for better Windows/Chrome compatibility
      const constraints = { 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      // Ensure AudioContext is running (crucial for Windows/Chrome)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAudio = async () => {
        if (!analyserRef.current || !audioContextRef.current) return;

        const now = Date.now();
        
        // OPTIMIZATION: Throttle audio analysis to ~12fps (every 80ms)
        // This is more than enough for volume/consistency metrics
        if (now - lastAnalysisTimeRef.current >= 80) {
          // Double check context state in loop
          if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
          }

          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Calculate raw metrics
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          const normalizedVol = Math.min(100, Math.round((average / 128) * 100));
          
          // Lowered threshold from 15 to 10 for better pickup
          const speaking = normalizedVol > 10;
          totalFramesRef.current++;
          if (speaking) speakingFramesRef.current++;

          // Only update React state every 300ms
          if (now - lastUpdateRef.current > 300) {
            setVolume(normalizedVol);
            setIsSpeaking(speaking);
            
            const consistency = (speakingFramesRef.current / totalFramesRef.current) * 100;
            let score = 0;
            if (consistency > 30 && consistency < 80) {
              score = 90 - Math.abs(50 - consistency);
            } else {
              score = Math.max(0, 50 - Math.abs(50 - consistency));
            }
            
            setAudioScore(Math.round(score));
            lastUpdateRef.current = now;
          }
          lastAnalysisTimeRef.current = now;
        }
        
        animationFrameRef.current = requestAnimationFrame(updateAudio);
      };
      
      updateAudio();
    } catch (err) {
      console.error('CRITICAL: Audio initialization failed:', err);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    speakingFramesRef.current = 0;
    totalFramesRef.current = 0;
    setAudioScore(0);
    setVolume(0);
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    if (isActive) {
      startAudio();
    } else {
      stopAudio();
    }
    return () => stopAudio();
  }, [isActive, startAudio, stopAudio]);

  return { audioScore, isSpeaking, volume };
}

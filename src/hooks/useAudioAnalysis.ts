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

  const startAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAudio = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const now = Date.now();
        // Calculate raw metrics on every frame for accuracy
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalizedVol = Math.min(100, Math.round((average / 128) * 100));
        
        const speaking = normalizedVol > 15;
        totalFramesRef.current++;
        if (speaking) speakingFramesRef.current++;

        // Only update React state every 200ms
        if (now - lastUpdateRef.current > 200) {
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
        animationFrameRef.current = requestAnimationFrame(updateAudio);
      };
      
      updateAudio();
    } catch (err) {
      console.error('Error accessing microphone:', err);
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

import { useState, useEffect, useRef, useCallback } from 'react';

export function useAudioAnalysis(isActive: boolean) {
  const [audioScore, setAudioScore] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
      
      let speakingFrames = 0;
      let totalFrames = 0;

      const updateAudio = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalizedVol = Math.min(100, Math.round((average / 128) * 100));
        setVolume(normalizedVol);
        
        const speaking = normalizedVol > 15;
        setIsSpeaking(speaking);
        
        totalFrames++;
        if (speaking) speakingFrames++;
        
        // Calculate audio score based on consistency (avoiding long silences or constant noise)
        const consistency = (speakingFrames / totalFrames) * 100;
        // Ideal consistency for an interview is around 40-70% (alternating between question and answer)
        let score = 0;
        if (consistency > 30 && consistency < 80) {
          score = 90 - Math.abs(50 - consistency);
        } else {
          score = Math.max(0, 50 - Math.abs(50 - consistency));
        }
        
        setAudioScore(Math.round(score));
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

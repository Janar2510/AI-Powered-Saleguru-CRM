import { useState, useCallback, useEffect, useRef } from 'react';
import { aiTranscriptionService, TranscriptionResult, AIAnalysisResult } from '../services/aiTranscriptionService';

interface UseAITranscriptionOptions {
  autoStart?: boolean;
  onComplete?: (transcription: TranscriptionResult, analysis: AIAnalysisResult) => void;
  onError?: (error: Error) => void;
  onRealTimeUpdate?: (partialTranscript: string) => void;
}

interface UseAITranscriptionReturn {
  // Recording state
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  
  // Processing state
  isTranscribing: boolean;
  isAnalyzing: boolean;
  progress: number;
  
  // Results
  currentTranscription: TranscriptionResult | null;
  currentAnalysis: AIAnalysisResult | null;
  error: Error | null;
  
  // Actions
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  uploadFile: (file: File) => Promise<void>;
  clearResults: () => void;
  
  // Real-time data
  partialTranscript: string;
  recordingTime: string;
}

export function useAITranscription(options: UseAITranscriptionOptions = {}): UseAITranscriptionReturn {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  
  // Processing state
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Results
  const [currentTranscription, setCurrentTranscription] = useState<TranscriptionResult | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // Real-time data
  const [partialTranscript, setPartialTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState('00:00');
  
  // Refs for timers
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Setup service event handlers
  useEffect(() => {
    aiTranscriptionService.onTranscriptionComplete = (transcription, analysis) => {
      setCurrentTranscription(transcription);
      setCurrentAnalysis(analysis);
      setIsTranscribing(false);
      setIsAnalyzing(false);
      setProgress(100);
      options.onComplete?.(transcription, analysis);
    };

    aiTranscriptionService.onTranscriptionError = (err) => {
      setError(err);
      setIsTranscribing(false);
      setIsAnalyzing(false);
      setProgress(0);
      options.onError?.(err);
    };

    aiTranscriptionService.onRealTimeTranscript = (partial) => {
      setPartialTranscript(partial);
      options.onRealTimeUpdate?.(partial);
    };

    return () => {
      // Cleanup
      aiTranscriptionService.onTranscriptionComplete = undefined;
      aiTranscriptionService.onTranscriptionError = undefined;
      aiTranscriptionService.onRealTimeTranscript = undefined;
    };
  }, [options]);

  // Recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      startTimeRef.current = Date.now() - duration;
      
      durationTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDuration(elapsed);
        
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        setRecordingTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [isRecording, isPaused, duration]);

  // Actions
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setPartialTranscript('');
      setCurrentTranscription(null);
      setCurrentAnalysis(null);
      
      await aiTranscriptionService.startRecording();
    } catch (err) {
      setError(err as Error);
      setIsRecording(false);
      throw err;
    }
  }, []);

  const stopRecording = useCallback(() => {
    aiTranscriptionService.stopRecording();
    setIsRecording(false);
    setIsPaused(false);
    setIsTranscribing(true);
    setProgress(10);
    
    // Simulate processing progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          setIsAnalyzing(true);
          return 90;
        }
        return prev + 10;
      });
    }, 300);
  }, []);

  const pauseRecording = useCallback(() => {
    if (isRecording && !isPaused) {
      aiTranscriptionService.pauseRecording();
      setIsPaused(true);
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (isRecording && isPaused) {
      aiTranscriptionService.pauseRecording(); // This resumes if already paused
      setIsPaused(false);
    }
  }, [isRecording, isPaused]);

  const uploadFile = useCallback(async (file: File) => {
    try {
      setError(null);
      setIsTranscribing(true);
      setIsAnalyzing(false);
      setProgress(0);
      setCurrentTranscription(null);
      setCurrentAnalysis(null);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 50) {
            clearInterval(progressInterval);
            setIsAnalyzing(true);
            return 50;
          }
          return prev + 10;
        });
      }, 200);

      const result = await aiTranscriptionService.uploadAndProcess(file);
      
      clearInterval(progressInterval);
      setCurrentTranscription(result.transcription);
      setCurrentAnalysis(result.analysis);
      setIsTranscribing(false);
      setIsAnalyzing(false);
      setProgress(100);
      
      options.onComplete?.(result.transcription, result.analysis);
    } catch (err) {
      setError(err as Error);
      setIsTranscribing(false);
      setIsAnalyzing(false);
      setProgress(0);
      options.onError?.(err as Error);
      throw err;
    }
  }, [options]);

  const clearResults = useCallback(() => {
    setCurrentTranscription(null);
    setCurrentAnalysis(null);
    setError(null);
    setProgress(0);
    setPartialTranscript('');
    setDuration(0);
    setRecordingTime('00:00');
  }, []);

  // Auto-start if requested
  useEffect(() => {
    if (options.autoStart) {
      startRecording().catch(console.error);
    }
  }, [options.autoStart, startRecording]);

  return {
    // Recording state
    isRecording,
    isPaused,
    duration,
    
    // Processing state
    isTranscribing,
    isAnalyzing,
    progress,
    
    // Results
    currentTranscription,
    currentAnalysis,
    error,
    
    // Actions
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    uploadFile,
    clearResults,
    
    // Real-time data
    partialTranscript,
    recordingTime,
  };
}

export default useAITranscription;


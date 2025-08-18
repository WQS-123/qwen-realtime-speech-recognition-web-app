import { useState, useRef, useCallback } from 'react';

export enum RecordingStatus {
  IDLE = 'idle',
  REQUESTING_PERMISSION = 'requesting_permission',
  RECORDING = 'recording',
  STOPPED = 'stopped',
  ERROR = 'error'
}

interface UseAudioRecorderReturn {
  status: RecordingStatus;
  audioBlob: Blob | null;
  audioUrl: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  error: string | null;
  duration: number;
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [status, setStatus] = useState<RecordingStatus>(RecordingStatus.IDLE);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setStatus(RecordingStatus.REQUESTING_PERMISSION);
      setError(null);
      setAudioBlob(null);
      setAudioUrl(null);
      setDuration(0);

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setStatus(RecordingStatus.STOPPED);
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      // Handle errors
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed');
        setStatus(RecordingStatus.ERROR);
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setStatus(RecordingStatus.RECORDING);
      startTimeRef.current = Date.now();

      // Start duration timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
      }, 1000);

    } catch (err) {
      console.error('Error starting recording:', err);
      let errorMessage = 'Failed to start recording';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Microphone permission denied';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No microphone found';
        } else if (err.name === 'NotSupportedError') {
          errorMessage = 'Recording not supported in this browser';
        }
      }
      
      setError(errorMessage);
      setStatus(RecordingStatus.ERROR);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && status === RecordingStatus.RECORDING) {
      mediaRecorderRef.current.stop();
    }
  }, [status]);

  return {
    status,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    error,
    duration
  };
};
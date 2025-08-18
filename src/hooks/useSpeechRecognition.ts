import { useState, useCallback } from 'react';

export interface SpeechRecognitionResult {
  text: string;
  duration: number;
}

export enum TranscriptionStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error'
}

interface UseSpeechRecognitionReturn {
  transcribe: (audioBlob: Blob, language?: string) => Promise<SpeechRecognitionResult | null>;
  status: TranscriptionStatus;
  error: string | null;
  result: SpeechRecognitionResult | null;
  isProcessing: boolean;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [status, setStatus] = useState<TranscriptionStatus>(TranscriptionStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SpeechRecognitionResult | null>(null);

  const transcribe = useCallback(async (
    audioBlob: Blob, 
    language: string = 'auto'
  ): Promise<SpeechRecognitionResult | null> => {
    try {
      setStatus(TranscriptionStatus.PROCESSING);
      setError(null);
      setResult(null);

      // Prepare form data
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', language);

      // Call our API endpoint
      const response = await fetch('/api/speech', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      const speechResult: SpeechRecognitionResult = {
        text: data.text,
        duration: data.duration || 0
      };

      setResult(speechResult);
      setStatus(TranscriptionStatus.SUCCESS);
      return speechResult;

    } catch (err) {
      console.error('Speech recognition error:', err);
      
      let errorMessage = 'Transcription failed';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      setError(errorMessage);
      setStatus(TranscriptionStatus.ERROR);
      return null;
    }
  }, []);

  return {
    transcribe,
    status,
    error,
    result,
    isProcessing: status === TranscriptionStatus.PROCESSING
  };
};
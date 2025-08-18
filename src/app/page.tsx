'use client';

import React, { useState, useEffect } from 'react';
import { useAudioRecorder, RecordingStatus } from '@/hooks/useAudioRecorder';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { isAudioRecordingSupported } from '@/utils/audioUtils';
import RecordButton from '@/components/RecordButton';
import AudioWaveform from '@/components/AudioWaveform';
import LanguageSelector from '@/components/LanguageSelector';
import TranscriptionResult from '@/components/TranscriptionResult';

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [isSupported, setIsSupported] = useState(true);

  const {
    status: recordingStatus,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    error: recordingError,
    duration
  } = useAudioRecorder();

  const {
    transcribe,
    status: transcriptionStatus,
    error: transcriptionError,
    result,
    isProcessing
  } = useSpeechRecognition();

  useEffect(() => {
    setIsSupported(isAudioRecordingSupported());
  }, []);

  useEffect(() => {
    if (recordingStatus === RecordingStatus.STOPPED && audioBlob) {
      transcribe(audioBlob, selectedLanguage);
    }
  }, [recordingStatus, audioBlob, selectedLanguage, transcribe]);

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Browser Not Supported
          </h2>
          <p className="text-gray-600">
            Your browser doesn't support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Qwen Speech Recognition
            </h1>
            <p className="text-lg text-gray-600">
              Record your voice and convert it to text using Qwen AI
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Language Selector */}
            <div className="flex justify-center">
              <div className="w-full max-w-xs">
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                  disabled={recordingStatus === RecordingStatus.RECORDING || isProcessing}
                />
              </div>
            </div>

            {/* Audio Waveform */}
            <div className="flex justify-center">
              <AudioWaveform
                status={recordingStatus}
                audioUrl={audioUrl}
                width={500}
                height={100}
              />
            </div>

            {/* Record Button */}
            <div className="flex justify-center">
              <RecordButton
                status={recordingStatus}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                duration={duration}
              />
            </div>

            {/* Error Display */}
            {recordingError && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-red-800">
                        Recording Error
                      </h4>
                      <p className="text-sm text-red-700 mt-1">{recordingError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transcription Result */}
            <TranscriptionResult
              status={transcriptionStatus}
              result={result}
              error={transcriptionError}
              isProcessing={isProcessing}
            />
          </div>

          {/* Instructions */}
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                How to use:
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Select your preferred language for better recognition accuracy</li>
                <li>Click the record button to start recording your voice</li>
                <li>Speak clearly into your microphone</li>
                <li>Click the stop button when you're finished</li>
                <li>Wait for the AI to transcribe your audio to text</li>
                <li>Copy or download the transcribed text</li>
              </ol>
              <div className="mt-4 text-sm text-blue-700">
                <strong>Note:</strong> Make sure your microphone is enabled and working properly.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

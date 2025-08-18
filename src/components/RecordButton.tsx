'use client';

import React from 'react';
import { RecordingStatus } from '@/hooks/useAudioRecorder';

interface RecordButtonProps {
  status: RecordingStatus;
  onStartRecording: () => void;
  onStopRecording: () => void;
  duration: number;
}

const RecordButton: React.FC<RecordButtonProps> = ({
  status,
  onStartRecording,
  onStopRecording,
  duration
}) => {
  const isRecording = status === RecordingStatus.RECORDING;
  const isRequestingPermission = status === RecordingStatus.REQUESTING_PERMISSION;
  const hasError = status === RecordingStatus.ERROR;

  const handleClick = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleClick}
        disabled={isRequestingPermission}
        className={`
          relative w-24 h-24 rounded-full border-4 transition-all duration-200 ease-in-out
          ${isRecording
            ? 'bg-red-500 border-red-600 hover:bg-red-600'
            : hasError
            ? 'bg-gray-400 border-gray-500 cursor-not-allowed'
            : 'bg-blue-500 border-blue-600 hover:bg-blue-600'
          }
          ${isRequestingPermission
            ? 'opacity-50 cursor-wait'
            : 'active:scale-95'
          }
          shadow-lg hover:shadow-xl
        `}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <div className="flex items-center justify-center h-full">
          {isRequestingPermission ? (
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          ) : isRecording ? (
            <div className="w-6 h-6 bg-white rounded-sm" />
          ) : (
            <div className="w-0 h-0 border-l-8 border-l-white border-y-6 border-y-transparent ml-1" />
          )}
        </div>

        {isRecording && (
          <div className="absolute -inset-2 rounded-full border-4 border-red-400 animate-pulse opacity-75" />
        )}
      </button>

      <div className="text-center">
        {isRecording && (
          <div className="text-2xl font-mono font-bold text-red-600">
            {formatTime(duration)}
          </div>
        )}
        
        <div className="text-sm text-gray-600 mt-1">
          {isRequestingPermission && 'Requesting microphone access...'}
          {status === RecordingStatus.IDLE && 'Click to start recording'}
          {isRecording && 'Recording... Click to stop'}
          {status === RecordingStatus.STOPPED && 'Recording completed'}
          {hasError && 'Recording failed'}
        </div>
      </div>
    </div>
  );
};

export default RecordButton;
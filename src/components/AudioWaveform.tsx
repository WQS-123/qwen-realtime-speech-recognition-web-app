'use client';

import React, { useEffect, useRef } from 'react';
import { RecordingStatus } from '@/hooks/useAudioRecorder';

interface AudioWaveformProps {
  status: RecordingStatus;
  audioUrl?: string | null;
  width?: number;
  height?: number;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  status,
  audioUrl,
  width = 400,
  height = 80
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const barsRef = useRef<number[]>(Array(50).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isRecording = status === RecordingStatus.RECORDING;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const barWidth = width / barsRef.current.length;
      const barSpacing = 2;
      const actualBarWidth = barWidth - barSpacing;

      barsRef.current.forEach((barHeight, index) => {
        const x = index * barWidth;
        const normalizedHeight = (barHeight / 100) * height;
        const y = (height - normalizedHeight) / 2;

        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        if (isRecording) {
          gradient.addColorStop(0, '#ef4444'); // red-500
          gradient.addColorStop(1, '#dc2626'); // red-600
        } else {
          gradient.addColorStop(0, '#3b82f6'); // blue-500
          gradient.addColorStop(1, '#2563eb'); // blue-600
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, actualBarWidth, normalizedHeight);

        // Update bar height for animation
        if (isRecording) {
          // Random wave animation while recording
          const targetHeight = Math.random() * 80 + 20;
          barsRef.current[index] += (targetHeight - barsRef.current[index]) * 0.1;
        } else {
          // Fade out animation when not recording
          barsRef.current[index] *= 0.95;
        }
      });

      if (isRecording || barsRef.current.some(bar => bar > 1)) {
        animationFrameRef.current = requestAnimationFrame(draw);
      }
    };

    if (isRecording) {
      draw();
    } else if (status === RecordingStatus.STOPPED && audioUrl) {
      // Create static waveform visualization for completed recording
      barsRef.current = barsRef.current.map(() => Math.random() * 60 + 10);
      draw();
    } else {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [status, audioUrl, width, height]);

  return (
    <div className="flex flex-col items-center space-y-2">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-200 rounded-lg bg-gray-50"
      />
      <div className="text-xs text-gray-500">
        {status === RecordingStatus.RECORDING && 'Visualizing audio input...'}
        {status === RecordingStatus.STOPPED && 'Recording waveform'}
        {status === RecordingStatus.IDLE && 'Start recording to see waveform'}
      </div>
    </div>
  );
};

export default AudioWaveform;
/**
 * Convert audio blob to base64 data URL
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Convert webm audio to wav format (if needed)
 * Note: This is a simplified version. In production, you might want to use a library like lamejs
 */
export const convertWebmToWav = async (webmBlob: Blob): Promise<Blob> => {
  // For now, we'll return the original blob since Qwen API supports multiple formats
  // In a production app, you might want to convert to a standard format
  return webmBlob;
};

/**
 * Get audio duration from blob
 */
export const getAudioDuration = (audioBlob: Blob): Promise<number> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
    };
    audio.src = URL.createObjectURL(audioBlob);
  });
};

/**
 * Format duration from seconds to MM:SS
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Check if the browser supports audio recording
 */
export const isAudioRecordingSupported = (): boolean => {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    window.MediaRecorder
  );
};

/**
 * Get supported audio formats for MediaRecorder
 */
export const getSupportedAudioFormats = (): string[] => {
  const formats = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/wav'
  ];
  
  return formats.filter(format => MediaRecorder.isTypeSupported(format));
};
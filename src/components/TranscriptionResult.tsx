'use client';

import React, { useState } from 'react';
import { TranscriptionStatus, SpeechRecognitionResult } from '@/hooks/useSpeechRecognition';

interface TranscriptionResultProps {
  status: TranscriptionStatus;
  result: SpeechRecognitionResult | null;
  error: string | null;
  isProcessing: boolean;
}

const TranscriptionResult: React.FC<TranscriptionResultProps> = ({
  status,
  result,
  error,
  isProcessing
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (!result?.text) return;

    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const downloadText = () => {
    if (!result?.text) return;

    const blob = new Blob([result.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${new Date().toISOString().slice(0, 19)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (status === TranscriptionStatus.IDLE) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Transcription Result
          </h3>
          <div className="flex items-center space-x-4 mt-2">
            <div className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${status === TranscriptionStatus.PROCESSING 
                ? 'bg-blue-100 text-blue-800' 
                : status === TranscriptionStatus.SUCCESS
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
              }
            `}>
              {status === TranscriptionStatus.PROCESSING && 'Processing...'}
              {status === TranscriptionStatus.SUCCESS && 'Completed'}
              {status === TranscriptionStatus.ERROR && 'Failed'}
            </div>
            {result?.duration && (
              <div className="text-sm text-gray-500">
                Audio duration: {result.duration}s
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          {isProcessing && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-gray-600">
                  Processing audio with Qwen AI...
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">
                    Transcription Error
                  </h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {result?.text && (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={result.text}
                  readOnly
                  className="w-full h-32 p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 resize-none focus:outline-none"
                  placeholder="Transcribed text will appear here..."
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {result.text.length} characters
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={downloadText}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscriptionResult;
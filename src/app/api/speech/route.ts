import { NextRequest, NextResponse } from 'next/server';

interface SpeechRecognitionResponse {
  success: boolean;
  text?: string;
  error?: string;
  duration?: number;
}

export async function POST(request: NextRequest): Promise<NextResponse<SpeechRecognitionResponse>> {
  try {
    const apiKey = process.env.DASHSCOPE_API_KEY;
    const baseUrl = process.env.DASHSCOPE_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Parse the form data containing the audio file
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'auto';

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert audio file to base64
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');
    const mimeType = audioFile.type || 'audio/webm';

    // Prepare the request payload for Qwen-Audio API
    const payload = {
      model: 'qwen-audio-turbo',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'audio',
              audio_url: {
                url: `data:${mimeType};base64,${audioBase64}`
              }
            },
            {
              type: 'text',
              text: language === 'auto' 
                ? 'Please transcribe this audio.' 
                : `Please transcribe this audio in ${language}.`
            }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    };

    // Make request to Qwen API
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Qwen API error:', errorData);
      return NextResponse.json(
        { success: false, error: `API request failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract the transcribed text from the response
    const transcribedText = data.choices?.[0]?.message?.content || '';

    if (!transcribedText) {
      return NextResponse.json(
        { success: false, error: 'No transcription received from API' },
        { status: 500 }
      );
    }

    // Calculate approximate duration (you might want to get this from the actual audio)
    const duration = Math.round(audioBuffer.byteLength / 16000); // Rough estimate

    return NextResponse.json({
      success: true,
      text: transcribedText,
      duration: duration
    });

  } catch (error) {
    console.error('Speech recognition error:', error);
    
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Speech recognition API endpoint. Use POST to submit audio for transcription.',
    supportedFormats: ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/m4a'],
    languages: ['auto', 'zh', 'en', 'ja', 'ko', 'de', 'es', 'fr', 'it']
  });
}
# Qwen Speech Recognition Web App

A modern web application that converts speech to text using Qwen's powerful AI speech recognition API. Built with Next.js, React, and Tailwind CSS.

## Features

- 🎤 **Real-time Audio Recording** - Record directly from your browser
- 🌍 **Multi-language Support** - Supports Chinese, English, Japanese, Korean, German, Spanish, French, and Italian
- 🎵 **Audio Waveform Visualization** - Visual feedback during recording
- 📝 **Text Export** - Copy to clipboard or download as text file
- 🎨 **Beautiful UI** - Modern, responsive design with Tailwind CSS
- 🔐 **Secure API Integration** - Server-side API calls to protect your keys
- ⚡ **Fast Processing** - Powered by Qwen-Audio AI model

## Prerequisites

- Node.js 18+ 
- npm or yarn
- A modern web browser with microphone support (Chrome, Firefox, Safari)
- Alibaba Cloud DashScope API key (for Qwen AI)

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd qwen-speech-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Qwen API credentials:

```bash
# Get your API key from: https://dashscope.console.aliyun.com/
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# API Base URL (usually no need to change)
DASHSCOPE_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here
```

### 4. Get Qwen API Key

1. Go to [Alibaba Cloud DashScope Console](https://dashscope.console.aliyun.com/)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the API key to your `.env.local` file

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## How to Use

1. **Select Language**: Choose your preferred language for better recognition accuracy
2. **Start Recording**: Click the blue record button to begin recording
3. **Speak Clearly**: Speak into your microphone clearly and at normal volume
4. **Stop Recording**: Click the red stop button when finished
5. **Get Results**: Wait for the AI to process and transcribe your audio
6. **Export Text**: Copy the text to clipboard or download as a file

## Quick Deploy to Vercel 🚀

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FWQS-123%2Fqwen-speech-recognition-app)

### Manual Deploy Steps

1. **Fork or Clone this repository**
2. **Get your Qwen API Key**:
   - Visit [DashScope Console](https://dashscope.console.aliyun.com/)
   - Sign up/Login to Alibaba Cloud
   - Create a new API key (format: `sk-xxxxxxxxxxxxx`)
3. **Deploy to Vercel**:
   - Connect your GitHub repository to [Vercel](https://vercel.com)
   - Add environment variables:
     - `DASHSCOPE_API_KEY`: Your actual API key  
     - `DASHSCOPE_BASE_URL`: `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`
   - Click Deploy

### Local Development
```bash
git clone https://github.com/WQS-123/qwen-speech-recognition-app.git
cd qwen-speech-recognition-app
npm install
cp .env.example .env.local
# Edit .env.local with your API key
npm run dev
```

### Manual Deployment Steps

1. **Build the application**:
```bash
npm run build
```

2. **Set environment variables** in your hosting platform:
```bash
DASHSCOPE_API_KEY=your_api_key
DASHSCOPE_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
```

3. **Deploy** using your preferred method (Vercel, Netlify, etc.)

## Technology Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **AI Service**: Alibaba Cloud Qwen-Audio
- **Audio Processing**: Web Audio API
- **State Management**: React Hooks

## Browser Compatibility

- Chrome 50+
- Firefox 55+
- Safari 14+
- Edge 79+

**Note**: Microphone access requires HTTPS in production.

## API Endpoints

### POST `/api/speech`
Transcribe audio to text using Qwen AI.

**Parameters**:
- `audio`: Audio file (FormData)
- `language`: Language code (optional, default: 'auto')

**Response**:
```json
{
  "success": true,
  "text": "Transcribed text here",
  "duration": 10
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues:

1. Check that your microphone is working and permissions are granted
2. Ensure your API key is valid and has sufficient credits
3. Try using a different browser
4. Check the browser console for error messages

For more help, please open an issue on GitHub.

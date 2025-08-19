// Qwen实时语音识别Web应用 - 基于WebSocket的实时流

class QwenRealtimeSpeechApp {
    constructor() {
        this.socket = null;
        this.mediaRecorder = null;
        this.audioStream = null;
        this.audioContext = null;
        this.processor = null;
        this.isRecording = false;
        this.startTime = 0;
        this.durationTimer = null;
        this.canvas = null;
        this.canvasContext = null;
        this.animationFrame = null;
        this.partialResult = '';
        this.finalResult = '';
        this.audioBuffer = [];
        this.bufferSize = 0;
        
        this.init();
    }

    init() {
        // 检查浏览器支持
        if (!this.isBrowserSupported()) {
            this.showError('您的浏览器不支持音频录制功能，请使用Chrome、Firefox或Safari等现代浏览器');
            return;
        }

        // 初始化DOM元素
        this.recordButton = document.getElementById('recordButton');
        this.recordIcon = document.getElementById('recordIcon');
        this.statusText = document.getElementById('statusText');
        this.duration = document.getElementById('duration');
        this.languageSelect = document.getElementById('languageSelect');
        this.waveformText = document.getElementById('waveformText');
        this.errorDisplay = document.getElementById('errorDisplay');
        this.errorMessage = document.getElementById('errorMessage');
        this.resultSection = document.getElementById('resultSection');
        this.processingAnimation = document.getElementById('processingAnimation');
        this.resultContent = document.getElementById('resultContent');
        this.resultText = document.getElementById('resultText');
        this.textLength = document.getElementById('textLength');
        this.statusBadge = document.getElementById('statusBadge');
        this.copyButton = document.getElementById('copyButton');
        this.downloadButton = document.getElementById('downloadButton');

        // 初始化画布
        this.canvas = document.getElementById('waveform');
        this.canvasContext = this.canvas.getContext('2d');
        this.clearWaveform();

        // 绑定事件
        this.recordButton.addEventListener('click', () => this.toggleRecording());
        this.copyButton.addEventListener('click', () => this.copyText());
        this.downloadButton.addEventListener('click', () => this.downloadText());

        // 初始化WebSocket连接
        this.initWebSocket();
    }

    isBrowserSupported() {
        return !!(navigator.mediaDevices && 
                 navigator.mediaDevices.getUserMedia && 
                 window.AudioContext);
    }

    initWebSocket() {
        try {
            // 连接到Socket.IO服务器
            this.socket = io('http://localhost:5008');

            this.socket.on('connect', () => {
                console.log('✅ 已连接到实时语音识别服务');
                this.updateStatus('connected', '已连接到语音识别服务');
            });

            this.socket.on('disconnect', () => {
                console.log('❌ 与语音识别服务断开连接');
                this.updateStatus('disconnected', '与服务器断开连接');
            });

            this.socket.on('recognition_started', (data) => {
                console.log('🎤 语音识别已启动:', data);
                this.showProcessing();
            });

            this.socket.on('recognition_result', (data) => {
                console.log('📝 识别结果:', data);
                this.handleRecognitionResult(data);
            });

            this.socket.on('recognition_stopped', (data) => {
                console.log('🛑 语音识别已停止:', data);
                this.handleRecognitionStopped(data);
            });

            this.socket.on('recognition_error', (data) => {
                console.error('❌ 识别错误:', data);
                this.showError(`识别错误: ${data.error}`);
            });

        } catch (error) {
            console.error('WebSocket连接失败:', error);
            this.showError('无法连接到语音识别服务');
        }
    }

    async toggleRecording() {
        if (!this.isRecording) {
            await this.startRecording();
        } else {
            this.stopRecording();
        }
    }

    async startRecording() {
        try {
            this.hideError();
            this.updateStatus('requesting', '正在请求麦克风权限...');

            // 请求麦克风权限 - 优化音频设置
            this.audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: 16000,
                    channelCount: 1
                }
            });

            // 创建音频处理器
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioContext.createMediaStreamSource(this.audioStream);
            
            // 检查采样率
            console.log(`AudioContext采样率: ${this.audioContext.sampleRate}Hz`);
            
            // 创建处理器节点 - 使用更大的缓冲区
            this.processor = this.audioContext.createScriptProcessor(8192, 1, 1);
            this.audioBuffer = [];
            this.bufferSize = 0;
            // 计算目标缓冲区大小 - 100ms的原始采样率数据
            this.targetBufferSize = Math.round(this.audioContext.sampleRate * 0.1); // 100ms
            
            this.processor.onaudioprocess = (event) => {
                if (this.isRecording && this.socket) {
                    const audioData = event.inputBuffer.getChannelData(0);
                    
                    // 累积音频数据到缓冲区
                    this.audioBuffer.push(...audioData);
                    this.bufferSize += audioData.length;
                    
                    // 当缓冲区达到目标大小时发送
                    while (this.bufferSize >= this.targetBufferSize) {
                        const chunk = this.audioBuffer.splice(0, this.targetBufferSize);
                        this.bufferSize -= this.targetBufferSize;
                        
                        // 重采样到16kHz（如果需要）
                        const resampledChunk = this.resampleTo16kHz(new Float32Array(chunk));
                        
                        // 转换为16位PCM
                        const pcm16 = this.convertToPCM16(resampledChunk);
                        
                        // 调试信息
                        console.log(`发送音频块: 原始${chunk.length}样本 -> 重采样${resampledChunk.length}样本 -> ${pcm16.byteLength}字节`);
                        
                        // 发送音频数据到服务器
                        this.socket.emit('audio_data', {
                            audio: this.arrayBufferToBase64(pcm16)
                        });
                    }
                }
            };

            // 连接音频节点
            source.connect(this.processor);
            this.processor.connect(this.audioContext.destination);

            // 开始录制
            this.isRecording = true;
            this.startTime = Date.now();
            this.partialResult = '';
            this.finalResult = '';
            this.audioBuffer = [];
            this.bufferSize = 0;
            
            // 启动语音识别
            this.socket.emit('start_recognition', {
                language: this.languageSelect.value
            });

            // 更新UI
            this.updateStatus('recording', '实时识别中... 点击停止');
            this.startDurationTimer();
            this.startWaveformAnimation();

        } catch (error) {
            console.error('开始录制失败:', error);
            let errorMsg = '录制失败';
            
            if (error.name === 'NotAllowedError') {
                errorMsg = '麦克风权限被拒绝，请允许访问麦克风';
            } else if (error.name === 'NotFoundError') {
                errorMsg = '未找到麦克风设备';
            } else if (error.name === 'NotSupportedError') {
                errorMsg = '您的浏览器不支持录音功能';
            }
            
            this.showError(errorMsg);
        }
    }

    stopRecording() {
        if (this.isRecording) {
            this.isRecording = false;
            
            // 停止音频流和处理器
            if (this.audioStream) {
                this.audioStream.getTracks().forEach(track => track.stop());
                this.audioStream = null;
            }
            
            if (this.processor) {
                this.processor.disconnect();
                this.processor = null;
            }
            
            if (this.audioContext) {
                this.audioContext.close();
                this.audioContext = null;
            }

            // 停止计时器和动画
            this.stopDurationTimer();
            this.stopWaveformAnimation();
            
            // 停止语音识别
            if (this.socket) {
                this.socket.emit('stop_recognition');
            }
            
            // 更新UI
            this.updateStatus('stopped', '正在处理最终结果...');
        }
    }

    resampleTo16kHz(audioData) {
        const sourceSampleRate = this.audioContext.sampleRate;
        const targetSampleRate = 16000;
        
        if (sourceSampleRate === targetSampleRate) {
            return audioData;
        }
        
        const ratio = sourceSampleRate / targetSampleRate;
        const newLength = Math.round(audioData.length / ratio);
        const result = new Float32Array(newLength);
        
        for (let i = 0; i < newLength; i++) {
            const srcIndex = i * ratio;
            const srcIndexFloor = Math.floor(srcIndex);
            const srcIndexCeil = Math.min(srcIndexFloor + 1, audioData.length - 1);
            const fraction = srcIndex - srcIndexFloor;
            
            result[i] = audioData[srcIndexFloor] * (1 - fraction) + audioData[srcIndexCeil] * fraction;
        }
        
        return result;
    }

    convertToPCM16(audioData) {
        const length = audioData.length;
        const arrayBuffer = new ArrayBuffer(length * 2);
        const dataView = new DataView(arrayBuffer);
        
        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, audioData[i]));
            const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            dataView.setInt16(i * 2, value, true);
        }
        
        return arrayBuffer;
    }

    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    handleRecognitionResult(data) {
        const { text, is_final, full_text } = data;
        
        if (is_final) {
            // 最终结果
            this.finalResult = full_text || text;
            this.partialResult = '';
        } else {
            // 临时结果
            this.partialResult = text;
        }
        
        // 显示实时结果
        const displayText = this.finalResult + (this.partialResult ? ' ' + this.partialResult : '');
        this.updateResultDisplay(displayText, !is_final);
    }

    handleRecognitionStopped(data) {
        const { final_text, duration } = data;
        
        // 清理SenseVoice的特殊标记
        const cleanText = this.cleanSenseVoiceText(final_text);
        
        this.showResult(cleanText, duration);
        this.resetRecording();
    }

    updateResultDisplay(text, isPartial = false) {
        // 显示结果区域
        this.resultSection.classList.remove('hidden');
        this.processingAnimation.classList.add('hidden');
        this.resultContent.classList.remove('hidden');
        
        // 清理并显示文本
        const cleanText = this.cleanSenseVoiceText(text);
        this.resultText.value = cleanText;
        this.textLength.textContent = `${cleanText.length} 字符`;
        
        // 更新状态标识
        if (isPartial) {
            this.statusBadge.textContent = '实时识别中...';
            this.statusBadge.className = 'px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800';
        } else {
            this.statusBadge.textContent = '识别完成';
            this.statusBadge.className = 'px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800';
        }
    }

    showResult(text, duration) {
        this.resultText.value = text;
        this.textLength.textContent = `${text.length} 字符`;
        
        if (duration) {
            document.getElementById('audioDuration').textContent = `识别时长: ${duration.toFixed(1)}秒`;
            document.getElementById('audioDuration').classList.remove('hidden');
        }

        // 隐藏处理动画，显示结果
        this.processingAnimation.classList.add('hidden');
        this.resultContent.classList.remove('hidden');
        
        // 更新状态
        this.statusBadge.textContent = '完成';
        this.statusBadge.className = 'px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800';
    }

    showProcessing() {
        this.resultSection.classList.remove('hidden');
        this.processingAnimation.classList.remove('hidden');
        this.resultContent.classList.add('hidden');
        
        this.statusBadge.textContent = '开始识别...';
        this.statusBadge.className = 'px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800';
    }

    updateStatus(status, text) {
        this.statusText.textContent = text;
        
        switch (status) {
            case 'recording':
                this.recordButton.className = 'relative w-24 h-24 rounded-full border-4 bg-red-500 border-red-600 hover:bg-red-600 recording-animation shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out';
                this.recordIcon.className = 'w-6 h-6 bg-white rounded-sm';
                this.duration.classList.remove('hidden');
                this.languageSelect.disabled = true;
                this.waveformText.textContent = '正在实时识别...';
                break;
                
            case 'stopped':
                this.recordButton.className = 'relative w-24 h-24 rounded-full border-4 bg-gray-400 border-gray-500 cursor-wait shadow-lg';
                this.recordIcon.className = 'w-6 h-6 bg-white rounded-sm';
                this.waveformText.textContent = '处理最终结果';
                break;
                
            default:
                this.recordButton.className = 'relative w-24 h-24 rounded-full border-4 bg-blue-500 border-blue-600 hover:bg-blue-600 active:scale-95 shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out';
                this.recordIcon.className = 'w-0 h-0 border-l-8 border-l-white border-y-6 border-y-transparent ml-1';
                this.duration.classList.add('hidden');
                this.languageSelect.disabled = false;
                this.waveformText.textContent = '点击录制按钮开始实时识别';
        }
    }

    startDurationTimer() {
        this.durationTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            this.duration.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopDurationTimer() {
        if (this.durationTimer) {
            clearInterval(this.durationTimer);
            this.durationTimer = null;
        }
    }

    startWaveformAnimation() {
        const draw = () => {
            if (!this.isRecording) return;

            this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            const barWidth = this.canvas.width / 50;
            const barSpacing = 2;
            const actualBarWidth = barWidth - barSpacing;

            for (let i = 0; i < 50; i++) {
                const barHeight = Math.random() * 60 + 20;
                const x = i * barWidth;
                const y = (this.canvas.height - barHeight) / 2;

                // 创建渐变
                const gradient = this.canvasContext.createLinearGradient(0, 0, 0, this.canvas.height);
                gradient.addColorStop(0, '#3b82f6'); // blue-500
                gradient.addColorStop(1, '#1d4ed8'); // blue-700

                this.canvasContext.fillStyle = gradient;
                this.canvasContext.fillRect(x, y, actualBarWidth, barHeight);
            }

            this.animationFrame = requestAnimationFrame(draw);
        };

        draw();
    }

    stopWaveformAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.clearWaveform();
    }

    clearWaveform() {
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    resetRecording() {
        this.updateStatus('idle', '点击开始实时识别');
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorDisplay.classList.remove('hidden');
    }

    hideError() {
        this.errorDisplay.classList.add('hidden');
    }

    async copyText() {
        try {
            await navigator.clipboard.writeText(this.resultText.value);
            
            // 临时改变按钮样式显示复制成功
            const originalContent = this.copyButton.innerHTML;
            this.copyButton.innerHTML = '<svg class="w-4 h-4 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>已复制!';
            
            setTimeout(() => {
                this.copyButton.innerHTML = originalContent;
            }, 2000);

        } catch (error) {
            console.error('复制失败:', error);
            this.showError('复制到剪贴板失败');
        }
    }

    downloadText() {
        const text = this.resultText.value;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `实时语音转录-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    cleanSenseVoiceText(text) {
        if (!text) return '';
        
        // 移除SenseVoice的特殊标记
        let cleanText = text
            .replace(/<\|Speech\|>/g, '')           // 移除语音开始标记
            .replace(/<\/Speech\|>/g, '')           // 移除语音结束标记  
            .replace(/<\|\/Speech\|>/g, '')         // 移除语音结束标记(另一种格式)
            .replace(/<\|NEUTRAL\|>/g, '')          // 移除中性情感标记
            .replace(/<\|HAPPY\|>/g, '')            // 移除快乐情感标记
            .replace(/<\|SAD\|>/g, '')              // 移除悲伤情感标记
            .replace(/<\|ANGRY\|>/g, '')            // 移除愤怒情感标记
            .replace(/<\|SURPRISE\|>/g, '')         // 移除惊讶情感标记
            .replace(/<\|FEAR\|>/g, '')             // 移除恐惧情感标记
            .replace(/<\|DISGUST\|>/g, '')          // 移除厌恶情感标记
            .replace(/<\|[^>]*\|>/g, '')            // 移除其他未知标记
            .trim();
        
        return cleanText;
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new QwenRealtimeSpeechApp();
});

// 提供全局访问以便调试
window.QwenRealtimeSpeechApp = QwenRealtimeSpeechApp;
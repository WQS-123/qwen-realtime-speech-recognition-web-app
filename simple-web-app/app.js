// Qwen语音识别Web应用 - 核心JavaScript代码

class QwenSpeechApp {
    constructor() {
        this.mediaRecorder = null;
        this.audioStream = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.startTime = 0;
        this.durationTimer = null;
        this.canvas = null;
        this.canvasContext = null;
        this.animationFrame = null;
        
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
    }

    isBrowserSupported() {
        return !!(navigator.mediaDevices && 
                 navigator.mediaDevices.getUserMedia && 
                 window.MediaRecorder);
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

            // 请求麦克风权限
            this.audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000
                }
            });

            // 创建MediaRecorder
            const options = { mimeType: this.getSupportedMimeType() };
            this.mediaRecorder = new MediaRecorder(this.audioStream, options);
            this.audioChunks = [];

            // 设置事件处理程序
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.processAudio();
            };

            this.mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder错误:', event);
                this.showError('录制失败，请重试');
                this.resetRecording();
            };

            // 开始录制
            this.mediaRecorder.start(100);
            this.isRecording = true;
            this.startTime = Date.now();
            
            // 更新UI
            this.updateStatus('recording', '录制中... 点击停止');
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
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // 停止音频流
            if (this.audioStream) {
                this.audioStream.getTracks().forEach(track => track.stop());
                this.audioStream = null;
            }

            // 停止计时器和动画
            this.stopDurationTimer();
            this.stopWaveformAnimation();
            
            // 更新UI
            this.updateStatus('stopped', '录制完成，正在处理...');
        }
    }

    async processAudio() {
        try {
            // 创建音频blob
            const audioBlob = new Blob(this.audioChunks, { 
                type: this.getSupportedMimeType() 
            });

            // 显示结果区域并开始处理动画
            this.showProcessing();

            // 调用语音识别API
            await this.transcribeAudio(audioBlob);

        } catch (error) {
            console.error('处理音频失败:', error);
            this.showError('音频处理失败: ' + error.message);
        } finally {
            this.resetRecording();
        }
    }

    async transcribeAudio(audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('language', this.languageSelect.value);

        try {
            // 调用真实的Qwen语音识别API
            const response = await this.callRealAPI(audioBlob, this.languageSelect.value);
            
            if (response.success) {
                this.showResult(response.text, response.duration);
            } else {
                throw new Error(response.error || '转录失败');
            }

        } catch (error) {
            console.error('转录失败:', error);
            this.showError('语音转录失败: ' + error.message);
        }
    }

    // 调用真实的Qwen语音识别API
    async callRealAPI(audioBlob, language) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('language', language);

        const response = await fetch('http://localhost:5007/api/speech', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    showResult(text, duration) {
        // 清理SenseVoice的特殊标记
        const cleanText = this.cleanSenseVoiceText(text);
        
        this.resultText.value = cleanText;
        this.textLength.textContent = `${cleanText.length} 字符`;
        
        if (duration) {
            document.getElementById('audioDuration').textContent = `音频时长: ${duration}秒`;
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
        
        this.statusBadge.textContent = '处理中...';
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
                this.waveformText.textContent = '正在录制音频...';
                break;
                
            case 'stopped':
                this.recordButton.className = 'relative w-24 h-24 rounded-full border-4 bg-gray-400 border-gray-500 cursor-wait shadow-lg';
                this.recordIcon.className = 'w-6 h-6 bg-white rounded-sm';
                this.waveformText.textContent = '处理录制内容';
                break;
                
            default:
                this.recordButton.className = 'relative w-24 h-24 rounded-full border-4 bg-blue-500 border-blue-600 hover:bg-blue-600 active:scale-95 shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out';
                this.recordIcon.className = 'w-0 h-0 border-l-8 border-l-white border-y-6 border-y-transparent ml-1';
                this.duration.classList.add('hidden');
                this.languageSelect.disabled = false;
                this.waveformText.textContent = '点击录制按钮开始录音';
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
                gradient.addColorStop(0, '#ef4444'); // red-500
                gradient.addColorStop(1, '#dc2626'); // red-600

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
        this.updateStatus('idle', '点击开始录制');
        this.audioChunks = [];
        this.mediaRecorder = null;
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
        a.download = `语音转录-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getSupportedMimeType() {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/wav'
        ];
        
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        
        return 'audio/webm'; // fallback
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
    new QwenSpeechApp();
});

// 提供全局访问以便调试
window.QwenSpeechApp = QwenSpeechApp;
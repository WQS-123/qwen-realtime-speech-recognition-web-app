# 🎤 Qwen实时语音识别应用

基于阿里云DashScope Paraformer-realtime-v2模型的实时语音识别Web应用。

## ✨ 功能特性

- 🔴 **实时语音识别** - 边说边识别，无需等待
- 🌐 **WebSocket通信** - 高效的实时数据传输
- 🎯 **高精度识别** - 使用最新的Paraformer-realtime-v2模型
- 🌍 **多语言支持** - 支持中文、英文、日语等多种语言
- 📱 **响应式设计** - 支持桌面端和移动端
- ⚡ **低延迟** - 毫秒级识别响应

## 🚀 快速开始

### 1. 环境要求

- Python 3.8+
- 现代浏览器（Chrome、Firefox、Safari等）
- 麦克风设备

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置API密钥

创建 `.env` 文件并添加你的DashScope API密钥：

```bash
DASHSCOPE_API_KEY=your_api_key_here
```

### 4. 启动服务

```bash
# 启动API服务器
python api_server.py

# 在另一个终端启动Web服务器
python start_web_server.py
```

### 5. 访问应用

- API服务器: `http://localhost:5008`
- Web应用: `http://localhost:8000`

## ✅ 修复完成的功能

- ✅ **API调用修复**: 从错误的HTTP端点修复为正确的WebSocket API
- ✅ **SDK集成**: 集成官方DashScope SDK，提供更稳定的识别
- ✅ **智能回退**: SDK优先，WebSocket备用的双重保障机制
- ✅ **音频处理**: 完善的音频格式转换和PCM处理
- ✅ **错误处理**: 详细的错误日志和用户友好的错误提示
- ✅ **协议修复**: 正确的WebSocket消息格式和任务流程

## 🔧 技术实现

- **纯前端技术**：HTML5 + JavaScript + CSS3
- **UI框架**：Tailwind CSS (CDN)
- **音频录制**：MediaRecorder API
- **音频可视化**：Canvas API
- **文件下载**：Blob API

## 🤖 模型特性

**使用Paraformer-RealTime-v2模型**：
- ✅ **实时处理**：专为实时语音识别优化
- ✅ **高精度识别**：基于最新的Paraformer架构  
- ✅ **多语言支持**：支持中英日韩等多种语言
- ✅ **WebSocket连接**：低延迟的实时通信
- ✅ **工业级稳定性**：阿里云企业级服务

## 🔧 技术架构

- **前端**：HTML5 + JavaScript + Tailwind CSS
- **后端**：Python Flask + WebSocket
- **AI模型**：Paraformer-RealTime-v2
- **通信协议**：WebSocket实时双工通信
- **音频处理**：Web Audio API

## 🌐 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+  
- ✅ Safari 14+
- ✅ Edge 79+

## 📱 使用方法

1. 允许浏览器访问麦克风权限
2. 选择要识别的语言
3. 点击蓝色录制按钮开始录音
4. 对着麦克风清晰说话
5. 点击红色停止按钮结束录制
6. 查看转录结果并进行复制或下载

## 🔒 隐私安全

- 🛡️ **本地处理**：音频录制在本地完成
- 🚫 **无数据收集**：不会保存或上传任何个人数据
- 🔐 **权限控制**：仅在用户允许时访问麦克风

## 🛠️ 自定义开发

### 修改API调用
编辑`app.js`中的`simulateAPICall`方法，替换为真实的API调用：

```javascript
async transcribeAudio(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('language', this.languageSelect.value);

    const response = await fetch('/api/speech', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    if (result.success) {
        this.showResult(result.text, result.duration);
    } else {
        throw new Error(result.error);
    }
}
```

### 自定义样式
修改`index.html`中的CSS或使用自定义的Tailwind配置。

### 添加新功能
在`QwenSpeechApp`类中添加新的方法和事件处理程序。

## 🐛 故障排除

### 麦克风权限问题
- 检查浏览器地址栏的权限设置
- 确保使用HTTPS或localhost
- 在Chrome中访问：`chrome://settings/content/microphone`

### 录制失败
- 检查设备麦克风是否正常工作
- 尝试刷新页面重新授权
- 查看浏览器控制台错误信息

### 界面显示异常
- 确保网络连接正常（加载Tailwind CSS）
- 检查浏览器是否支持现代JavaScript特性
- 尝试清除浏览器缓存

---

💡 **提示**：这个简单版本非常适合学习Web音频API和快速原型开发！
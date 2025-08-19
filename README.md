# Qwen语音识别Web应用

一个现代化的语音转文字Web应用，使用阿里云通义千问的强大AI语音识别API。基于Next.js、React和Tailwind CSS构建。

## ✨ 功能特性

- 🎤 **实时音频录制** - 直接在浏览器中录制语音
- 🌍 **多语言支持** - 支持中文、英文、日语、韩语、德语、西班牙语、法语、意大利语
- 🎵 **音频波形可视化** - 录制时的实时视觉反馈
- 📝 **文本导出** - 复制到剪贴板或下载为文本文件
- 🎨 **现代化UI** - 响应式设计，支持桌面端和移动端
- 🔐 **安全API集成** - 服务端API调用保护密钥安全
- ⚡ **快速处理** - 基于通义千问音频模型

## 🛠️ 运行要求

- Node.js 18+ 
- npm 或 yarn
- 现代浏览器(Chrome、Firefox、Safari)，支持麦克风功能
- 阿里云DashScope API密钥

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/WQS-123/qwen-speech-recognition-app.git
cd qwen-speech-recognition-app
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动应用

```bash
npm run dev
```

🎉 **应用已启动！** 打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可使用语音识别功能！

## 📱 使用方法

1. **选择语言**: 选择你要识别的语言以提高准确率
2. **开始录制**: 点击蓝色录制按钮开始录音
3. **清晰发声**: 对着麦克风清晰地说话
4. **停止录制**: 录制完成后点击红色停止按钮
5. **获取结果**: 等待AI处理并转换为文字
6. **导出文本**: 复制文字到剪贴板或下载为文件

## 🔧 技术栈

- **框架**: Next.js 15
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **AI服务**: 阿里云通义千问音频模型
- **音频处理**: Web Audio API
- **状态管理**: React Hooks

## 🌏 浏览器兼容性

- Chrome 50+
- Firefox 55+
- Safari 14+
- Edge 79+

**注意**: 麦克风访问需要HTTPS环境（本地开发使用localhost可以）。

## 🛠️ API说明

### POST `/api/speech`
将音频转换为文字

**参数**:
- `audio`: 音频文件 (FormData)
- `language`: 语言代码 (可选，默认: 'auto')

**响应**:
```json
{
  "success": true,
  "text": "转换后的文字内容",
  "duration": 10
}
```

## 🔑 API密钥配置

如果需要使用自己的API密钥，请：

1. 访问 [阿里云DashScope控制台](https://dashscope.console.aliyun.com/)
2. 注册/登录账户并开通服务
3. 创建API密钥
4. 修改 `.env.local` 文件中的 `DASHSCOPE_API_KEY`

## 🐛 常见问题

### 麦克风权限被拒绝
- 确保浏览器允许麦克风权限
- 检查设备麦克风是否正常工作
- 在Chrome中访问chrome://settings/content/microphone检查权限

### API调用失败
- 检查API密钥是否正确
- 确认阿里云账户余额充足
- 检查网络连接是否正常

### 音频录制失败
- 使用支持的浏览器版本
- 确保在HTTPS环境下使用
- 检查浏览器控制台错误信息

## 📄 开源协议

本项目基于 MIT 协议开源 - 详见 LICENSE 文件

## 🤝 贡献

1. Fork 本项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📞 技术支持

如遇问题：
1. 查看浏览器控制台错误信息
2. 检查 [GitHub Issues](https://github.com/WQS-123/qwen-speech-recognition-app/issues)
3. 提交新的Issue详细说明问题

---

⭐ 如果这个项目对你有帮助，请给个星标支持！
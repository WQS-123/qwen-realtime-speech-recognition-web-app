#!/bin/bash

# Vercel 自动部署配置脚本
# 使用此脚本可以一键设置环境变量并部署

echo "🚀 Qwen Speech Recognition App - Vercel 部署助手"
echo "=================================================="
echo ""

# 检查 Vercel CLI 是否安装
if ! command -v vercel &> /dev/null; then
    echo "❌ 未找到 Vercel CLI"
    echo "📦 正在安装 Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI 已就绪"
echo ""

# 提示用户输入API密钥
echo "🔑 请输入你的 DashScope API 密钥："
echo "💡 获取地址：https://dashscope.console.aliyun.com/"
echo "📝 格式示例：sk-1234567890abcdef..."
echo ""
read -p "API Key: " api_key

if [ -z "$api_key" ]; then
    echo "❌ API密钥不能为空！"
    exit 1
fi

# 验证API密钥格式
if [[ ! "$api_key" =~ ^sk- ]]; then
    echo "⚠️  警告：API密钥应该以 'sk-' 开头，请确认输入正确"
fi

echo ""
echo "🛠️  正在配置环境变量..."

# 设置环境变量
vercel env add DASHSCOPE_API_KEY "$api_key" production
vercel env add DASHSCOPE_BASE_URL "https://dashscope-intl.aliyuncs.com/compatible-mode/v1" production

echo "✅ 环境变量配置完成！"
echo ""
echo "🚀 开始部署..."

# 部署项目
vercel --prod

echo ""
echo "🎉 部署完成！"
echo "📱 你的应用现在可以在 Vercel 提供的URL上访问了"
echo ""
echo "📚 需要帮助？查看："
echo "   - 项目文档: README.md"
echo "   - 部署指南: DEPLOYMENT.md"
echo "   - GitHub: https://github.com/WQS-123/qwen-speech-recognition-app"
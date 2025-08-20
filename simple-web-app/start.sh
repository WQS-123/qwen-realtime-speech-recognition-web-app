#!/bin/bash

# 生产环境启动脚本
echo "🚀 启动Qwen实时语音识别应用..."

# 检查环境变量
if [ -z "$DASHSCOPE_API_KEY" ]; then
    echo "❌ 错误: DASHSCOPE_API_KEY环境变量未设置"
    exit 1
fi

# 设置默认端口
export PORT=${PORT:-8080}
export PYTHONUNBUFFERED=1

echo "✅ 环境配置完成"
echo "📡 端口: $PORT"
echo "🔑 API密钥: 已配置"

# 启动应用
exec python api_server.py
# 部署指南 Deployment Guide

## 🚀 快速部署到Vercel (推荐)

### 方法一：一键部署 
点击下面的按钮直接部署：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FWQS-123%2Fqwen-speech-recognition-app)

### 方法二：手动部署

#### 1. 获取阿里云API密钥
- 访问 [DashScope控制台](https://dashscope.console.aliyun.com/)
- 注册/登录阿里云账户
- 开通DashScope服务
- 创建API密钥（格式：`sk-xxxxxxxxxxxxx`）

#### 2. 在Vercel中部署
1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 "New Project" 
3. 导入GitHub仓库：`WQS-123/qwen-speech-recognition-app`
4. 在 **Environment Variables** 中添加：
   ```
   DASHSCOPE_API_KEY = sk-your-actual-api-key-here
   DASHSCOPE_BASE_URL = https://dashscope-intl.aliyuncs.com/compatible-mode/v1
   ```
5. 点击 "Deploy"

#### 3. 部署完成
- 等待2-3分钟部署完成
- 获得你的应用链接：`https://your-app-name.vercel.app`

## 🔑 API密钥获取详细步骤

### 阿里云DashScope API密钥
1. **注册阿里云账户**
   - 访问 [阿里云](https://www.aliyun.com/)
   - 完成实名认证

2. **开通DashScope服务**
   - 访问 [DashScope控制台](https://dashscope.console.aliyun.com/)
   - 开通服务（可能需要充值少量费用用于API调用）

3. **创建API密钥**
   - 在控制台中找到"API密钥管理"
   - 点击"创建API密钥"
   - 复制生成的密钥（格式类似：`sk-1234567890abcdef`）

4. **测试API密钥**
   - 可以使用提供的测试工具验证密钥是否有效

## 💰 费用说明

- **Vercel部署**：免费版足够使用
- **阿里云API调用**：按使用量计费
  - 语音识别大约 ¥0.005/分钟
  - 新用户通常有免费额度

## 🛠️ 本地开发

```bash
# 克隆项目
git clone https://github.com/WQS-123/qwen-speech-recognition-app.git
cd qwen-speech-recognition-app

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 添加你的API密钥

# 启动开发服务器
npm run dev
```

## 🔧 环境变量说明

| 变量名 | 必需 | 说明 | 示例值 |
|--------|------|------|--------|
| `DASHSCOPE_API_KEY` | ✅ | 阿里云DashScope API密钥 | `sk-1234567890abcdef` |
| `DASHSCOPE_BASE_URL` | ❌ | API基础URL（通常无需修改） | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` |

## 🚨 常见问题

### 1. API密钥无效
- 检查密钥格式是否正确（以`sk-`开头）
- 确认已开通DashScope服务
- 检查账户余额是否充足

### 2. 麦克风无权限
- 确保在HTTPS环境下使用
- 浏览器允许麦克风权限
- 检查设备麦克风是否工作

### 3. 部署失败
- 检查环境变量是否正确设置
- 查看Vercel部署日志
- 确认代码没有语法错误

## 📞 技术支持

如果遇到问题：
1. 检查 [GitHub Issues](https://github.com/WQS-123/qwen-speech-recognition-app/issues)
2. 查看浏览器控制台错误信息
3. 提交新的Issue说明问题详情
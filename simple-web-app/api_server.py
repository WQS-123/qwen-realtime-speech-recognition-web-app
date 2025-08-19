#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
基于Paraformer实时语音识别v2的WebSocket API服务器
支持实时音频流处理，避免文件上传问题
"""

import os
import json
import asyncio
import websockets
import threading
import queue
import time
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv
import logging
import dashscope
from dashscope.audio.asr import Recognition, RecognitionCallback, RecognitionResult

# 加载环境变量
load_dotenv()

# 创建Flask应用
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 配置DashScope API
DASHSCOPE_API_KEY = os.getenv('DASHSCOPE_API_KEY')
if not DASHSCOPE_API_KEY:
    logger.error("未找到DASHSCOPE_API_KEY环境变量")
    exit(1)

dashscope.api_key = DASHSCOPE_API_KEY

# 全局变量存储识别会话
recognition_sessions = {}

class RealtimeCallback(RecognitionCallback):
    def __init__(self, session_id):
        self.session_id = session_id
        self.recognition_results = []
        self.partial_result = ""
        self.final_result = ""
        
    def on_open(self) -> None:
        logger.info(f'会话 {self.session_id} 语音识别服务已开启')
        socketio.emit('recognition_opened', {'session_id': self.session_id}, room=self.session_id)

    def on_close(self) -> None:
        logger.info(f'会话 {self.session_id} 语音识别服务已关闭')
        socketio.emit('recognition_closed', {'session_id': self.session_id}, room=self.session_id)

    def on_event(self, result: RecognitionResult) -> None:
        try:
            sentence = result.get_sentence()
            if sentence and sentence.get('text'):
                text = sentence.get('text', '')
                is_final = sentence.get('end_time') is not None
                
                logger.info(f'会话 {self.session_id} 识别结果: {text} (final: {is_final})')
                
                if is_final:
                    # 最终结果
                    self.final_result += text + " "
                    self.recognition_results.append({
                        'text': text,
                        'is_final': True,
                        'timestamp': time.time()
                    })
                    
                    socketio.emit('recognition_result', {
                        'session_id': self.session_id,
                        'text': text,
                        'is_final': True,
                        'full_text': self.final_result.strip()
                    }, room=self.session_id)
                else:
                    # 临时结果
                    self.partial_result = text
                    socketio.emit('recognition_result', {
                        'session_id': self.session_id,
                        'text': text,
                        'is_final': False,
                        'full_text': self.final_result.strip() + " " + text
                    }, room=self.session_id)
                    
        except Exception as e:
            logger.error(f'处理识别结果时出错: {e}')
            socketio.emit('recognition_error', {
                'session_id': self.session_id,
                'error': str(e)
            }, room=self.session_id)

@app.route('/')
def index():
    """返回主页"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    """静态文件服务"""
    return send_from_directory('.', path)

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        'status': 'healthy',
        'service': 'Qwen Real-time Speech Recognition API',
        'version': '8.0.0',
        'model': 'paraformer-realtime-v2',
        'support': 'WebSocket实时流',
        'sessions': len(recognition_sessions)
    })

@socketio.on('connect')
def handle_connect():
    """客户端连接"""
    logger.info(f'客户端已连接: {request.sid}')
    emit('connected', {'session_id': request.sid})

@socketio.on('disconnect')
def handle_disconnect():
    """客户端断开连接"""
    session_id = request.sid
    logger.info(f'客户端已断开连接: {session_id}')
    
    # 停止识别会话
    if session_id in recognition_sessions:
        try:
            recognition_sessions[session_id]['recognition'].stop()
            del recognition_sessions[session_id]
            logger.info(f'已停止会话 {session_id} 的识别服务')
        except Exception as e:
            logger.error(f'停止识别服务时出错: {e}')

@socketio.on('start_recognition')
def handle_start_recognition(data):
    """开始语音识别"""
    session_id = request.sid
    language = data.get('language', 'auto')
    
    logger.info(f'开始为会话 {session_id} 启动语音识别，语言: {language}')
    
    try:
        # 如果已有识别会话，先停止
        if session_id in recognition_sessions:
            recognition_sessions[session_id]['recognition'].stop()
            del recognition_sessions[session_id]
        
        # 创建新的识别回调
        callback = RealtimeCallback(session_id)
        
        # 创建识别器
        recognition = Recognition(
            model='paraformer-realtime-v2',
            format='pcm',
            sample_rate=16000,
            callback=callback
        )
        
        # 启动识别
        recognition.start()
        
        # 存储识别会话
        recognition_sessions[session_id] = {
            'recognition': recognition,
            'callback': callback,
            'language': language,
            'start_time': time.time()
        }
        
        # 将客户端加入房间
        from flask_socketio import join_room
        join_room(session_id)
        
        emit('recognition_started', {
            'session_id': session_id,
            'language': language,
            'model': 'paraformer-realtime-v2'
        })
        
        logger.info(f'会话 {session_id} 语音识别已启动')
        
    except Exception as e:
        logger.error(f'启动语音识别失败: {e}')
        emit('recognition_error', {
            'session_id': session_id,
            'error': f'启动识别失败: {str(e)}'
        })

@socketio.on('stop_recognition')
def handle_stop_recognition():
    """停止语音识别"""
    session_id = request.sid
    
    logger.info(f'停止会话 {session_id} 的语音识别')
    
    if session_id in recognition_sessions:
        try:
            session = recognition_sessions[session_id]
            recognition = session['recognition']
            callback = session['callback']
            
            # 停止识别
            recognition.stop()
            
            # 发送最终结果
            final_text = callback.final_result.strip()
            emit('recognition_stopped', {
                'session_id': session_id,
                'final_text': final_text,
                'duration': time.time() - session['start_time']
            })
            
            # 清理会话
            del recognition_sessions[session_id]
            
            logger.info(f'会话 {session_id} 语音识别已停止，最终结果: {final_text}')
            
        except Exception as e:
            logger.error(f'停止语音识别时出错: {e}')
            emit('recognition_error', {
                'session_id': session_id,
                'error': f'停止识别失败: {str(e)}'
            })
    else:
        emit('recognition_error', {
            'session_id': session_id,
            'error': '没有找到活跃的识别会话'
        })

@socketio.on('audio_data')
def handle_audio_data(data):
    """处理音频数据"""
    session_id = request.sid
    
    if session_id in recognition_sessions:
        try:
            recognition = recognition_sessions[session_id]['recognition']
            
            # 音频数据是base64编码的
            import base64
            audio_bytes = base64.b64decode(data['audio'])
            
            # 发送音频帧到识别服务
            recognition.send_audio_frame(audio_bytes)
            
        except Exception as e:
            logger.error(f'处理音频数据时出错: {e}')
            emit('recognition_error', {
                'session_id': session_id,
                'error': f'音频处理失败: {str(e)}'
            })
    else:
        emit('recognition_error', {
            'session_id': session_id,
            'error': '没有活跃的识别会话，请先开始识别'
        })

@app.errorhandler(413)
def too_large(e):
    return jsonify({
        'success': False,
        'error': '上传的数据过大'
    }), 413

@app.errorhandler(404)
def not_found(e):
    return jsonify({
        'success': False,
        'error': '请求的资源不存在'
    }), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({
        'success': False,
        'error': '服务器内部错误'
    }), 500

if __name__ == '__main__':
    print("🎤 Qwen实时语音识别API服务器启动中...")
    print(f"📡 API密钥配置: {'✅ 已配置' if DASHSCOPE_API_KEY else '❌ 未配置'}")
    print("🔧 使用paraformer-realtime-v2模型")
    print("🌐 支持WebSocket实时音频流")
    print("⚡ 真正的实时识别，无需文件上传")
    print(f"🚀 服务器将在 http://localhost:5008 启动")
    print("📝 WebSocket端点: /socket.io/")
    print("🏥 健康检查: GET /api/health")
    print("-" * 50)
    
    socketio.run(
        app,
        host='0.0.0.0',
        port=5008,
        debug=True,
        allow_unsafe_werkzeug=True
    )
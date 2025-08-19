#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
简单的Web服务器，提供静态文件服务
"""

import os
from flask import Flask, send_from_directory

app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    print("🌐 启动Web文件服务器...")
    print("📂 访问地址: http://localhost:8000")
    print("📄 主页: http://localhost:8000/index.html")
    print("-" * 50)
    
    app.run(
        host='0.0.0.0',
        port=8001,
        debug=False
    )
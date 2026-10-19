#!/bin/bash
# LingoVerse 一键启动脚本
# 用法：./start.sh

cd "$(dirname "$0")"

echo "============================================"
echo "  🌍 LingoVerse - 多语种学习平台"
echo "============================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装：https://nodejs.org"
    exit 1
fi

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
fi

# 获取本机 IP 用于局域网访问
MY_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
PORT=3000

echo ""
echo "✅ 启动成功！"
echo ""
echo "📱 本机访问：http://localhost:${PORT}"
if [ "$MY_IP" != "localhost" ]; then
    echo "📱 手机访问（同WiFi）：http://${MY_IP}:${PORT}"
fi
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

node server/index.js

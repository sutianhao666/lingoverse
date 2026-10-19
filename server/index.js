const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
require('./seed'); // 初始化种子数据

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/community', require('./routes/community'));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🌍 多语种学习平台已启动: http://localhost:${PORT}\n`);
});

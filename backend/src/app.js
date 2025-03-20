const express = require('express');
const cors = require('cors');
const app = express();

// 配置CORS
app.use(cors({
  origin: 'http://localhost:3000', // 允许前端域名
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 解析JSON请求体
app.use(express.json());

// 路由配置
app.use('/api/users', require('./routes/users'));
app.use('/api/points', require('./routes/points'));
app.use('/api/point-rules', require('./routes/point-rules'));

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ message: '服务器内部错误' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());

// 导入路由
const activitiesRouter = require('./routes/activities');
const registrationsRouter = require('./routes/registrations');
const usersRouter = require('./routes/users');
const pointRulesRouter = require('./routes/point-rules');
const pointsRouter = require('./routes/points');

// 注册路由
app.use('/api/activities', activitiesRouter);
app.use('/api/registrations', registrationsRouter);
app.use('/api/users', usersRouter);
app.use('/api/point-rules', pointRulesRouter);
app.use('/api/points', pointsRouter);

// 路由配置
app.get('/', (req, res) => {
  res.json({ message: '欢迎使用校内社团活动积分系统API' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误' });
});

// 启动服务器
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
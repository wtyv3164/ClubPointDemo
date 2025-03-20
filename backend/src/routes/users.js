const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // 验证必填字段
    if (!username || !password || !email) {
      return res.status(400).json({ message: '用户名、密码和邮箱为必填项' });
    }
    
    // 检查用户名或邮箱是否已存在
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: '用户名或邮箱已存在' });
    }
    
    // 创建新用户
    const [result] = await pool.query(
      'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
      [username, password, email, 'user']
    );
    
    res.status(201).json({ 
      message: '用户注册成功',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码为必填项' });
    }
    
    // 查询用户
    const [users] = await pool.query(
      'SELECT id, username, email, role, total_points FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    const user = users[0];
    
    // 登录成功
    res.status(200).json({
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        totalPoints: user.total_points
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取用户信息
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const [users] = await pool.query(
      'SELECT id, username, email, role, total_points, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    const user = users[0];
    
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      totalPoints: user.total_points,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取所有用户列表
router.get('/', async (req, res) => {
  try {
    // 可选的查询参数
    const { limit = 100, offset = 0, search = '' } = req.query;
    
    let query = `
      SELECT id, username, email, role, total_points, created_at
      FROM users
    `;
    
    const queryParams = [];
    
    // 添加搜索条件
    if (search) {
      query += ` WHERE username LIKE ? OR email LIKE ? `;
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    // 添加排序和分页
    query += ` ORDER BY username ASC LIMIT ? OFFSET ? `;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [users] = await pool.query(query, queryParams);
    
    res.status(200).json(users);
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router; 
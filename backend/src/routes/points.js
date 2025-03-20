const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// 中间件：检查用户是否为管理员 - 修改为检查操作者而非被操作用户
const checkAdmin = async (req, res, next) => {
  try {
    // 使用operatorId而不是userId来检查权限
    const operatorId = req.body.operatorId; 
    
    if (!operatorId) {
      return res.status(401).json({ message: '未授权，请先登录' });
    }
    
    const [users] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [operatorId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: '操作者不存在' });
    }
    
    if (users[0].role !== 'admin') {
      return res.status(403).json({ message: '权限不足，仅管理员可执行此操作' });
    }
    
    next();
  } catch (error) {
    console.error('权限检查错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 手动发放积分（需要管理员权限）
router.post('/award', checkAdmin, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { 
      userId, 
      points, 
      ruleId,
      description,
      referenceId,
      referenceType,
      operatorId
    } = req.body;
    
    // 验证必填字段
    if (!userId || !points || !ruleId) {
      return res.status(400).json({ message: '用户ID、积分值和规则ID为必填项' });
    }
    
    // 获取规则详情
    const [rules] = await connection.query(
      'SELECT * FROM point_rules WHERE id = ?',
      [ruleId]
    );
    
    if (rules.length === 0) {
      return res.status(404).json({ message: '积分规则不存在' });
    }
    
    const rule = rules[0];
    
    // 检查规则是否激活
    if (!rule.is_active) {
      await connection.rollback();
      return res.status(400).json({ message: '积分规则未激活，无法使用' });
    }
    
    // 计算积分过期时间
    let expireAt = null;
    if (rule.validity_days) {
      expireAt = new Date();
      expireAt.setDate(expireAt.getDate() + rule.validity_days);
      expireAt = expireAt.toISOString().slice(0, 19).replace('T', ' ');
    }
    
    // 记录积分交易
    await connection.query(
      `INSERT INTO point_transactions 
       (user_id, rule_id, points, transaction_type, reference_id, reference_type, description, operator_id, expire_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, 
        ruleId, 
        points, 
        rule.rule_type, 
        referenceId || null, 
        referenceType || null, 
        description || `管理员手动${rule.rule_type === 'earn' ? '发放' : '扣除'}积分`, 
        operatorId, 
        expireAt
      ]
    );
    
    // 更新用户总积分
    if (rule.rule_type === 'earn') {
      await connection.query(
        'UPDATE users SET total_points = total_points + ? WHERE id = ?',
        [points, userId]
      );
    } else {
      // 检查用户积分是否足够
      const [users] = await connection.query(
        'SELECT total_points FROM users WHERE id = ?',
        [userId]
      );
      
      if (users.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: '用户不存在' });
      }
      
      if (users[0].total_points < points) {
        await connection.rollback();
        return res.status(400).json({ message: '用户积分不足' });
      }
      
      await connection.query(
        'UPDATE users SET total_points = total_points - ? WHERE id = ?',
        [points, userId]
      );
    }
    
    await connection.commit();
    
    res.status(201).json({ 
      message: rule.rule_type === 'earn' ? '积分发放成功' : '积分扣除成功'
    });
  } catch (error) {
    await connection.rollback();
    console.error('积分操作错误:', error);
    res.status(500).json({ message: '服务器错误' });
  } finally {
    connection.release();
  }
});

// 获取用户的积分交易记录
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { startDate, endDate, transactionType } = req.query;
    
    let query = `
      SELECT pt.*, pr.rule_name, pr.action_type, u.username as operator_name
      FROM point_transactions pt
      JOIN point_rules pr ON pt.rule_id = pr.id
      LEFT JOIN users u ON pt.operator_id = u.id
      WHERE pt.user_id = ?
    `;
    
    const queryParams = [userId];
    
    // 添加筛选条件
    if (startDate) {
      query += ' AND pt.created_at >= ?';
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ' AND pt.created_at <= ?';
      queryParams.push(endDate);
    }
    
    if (transactionType) {
      query += ' AND pt.transaction_type = ?';
      queryParams.push(transactionType);
    }
    
    query += ' ORDER BY pt.created_at DESC';
    
    const [transactions] = await pool.query(query, queryParams);
    
    res.status(200).json(transactions);
  } catch (error) {
    console.error('获取积分记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取积分排行榜
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const [leaderboard] = await pool.query(
      `SELECT id, username, total_points
       FROM users
       ORDER BY total_points DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );
    
    // 获取总用户数
    const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM users');
    const total = totalResult[0].total;
    
    res.status(200).json({
      leaderboard,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('获取积分排行榜错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取积分统计数据
router.get('/stats', async (req, res) => {
  try {
    const { userId, period = 'month' } = req.query;
    
    // 验证必填字段
    if (!userId) {
      return res.status(400).json({ message: '用户ID为必填项' });
    }
    
    let timeFormat;
    let groupBy;
    
    // 根据周期设置不同的时间格式和分组条件
    switch (period) {
      case 'day':
        timeFormat = '%Y-%m-%d';
        groupBy = 'DAY(created_at)';
        break;
      case 'week':
        timeFormat = '%x-W%v'; // ISO 周格式 YYYY-WNN
        groupBy = 'YEARWEEK(created_at)';
        break;
      case 'month':
      default:
        timeFormat = '%Y-%m';
        groupBy = 'MONTH(created_at), YEAR(created_at)';
        break;
    }
    
    // 获取积分统计数据
    const [earnStats] = await pool.query(
      `SELECT 
         DATE_FORMAT(created_at, ?) as time_period,
         SUM(points) as total_points,
         COUNT(*) as transaction_count
       FROM point_transactions
       WHERE user_id = ? AND transaction_type = 'earn'
       GROUP BY ${groupBy}
       ORDER BY MIN(created_at)`,
      [timeFormat, userId]
    );
    
    const [consumeStats] = await pool.query(
      `SELECT 
         DATE_FORMAT(created_at, ?) as time_period,
         SUM(points) as total_points,
         COUNT(*) as transaction_count
       FROM point_transactions
       WHERE user_id = ? AND transaction_type = 'consume'
       GROUP BY ${groupBy}
       ORDER BY MIN(created_at)`,
      [timeFormat, userId]
    );
    
    res.status(200).json({
      earnStats,
      consumeStats,
      period
    });
  } catch (error) {
    console.error('获取积分统计数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router; 
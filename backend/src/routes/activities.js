const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// 中间件：检查用户是否为管理员
const checkAdmin = async (req, res, next) => {
  try {
    const userId = req.body.userId || req.query.userId;
    
    if (!userId) {
      return res.status(401).json({ message: '未授权，请先登录' });
    }
    
    const [users] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
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

// 创建活动（需要管理员权限）
router.post('/', checkAdmin, async (req, res) => {
  try {
    const { title, description, start_time, end_time, location, max_participants, club_id } = req.body;
    
    // 将ISO格式的日期时间字符串转换为MySQL兼容格式
    const formatDateTime = (dateTimeStr) => {
      return new Date(dateTimeStr).toISOString().slice(0, 19).replace('T', ' ');
    };

    const formattedStartTime = formatDateTime(start_time);
    const formattedEndTime = formatDateTime(end_time);

    const [result] = await pool.execute(
      'INSERT INTO activities (title, description, start_time, end_time, location, max_participants, club_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, formattedStartTime, formattedEndTime, location, max_participants, club_id, 'draft']
    );
    res.status(201).json({ id: result.insertId, message: '活动创建成功' });
  } catch (error) {
    console.error('创建活动失败:', error);
    res.status(500).json({ message: '创建活动失败' });
  }
});

// 获取活动列表
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    let activities;
    
    if (userId) {
      // 检查用户角色
      const [users] = await pool.query('SELECT role FROM users WHERE id = ?', [userId]);
      const isAdmin = users.length > 0 && users[0].role === 'admin';
      
      if (isAdmin) {
        // 管理员可以看到所有活动
        [activities] = await pool.execute('SELECT * FROM activities ORDER BY created_at DESC');
      } else {
        // 普通用户只能看到已发布的活动
        [activities] = await pool.execute(
          'SELECT * FROM activities WHERE status = "published" ORDER BY created_at DESC'
        );
      }
    } else {
      // 未登录用户只能看到已发布的活动
      [activities] = await pool.execute(
        'SELECT * FROM activities WHERE status = "published" ORDER BY created_at DESC'
      );
    }
    
    res.json(activities);
  } catch (error) {
    console.error('获取活动列表失败:', error);
    res.status(500).json({ message: '获取活动列表失败' });
  }
});

// 获取单个活动详情
router.get('/:id', async (req, res) => {
  try {
    const [activities] = await pool.execute('SELECT * FROM activities WHERE id = ?', [req.params.id]);
    if (activities.length === 0) {
      return res.status(404).json({ message: '活动不存在' });
    }
    res.json(activities[0]);
  } catch (error) {
    console.error('获取活动详情失败:', error);
    res.status(500).json({ message: '获取活动详情失败' });
  }
});

// 更新活动状态（发布/取消），仅管理员可操作
router.patch('/:id/status', checkAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    // 验证状态值
    const validStatuses = ['draft', 'published', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: '无效的状态值' });
    }
    
    await pool.execute('UPDATE activities SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: '活动状态更新成功' });
  } catch (error) {
    console.error('更新活动状态失败:', error);
    res.status(500).json({ message: '更新活动状态失败' });
  }
});

// 完成活动并发放积分
router.post('/:id/complete', checkAdmin, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const activityId = req.params.id;
    
    // 更新活动状态为已完成
    await connection.execute(
      'UPDATE activities SET status = ? WHERE id = ?', 
      ['completed', activityId]
    );
    
    // 获取所有签到且签退的参与者
    const [participants] = await connection.execute(
      `SELECT user_id FROM registrations 
       WHERE activity_id = ? AND status = 'approved' 
       AND check_in_time IS NOT NULL AND check_out_time IS NOT NULL`,
      [activityId]
    );
    
    // 获取活动参与的积分规则
    const [rules] = await connection.execute(
      `SELECT * FROM point_rules 
       WHERE action_type = 'activity_participation' AND is_active = TRUE 
       ORDER BY created_at DESC LIMIT 1`
    );
    
    if (rules.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: '未找到活动参与的积分规则' });
    }
    
    const rule = rules[0];
    const pointsToAward = rule.points;
    
    // 为每个参与者发放积分
    for (const participant of participants) {
      const userId = participant.user_id;
      
      // 计算积分过期时间
      let expireAt = null;
      if (rule.validity_days) {
        expireAt = new Date();
        expireAt.setDate(expireAt.getDate() + rule.validity_days);
        expireAt = expireAt.toISOString().slice(0, 19).replace('T', ' ');
      }
      
      // 记录积分交易
      await connection.execute(
        `INSERT INTO point_transactions 
         (user_id, rule_id, points, transaction_type, reference_id, reference_type, description, operator_id, expire_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, 
          rule.id, 
          pointsToAward, 
          'earn', 
          activityId, 
          'activity', 
          `参与活动"${activityId}"获得积分`, 
          req.body.userId, 
          expireAt
        ]
      );
      
      // 更新用户总积分
      await connection.execute(
        'UPDATE users SET total_points = total_points + ? WHERE id = ?',
        [pointsToAward, userId]
      );
    }
    
    await connection.commit();
    
    res.json({ 
      message: '活动已完成，积分已发放', 
      participantsCount: participants.length,
      pointsAwarded: participants.length * pointsToAward
    });
  } catch (error) {
    await connection.rollback();
    console.error('完成活动并发放积分失败:', error);
    res.status(500).json({ message: '服务器错误' });
  } finally {
    connection.release();
  }
});

module.exports = router;
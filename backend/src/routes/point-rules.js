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

// 创建积分规则（需要管理员权限）
router.post('/', checkAdmin, async (req, res) => {
  try {
    const { 
      rule_name, 
      rule_type, 
      action_type, 
      points, 
      exchange_ratio, 
      validity_days, 
      description, 
      is_active,
      userId // 创建人ID
    } = req.body;
    
    // 验证必填字段
    if (!rule_name || !rule_type || !action_type || !points) {
      return res.status(400).json({ message: '规则名称、类型、行为类型和积分值为必填项' });
    }
    
    const [result] = await pool.query(
      `INSERT INTO point_rules 
       (rule_name, rule_type, action_type, points, exchange_ratio, validity_days, description, is_active, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [rule_name, rule_type, action_type, points, exchange_ratio, validity_days, description, is_active || true, userId]
    );
    
    res.status(201).json({ 
      message: '积分规则创建成功',
      ruleId: result.insertId 
    });
  } catch (error) {
    console.error('创建积分规则错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取所有积分规则
router.get('/', async (req, res) => {
  try {
    const [rules] = await pool.query(
      `SELECT pr.*, u.username as created_by_name 
       FROM point_rules pr
       JOIN users u ON pr.created_by = u.id
       ORDER BY pr.created_at DESC`
    );
    
    res.status(200).json(rules);
  } catch (error) {
    console.error('获取积分规则错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个积分规则详情
router.get('/:id', async (req, res) => {
  try {
    const [rules] = await pool.query(
      `SELECT pr.*, u.username as created_by_name 
       FROM point_rules pr
       JOIN users u ON pr.created_by = u.id
       WHERE pr.id = ?`,
      [req.params.id]
    );
    
    if (rules.length === 0) {
      return res.status(404).json({ message: '积分规则不存在' });
    }
    
    res.status(200).json(rules[0]);
  } catch (error) {
    console.error('获取积分规则详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新积分规则（需要管理员权限）
router.put('/:id', checkAdmin, async (req, res) => {
  try {
    const { 
      rule_name, 
      rule_type, 
      action_type, 
      points, 
      exchange_ratio, 
      validity_days, 
      description, 
      is_active
    } = req.body;
    
    // 验证必填字段
    if (!rule_name || !rule_type || !action_type || !points) {
      return res.status(400).json({ message: '规则名称、类型、行为类型和积分值为必填项' });
    }
    
    await pool.query(
      `UPDATE point_rules 
       SET rule_name = ?, rule_type = ?, action_type = ?, points = ?, 
           exchange_ratio = ?, validity_days = ?, description = ?, is_active = ?
       WHERE id = ?`,
      [
        rule_name, rule_type, action_type, points, 
        exchange_ratio, validity_days, description, is_active || true,
        req.params.id
      ]
    );
    
    res.status(200).json({ message: '积分规则更新成功' });
  } catch (error) {
    console.error('更新积分规则错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 启用/禁用积分规则（需要管理员权限）
router.patch('/:id/toggle-status', checkAdmin, async (req, res) => {
  try {
    const { is_active } = req.body;
    
    if (is_active === undefined) {
      return res.status(400).json({ message: '状态值为必填项' });
    }
    
    await pool.query(
      'UPDATE point_rules SET is_active = ? WHERE id = ?',
      [is_active, req.params.id]
    );
    
    res.status(200).json({ 
      message: is_active ? '积分规则已启用' : '积分规则已禁用' 
    });
  } catch (error) {
    console.error('更新积分规则状态错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router; 
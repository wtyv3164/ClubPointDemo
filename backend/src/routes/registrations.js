const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// 报名活动
router.post('/', async (req, res) => {
  try {
    const { activity_id, user_id } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO registrations (activity_id, user_id) VALUES (?, ?)',
      [activity_id, user_id]
    );
    res.status(201).json({ id: result.insertId, message: '活动报名成功' });
  } catch (error) {
    console.error('活动报名失败:', error);
    res.status(500).json({ message: '活动报名失败' });
  }
});

// 获取活动的报名列表
router.get('/activity/:activityId', async (req, res) => {
  try {
    const [registrations] = await pool.execute(
      'SELECT r.*, u.name as user_name FROM registrations r LEFT JOIN users u ON r.user_id = u.id WHERE r.activity_id = ?',
      [req.params.activityId]
    );
    res.json(registrations);
  } catch (error) {
    console.error('获取报名列表失败:', error);
    res.status(500).json({ message: '获取报名列表失败' });
  }
});

// 更新报名状态（审核通过/拒绝）
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.execute(
      'UPDATE registrations SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    res.json({ message: '报名状态更新成功' });
  } catch (error) {
    console.error('更新报名状态失败:', error);
    res.status(500).json({ message: '更新报名状态失败' });
  }
});

// 签到
router.post('/:id/check-in', async (req, res) => {
  try {
    await pool.execute(
      'UPDATE registrations SET check_in_time = CURRENT_TIMESTAMP WHERE id = ? AND status = "approved"',
      [req.params.id]
    );
    res.json({ message: '签到成功' });
  } catch (error) {
    console.error('签到失败:', error);
    res.status(500).json({ message: '签到失败' });
  }
});

// 签退
router.post('/:id/check-out', async (req, res) => {
  try {
    await pool.execute(
      'UPDATE registrations SET check_out_time = CURRENT_TIMESTAMP WHERE id = ? AND check_in_time IS NOT NULL',
      [req.params.id]
    );
    res.json({ message: '签退成功' });
  } catch (error) {
    console.error('签退失败:', error);
    res.status(500).json({ message: '签退失败' });
  }
});

module.exports = router;
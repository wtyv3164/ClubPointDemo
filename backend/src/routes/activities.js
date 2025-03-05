const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// 创建活动
router.post('/', async (req, res) => {
  try {
    const { title, description, start_time, end_time, location, max_participants, club_id } = req.body;
    
    // 将ISO格式的日期时间字符串转换为MySQL兼容格式
    const formatDateTime = (dateTimeStr) => {
      return new Date(dateTimeStr).toISOString().slice(0, 19).replace('T', ' ');
    };

    const formattedStartTime = formatDateTime(start_time);
    const formattedEndTime = formatDateTime(end_time);

    const [result] = await pool.execute(
      'INSERT INTO activities (title, description, start_time, end_time, location, max_participants, club_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, formattedStartTime, formattedEndTime, location, max_participants, club_id]
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
    const [activities] = await pool.execute('SELECT * FROM activities ORDER BY created_at DESC');
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

// 更新活动状态（发布/取消）
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.execute('UPDATE activities SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: '活动状态更新成功' });
  } catch (error) {
    console.error('更新活动状态失败:', error);
    res.status(500).json({ message: '更新活动状态失败' });
  }
});

module.exports = router;
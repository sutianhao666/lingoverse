const express = require('express');
const db = require('../database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 获取成就列表
router.get('/', auth, (req, res) => {
  const achievements = db.prepare('SELECT * FROM achievements').all();
  const userAch = db.prepare('SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = ?').all(req.user.id);
  const unlockedIds = new Set(userAch.map(a => a.achievement_id));

  const result = achievements.map(a => ({
    ...a,
    unlocked: unlockedIds.has(a.id),
    unlocked_at: userAch.find(u => u.achievement_id === a.id)?.unlocked_at
  }));
  res.json(result);
});

module.exports = router;

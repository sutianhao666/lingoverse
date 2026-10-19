const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database');
const { sign, auth } = require('../middleware/auth');

const router = express.Router();

// 注册
router.post('/register', (req, res) => {
  const { username, email, password, nickname } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: '请填写完整信息' });
  if (password.length < 6) return res.status(400).json({ error: '密码至少6位' });

  const exists = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (exists) return res.status(400).json({ error: '用户名或邮箱已存在' });

  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (username, email, password, nickname) VALUES (?,?,?,?)')
    .run(username, email, hash, nickname || username);

  const user = db.prepare('SELECT id, username, email, nickname, avatar, bio, target_language, level, exp, streak FROM users WHERE id = ?').get(info.lastInsertRowid);
  const token = sign({ id: user.id, username: user.username });
  res.json({ token, user });
});

// 登录
router.post('/login', (req, res) => {
  const { account, password } = req.body;
  if (!account || !password) return res.status(400).json({ error: '请填写账号和密码' });

  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(account, account);
  if (!user) return res.status(400).json({ error: '账号不存在' });

  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) return res.status(400).json({ error: '密码错误' });

  // 更新活跃时间
  const today = new Date().toISOString().split('T')[0];
  if (user.last_active !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak = user.last_active === yesterday ? (user.streak || 0) + 1 : 1;
    db.prepare('UPDATE users SET last_active = ?, streak = ? WHERE id = ?').run(today, newStreak, user.id);
    user.streak = newStreak;
  }

  const safeUser = { ...user };
  delete safeUser.password;
  const token = sign({ id: user.id, username: user.username });
  res.json({ token, user: safeUser });
});

// 获取个人信息
router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, username, email, nickname, avatar, bio, target_language, level, exp, streak, last_active, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// 更新个人信息
router.put('/me', auth, (req, res) => {
  const { nickname, bio, avatar, target_language } = req.body;
  db.prepare('UPDATE users SET nickname = COALESCE(?, nickname), bio = COALESCE(?, bio), avatar = COALESCE(?, avatar), target_language = COALESCE(?, target_language) WHERE id = ?')
    .run(nickname, bio, avatar, target_language, req.user.id);
  const user = db.prepare('SELECT id, username, email, nickname, avatar, bio, target_language, level, exp, streak FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// 更新经验值
router.post('/add-exp', auth, (req, res) => {
  const { exp } = req.body;
  if (!exp || exp < 0) return res.status(400).json({ error: '无效的经验值' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  let newExp = user.exp + exp;
  let newLevel = user.level;
  const levels = db.prepare('SELECT * FROM levels ORDER BY exp_required DESC').all();
  for (const lv of levels) {
    if (newExp >= lv.exp_required) {
      newLevel = lv.id;
      break;
    }
  }
  db.prepare('UPDATE users SET exp = ?, level = ? WHERE id = ?').run(newExp, newLevel, req.user.id);

  // 检查成就
  checkAchievements(req.user.id);

  res.json({ exp: newExp, level: newLevel });
});

function checkAchievements(userId) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const records = db.prepare('SELECT * FROM study_records WHERE user_id = ?').all(userId);
  const posts = db.prepare('SELECT COUNT(*) as cnt FROM posts WHERE user_id = ?').get(userId);
  const langs = db.prepare('SELECT COUNT(DISTINCT language_id) as cnt FROM progress WHERE user_id = ?').get(userId);

  const achievements = db.prepare('SELECT * FROM achievements').all();
  const unlocked = db.prepare('SELECT achievement_id FROM user_achievements WHERE user_id = ?').all(userId);
  const unlockedSet = new Set(unlocked.map(u => u.achievement_id));

  const counts = {
    lessons: records.filter(r => r.total_count > 0).length,
    words: records.filter(r => r.module === 'word').reduce((s, r) => s + r.total_count, 0),
    grammar: records.filter(r => r.module === 'grammar').reduce((s, r) => s + r.total_count, 0),
    streak: user.streak,
    posts: posts.cnt,
    languages: langs.cnt || 1
  };

  for (const ach of achievements) {
    if (!unlockedSet.has(ach.id) && counts[ach.condition_type] >= ach.condition_value) {
      db.prepare('INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?,?)').run(userId, ach.id);
      db.prepare('UPDATE users SET exp = exp + ? WHERE id = ?').run(ach.exp_reward, userId);
    }
  }
}

module.exports = router;

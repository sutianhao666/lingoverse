const express = require('express');
const db = require('../database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 获取用户所有语言的进度
router.get('/', auth, (req, res) => {
  const progress = db.prepare(`
    SELECT p.*, l.name, l.name_cn, l.flag
    FROM progress p JOIN languages l ON p.language_id = l.id
    WHERE p.user_id = ?
  `).all(req.user.id);
  res.json(progress);
});

// 获取学习统计
router.get('/stats/overview', auth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const totalRecords = db.prepare('SELECT COUNT(*) as cnt, SUM(exp_earned) as exp FROM study_records WHERE user_id = ?').get(req.user.id);
  const totalWords = db.prepare('SELECT COUNT(*) as cnt FROM study_records WHERE user_id = ? AND module = ?').get(req.user.id, 'word');
  const totalGrammar = db.prepare('SELECT COUNT(*) as cnt FROM study_records WHERE user_id = ? AND module = ?').get(req.user.id, 'grammar');

  const weekRecords = db.prepare(`
    SELECT DATE(studied_at) as day, COUNT(*) as cnt
    FROM study_records
    WHERE user_id = ? AND studied_at >= date('now', '-7 days')
    GROUP BY DATE(studied_at)
  `).all(req.user.id);

  res.json({
    exp: user.exp,
    level: user.level,
    streak: user.streak,
    total_sessions: totalRecords.cnt,
    total_exp_earned: totalRecords.exp || 0,
    word_sessions: totalWords.cnt,
    grammar_sessions: totalGrammar.cnt,
    weekRecords: weekRecords
  });
});

// 个性化推荐
router.get('/recommend', auth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const targetLang = user.target_language || 'en';
  const progress = db.prepare('SELECT * FROM progress WHERE user_id = ? AND language_id = ?').get(req.user.id, targetLang);

  const currentLevel = progress?.current_level || 1;

  const recWords = db.prepare('SELECT * FROM words WHERE language_id = ? AND level_id = ? ORDER BY RANDOM() LIMIT 10')
    .all(targetLang, currentLevel);

  const recGrammar = db.prepare('SELECT * FROM grammar WHERE language_id = ? AND level_id <= ? ORDER BY level_id, id LIMIT 5')
    .all(targetLang, currentLevel);

  const recListening = db.prepare('SELECT * FROM listening WHERE language_id = ? AND level_id <= ? ORDER BY level_id, id LIMIT 3')
    .all(targetLang, currentLevel);

  const hotLangs = db.prepare('SELECT * FROM languages ORDER BY RANDOM() LIMIT 3').all();

  res.json({
    target_language: targetLang,
    current_level: currentLevel,
    recommendations: {
      words: recWords,
      grammar: recGrammar,
      listening: recListening
    },
    discover: hotLangs
  });
});

// 获取/创建某个语言的进度
router.get('/:langId', auth, (req, res) => {
  // 验证语言存在
  const lang = db.prepare('SELECT id FROM languages WHERE id = ?').get(req.params.langId);
  if (!lang) return res.status(404).json({ error: '语言不存在' });

  let p = db.prepare('SELECT * FROM progress WHERE user_id = ? AND language_id = ?').get(req.user.id, req.params.langId);
  if (!p) {
    db.prepare('INSERT INTO progress (user_id, language_id) VALUES (?, ?)').run(req.user.id, req.params.langId);
    p = db.prepare('SELECT * FROM progress WHERE user_id = ? AND language_id = ?').get(req.user.id, req.params.langId);
  }
  res.json(p);
});

// 更新进度
router.put('/:langId', auth, (req, res) => {
  const { current_level, current_unit, completed_unit } = req.body;
  const lang = db.prepare('SELECT id FROM languages WHERE id = ?').get(req.params.langId);
  if (!lang) return res.status(404).json({ error: '语言不存在' });

  let p = db.prepare('SELECT * FROM progress WHERE user_id = ? AND language_id = ?').get(req.user.id, req.params.langId);
  if (!p) {
    db.prepare('INSERT INTO progress (user_id, language_id) VALUES (?, ?)').run(req.user.id, req.params.langId);
    p = db.prepare('SELECT * FROM progress WHERE user_id = ? AND language_id = ?').get(req.user.id, req.params.langId);
  }

  let completedUnits = JSON.parse(p.completed_units || '[]');
  if (completed_unit && !completedUnits.includes(completed_unit)) {
    completedUnits.push(completed_unit);
  }

  db.prepare(`UPDATE progress SET
    current_level = COALESCE(?, current_level),
    current_unit = COALESCE(?, current_unit),
    completed_units = ?,
    last_studied = ?
    WHERE user_id = ? AND language_id = ?`)
    .run(current_level || p.current_level, current_unit || p.current_unit, JSON.stringify(completedUnits),
      new Date().toISOString().split('T')[0], req.user.id, req.params.langId);

  db.prepare('UPDATE users SET target_language = ? WHERE id = ?').run(req.params.langId, req.user.id);

  p = db.prepare('SELECT * FROM progress WHERE user_id = ? AND language_id = ?').get(req.user.id, req.params.langId);
  res.json(p);
});

module.exports = router;

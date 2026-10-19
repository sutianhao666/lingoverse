const express = require('express');
const db = require('../database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 获取所有语言
router.get('/languages', (req, res) => {
  const langs = db.prepare('SELECT * FROM languages').all();
  res.json(langs);
});

// 获取等级列表
router.get('/levels', (req, res) => {
  const levels = db.prepare('SELECT * FROM levels ORDER BY id').all();
  res.json(levels);
});

// 获取某个语言的等级进度信息
router.get('/language/:langId', (req, res) => {
  const lang = db.prepare('SELECT * FROM languages WHERE id = ?').get(req.params.langId);
  if (!lang) return res.status(404).json({ error: '语言不存在' });
  const levels = db.prepare('SELECT * FROM levels ORDER BY id').all();
  res.json({ ...lang, levels });
});

// 获取某个语言某等级的单元
router.get('/language/:langId/level/:levelId/units', (req, res) => {
  const units = db.prepare('SELECT * FROM units WHERE language_id = ? AND level_id = ? ORDER BY order_index')
    .all(req.params.langId, req.params.levelId);
  res.json(units);
});

// 单词列表
router.get('/words', (req, res) => {
  const { lang, level, unit, limit = 50 } = req.query;
  let sql = 'SELECT * FROM words WHERE 1=1';
  const params = [];
  if (lang) { sql += ' AND language_id = ?'; params.push(lang); }
  if (level) { sql += ' AND level_id = ?'; params.push(level); }
  if (unit) { sql += ' AND unit_id = ?'; params.push(unit); }
  sql += ' ORDER BY id LIMIT ?'; params.push(parseInt(limit));
  const words = db.prepare(sql).all(...params);
  res.json(words);
});

// 单词详情
router.get('/words/:id', (req, res) => {
  const word = db.prepare('SELECT * FROM words WHERE id = ?').get(req.params.id);
  if (!word) return res.status(404).json({ error: '单词不存在' });
  res.json(word);
});

// 语法列表
router.get('/grammar', (req, res) => {
  const { lang, level } = req.query;
  let sql = 'SELECT * FROM grammar WHERE 1=1';
  const params = [];
  if (lang) { sql += ' AND language_id = ?'; params.push(lang); }
  if (level) { sql += ' AND level_id = ?'; params.push(level); }
  const grammar = db.prepare(sql).all(...params);
  res.json(grammar);
});

// 语法详情
router.get('/grammar/:id', (req, res) => {
  const g = db.prepare('SELECT * FROM grammar WHERE id = ?').get(req.params.id);
  if (!g) return res.status(404).json({ error: '语法不存在' });
  res.json(g);
});

// 听力列表
router.get('/listening', (req, res) => {
  const { lang, level } = req.query;
  let sql = 'SELECT id, language_id, title, translation, level_id FROM listening WHERE 1=1';
  const params = [];
  if (lang) { sql += ' AND language_id = ?'; params.push(lang); }
  if (level) { sql += ' AND level_id = ?'; params.push(level); }
  const items = db.prepare(sql).all(...params);
  res.json(items);
});

// 听力详情
router.get('/listening/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM listening WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: '听力不存在' });
  res.json(item);
});

// 记录学习（需要登录）
router.post('/study/record', auth, (req, res) => {
  const { language_id, module, item_id, correct_count, total_count, exp_earned } = req.body;
  const info = db.prepare('INSERT INTO study_records (user_id, language_id, module, item_id, correct_count, total_count, exp_earned) VALUES (?,?,?,?,?,?,?)')
    .run(req.user.id, language_id, module, item_id, correct_count || 0, total_count || 0, exp_earned || 0);

  // 更新活跃时间
  const today = new Date().toISOString().split('T')[0];
  db.prepare('UPDATE users SET last_active = ? WHERE id = ?').run(today, req.user.id);

  // 添加经验
  if (exp_earned > 0) {
    db.prepare('UPDATE users SET exp = exp + ? WHERE id = ?').run(exp_earned, req.user.id);
  }
  res.json({ id: info.lastInsertRowid });
});

module.exports = router;

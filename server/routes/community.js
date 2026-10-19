const express = require('express');
const db = require('../database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 获取帖子列表（含用户信息）
router.get('/posts', (req, res) => {
  const { language_id, limit = 50 } = req.query;
  let sql = `
    SELECT p.*, u.username, u.nickname, u.avatar
    FROM posts p JOIN users u ON p.user_id = u.id
    WHERE p.parent_id = 0
  `;
  const params = [];
  if (language_id) { sql += ' AND p.language_id = ?'; params.push(language_id); }
  sql += ' ORDER BY p.created_at DESC LIMIT ?';
  params.push(parseInt(limit));
  const posts = db.prepare(sql).all(...params);
  res.json(posts);
});

// 发布帖子
router.post('/posts', auth, (req, res) => {
  const { content, language_id } = req.body;
  if (!content || content.trim().length < 5) return res.status(400).json({ error: '内容至少5个字符' });
  const info = db.prepare('INSERT INTO posts (user_id, content, language_id) VALUES (?,?,?)')
    .run(req.user.id, content.trim(), language_id || null);
  const post = db.prepare(`
    SELECT p.*, u.username, u.nickname, u.avatar
    FROM posts p JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(info.lastInsertRowid);

  // 发帖奖励经验
  db.prepare('UPDATE users SET exp = exp + 20 WHERE id = ?').run(req.user.id);

  res.json(post);
});

// 删除帖子
router.delete('/posts/:id', auth, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: '帖子不存在' });
  if (post.user_id !== req.user.id) return res.status(403).json({ error: '无权限' });
  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  db.prepare('DELETE FROM posts WHERE parent_id = ?').run(req.params.id); // 删除评论
  res.json({ success: true });
});

// 点赞
router.post('/posts/:id/like', auth, (req, res) => {
  db.prepare('UPDATE posts SET likes = likes + 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// 获取帖子评论
router.get('/posts/:id/comments', (req, res) => {
  const comments = db.prepare(`
    SELECT p.*, u.username, u.nickname, u.avatar
    FROM posts p JOIN users u ON p.user_id = u.id
    WHERE p.parent_id = ?
    ORDER BY p.created_at ASC
  `).all(req.params.id);
  res.json(comments);
});

// 发表评论
router.post('/posts/:id/comments', auth, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: '请输入评论内容' });
  const info = db.prepare('INSERT INTO posts (user_id, content, parent_id) VALUES (?,?,?)')
    .run(req.user.id, content, req.params.id);
  const comment = db.prepare(`
    SELECT p.*, u.username, u.nickname, u.avatar
    FROM posts p JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(info.lastInsertRowid);
  res.json(comment);
});

// 排行榜
router.get('/leaderboard', (req, res) => {
  const users = db.prepare(`
    SELECT id, username, nickname, avatar, level, exp, streak
    FROM users
    ORDER BY exp DESC
    LIMIT 20
  `).all();
  res.json(users);
});

module.exports = router;

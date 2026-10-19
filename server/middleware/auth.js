const jwt = require('jsonwebtoken');
const SECRET = 'lang-platform-secret-key-2026';

function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
  if (!token) return res.status(401).json({ error: '请先登录' });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: '登录已过期' });
  }
}

function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' });
}

module.exports = { auth, sign, SECRET };

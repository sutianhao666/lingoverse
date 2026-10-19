const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// 优先用 /tmp（Render/Glitch 等平台唯一可写目录），否则用本地 data
const dbDir = process.env.RENDER ? '/tmp' : path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'lang.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 创建所有表
db.exec(`
  -- 用户表
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nickname TEXT,
    avatar TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    target_language TEXT DEFAULT 'en',
    level INTEGER DEFAULT 1,
    exp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_active DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 课程/语言表
  CREATE TABLE IF NOT EXISTS languages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_cn TEXT NOT NULL,
    flag TEXT,
    description TEXT,
    difficulty INTEGER DEFAULT 1
  );

  -- 等级表 (CEFR A1-C2 + 自定义)
  CREATE TABLE IF NOT EXISTS levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    exp_required INTEGER NOT NULL,
    description TEXT
  );

  -- 课程单元
  CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language_id TEXT NOT NULL,
    level_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    FOREIGN KEY (language_id) REFERENCES languages(id),
    FOREIGN KEY (level_id) REFERENCES levels(id)
  );

  -- 课程内容 - 单词
  CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language_id TEXT NOT NULL,
    word TEXT NOT NULL,
    translation TEXT NOT NULL,
    phonetic TEXT DEFAULT '',
    example TEXT DEFAULT '',
    example_translation TEXT DEFAULT '',
    unit_id INTEGER,
    level_id INTEGER,
    FOREIGN KEY (language_id) REFERENCES languages(id),
    FOREIGN KEY (unit_id) REFERENCES units(id),
    FOREIGN KEY (level_id) REFERENCES levels(id)
  );

  -- 课程内容 - 语法点
  CREATE TABLE IF NOT EXISTS grammar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    example TEXT DEFAULT '',
    unit_id INTEGER,
    level_id INTEGER,
    FOREIGN KEY (language_id) REFERENCES languages(id),
    FOREIGN KEY (unit_id) REFERENCES units(id),
    FOREIGN KEY (level_id) REFERENCES levels(id)
  );

  -- 课程内容 - 听力
  CREATE TABLE IF NOT EXISTS listening (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language_id TEXT NOT NULL,
    title TEXT NOT NULL,
    script TEXT NOT NULL,
    translation TEXT DEFAULT '',
    audio_url TEXT DEFAULT '',
    questions TEXT DEFAULT '[]',
    unit_id INTEGER,
    level_id INTEGER,
    FOREIGN KEY (language_id) REFERENCES languages(id),
    FOREIGN KEY (unit_id) REFERENCES units(id),
    FOREIGN KEY (level_id) REFERENCES levels(id)
  );

  -- 用户学习进度
  CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    language_id TEXT NOT NULL,
    current_level INTEGER DEFAULT 1,
    current_unit INTEGER DEFAULT 1,
    completed_units TEXT DEFAULT '[]',
    study_minutes INTEGER DEFAULT 0,
    last_studied DATE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (language_id) REFERENCES languages(id),
    UNIQUE(user_id, language_id)
  );

  -- 学习记录
  CREATE TABLE IF NOT EXISTS study_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    language_id TEXT NOT NULL,
    module TEXT NOT NULL,
    item_id INTEGER,
    correct_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    exp_earned INTEGER DEFAULT 0,
    studied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- 成就系统
  CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    exp_reward INTEGER DEFAULT 0,
    condition_type TEXT NOT NULL,
    condition_value INTEGER DEFAULT 0
  );

  -- 用户获得的成就
  CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id),
    UNIQUE(user_id, achievement_id)
  );

  -- 社区帖子
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    language_id TEXT,
    parent_id INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- 好友关系
  CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
  );
`);

module.exports = db;

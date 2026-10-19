// 页面渲染
const Pages = {
  
  // ========== 首页 ==========
  async home() {
    const app = document.getElementById('app');
    
    let recData = null;
    let stats = null;
    let leaderboard = [];
    try {
      if (App.user) {
        recData = await API.progress.recommend();
        stats = await API.progress.stats();
      }
      leaderboard = await API.community.leaderboard();
    } catch(e) { console.error(e); }
    
    const targetLang = recData?.target_language || 'en';
    const targetLangName = App.langName(targetLang);
    
    let heroContent = '';
    if (App.user && stats) {
      heroContent = `
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="num">${stats.streak}</div>
            <div class="label">连续学习天数 🔥</div>
          </div>
          <div class="hero-stat">
            <div class="num">${stats.exp}</div>
            <div class="label">累计经验值 ⭐</div>
          </div>
          <div class="hero-stat">
            <div class="num">Lv.${stats.level}</div>
            <div class="label">当前等级 🎯</div>
          </div>
        </div>
      `;
    } else {
      heroContent = `
        <p>多语种沉浸式学习平台，支持英语、日语、韩语等主流语言。通过分级课程、互动练习、社区交流，让你轻松掌握一门新语言。</p>
        <div class="flex gap-2">
          <button class="btn btn-lg" style="background:white;color:var(--primary)" onclick="App.showAuth('register')">🚀 免费开始学习</button>
          <button class="btn btn-lg" style="background:rgba(255,255,255,0.2);color:white;border:2px solid white" onclick="App.navigate('courses')">查看课程</button>
        </div>
      `;
    }
    
    let recommendationsHtml = '';
    if (recData) {
      const rec = recData.recommendations;
      recommendationsHtml = `
        <section style="margin-bottom:48px">
          <h2 class="section-title">📚 为你推荐 - ${targetLangName}</h2>
          <div class="grid grid-3">
            ${rec.words.length ? `
              <div class="card" style="cursor:pointer" onclick="App.navigate('unit', {lang:'${targetLang}', module:'words'})">
                <div style="font-size:2rem;margin-bottom:8px">📖</div>
                <h3 style="margin-bottom:8px">单词记忆</h3>
                <p style="color:var(--text-secondary);font-size:0.85rem">${rec.words.length}个新单词等你学习</p>
                <div class="mt-8"><span class="badge badge-primary">开始背单词</span></div>
              </div>` : ''}
            ${rec.grammar.length ? `
              <div class="card" style="cursor:pointer" onclick="App.navigate('unit', {lang:'${targetLang}', module:'grammar'})">
                <div style="font-size:2rem;margin-bottom:8px">✍️</div>
                <h3 style="margin-bottom:8px">语法练习</h3>
                <p style="color:var(--text-secondary);font-size:0.85rem">${rec.grammar.length}个语法点待掌握</p>
                <div class="mt-8"><span class="badge badge-success">开始练习</span></div>
              </div>` : ''}
            ${rec.listening.length ? `
              <div class="card" style="cursor:pointer" onclick="App.navigate('unit', {lang:'${targetLang}', module:'listening'})">
                <div style="font-size:2rem;margin-bottom:8px">🎧</div>
                <h3 style="margin-bottom:8px">听力训练</h3>
                <p style="color:var(--text-secondary);font-size:0.85rem">${rec.listening.length}段听力材料</p>
                <div class="mt-8"><span class="badge badge-warning">开始听</span></div>
              </div>` : ''}
          </div>
        </section>
      `;
    }
    
    const langCardsHtml = App.langs.slice(0, 5).map(l => `
      <div class="lang-card" onclick="App.navigate('language', {lang:'${l.id}'})">
        <div class="lang-flag">${l.flag}</div>
        <div class="lang-name">${l.name_cn}</div>
        <div class="lang-name-en">${l.name}</div>
      </div>
    `).join('');
    
    app.innerHTML = `
      <div class="hero">
        <div class="hero-content">
          <h1>🌍 沉浸式语言学习</h1>
          ${heroContent}
        </div>
      </div>
      
      ${recommendationsHtml}
      
      <section style="margin-bottom:48px">
        <h2 class="section-title">选择你想学的语言</h2>
        <div class="grid grid-4">
          ${langCardsHtml}
        </div>
      </section>
      
      <section style="margin-bottom:48px">
        <h2 class="section-title">🏆 学习排行榜</h2>
        <div class="card">
          ${leaderboard.slice(0, 5).map((u, i) => `
            <div class="leaderboard-item">
              <div class="rank-num ${i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':''}">${i+1}</div>
              <div class="avatar">${(u.nickname || u.username || 'U').charAt(0).toUpperCase()}</div>
              <div style="flex:1">
                <div style="font-weight:600">${u.nickname || u.username}</div>
              </div>
              <div class="badge badge-success">⭐ ${u.exp}</div>
            </div>
          `).join('') || '<div class="empty-state">暂无数据</div>'}
        </div>
      </section>
    `;
  },
  
  // ========== 课程列表 ==========
  async courses() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <h1 style="font-size:2rem;font-weight:700;margin-bottom:32px">📚 选择语言开始学习</h1>
      <div class="grid grid-3">
        ${App.langs.map(l => `
          <div class="lang-card" onclick="App.navigate('language', {lang:'${l.id}'})">
            <div class="lang-flag">${l.flag}</div>
            <div class="lang-name">${l.name_cn}</div>
            <div class="lang-name-en">${l.name}</div>
            <div style="color:var(--text-secondary);font-size:0.85rem;margin-top:8px;padding:0 8px">${l.description}</div>
          </div>
        `).join('')}
      </div>
    `;
  },
  
  // ========== 语言详情 ==========
  async languageDetail(params) {
    const app = document.getElementById('app');
    const langId = params.lang || App.user?.target_language || 'en';
    
    const [langInfo, units, progress] = await Promise.all([
      API.courses.language(langId),
      API.courses.units(langId, 1),
      App.user ? API.progress.get(langId).catch(() => null) : Promise.resolve(null)
    ]);
    
    const currentLevel = progress?.current_level || 1;
    
    let levelTabs = App.levels.map(lv => {
      const active = lv.id === currentLevel;
      return `<button class="btn ${active ? 'btn-primary' : 'btn-secondary'} btn-sm" style="margin-right:8px;margin-bottom:8px" onclick="App.navigate('language', {lang:'${langId}', level:${lv.id}})">
        ${lv.code} ${lv.name}
      </button>`;
    }).join('');
    
    const unitList = await API.courses.units(langId, params.level || currentLevel);
    
    app.innerHTML = `
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
        <span style="font-size:3rem">${langInfo.flag}</span>
        <div>
          <h1 style="font-size:2rem;font-weight:700;margin-bottom:4px">${langInfo.name_cn} (${langInfo.name})</h1>
          <p style="color:var(--text-secondary)">${langInfo.description}</p>
        </div>
      </div>
      
      <div style="margin-bottom:32px">
        <div style="font-weight:600;margin-bottom:12px">选择等级</div>
        <div>${levelTabs}</div>
      </div>
      
      <h2 class="section-title">📖 学习单元</h2>
      <div class="grid grid-2">
        ${unitList.map((u, i) => `
          <div class="unit-card" onclick="App.navigate('unit', {lang:'${langId}', level:${params.level || currentLevel}, unit:${u.id}, title:'${u.title}'})">
            <div class="unit-icon">${['📖','✍️','🎧','💬'][i % 4]}</div>
            <div class="unit-info">
              <div class="unit-title">Unit ${u.order_index}: ${u.title}</div>
              <div class="unit-desc">${u.description || '核心学习内容'}</div>
            </div>
            <span class="badge badge-primary">进入</span>
          </div>
        `).join('')}
      </div>
      
      <div class="mt-8" style="display:flex;gap:16px;flex-wrap:wrap">
        <button class="btn btn-secondary" onclick="App.navigate('unit', {lang:'${langId}', module:'words'})">📖 单词库</button>
        <button class="btn btn-secondary" onclick="App.navigate('unit', {lang:'${langId}', module:'grammar'})">✍️ 语法点</button>
        <button class="btn btn-secondary" onclick="App.navigate('unit', {lang:'${langId}', module:'listening'})">🎧 听力材料</button>
        <button class="btn btn-secondary" onclick="App.navigate('unit', {lang:'${langId}', module:'speaking'})">💬 口语跟读</button>
      </div>
    `;
  },
  
  // ========== 单元详情（学习模块） ==========
  async unitDetail(params) {
    if (!App.user) {
      App.showAuth('login');
      throw new Error('需要登录');
    }
    
    const langId = params.lang;
    const langName = App.langName(langId);
    
    // 根据不同模块进入不同学习界面
    if (params.module) {
      const moduleMap = {
        words: () => Learning.wordCard(langId, params.level),
        grammar: () => Learning.grammarQuiz(langId, params.level),
        listening: () => Learning.listeningPractice(langId, params.level),
        speaking: () => Learning.speakingPractice(langId, params.level)
      };
      if (moduleMap[params.module]) {
        return moduleMap[params.module]();
      }
    }
    
    // 默认显示单元概览
    const unitId = params.unit;
    const level = params.level || 1;
    
    const [words, grammarItems, listeningItems] = await Promise.all([
      API.courses.words({ lang: langId, level, unit: unitId }).catch(() => []),
      API.courses.grammar({ lang: langId, level }).catch(() => []),
      API.courses.listening({ lang: langId, level }).catch(() => [])
    ]);
    
    const app = document.getElementById('app');
    app.innerHTML = `
      <h1 style="font-size:1.8rem;font-weight:700;margin-bottom:24px">
        ${params.title || '学习单元'} <span style="font-size:1rem;color:var(--text-secondary)">- ${langName}</span>
      </h1>
      
      <div class="grid grid-2">
        <div class="card" style="cursor:pointer" onclick="Learning.wordCard('${langId}', ${level})">
          <div class="unit-icon" style="margin-bottom:16px">📖</div>
          <h3 style="margin-bottom:8px">单词记忆</h3>
          <p style="color:var(--text-secondary);font-size:0.9rem">闪卡记忆模式，记住${words.length || '核心'}单词</p>
          <div class="mt-8"><span class="badge badge-primary">开始 →</span></div>
        </div>
        
        <div class="card" style="cursor:pointer" onclick="Learning.grammarQuiz('${langId}', ${level})">
          <div class="unit-icon" style="margin-bottom:16px">✍️</div>
          <h3 style="margin-bottom:8px">语法练习</h3>
          <p style="color:var(--text-secondary);font-size:0.9rem">${grammarItems.length || '实用'}语法点闯关</p>
          <div class="mt-8"><span class="badge badge-success">开始 →</span></div>
        </div>
        
        <div class="card" style="cursor:pointer" onclick="Learning.listeningPractice('${langId}', ${level})">
          <div class="unit-icon" style="margin-bottom:16px">🎧</div>
          <h3 style="margin-bottom:8px">听力训练</h3>
          <p style="color:var(--text-secondary);font-size:0.9rem">${listeningItems.length || '真实'}场景听力</p>
          <div class="mt-8"><span class="badge badge-warning">开始 →</span></div>
        </div>
        
        <div class="card" style="cursor:pointer" onclick="Learning.speakingPractice('${langId}', ${level})">
          <div class="unit-icon" style="margin-bottom:16px">💬</div>
          <h3 style="margin-bottom:8px">口语跟读</h3>
          <p style="color:var(--text-secondary);font-size:0.9rem">录音练习，提升口语发音</p>
          <div class="mt-8"><span class="badge badge-danger">开始 →</span></div>
        </div>
      </div>
      
      <div class="mt-8">
        <button class="btn btn-ghost" onclick="App.navigate('language', {lang:'${langId}'})">← 返回课程</button>
      </div>
    `;
  },
  
  // ========== 社区 ==========
  async community() {
    if (!App.user) { App.showAuth('login'); return; }
    
    const app = document.getElementById('app');
    const posts = await API.community.posts();
    const leaderboard = await API.community.leaderboard();
    
    app.innerHTML = `
      <div class="grid" style="grid-template-columns: 1fr 320px; gap:24px">
        <div>
          <div class="card" style="margin-bottom:24px">
            <div class="flex items-center gap-4">
              <div class="avatar">${(App.user.nickname || App.user.username).charAt(0).toUpperCase()}</div>
              <input class="form-input" id="postInput" placeholder="分享你的学习心得..." style="flex:1;border:none;background:var(--bg-dark)" />
              <button class="btn btn-primary" onclick="createPost()">发布</button>
            </div>
          </div>
          
          <div id="postList">
            ${posts.length ? posts.map(p => renderPost(p)).join('') : `
              <div class="empty-state">
                <div class="empty-icon">💭</div>
                <p>还没有动态，快来发布第一条吧！</p>
              </div>
            `}
          </div>
        </div>
        
        <div>
          <div class="card" style="margin-bottom:24px">
            <h3 style="font-weight:700;margin-bottom:16px">🏆 排行榜</h3>
            ${leaderboard.slice(0, 10).map((u, i) => `
              <div class="leaderboard-item">
                <div class="rank-num ${i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':''}">${i+1}</div>
                <div class="avatar" style="width:32px;height:32px;font-size:0.85rem">${(u.nickname || u.username).charAt(0).toUpperCase()}</div>
                <div style="flex:1;font-size:0.9rem;font-weight:500">${u.nickname || u.username}</div>
                <div style="font-size:0.8rem;color:var(--text-secondary)">⭐${u.exp}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="card">
            <h3 style="font-weight:700;margin-bottom:16px">🔥 社区动态</h3>
            <p style="color:var(--text-secondary);font-size:0.9rem">和志同道合的学习者一起成长，分享学习经验和打卡日常！</p>
          </div>
        </div>
      </div>
    `;
  },
  
  // ========== 个人中心 ==========
  async profile() {
    if (!App.user) { App.showAuth('login'); return; }
    
    const app = document.getElementById('app');
    const [stats, achievements, progress] = await Promise.all([
      API.progress.stats().catch(() => ({})),
      API.achievements().catch(() => []),
      API.progress.all().catch(() => [])
    ]);
    
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    
    // 生成过去7天热力图
    const weekMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i*86400000).toISOString().split('T')[0];
      weekMap[d] = 0;
    }
    (stats.weekRecords || []).forEach(r => { if (weekMap[r.day] !== undefined) weekMap[r.day] = r.cnt; });
    const weekDays = Object.keys(weekMap);
    
    app.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar">${(App.user.nickname || App.user.username).charAt(0).toUpperCase()}</div>
        <div style="flex:1">
          <div class="profile-name">${App.user.nickname || App.user.username}</div>
          <div style="opacity:0.9;font-size:0.9rem">${App.user.email}</div>
          <div class="profile-stats">
            <div class="profile-stat"><div class="num">${stats.exp || 0}</div><div class="label">经验值</div></div>
            <div class="profile-stat"><div class="num">${stats.streak || 0}天</div><div class="label">连续学习</div></div>
            <div class="profile-stat"><div class="num">Lv.${stats.level || 1}</div><div class="label">等级</div></div>
            <div class="profile-stat"><div class="num">${unlockedCount}/${achievements.length}</div><div class="label">成就</div></div>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <button class="btn btn-lg" style="background:rgba(255,255,255,0.2);color:white;border:2px solid white" onclick="editProfile()">编辑资料</button>
        </div>
      </div>
      
      <div class="grid grid-4" style="margin-bottom:32px">
        <div class="stat-card">
          <div class="stat-num">${stats.word_sessions || 0}</div>
          <div class="stat-label">单词学习次数</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${stats.grammar_sessions || 0}</div>
          <div class="stat-label">语法练习次数</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${stats.total_sessions || 0}</div>
          <div class="stat-label">总学习次数</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${progress.length || 0}</div>
          <div class="stat-label">正在学习语言</div>
        </div>
      </div>
      
      <div class="card" style="margin-bottom:32px">
        <h3 style="font-weight:700;margin-bottom:16px">📅 本周学习记录</h3>
        <div class="flex gap-2 items-end" style="height:80px">
          ${weekDays.map(d => {
            const cnt = weekMap[d];
            const height = Math.max(8, cnt * 20);
            const day = new Date(d).toLocaleDateString('zh', { weekday: 'short' });
            return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
              <div style="width:100%;height:${height}px;background:linear-gradient(to top,var(--primary),var(--secondary));border-radius:4px 4px 0 0"></div>
              <div style="font-size:0.75rem;color:var(--text-secondary)">${day}</div>
            </div>`;
          }).join('')}
        </div>
      </div>
      
      <h2 class="section-title">🎖️ 我的成就</h2>
      <div class="grid grid-4">
        ${achievements.map(a => `
          <div class="achievement-card ${a.unlocked ? 'unlocked' : ''}">
            <div class="ach-icon">${a.icon}</div>
            <div class="ach-name">${a.name}</div>
            <div class="ach-desc">${a.description}</div>
            ${a.unlocked ? `<span class="badge badge-success" style="margin-top:8px;font-size:0.75rem">已解锁 +${a.exp_reward}⭐</span>` : `<span class="badge badge-muted" style="margin-top:8px;font-size:0.75rem">未解锁</span>`}
          </div>
        `).join('')}
      </div>
    `;
  },
  
  // ========== 成就 ==========
  async achievements() {
    if (!App.user) { App.showAuth('login'); return; }
    const app = document.getElementById('app');
    const list = await API.achievements();
    app.innerHTML = `
      <h1 class="section-title">🎖️ 成就墙</h1>
      <div class="grid grid-4">
        ${list.map(a => `
          <div class="achievement-card ${a.unlocked ? 'unlocked' : ''}">
            <div class="ach-icon">${a.icon}</div>
            <div class="ach-name">${a.name}</div>
            <div class="ach-desc">${a.description}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
};

// 渲染帖子
function renderPost(p) {
  return `
    <div class="post-card" id="post-${p.id}">
      <div class="post-header">
        <div class="avatar">${(p.nickname || p.username).charAt(0).toUpperCase()}</div>
        <div>
          <div class="post-author">${p.nickname || p.username}</div>
          <div class="post-time">${formatTime(p.created_at)}</div>
        </div>
        ${p.language_id ? `<span class="badge badge-primary" style="margin-left:auto">${App.langName(p.language_id)}</span>` : ''}
      </div>
      <div class="post-content">${escapeHtml(p.content)}</div>
      <div class="post-actions">
        <div class="post-action" onclick="likePost(${p.id}, this)">👍 <span>${p.likes || 0}</span></div>
        <div class="post-action" onclick="showComments(${p.id})">💬 评论</div>
        ${p.user_id === App.user?.id ? `<div class="post-action" style="color:var(--danger)" onclick="deletePost(${p.id})">🗑️ 删除</div>` : ''}
      </div>
      <div id="comments-${p.id}"></div>
    </div>
  `;
}

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return Math.floor(diff/60) + '分钟前';
  if (diff < 86400) return Math.floor(diff/3600) + '小时前';
  return d.toLocaleDateString();
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// 社区操作
async function createPost() {
  const input = document.getElementById('postInput');
  const content = input.value.trim();
  if (!content) return App.toast('请输入内容', 'warning');
  try {
    await API.community.createPost({ content });
    input.value = '';
    App.toast('发布成功 🎉', 'success');
    App.navigate('community');
  } catch(e) {
    App.toast(e.message, 'error');
  }
}

async function likePost(id, el) {
  try {
    await API.community.likePost(id);
    const span = el.querySelector('span');
    span.textContent = (parseInt(span.textContent) || 0) + 1;
    App.toast('已点赞 ❤️', 'success');
  } catch(e) { App.toast(e.message, 'error'); }
}

async function deletePost(id) {
  if (!confirm('确认删除这条帖子？')) return;
  try {
    await API.community.deletePost(id);
    document.getElementById('post-' + id).remove();
    App.toast('已删除', 'success');
  } catch(e) { App.toast(e.message, 'error'); }
}

async function showComments(postId) {
  const container = document.getElementById('comments-' + postId);
  if (container.innerHTML.trim()) { container.innerHTML = ''; return; }
  
  const comments = await API.community.comments(postId);
  const html = `
    <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
      <div class="flex gap-2" style="margin-bottom:12px">
        <input class="form-input" id="comment-input-${postId}" placeholder="写下你的评论..." style="flex:1" />
        <button class="btn btn-primary btn-sm" onclick="addComment(${postId})">发送</button>
      </div>
      ${comments.length ? comments.map(c => `
        <div class="flex gap-2" style="padding:8px 0">
          <div class="avatar" style="width:28px;height:28px;font-size:0.8rem">${(c.nickname || c.username).charAt(0).toUpperCase()}</div>
          <div style="flex:1">
            <div style="font-size:0.85rem"><strong>${c.nickname || c.username}</strong> <span style="color:var(--text-muted);font-size:0.75rem">${formatTime(c.created_at)}</span></div>
            <div style="font-size:0.9rem">${escapeHtml(c.content)}</div>
          </div>
        </div>
      `).join('') : '<div style="color:var(--text-muted);font-size:0.85rem">还没有评论</div>'}
    </div>
  `;
  container.innerHTML = html;
}

async function addComment(postId) {
  const input = document.getElementById('comment-input-' + postId);
  if (!input.value.trim()) return;
  await API.community.addComment(postId, input.value.trim());
  showComments(postId); // 重新加载
}

async function editProfile() {
  const u = App.user;
  App.openModal(`
    <div class="modal-title">编辑资料</div>
    <form id="editForm" class="flex flex-col gap-4">
      <div class="form-group">
        <label class="form-label">昵称</label>
        <input class="form-input" name="nickname" value="${u.nickname || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">简介</label>
        <textarea class="form-input form-textarea" name="bio" placeholder="介绍一下你自己">${u.bio || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">目标语言</label>
        <select class="form-input" name="target_language">
          ${App.langs.map(l => `<option value="${l.id}" ${u.target_language===l.id?'selected':''}>${l.flag} ${l.name_cn}</option>`).join('')}
        </select>
      </div>
      <button type="submit" class="btn btn-primary btn-lg" style="width:100%">保存</button>
    </form>
  `);
  
  document.getElementById('editForm').onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const updated = await API.auth.update(data);
    App.user = updated;
    localStorage.setItem('user', JSON.stringify(updated));
    App.closeModal();
    App.toast('保存成功 ✨', 'success');
    App.renderNavUser();
    App.navigate('profile');
  };
}

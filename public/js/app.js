// 应用核心
const App = {
  user: null,
  currentPage: 'home',
  langs: [],
  levels: [],
  
  // 初始化
  async init() {
    this.loadUser();
    await this.loadBasicData();
    this.setupNav();
    
    // 路由
    const hash = window.location.hash.slice(1);
    if (hash) this.navigate(hash);
    else this.navigate('home');
  },
  
  loadUser() {
    const saved = localStorage.getItem('user');
    if (saved) {
      try { this.user = JSON.parse(saved); } catch { this.user = null; }
    }
  },
  
  async loadBasicData() {
    try {
      const [langs, levels] = await Promise.all([
        API.courses.languages(),
        API.courses.levels()
      ]);
      this.langs = langs;
      this.levels = levels;
    } catch(e) { console.error(e); }
  },
  
  setupNav() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1);
      if (hash) this.navigate(hash);
    });
  },
  
  // 登录/注册 模态
  showAuth(type = 'login') {
    this.currentAuthType = type;
    const isLogin = type === 'login';
    const html = `
      <div class="modal-title">${isLogin ? '欢迎回来 👋' : '创建新账号 🌟'}</div>
      <form id="authForm" class="flex flex-col gap-4">
        ${!isLogin ? `
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input class="form-input" name="username" required placeholder="设置一个好记的名字">
          </div>` : ''}
        <div class="form-group">
          <label class="form-label">${isLogin ? '账号' : '邮箱'}</label>
          <input class="form-input" name="${isLogin ? 'account' : 'email'}" required 
            placeholder="${isLogin ? '用户名或邮箱' : 'your@email.com'}" type="${isLogin ? 'text' : 'email'}">
        </div>
        ${!isLogin ? `
          <div class="form-group">
            <label class="form-label">昵称（可选）</label>
            <input class="form-input" name="nickname" placeholder="显示的昵称">
          </div>` : ''}
        <div class="form-group">
          <label class="form-label">密码</label>
          <input class="form-input" name="password" type="password" required placeholder="至少6位">
        </div>
        <button type="submit" class="btn btn-primary btn-lg" style="width:100%">
          ${isLogin ? '登录' : '注册'}
        </button>
        <div class="text-center" style="color:var(--text-secondary);font-size:0.9rem">
          ${isLogin ? '还没有账号？' : '已有账号？'}
          <a href="#" onclick="App.switchAuth()" style="color:var(--primary)">${isLogin ? '去注册' : '去登录'}</a>
        </div>
      </form>
    `;
    this.openModal(html);
    
    document.getElementById('authForm').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const data = Object.fromEntries(new FormData(form));
      try {
        const res = isLogin ? await API.auth.login(data) : await API.auth.register(data);
        API.token = res.token;
        this.user = res.user;
        localStorage.setItem('user', JSON.stringify(res.user));
        this.closeModal();
        this.renderNavUser();
        this.toast(isLogin ? '登录成功 👋' : '注册成功，欢迎加入！🎉', 'success');
        this.navigate('home');
      } catch(err) {
        this.toast(err.message, 'error');
      }
    };
  },
  
  switchAuth() {
    this.showAuth(this.currentAuthType === 'login' ? 'register' : 'login');
  },
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.user = null;
    this.renderNavUser();
    this.navigate('home');
    this.toast('已退出登录', 'success');
  },
  
  // 模态框
  openModal(html) {
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modal').classList.add('show');
  },
  
  closeModal() {
    document.getElementById('modal').classList.remove('show');
    document.getElementById('modalContent').innerHTML = '';
  },
  
  // Toast
  toast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; }, 2500);
    setTimeout(() => toast.remove(), 3000);
  },
  
  // 成就弹窗
  showAchievement(icon, name) {
    const popup = document.getElementById('achievementPopup');
    document.getElementById('achIcon').textContent = icon;
    document.getElementById('achName').textContent = name;
    popup.classList.add('show');
    setTimeout(() => popup.classList.remove('show'), 3000);
  },
  
  // 导航
  navigate(page, params = {}) {
    this.currentPage = page;
    window.location.hash = page;
    
    // 更新导航高亮
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.classList.toggle('active', a.dataset.page === page);
    });
    
    const app = document.getElementById('app');
    app.innerHTML = '<div class="text-center" style="padding:60px"><div class="empty-icon">⏳</div><div>加载中...</div></div>';
    
    // 确保登录状态有效
    if (this.user && API.token) {
      API.auth.me().then(u => { this.user = u; localStorage.setItem('user', JSON.stringify(u)); })
        .catch(() => { this.logout(); });
    }
    
    const pages = {
      home: Pages.home,
      courses: Pages.courses,
      'language': Pages.languageDetail,
      'unit': Pages.unitDetail,
      community: Pages.community,
      profile: Pages.profile,
      achievements: Pages.achievements
    };
    
    if (pages[page]) {
      pages[page](params).catch(err => {
        console.error(err);
        app.innerHTML = `<div class="empty-state"><div class="empty-icon">😵</div><div>加载失败，请刷新重试</div></div>`;
      });
    } else {
      app.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><h2>页面不存在</h2></div>`;
    }
    
    window.scrollTo(0, 0);
  },
  
  renderNavUser() {
    const container = document.getElementById('navUser');
    if (this.user) {
      container.innerHTML = `
        <span class="badge badge-primary" style="font-size:0.8rem">🔥 ${this.user.streak || 0}天</span>
        <span class="badge badge-success" style="font-size:0.8rem">⭐ ${this.user.exp || 0}</span>
        <div class="avatar" style="width:32px;height:32px;font-size:0.9rem;cursor:pointer" onclick="App.navigate('profile')">
          ${(this.user.nickname || this.user.username || 'U').charAt(0).toUpperCase()}
        </div>
        <button class="btn btn-ghost btn-sm" onclick="App.logout()">退出</button>
      `;
    } else {
      container.innerHTML = `
        <button class="btn btn-primary btn-sm" onclick="App.showAuth('login')">登录</button>
        <button class="btn btn-outline btn-sm" onclick="App.showAuth('register')">注册</button>
      `;
    }
  },
  
  // 语言和等级工具
  langName(id) {
    const l = this.langs.find(x => x.id === id);
    return l ? l.name_cn : id;
  },
  levelName(id) {
    const l = this.levels.find(x => x.id === id);
    return l ? `${l.code} ${l.name}` : `Lv.${id}`;
  },
  
  // 未登录检查
  requireLogin() {
    if (!this.user) {
      this.showAuth('login');
      this.toast('请先登录', 'warning');
      return false;
    }
    return true;
  }
};

// API 客户端
const API = {
  base: '/api',
  get token() { return localStorage.getItem('token'); },
  set token(t) { localStorage.setItem('token', t); },
  
  async request(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    
    const res = await fetch(this.base + path, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      throw new Error(data.error || '请求失败');
    }
    return data;
  },
  
  get(path) { return this.request(path); },
  post(path, body) { return this.request(path, { method: 'POST', body: JSON.stringify(body) }); },
  put(path, body) { return this.request(path, { method: 'PUT', body: JSON.stringify(body) }); },
  delete(path) { return this.request(path, { method: 'DELETE' }); },
  
  // 认证
  auth: {
    register: (data) => API.post('/auth/register', data),
    login: (data) => API.post('/auth/login', data),
    me: () => API.get('/auth/me'),
    update: (data) => API.put('/auth/me', data),
    addExp: (exp) => API.post('/auth/add-exp', { exp })
  },
  
  // 课程
  courses: {
    languages: () => API.get('/courses/languages'),
    levels: () => API.get('/courses/levels'),
    language: (id) => API.get(`/courses/language/${id}`),
    units: (lang, level) => API.get(`/courses/language/${lang}/level/${level}/units`),
    words: (params) => API.get('/courses/words?' + new URLSearchParams(params).toString()),
    word: (id) => API.get(`/courses/words/${id}`),
    grammar: (params) => API.get('/courses/grammar?' + new URLSearchParams(params).toString()),
    grammarItem: (id) => API.get(`/courses/grammar/${id}`),
    listening: (params) => API.get('/courses/listening?' + new URLSearchParams(params).toString()),
    listeningItem: (id) => API.get(`/courses/listening/${id}`),
    recordStudy: (data) => API.post('/courses/study/record', data)
  },
  
  // 进度
  progress: {
    all: () => API.get('/progress'),
    get: (langId) => API.get(`/progress/${langId}`),
    update: (langId, data) => API.put(`/progress/${langId}`, data),
    stats: () => API.get('/progress/stats/overview'),
    recommend: () => API.get('/progress/recommend')
  },
  
  // 成就
  achievements: () => API.get('/achievements'),
  
  // 社区
  community: {
    posts: (params) => API.get('/community/posts' + (params ? '?' + new URLSearchParams(params).toString() : '')),
    createPost: (data) => API.post('/community/posts', data),
    deletePost: (id) => API.delete(`/community/posts/${id}`),
    likePost: (id) => API.post(`/community/posts/${id}/like`),
    comments: (postId) => API.get(`/community/posts/${postId}/comments`),
    addComment: (postId, content) => API.post(`/community/posts/${postId}/comments`, { content }),
    leaderboard: () => API.get('/community/leaderboard')
  }
};

// 学习模块
const Learning = {
  
  // ========== 单词闪卡 ==========
  async wordCard(langId, level = 1) {
    const app = document.getElementById('app');
    const words = await API.courses.words({ lang: langId, level, limit: 100 });
    
    if (!words.length) {
      app.innerHTML = `<div class="empty-state"><div class="empty-icon">📖</div><p>该等级暂无单词，请选择其他等级</p><button class="btn btn-primary mt-8" onclick="App.navigate('language',{lang:'${langId}'})">返回</button></div>`;
      return;
    }
    
    let index = 0;
    let knownCount = 0;
    let expEarned = 0;
    let queue = [...words].sort(() => Math.random() - 0.5);
    
    function renderCard() {
      if (index >= queue.length || knownCount >= 10) {
        finishSession(queue, knownCount, expEarned, 'word', langId);
        return;
      }
      
      const w = queue[index];
      app.innerHTML = `
        <div class="learning-container">
          <div class="progress-header">
            <div class="progress-info">📖 ${App.langName(langId)} 单词记忆</div>
            <div class="progress-count">${index + 1} / ${queue.length} · 已掌握 ${knownCount}</div>
          </div>
          <div class="progress-bar" style="margin-bottom:32px">
            <div class="progress-fill" style="width:${(index / queue.length * 100)}%"></div>
          </div>
          
          <div class="flashcard" id="flashcard" onclick="this.classList.toggle('flipped')">
            <div class="flashcard-inner">
              <div class="flashcard-face flashcard-front">
                <div class="flashcard-word">${w.word}</div>
                <div class="flashcard-phonetic">${w.phonetic || ''}</div>
                <div style="margin-top:24px;font-size:0.85rem;opacity:0.7">👆 点击卡片查看释义</div>
              </div>
              <div class="flashcard-face flashcard-back">
                <div class="flashcard-translation">${w.translation}</div>
                <div class="flashcard-example">"${w.example}"</div>
                <div class="flashcard-example">${w.example_translation}</div>
              </div>
            </div>
          </div>
          
          <div class="flex gap-4 justify-center">
            <button class="btn btn-danger btn-lg" onclick="Learning.nextWord(false)">
              😅 不认识
            </button>
            <button class="btn btn-success btn-lg" onclick="Learning.nextWord(true)">
              ✅ 认识
            </button>
          </div>
          
          <div class="text-center mt-8">
            <button class="btn btn-ghost" onclick="App.navigate('language',{lang:'${langId}'})">← 退出学习</button>
          </div>
        </div>
      `;
      
      // 尝试发音（Web Speech API）
      setTimeout(() => {
        if ('speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(w.word);
          u.lang = langId === 'ja' ? 'ja-JP' : langId === 'ko' ? 'ko-KR' : langId === 'fr' ? 'fr-FR' : langId === 'es' ? 'es-ES' : 'en-US';
          speechSynthesis.speak(u);
        }
      }, 300);
    }
    
    Learning.nextWord = (known) => {
      index++;
      if (known) {
        knownCount++;
        expEarned += 10;
      } else {
        expEarned += 3;
      }
      renderCard();
    };
    
    renderCard();
  },
  
  // ========== 语法测验 ==========
  async grammarQuiz(langId, level = 1) {
    const app = document.getElementById('app');
    const grammarItems = await API.courses.grammar({ lang: langId, level });
    
    if (!grammarItems.length) {
      app.innerHTML = `<div class="empty-state"><div class="empty-icon">✍️</div><p>该语言暂无语法内容，请换一门语言试试</p><button class="btn btn-primary mt-8" onclick="App.navigate('language',{lang:'${langId}'})">返回</button></div>`;
      return;
    }
    
    let index = 0;
    let correctCount = 0;
    let expEarned = 0;
    const total = grammarItems.length;
    
    function render() {
      if (index >= total) {
        finishSession(grammarItems, correctCount, expEarned, 'grammar', langId);
        return;
      }
      
      const g = grammarItems[index];
      // 生成一个简单的选择题（用 example 作为选项之一）
      const allExamples = grammarItems.map(x => x.example).filter(x => x);
      const wrong = allExamples.filter(e => e !== g.example).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [...wrong, g.example].sort(() => Math.random() - 0.5);
      
      app.innerHTML = `
        <div class="learning-container">
          <div class="progress-header">
            <div class="progress-info">✍️ ${App.langName(langId)} 语法练习</div>
            <div class="progress-count">${index + 1} / ${total} · 正确 ${correctCount}</div>
          </div>
          <div class="progress-bar" style="margin-bottom:32px">
            <div class="progress-fill" style="width:${(index / total * 100)}%"></div>
          </div>
          
          <div class="card" style="margin-bottom:24px">
            <div style="font-weight:700;font-size:1.2rem;margin-bottom:12px">📚 ${g.title}</div>
            <pre style="white-space:pre-wrap;font-family:inherit;color:var(--text-secondary);line-height:1.8">${g.content}</pre>
          </div>
          
          <div class="question-card">
            <div class="question-text">下面哪个句子正确使用了「${g.title}」？</div>
            <div class="option-list">
              ${options.map((o, i) => `<button class="option-btn" data-correct="${o === g.example}" onclick="Learning.selectGrammar(this,'${g.example.replace(/'/g, "\\'")}')">${o}</button>`).join('')}
            </div>
          </div>
          
          <div class="text-center">
            <button class="btn btn-ghost" onclick="App.navigate('language',{lang:'${langId}'})">← 退出</button>
          </div>
        </div>
      `;
    }
    
    Learning.selectGrammar = (btn, correctAnswer) => {
      const buttons = document.querySelectorAll('.option-btn');
      buttons.forEach(b => b.disabled = true);
      const isCorrect = btn.dataset.correct === 'true';
      if (isCorrect) {
        btn.classList.add('correct');
        correctCount++;
        expEarned += 15;
        App.toast('✅ 回答正确！', 'success');
      } else {
        btn.classList.add('wrong');
        buttons.forEach(b => { if (b.dataset.correct === 'true') b.classList.add('correct'); });
        App.toast('😅 答错了，正确答案已标出', 'error');
      }
      setTimeout(() => { index++; render(); }, 1500);
    };
    
    render();
  },
  
  // ========== 听力训练 ==========
  async listeningPractice(langId, level = 1) {
    const app = document.getElementById('app');
    const items = await API.courses.listening({ lang: langId, level });
    
    if (!items.length) {
      app.innerHTML = `<div class="empty-state"><div class="empty-icon">🎧</div><p>暂无听力材料，请尝试其他语言</p><button class="btn btn-primary mt-8" onclick="App.navigate('language',{lang:'${langId}'})">返回</button></div>`;
      return;
    }
    
    let itemIndex = 0;
    let correctCount = 0;
    let expEarned = 0;
    
    function speakText(text) {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = langId === 'ja' ? 'ja-JP' : langId === 'ko' ? 'ko-KR' : langId === 'fr' ? 'fr-FR' : langId === 'es' ? 'es-ES' : 'en-US';
        u.rate = 0.9;
        speechSynthesis.speak(u);
      }
    }
    
    function renderItem() {
      if (itemIndex >= items.length) {
        finishSession(items, correctCount, expEarned, 'listening', langId);
        return;
      }
      
      const item = items[itemIndex];
      const questions = JSON.parse(item.questions || '[]');
      let qIndex = 0;
      let qCorrect = 0;
      
      function renderQuestion() {
        if (qIndex >= questions.length) {
          itemIndex++;
          expEarned += qCorrect * 20;
          setTimeout(renderItem, 500);
          return;
        }
        
        const q = questions[qIndex];
        app.innerHTML = `
          <div class="learning-container">
            <div class="progress-header">
              <div class="progress-info">🎧 ${App.langName(langId)} 听力训练</div>
              <div class="progress-count">${itemIndex + 1}/${items.length} · 已答对 ${correctCount}</div>
            </div>
            <div class="progress-bar" style="margin-bottom:32px">
              <div class="progress-fill" style="width:${(itemIndex / items.length * 100)}%"></div>
            </div>
            
            <div class="audio-player">
              <button class="play-btn" onclick="speakText(${JSON.stringify(item.script).replace(/"/g,'&quot;')})">▶</button>
              <div style="margin-top:12px;font-weight:600">${item.title}</div>
              <div class="audio-wave">
                ${Array(20).fill(0).map((_,i) => `<div class="wave-bar" style="animation-delay:${i*0.08}s"></div>`).join('')}
              </div>
              <button class="btn btn-secondary btn-sm mt-8" onclick="toggleScript(this)" style="margin-top:16px">👀 显示原文</button>
              <div class="card" id="scriptArea" style="margin-top:16px;display:none;text-align:left">
                <pre style="white-space:pre-wrap;font-family:inherit;font-size:0.95rem;line-height:1.8">${item.script}</pre>
                <div style="margin-top:12px;padding-top:12px;border-top:1px dashed var(--border);color:var(--text-secondary);font-size:0.9rem">
                  ${item.translation || ''}
                </div>
              </div>
            </div>
            
            <div class="question-card">
              <div class="question-text">${q.q}</div>
              <div class="option-list">
                ${q.options.map((opt, i) => `<button class="option-btn" data-answer="${i}" onclick="Learning.selectListening(this, ${q.answer})">${String.fromCharCode(65+i)}. ${opt}</button>`).join('')}
              </div>
            </div>
            
            <div class="text-center">
              <button class="btn btn-ghost" onclick="App.navigate('language',{lang:'${langId}'})">← 退出</button>
            </div>
          </div>
        `;
      }
      
      function toggleScript(btn) {
        const area = document.getElementById('scriptArea');
        area.style.display = area.style.display === 'none' ? 'block' : 'none';
        btn.textContent = area.style.display === 'none' ? '👀 显示原文' : '🙈 隐藏原文';
      }
      window.toggleScript = toggleScript;
      window.speakText = speakText;
      
      Learning.selectListening = (btn, correctIdx) => {
        const buttons = document.querySelectorAll('.option-btn');
        buttons.forEach(b => b.disabled = true);
        const chosen = parseInt(btn.dataset.answer);
        buttons.forEach((b, i) => {
          if (i === correctIdx) b.classList.add('correct');
          else if (i === chosen) b.classList.add('wrong');
        });
        if (chosen === correctIdx) { correctCount++; qCorrect++; App.toast('✅ 正确！', 'success'); }
        else App.toast('😅 再试试', 'error');
        setTimeout(() => { qIndex++; renderQuestion(); }, 1500);
      };
      
      renderQuestion();
    }
    
    renderItem();
  },
  
  // ========== 口语跟读 ==========
  async speakingPractice(langId, level = 1) {
    const app = document.getElementById('app');
    const words = await API.courses.words({ lang: langId, level, limit: 30 });
    const phrases = words.slice(0, 10);
    
    if (!phrases.length) {
      app.innerHTML = `<div class="empty-state"><div class="empty-icon">💬</div><p>暂无口语内容</p><button class="btn btn-primary mt-8" onclick="App.navigate('language',{lang:'${langId}'})">返回</button></div>`;
      return;
    }
    
    let index = 0;
    let score = 0;
    let expEarned = 0;
    
    function speak() {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(phrases[index].word);
        u.lang = langId === 'ja' ? 'ja-JP' : langId === 'ko' ? 'ko-KR' : 'en-US';
        u.rate = 0.8;
        speechSynthesis.speak(u);
      }
    }
    
    function record() {
      if (!navigator.mediaDevices) {
        App.toast('当前浏览器不支持录音，请使用 Chrome/Safari', 'warning');
        return;
      }
      const btn = document.getElementById('recBtn');
      btn.classList.add('recording');
      btn.innerHTML = '⏹️';
      btn.disabled = true;
      
      // 模拟录音（真实环境需要更复杂实现）
      setTimeout(() => {
        btn.classList.remove('recording');
        btn.innerHTML = '🎤';
        btn.disabled = false;
        
        // 模拟评分 60-100
        const s = Math.floor(Math.random() * 40) + 60;
        score += s;
        expEarned += Math.floor(s / 10);
        
        if (s >= 80) App.toast(`🎉 发音很棒！${s}分`, 'success');
        else if (s >= 60) App.toast(`👍 还不错！${s}分`, 'success');
        else App.toast(`💪 继续加油！${s}分`, 'warning');
        
        setTimeout(() => { index++; render(); }, 1200);
      }, 1500);
    }
    
    function render() {
      if (index >= phrases.length) {
        finishSession(phrases, Math.floor(score / 70), expEarned, 'speaking', langId);
        return;
      }
      
      const p = phrases[index];
      app.innerHTML = `
        <div class="learning-container">
          <div class="progress-header">
            <div class="progress-info">💬 ${App.langName(langId)} 口语跟读</div>
            <div class="progress-count">${index + 1} / ${phrases.length}</div>
          </div>
          <div class="progress-bar" style="margin-bottom:32px">
            <div class="progress-fill" style="width:${(index / phrases.length * 100)}%"></div>
          </div>
          
          <div class="record-area">
            <div style="font-size:3rem;font-weight:700;margin-bottom:12px">${p.word}</div>
            <div style="color:var(--text-secondary);font-size:1.1rem;margin-bottom:24px">${p.translation}</div>
            
            <div class="flex justify-center gap-2" style="margin-bottom:32px">
              <button class="btn btn-primary" onclick="Learning.speakExample()">🔊 听示范</button>
              <button class="btn btn-secondary" onclick="Learning.recordAgain()">🎤 我来读</button>
            </div>
            
            <div style="color:var(--text-muted);font-size:0.9rem">例句：${p.example || '-'}</div>
          </div>
          
          <div class="text-center">
            <button class="btn btn-ghost" onclick="App.navigate('language',{lang:'${langId}'})">← 退出</button>
          </div>
        </div>
      `;
      
      Learning.speakExample = speak;
      Learning.recordAgain = record;
    }
    
    render();
  },
  
  // ========== 完成会话 ==========
  async finishSession(items, correctCount, expEarned, module, langId) {
    const app = document.getElementById('app');
    const total = items.length;
    const percent = total > 0 ? Math.round(correctCount / total * 100) : 0;
    
    // 记录学习
    try {
      await API.courses.recordStudy({
        language_id: langId,
        module,
        total_count: total,
        correct_count: correctCount,
        exp_earned: expEarned
      });
      await API.auth.addExp(expEarned);
      // 刷新用户信息
      const me = await API.auth.me();
      App.user = me;
      localStorage.setItem('user', JSON.stringify(me));
      App.renderNavUser();
    } catch(e) { console.error(e); }
    
    app.innerHTML = `
      <div class="learning-container">
        <div class="result-card">
          <div style="font-size:4rem;margin-bottom:16px">${percent >= 80 ? '🎉' : percent >= 60 ? '👍' : '💪'}</div>
          <div class="result-label">本次完成</div>
          <div class="result-score">${percent}%</div>
          <div class="result-stats">
            <div><div style="font-size:1.5rem;font-weight:700">${correctCount}/${total}</div><div style="font-size:0.85rem;opacity:0.9">答对</div></div>
            <div><div style="font-size:1.5rem;font-weight:700">+${expEarned}</div><div style="font-size:0.85rem;opacity:0.9">经验值 ⭐</div></div>
          </div>
        </div>
        
        <div class="flex justify-center gap-4 mt-8">
          <button class="btn btn-primary btn-lg" onclick="App.navigate('unit', {lang:'${langId}', module:'${module}'})">🔄 再来一次</button>
          <button class="btn btn-secondary btn-lg" onclick="App.navigate('language', {lang:'${langId}'})">📚 返回课程</button>
        </div>
      </div>
    `;
    
    if (percent >= 80) App.toast('太棒了！继续保持 🚀', 'success');
    else if (percent >= 60) App.toast('不错！还有提升空间 ✨', 'success');
    else App.toast('加油！多练习几次 💪', 'warning');
  }
};

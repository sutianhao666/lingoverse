const db = require('./database');

function seed() {
  // 语言
  const languages = [
    { id: 'en', name: 'English', name_cn: '英语', flag: '🇬🇧', description: '全球通用语言，商务与学术必备' },
    { id: 'ja', name: '日本語', name_cn: '日语', flag: '🇯🇵', description: '动漫与科技文化的发源地' },
    { id: 'ko', name: '한국어', name_cn: '韩语', flag: '🇰🇷', description: 'K-POP与韩剧的魅力语言' },
    { id: 'fr', name: 'Français', name_cn: '法语', flag: '🇫🇷', description: '浪漫之都的官方语言' },
    { id: 'es', name: 'Español', name_cn: '西班牙语', flag: '🇪🇸', description: '全球第二大母语使用语言' }
  ];
  const insertLang = db.prepare('INSERT OR IGNORE INTO languages (id, name, name_cn, flag, description) VALUES (?,?,?,?,?)');
  languages.forEach(l => insertLang.run(l.id, l.name, l.name_cn, l.flag, l.description));

  // 等级
  const levels = [
    { code: 'A1', name: '入门', exp_required: 0, description: '零基础开始' },
    { code: 'A2', name: '初级', exp_required: 200, description: '简单日常交流' },
    { code: 'B1', name: '中级', exp_required: 600, description: '独立表达观点' },
    { code: 'B2', name: '中高级', exp_required: 1500, description: '流畅自然沟通' },
    { code: 'C1', name: '高级', exp_required: 3000, description: '接近母语水平' },
    { code: 'C2', name: '精通', exp_required: 6000, description: '完全掌握语言' }
  ];
  const insertLevel = db.prepare('INSERT OR IGNORE INTO levels (code, name, exp_required, description) VALUES (?,?,?,?)');
  levels.forEach(l => insertLevel.run(l.code, l.name, l.exp_required, l.description));

  // 单元 - 每个语言每个等级几个单元
  const units = [];
  languages.forEach(lang => {
    for (let lv = 1; lv <= 3; lv++) {
      const titles = {
        en: ['日常问候', '自我介绍', '购物生活', '出行交通', '工作学习', '社交娱乐'],
        ja: ['挨拶', '自己紹介', '買い物', '交通', '勉強', 'エンタメ'],
        ko: ['인사', '자기소개', '쇼핑', '교통', '공부', '문화생활'],
        fr: ['Salutations', 'Présentation', 'Shopping', 'Transport', 'Études', 'Culture'],
        es: ['Saludos', 'Presentación', 'Compras', 'Transporte', 'Estudios', 'Cultura']
      };
      const t = titles[lang.id] || titles.en;
      for (let i = 0; i < 4; i++) {
        units.push({ language_id: lang.id, level_id: lv, title: t[(lv - 1) * 2 + i] || `单元${i+1}`, description: '核心词汇与语法', order_index: i + 1 });
      }
    }
  });
  const insertUnit = db.prepare('INSERT INTO units (language_id, level_id, title, description, order_index) VALUES (?,?,?,?,?)');
  units.forEach(u => insertUnit.run(u.language_id, u.level_id, u.title, u.description, u.order_index));

  // 英语单词
  const enWords = [
    // A1
    { language_id: 'en', word: 'hello', translation: '你好', phonetic: '/həˈloʊ/', example: 'Hello, nice to meet you.', example_translation: '你好，很高兴认识你。', level_id: 1 },
    { language_id: 'en', word: 'world', translation: '世界', phonetic: '/wɜːrld/', example: 'Hello world!', example_translation: '你好世界！', level_id: 1 },
    { language_id: 'en', word: 'friend', translation: '朋友', phonetic: '/frend/', example: 'She is my best friend.', example_translation: '她是我最好的朋友。', level_id: 1 },
    { language_id: 'en', word: 'family', translation: '家庭', phonetic: '/ˈfæməli/', example: 'I love my family.', example_translation: '我爱我的家庭。', level_id: 1 },
    { language_id: 'en', word: 'book', translation: '书', phonetic: '/bʊk/', example: 'This book is interesting.', example_translation: '这本书很有趣。', level_id: 1 },
    { language_id: 'en', word: 'school', translation: '学校', phonetic: '/skuːl/', example: 'I go to school every day.', example_translation: '我每天上学。', level_id: 1 },
    { language_id: 'en', word: 'water', translation: '水', phonetic: '/ˈwɔːtər/', example: 'Please give me some water.', example_translation: '请给我一些水。', level_id: 1 },
    { language_id: 'en', word: 'food', translation: '食物', phonetic: '/fuːd/', example: 'The food is delicious.', example_translation: '食物很美味。', level_id: 1 },
    { language_id: 'en', word: 'morning', translation: '早晨', phonetic: '/ˈmɔːrnɪŋ/', example: 'Good morning!', example_translation: '早上好！', level_id: 1 },
    { language_id: 'en', word: 'evening', translation: '晚上', phonetic: '/ˈiːvnɪŋ/', example: 'Good evening!', example_translation: '晚上好！', level_id: 1 },
    // A2
    { language_id: 'en', word: 'beautiful', translation: '美丽的', phonetic: '/ˈbjuːtɪfl/', example: 'What a beautiful day!', example_translation: '多么美好的一天！', level_id: 2 },
    { language_id: 'en', word: 'important', translation: '重要的', phonetic: '/ɪmˈpɔːrtnt/', example: 'This is very important.', example_translation: '这非常重要。', level_id: 2 },
    { language_id: 'en', word: 'quickly', translation: '快速地', phonetic: '/ˈkwɪkli/', example: 'Run quickly!', example_translation: '快跑！', level_id: 2 },
    { language_id: 'en', word: 'yesterday', translation: '昨天', phonetic: '/ˈjestərdeɪ/', example: 'I saw him yesterday.', example_translation: '我昨天看到了他。', level_id: 2 },
    { language_id: 'en', word: 'tomorrow', translation: '明天', phonetic: '/təˈmɔːroʊ/', example: 'See you tomorrow.', example_translation: '明天见。', level_id: 2 },
    { language_id: 'en', word: 'sometimes', translation: '有时候', phonetic: '/ˈsʌmtaɪmz/', example: 'Sometimes I eat fast food.', example_translation: '有时候我吃快餐。', level_id: 2 },
    { language_id: 'en', word: 'understand', translation: '理解', phonetic: '/ˌʌndərˈstænd/', example: 'I don\'t understand.', example_translation: '我不理解。', level_id: 2 },
    { language_id: 'en', word: 'remember', translation: '记住', phonetic: '/rɪˈmembər/', example: 'Remember to call me.', example_translation: '记得给我打电话。', level_id: 2 },
    // B1
    { language_id: 'en', word: 'experience', translation: '经验', phonetic: '/ɪkˈspɪriəns/', example: 'It was a great experience.', example_translation: '这是一次很棒的经历。', level_id: 3 },
    { language_id: 'en', word: 'opportunity', translation: '机会', phonetic: '/ˌɑːpərˈtuːnəti/', example: 'Don\'t miss this opportunity.', example_translation: '不要错过这个机会。', level_id: 3 },
    { language_id: 'en', word: 'achieve', translation: '实现', phonetic: '/əˈtʃiːv/', example: 'You can achieve anything.', example_translation: '你可以实现任何事。', level_id: 3 },
    { language_id: 'en', word: 'communicate', translation: '沟通', phonetic: '/kəˈmjuːnɪkeɪt/', example: 'We need to communicate better.', example_translation: '我们需要更好地沟通。', level_id: 3 },
    { language_id: 'en', word: 'environment', translation: '环境', phonetic: '/ɪnˈvaɪrənmənt/', example: 'Protect the environment.', example_translation: '保护环境。', level_id: 3 },
    { language_id: 'en', word: 'technology', translation: '技术', phonetic: '/tekˈnɑːlədʒi/', example: 'Technology changes fast.', example_translation: '技术变化很快。', level_id: 3 },
    { language_id: 'en', word: 'culture', translation: '文化', phonetic: '/ˈkʌltʃər/', example: 'I love learning about new cultures.', example_translation: '我喜欢了解新文化。', level_id: 3 },
    { language_id: 'en', word: 'challenge', translation: '挑战', phonetic: '/ˈtʃælɪndʒ/', example: 'Life is full of challenges.', example_translation: '生活充满挑战。', level_id: 3 }
  ];

  // 日语单词
  const jaWords = [
    { language_id: 'ja', word: 'こんにちは', translation: '你好', phonetic: 'konnichiwa', example: 'こんにちは、元気ですか？', example_translation: '你好，身体好吗？', level_id: 1 },
    { language_id: 'ja', word: 'ありがとう', translation: '谢谢', phonetic: 'arigatou', example: 'ありがとうございます。', example_translation: '非常感谢。', level_id: 1 },
    { language_id: 'ja', word: 'さようなら', translation: '再见', phonetic: 'sayounara', example: 'さようなら、また明日。', example_translation: '再见，明天见。', level_id: 1 },
    { language_id: 'ja', word: 'はい', translation: '是的', phonetic: 'hai', example: 'はい、そうです。', example_translation: '是的，是这样的。', level_id: 1 },
    { language_id: 'ja', word: '名前', translation: '名字', phonetic: 'namae', example: 'お名前は何ですか？', example_translation: '你叫什么名字？', level_id: 1 },
    { language_id: 'ja', word: '友達', translation: '朋友', phonetic: 'tomodachi', example: '彼は私の友達です。', example_translation: '他是我的朋友。', level_id: 1 },
    { language_id: 'ja', word: '水', translation: '水', phonetic: 'mizu', example: '水をください。', example_translation: '请给我水。', level_id: 1 },
    { language_id: 'ja', word: '学校', translation: '学校', phonetic: 'gakkou', example: '学校に行きます。', example_translation: '去学校。', level_id: 1 },
    { language_id: 'ja', word: '綺麗', translation: '美丽', phonetic: 'kirei', example: '桜が綺麗ですね。', example_translation: '樱花真美啊。', level_id: 2 },
    { language_id: 'ja', word: '楽しい', translation: '开心', phonetic: 'tanoshii', example: 'とても楽しかった。', example_translation: '非常开心。', level_id: 2 },
    { language_id: 'ja', word: '勉強', translation: '学习', phonetic: 'benkyou', example: '日本語を勉強しています。', example_translation: '我在学习日语。', level_id: 2 },
    { language_id: 'ja', word: '経験', translation: '经验', phonetic: 'keiken', example: '良い経験になりました。', example_translation: '成为了很好的经验。', level_id: 3 },
    { language_id: 'ja', word: '機会', translation: '机会', phonetic: 'kikai', example: '良い機会ですね。', example_translation: '是个好机会呢。', level_id: 3 },
    { language_id: 'ja', word: '挑戦', translation: '挑战', phonetic: 'chousen', example: '新しいことに挑戦します。', example_translation: '挑战新事物。', level_id: 3 }
  ];

  // 韩语单词
  const koWords = [
    { language_id: 'ko', word: '안녕하세요', translation: '你好', phonetic: 'annyeonghaseyo', example: '안녕하세요, 만나서 반갑습니다.', example_translation: '你好，很高兴见到你。', level_id: 1 },
    { language_id: 'ko', word: '감사합니다', translation: '谢谢', phonetic: 'gamsahamnida', example: '도와주셔서 감사합니다.', example_translation: '谢谢你的帮助。', level_id: 1 },
    { language_id: 'ko', word: '안녕히 가세요', translation: '再见（留）', phonetic: 'annyeonghi gaseyo', example: '안녕히 가세요.', example_translation: '请慢走。', level_id: 1 },
    { language_id: 'ko', word: '네', translation: '是的', phonetic: 'ne', example: '네, 맞습니다.', example_translation: '是的，没错。', level_id: 1 },
    { language_id: 'ko', word: '이름', translation: '名字', phonetic: 'ireum', example: '이름이 뭐예요?', example_translation: '你叫什么名字？', level_id: 1 },
    { language_id: 'ko', word: '친구', translation: '朋友', phonetic: 'chingu', example: '그는 내 친구예요.', example_translation: '他是我的朋友。', level_id: 1 },
    { language_id: 'ko', word: '물', translation: '水', phonetic: 'mul', example: '물 좀 주세요.', example_translation: '请给我水。', level_id: 1 },
    { language_id: 'ko', word: '학교', translation: '学校', phonetic: 'hakgyo', example: '학교에 가요.', example_translation: '去学校。', level_id: 1 },
    { language_id: 'ko', word: '예쁘다', translation: '漂亮', phonetic: 'yeppeuda', example: '꽃이 예뻐요.', example_translation: '花很漂亮。', level_id: 2 },
    { language_id: 'ko', word: '재미있다', translation: '有趣', phonetic: 'jaemiitda', example: '영화가 재미있었어요.', example_translation: '电影很有趣。', level_id: 2 },
    { language_id: 'ko', word: '공부하다', translation: '学习', phonetic: 'gongbuhada', example: '한국어를 공부해요.', example_translation: '学习韩语。', level_id: 2 },
    { language_id: 'ko', word: '경험', translation: '经验', phonetic: 'gyeongheom', example: '좋은 경험이었어요.', example_translation: '是好的经验。', level_id: 3 },
    { language_id: 'ko', word: '기회', translation: '机会', phonetic: 'gihoe', example: '좋은 기회예요.', example_translation: '是好机会。', level_id: 3 },
    { language_id: 'ko', word: '도전', translation: '挑战', phonetic: 'dojeon', example: '새로운 도전을 해요.', example_translation: '做新的挑战。', level_id: 3 }
  ];

  const allWords = [...enWords, ...jaWords, ...koWords];
  const insertWord = db.prepare('INSERT OR IGNORE INTO words (language_id, word, translation, phonetic, example, example_translation, level_id) VALUES (?,?,?,?,?,?,?)');
  allWords.forEach(w => insertWord.run(w.language_id, w.word, w.translation, w.phonetic, w.example, w.example_translation, w.level_id));

  // 英语语法
  const enGrammar = [
    { language_id: 'en', title: '一般现在时', content: '主语 + 动词原形/动词+s/es\n表示经常性、习惯性的动作或客观事实。\n例：I go to school every day.', example: 'She works in a bank.', level_id: 1 },
    { language_id: 'en', title: '一般过去时', content: '主语 + 动词过去式\n表示过去某个时间发生的动作或存在的状态。\n例：I visited Beijing last year.', example: 'He played football yesterday.', level_id: 1 },
    { language_id: 'en', title: '现在进行时', content: '主语 + am/is/are + 动词ing\n表示现在正在进行的动作。\n例：I am reading a book.', example: 'They are watching TV now.', level_id: 2 },
    { language_id: 'en', title: '现在完成时', content: '主语 + have/has + 过去分词\n表示过去发生的动作对现在造成的影响。\n例：I have lived here for 3 years.', example: 'She has finished her homework.', level_id: 2 },
    { language_id: 'en', title: '被动语态', content: '主语 + be + 过去分词\n强调动作的承受者。\n例：The book was written by him.', example: 'English is spoken worldwide.', level_id: 3 },
    { language_id: 'en', title: '定语从句', content: '修饰名词的从句，用who/which/that引导。\n例：The man who is tall is my teacher.', example: 'This is the book that I bought.', level_id: 3 }
  ];
  const insertGram = db.prepare('INSERT OR IGNORE INTO grammar (language_id, title, content, example, level_id) VALUES (?,?,?,?,?)');
  enGrammar.forEach(g => insertGram.run(g.language_id, g.title, g.content, g.example, g.level_id));

  // 日语语法
  const jaGrammar = [
    { language_id: 'ja', title: 'は/が 助词', content: 'は：主题助词，表示句子主题。\nが：主格助词，表示主语。\n例：私は学生です。', example: 'りんごが好きです。', level_id: 1 },
    { language_id: 'ja', title: 'です/ます 体', content: 'です：名词/形容词句末。\nます：动词敬体。\n例：これは本です。', example: '毎日日本語を勉強します。', level_id: 1 },
    { language_id: 'ja', title: 'て形', content: '动词て形表示动作连接或请求等。\n例：食べて行く。', example: '窓を開けてください。', level_id: 2 },
    { language_id: 'ja', title: 'ながら', content: '动词て形 + ながら：一边...一边...\n例：音楽を聞きながら勉強する。', example: '歩きながら話しました。', level_id: 2 },
    { language_id: 'ja', title: '～てしまう', content: '表示动作完成或遗憾。\n例：忘れてしまった。', example: '大事なファイルを消してしまいました。', level_id: 3 }
  ];
  jaGrammar.forEach(g => insertGram.run(g.language_id, g.title, g.content, g.example, g.level_id));

  // 韩语语法
  const koGrammar = [
    { language_id: 'ko', title: '이/가 助词', content: '이：闭音节后 / 가：开音节后\n表示主语。\n例：학생이 왔어요.', example: '사과가 맛있어요.', level_id: 1 },
    { language_id: 'ko', title: '은/는 助词', content: '은：闭音节后 / 는：开音节后\n表示主题。\n例：저는 학생이에요.', example: '물은 차가워요.', level_id: 1 },
    { language_id: 'ko', title: '아요/어요 体', content: '动词/形容词 + 아요/어요 构成现在时敬体。\n例：가요 / 먹어요.', example: '친구를 만나요.', level_id: 2 },
    { language_id: 'ko', title: '고 싶다', content: '动词词干 + 고 싶다：想要...\n例：먹고 싶어요.', example: '한국에 가고 싶어요.', level_id: 2 },
    { language_id: 'ko', title: '～게 되다', content: '表示变化、决定。\n例：유학하게 되었어요.', example: '회사에 다니게 되었어요.', level_id: 3 }
  ];
  koGrammar.forEach(g => insertGram.run(g.language_id, g.title, g.content, g.example, g.level_id));

  // 听力
  const listeningItems = [
    { language_id: 'en', title: 'At the Cafe', script: 'Waiter: Good morning! Welcome to our cafe.\nCustomer: Good morning. I\'d like a cup of coffee, please.\nWaiter: Sure. What size?\nCustomer: Medium, please.\nWaiter: Would you like anything else?\nCustomer: No, thank you. How much is it?\nWaiter: That\'s 5 dollars.', translation: '服务员：早上好！欢迎来到我们的咖啡馆。\n顾客：早上好。请给我一杯咖啡。\n服务员：好的，要什么杯型？\n顾客：中杯。\n服务员：还需要别的吗？\n顾客：不了，谢谢。多少钱？\n服务员：5美元。', questions: JSON.stringify([{q: 'What does the customer order?', options: ['Tea', 'Coffee', 'Juice', 'Water'], answer: 1}, {q: 'What size does the customer want?', options: ['Small', 'Large', 'Medium', 'XL'], answer: 2}]), level_id: 1 },
    { language_id: 'en', title: 'Job Interview', script: 'Interviewer: Tell me about yourself.\nCandidate: I graduated from university last year with a degree in computer science. I\'ve been working as an intern for six months.\nInterviewer: Why do you want this job?\nCandidate: I\'m passionate about technology and I believe this company offers great opportunities.', translation: '面试官：介绍一下你自己。\n求职者：我去年大学毕业，计算机科学学位。我已经实习了六个月。\n面试官：你为什么想要这份工作？\n求职者：我对技术很热情，我相信贵公司能提供很好的机会。', questions: JSON.stringify([{q: 'What is the candidate\'s major?', options: ['Business', 'Computer Science', 'English', 'Math'], answer: 1}, {q: 'How long has the candidate been interning?', options: ['3 months', '1 year', '6 months', '2 years'], answer: 2}]), level_id: 3 },
    { language_id: 'ja', title: 'カフェで', script: '店員：いらっしゃいませ！\n客：すみません、コーヒーを一つください。\n店員：かしこまりました。\n客：いくらですか？\n店員：500円です。', translation: '店员：欢迎光临！\n顾客：不好意思，请给我一杯咖啡。\n店员：好的。\n顾客：多少钱？\n店员：500日元。', questions: JSON.stringify([{q: '客は何を注文しましたか？', options: ['お茶', 'コーヒー', 'ジュース', '水'], answer: 1}, {q: '値段はいくらですか？', options: ['300円', '400円', '500円', '600円'], answer: 2}]), level_id: 1 },
    { language_id: 'ko', title: '카페에서', script: '직원: 안녕하세요!\n손님: 안녕하세요. 커피 한 잔 주세요.\n직원: 네, 알겠습니다.\n손님: 얼마예요?\n직원: 5000원입니다.', translation: '店员：你好！\n顾客：你好。请给我一杯咖啡。\n店员：好的。\n顾客：多少钱？\n店员：5000韩元。', questions: JSON.stringify([{q: '손님은 무엇을 시켰어요?', options: ['차', '커피', '주스', '물'], answer: 1}, {q: '가격은 얼마예요?', options: ['3000원', '4000원', '5000원', '6000원'], answer: 2}]), level_id: 1 }
  ];
  const insertListening = db.prepare('INSERT OR IGNORE INTO listening (language_id, title, script, translation, questions, level_id) VALUES (?,?,?,?,?,?)');
  listeningItems.forEach(l => insertListening.run(l.language_id, l.title, l.script, l.translation, l.questions, l.level_id));

  // 成就
  const achievements = [
    { id: 'first_lesson', name: '初出茅庐', description: '完成第一节课', icon: '🌱', exp_reward: 50, condition_type: 'lessons', condition_value: 1 },
    { id: 'streak_7', name: '七日坚持', description: '连续学习7天', icon: '🔥', exp_reward: 100, condition_type: 'streak', condition_value: 7 },
    { id: 'streak_30', name: '月度达人', description: '连续学习30天', icon: '🏆', exp_reward: 300, condition_type: 'streak', condition_value: 30 },
    { id: 'vocab_50', name: '词汇小能手', description: '掌握50个单词', icon: '📚', exp_reward: 80, condition_type: 'words', condition_value: 50 },
    { id: 'vocab_200', name: '词汇大师', description: '掌握200个单词', icon: '🎓', exp_reward: 200, condition_type: 'words', condition_value: 200 },
    { id: 'grammar_10', name: '语法通', description: '学习10个语法点', icon: '📝', exp_reward: 100, condition_type: 'grammar', condition_value: 10 },
    { id: 'social_5', name: '社交达人', description: '发布5条社区动态', icon: '💬', exp_reward: 50, condition_type: 'posts', condition_value: 5 },
    { id: 'multi_lang', name: '多语者', description: '学习3种不同语言', icon: '🌍', exp_reward: 200, condition_type: 'languages', condition_value: 3 }
  ];
  const insertAch = db.prepare('INSERT OR IGNORE INTO achievements (id, name, description, icon, exp_reward, condition_type, condition_value) VALUES (?,?,?,?,?,?,?)');
  achievements.forEach(a => insertAch.run(a.id, a.name, a.description, a.icon, a.exp_reward, a.condition_type, a.condition_value));

  console.log('数据库种子数据初始化完成！');
}

seed();

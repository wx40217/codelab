import { BilingualCodeLine, Lesson } from '../../types/course';

const ASCII_CODE: BilingualCodeLine[] = [
  { line: 1, indent: 0, cn: '翻译密码(编号列表):', py: 'def decode_text(codes):', isHead: true },
  { line: 2, indent: 4, cn: '结果 = ""', py: 'result = ""' },
  { line: 3, indent: 4, cn: '对每个 编号 在 编号列表里:', py: 'for code in codes:' },
  { line: 4, indent: 8, cn: '字母 = 查密码本(编号)', py: 'letter = chr(code)' },
  { line: 5, indent: 8, cn: '结果 = 结果 + 字母', py: 'result = result + letter' },
  { line: 6, indent: 4, cn: '返回 结果', py: 'return result' },
];

export const textEncodingLesson: Lesson = {
  id: 'text-encoding',
  chapterId: 'ch-1',
  chapterNum: '01',
  orderInChapter: 3,
  totalInChapter: 3,
  title: '电脑如何给文字编号',
  subtitle: 'A 是 65？揭秘文字与表情的超级密码本',
  concepts: ['ASCII', 'Unicode', '字符编码', '密码本', 'chr'],
  status: 'ready',
  factsTitle: '密码本对照读数',
  codeLines: ASCII_CODE,
  steps: [
    {
      id: 't1-codebook',
      label: '全世界统一的密码本',
      kind: '概念',
      companionMood: 'curious',
      companionLine: '电脑肚子里只有数字，那它怎么记住你打出来的字母和微信消息呢？',
      body: [
        '电脑只懂数字，不认识字母 A、B、C。于是全世界的工程师一起约定了一本<strong>超级密码本（ASCII 编码表）</strong>。',
        '密码本规定：大写字母 <strong>A 对应 65</strong>，<strong>B 对应 66</strong>，<strong>C 对应 67</strong>……按字母表顺序一个个排下去！',
      ],
      note: {
        title: '为什么要全世界统一？',
        icon: 'bulb',
        text: '如果你的手机觉得 65 是 A，朋友的手机觉得 65 是“烤鸡腿”，发消息就会变成一堆乱码啦！',
      },
      state: {
        scene: 'iso-strip',
        baseLabel: 'ASCII 字母密码本',
        pointerIdx: 0,
        tagText: 'A 的秘密编号是 65',
        tagTone: 'coral',
        items: [
          { id: 'a', top: 'A', sub: '65', tone: 'found', lift: 10 },
          { id: 'b', top: 'B', sub: '66', tone: 'paper' },
          { id: 'c', top: 'C', sub: '67', tone: 'paper' },
          { id: 'd', top: 'D', sub: '68', tone: 'paper' },
          { id: 'e', top: 'E', sub: '69', tone: 'paper' },
        ],
      },
      lines: [1, 4],
      facts: {
        rows: [
          { label: '字母 A', value: 65, active: true },
          { label: '字母 B', value: 66 },
          { label: '字母 C', value: 67 },
        ],
        note: '顺着往下数，每个相邻字母的编号正好加 1。',
      },
    },
    {
      id: 't2-word-hi',
      label: '把单词变成一串数字',
      kind: '演示',
      companionMood: 'happy',
      companionLine: '猜猜电脑看到 [72, 73] 这两个数字时，会向你打什么招呼？',
      body: [
        '当你输入 <strong>HI</strong> 时，键盘查了一下密码本，悄悄发给电脑两个数字：<strong>72</strong>（H）和 <strong>73</strong>（I）。',
        '接着电脑再把 72 和 73 变成我们第 1 课学过的 0 和 1 开关存进内存里！',
      ],
      quiz: {
        id: 'quiz-ascii-next',
        question: '先猜一猜：已知 A 是 65、B 是 66、C 是 67，那字母 F 的编号是多少？',
        options: [
          { label: '68', feedback: '68 是字母 D 哦，顺着 A(65)、B(66)、C(67)、D(68)、E(69) 再往后数一个！' },
          { label: '70', correct: true, feedback: '神算子！A=65, B=66, C=67, D=68, E=69, F=70！' },
          { label: '72', feedback: '72 已经数到字母 H 啦，往回数两位看看！' },
        ],
        rewardStars: 10,
      },
      state: {
        scene: 'iso-strip',
        baseLabel: '解码数字 → 字母',
        pointerIdx: 1,
        tagText: '[72, 73] → "HI"',
        tagTone: 'coral',
        items: [
          { id: 'h', top: 'H', sub: '72', tone: 'active', lift: 6 },
          { id: 'i', top: 'I', sub: '73', tone: 'found', lift: 10 },
          { id: 'excl', top: '!', sub: '33', tone: 'paper' },
        ],
      },
      lines: [3, 4, 5],
      facts: {
        rows: [
          { label: '输入编号', chips: [{ text: '72' }, { text: '73' }, { text: '33' }] },
          { label: '翻译结果', value: 'HI!', active: true },
        ],
        note: '连标点符号“!”和空格也都有自己专属的编号。',
      },
    },
    {
      id: 't3-unicode',
      label: '汉字和表情怎么办？',
      kind: '规律',
      companionMood: 'excited',
      companionLine: '连汉字「你」「好」和机器人表情 🤖 也都住进了超大密码本里！',
      body: [
        '老牌 ASCII 表只装得下 128 个英文和符号。为了装下中文汉字、日文、甚至可爱的 Emoji 表情，工程师把密码本扩建成了超巨型的 <strong>Unicode（万国码）</strong>。',
        '在 Unicode 里，每一个汉字和 Emoji 都有独一无二的身份证号！',
      ],
      state: {
        scene: 'iso-strip',
        baseLabel: 'Unicode 超级万国码',
        pointerIdx: 2,
        tagText: '每个表情都有数字编号',
        tagTone: 'coral',
        items: [
          { id: 'u1', top: '你', sub: '20320', tone: 'paper' },
          { id: 'u2', top: '好', sub: '22909', tone: 'paper' },
          { id: 'u3', top: '🤖', sub: '129302', tone: 'found', lift: 10 },
          { id: 'u4', top: '★', sub: '9733', tone: 'active', lift: 5 },
        ],
      },
      lines: [4, 6],
      facts: {
        rows: [
          { label: 'ASCII 容量', value: '128 个字符' },
          { label: 'Unicode 容量', value: '超过 15 万个', active: true },
        ],
        note: 'Python 的 chr(数字) 可以一键查出任何编号对应的字符！',
      },
    },
    {
      id: 't4-ready',
      label: '破译秘密特工电报',
      kind: '实战',
      companionMood: 'proud',
      companionLine: '阿派收到一封数字密电 [67, 65, 84]，快来动手挑战里把它翻译出来！',
      body: [
        '现在你已经掌握了「文字 → 数字 → 0 和 1」的完整变身链条！',
        '点击「进入动手挑战」，对照 2.5D 密码本方块，亲手把神秘数字电报 <strong>[67, 65, 84]</strong> 破译成英文单词吧！',
      ],
      state: {
        scene: 'iso-strip',
        baseLabel: '神秘数字电报',
        pointerIdx: 0,
        tagText: '猜猜 67 · 65 · 84 是什么？',
        tagTone: 'dark',
        items: [
          { id: 'q1', top: '?', sub: '67', tone: 'active', lift: 6 },
          { id: 'q2', top: '?', sub: '65', tone: 'paper' },
          { id: 'q3', top: '?', sub: '84', tone: 'paper' },
        ],
      },
      lines: [1, 3, 4, 6],
      facts: {
        rows: [
          { label: '待破译密电', value: '67 · 65 · 84', active: true },
          { label: '线索', value: '一种会喵喵叫的小动物' },
        ],
        note: '点击下方按钮进入破译台！',
      },
    },
  ],
  challenge: {
    type: 'ascii-decoder',
    title: '特工译码台：破译神秘数字电报',
    prompt: '点击下方密码本里的字母，按顺序把数字 [67, 65, 84] 翻译成 3 个字母的英文单词！',
    codeMap: [
      { char: 'A', code: 65 },
      { char: 'B', code: 66 },
      { char: 'C', code: 67 },
      { char: 'D', code: 68 },
      { char: 'O', code: 79 },
      { char: 'T', code: 84 },
    ],
    targetWord: 'CAT',
  },
};

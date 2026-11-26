import { BilingualCodeLine, Lesson } from '../../types/course';

const ARRAY_CODE: BilingualCodeLine[] = [
  { line: 1, indent: 0, cn: '储物柜 = ["🍎", "🎮", "⚽", "🚀", "🎸"]', py: 'lockers = ["🍎", "🎮", "⚽", "🚀", "🎸"]', isHead: true },
  { line: 2, indent: 0, cn: '第一个 = 储物柜[0]  // 0号柜：🍎', py: 'first = lockers[0]  # 🍎' },
  { line: 3, indent: 0, cn: '火箭 = 储物柜[3]    // 3号柜：🚀', py: 'rocket = lockers[3] # 🚀' },
  { line: 4, indent: 0, cn: '储物柜[2] = "🏀"    // 换掉2号柜', py: 'lockers[2] = "🏀"' },
];

export const arraysLockersLesson: Lesson = {
  id: 'arrays-lockers',
  chapterId: 'ch-3',
  chapterNum: '03',
  orderInChapter: 1,
  totalInChapter: 4,
  title: '一排储物柜：数组',
  subtitle: '为什么程序员总爱从 0 开始数数？',
  concepts: ['数组', 'Array', '索引', '下标', 'O(1)'],
  status: 'ready',
  factsTitle: '储物柜数组状态',
  codeLines: ARRAY_CODE,
  steps: [
    {
      id: 'a1-row',
      label: '紧挨着的一排储物柜',
      kind: '概念',
      companionMood: 'curious',
      companionLine: '如果背包里有 5 件宝物，建 5 个变量太麻烦了！不如排成一排「数组储物柜」！',
      body: [
        '<strong>数组（Array）</strong>就像学校走廊里紧挨着的一排储物柜，每一个柜子都贴着门牌号——编程里叫做<strong>下标（Index）</strong>。',
        '最特别的是：程序员永远从 <strong>0</strong> 开始编号！因为 0 代表「从起点走 0 步」，就是最左边第 1 个柜子。',
      ],
      note: {
        title: '记住这个程序员暗号',
        icon: 'bulb',
        text: '第 1 个柜子是 [0]，第 2 个是 [1]……一共有 5 个柜子，最后一个柜子的门牌号是 [4]！',
      },
      state: {
        scene: 'iso-strip',
        baseLabel: '数组储物柜 lockers[0..4]',
        pointerIdx: 0,
        tagText: 'lockers[0] = 🍎',
        tagTone: 'coral',
        items: [
          { id: 'l0', top: '🍎', sub: '[0]', tone: 'found', lift: 10 },
          { id: 'l1', top: '🎮', sub: '[1]', tone: 'paper' },
          { id: 'l2', top: '⚽', sub: '[2]', tone: 'paper' },
          { id: 'l3', top: '🚀', sub: '[3]', tone: 'paper' },
          { id: 'l4', top: '🎸', sub: '[4]', tone: 'paper' },
        ],
      },
      lines: [1, 2],
      facts: {
        rows: [
          { label: '数组长度', value: 5 },
          { label: '下标范围', value: '0 ~ 4' },
          { label: 'lockers[0]', value: '🍎', active: true },
        ],
        note: '下标表示“离起点有多远”，所以起点自己距离是 0！',
      },
    },
    {
      id: 'a2-instant',
      label: '报门牌号，1 步秒拿',
      kind: '规律',
      companionMood: 'excited',
      companionLine: '想拿火箭 🚀？不用从头翻，直接喊一声 lockers[3]，1 步瞬间拿到！',
      body: [
        '因为所有柜子紧挨着、大小一模一样，电脑只要用门牌号做一次加法，就能<strong>1 步瞬间跳到</strong>对应的柜子！',
        '执行第 3 行 <strong>lockers[3]</strong>，不用翻看 0、1、2 号，直接精准弹出 3 号柜里的 <strong>🚀</strong>！',
      ],
      quiz: {
        id: 'quiz-array-index',
        question: '先猜一猜：吉他 🎸 排在整排储物柜的第 5 个位置，它的数组下标是多少？',
        options: [
          { label: '[5]', feedback: '小心哦！数组从 0 开始数：0、1、2、3、4，所以没有 5 号柜！' },
          { label: '[4]', correct: true, feedback: '答对啦！0→🍎, 1→🎮, 2→⚽, 3→🚀, 4→🎸，你已经像真程序员一样数数了！' },
          { label: '[3]', feedback: '3 号柜里装的是火箭 🚀 哦，吉他还在它右边一格！' },
        ],
        rewardStars: 10,
      },
      state: {
        scene: 'iso-strip',
        baseLabel: '瞬间定位 lockers[3]',
        pointerIdx: 3,
        tagText: 'lockers[3] → 🚀（仅 1 步！）',
        tagTone: 'coral',
        items: [
          { id: 'l0', top: '🍎', sub: '[0]', tone: 'dim' },
          { id: 'l1', top: '🎮', sub: '[1]', tone: 'dim' },
          { id: 'l2', top: '⚽', sub: '[2]', tone: 'dim' },
          { id: 'l3', top: '🚀', sub: '[3]', tone: 'found', lift: 12 },
          { id: 'l4', top: '🎸', sub: '[4]', tone: 'dim' },
        ],
      },
      lines: [3],
      facts: {
        rows: [
          { label: '查询指令', value: 'lockers[3]' },
          { label: '花费步数', value: '1 步 · O(1)', active: true },
          { label: '拿到宝物', value: '🚀' },
        ],
        note: '就算有 100 万个柜子，按门牌号拿东西也只需要 1 步！',
      },
    },
    {
      id: 'a3-replace',
      label: '原地换掉里面的宝贝',
      kind: '演示',
      companionMood: 'happy',
      companionLine: '把 2 号柜里的足球 ⚽ 换成篮球 🏀，其他柜子完全不受打扰！',
      body: [
        '执行第 4 行 <strong>lockers[2] = "🏀"</strong>，就能直接打开 2 号柜把里面的足球换成篮球。',
        '这就是数组最厉害的超能力：只要知道门牌号，无论是读取还是替换，统统瞬间完成！',
      ],
      state: {
        scene: 'iso-strip',
        baseLabel: '原地修改 lockers[2]',
        pointerIdx: 2,
        tagText: 'lockers[2] = 🏀',
        tagTone: 'coral',
        items: [
          { id: 'l0', top: '🍎', sub: '[0]', tone: 'paper' },
          { id: 'l1', top: '🎮', sub: '[1]', tone: 'paper' },
          { id: 'l2', top: '🏀', sub: '[2]', tone: 'active', lift: 10 },
          { id: 'l3', top: '🚀', sub: '[3]', tone: 'paper' },
          { id: 'l4', top: '🎸', sub: '[4]', tone: 'paper' },
        ],
      },
      lines: [4],
      facts: {
        rows: [
          { label: '修改位置', value: 'lockers[2]', active: true },
          { label: '新内容', value: '🏀' },
          { label: '总长度', value: '依然是 5' },
        ],
        note: '接下来去挑战一下你的 0 开始数数反应速度吧！',
      },
    },
  ],
  challenge: {
    type: 'array-lookup',
    title: '储物柜寻宝：找到藏着「💎」的门牌号',
    prompt: '请直接点击 2.5D 舞台上藏着「💎」的储物柜，或点击下方对应的数组下标（记住从 0 开始数哦）！',
    items: ['🍪', '🧸', '🎨', '💎', '🪁'],
    targetItem: '💎',
    targetIndex: 3,
  },
};

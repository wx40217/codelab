import { BilingualCodeLine, Lesson } from '../../types/course';

const BUGGY_CODE: BilingualCodeLine[] = [
  { line: 1, indent: 0, cn: '拿能量块():', py: 'def get_star():', isHead: true },
  { line: 2, indent: 4, cn: '向前跳 1 格  // 第 1 步', py: 'robot.move()  # step 1' },
  { line: 3, indent: 4, cn: '向前跳 1 格  // 第 2 步', py: 'robot.move()  # step 2' },
  { line: 4, indent: 4, cn: '向前跳 1 格  // 第 3 步', py: 'robot.move()  # step 3' },
  { line: 5, indent: 4, cn: '向前跳 1 格  // 多写了！', py: 'robot.move()  # extra bug!' },
];

const FIXED_CODE: BilingualCodeLine[] = [
  { line: 1, indent: 0, cn: '拿能量块():', py: 'def get_star():', isHead: true },
  { line: 2, indent: 4, cn: '向前跳 1 格  // 到达 1 号', py: 'robot.move()  # tile 1' },
  { line: 3, indent: 4, cn: '向前跳 1 格  // 到达 2 号', py: 'robot.move()  # tile 2' },
  { line: 4, indent: 4, cn: '向前跳 1 格  // 到达 3 号 ★', py: 'robot.move()  # tile 3 ★' },
];

export const seqAndBugLesson: Lesson = {
  id: 'seq-and-bug',
  chapterId: 'ch-2',
  chapterNum: '02',
  orderInChapter: 1,
  totalInChapter: 4,
  title: '顺序指令与 Bug',
  subtitle: '为什么听话的小机器人直直撞墙了？',
  concepts: ['顺序执行', 'Bug', 'Debug', '调试', '逐行'],
  status: 'ready',
  factsTitle: '程序执行状态',
  codeLines: BUGGY_CODE,
  steps: [
    {
      id: 'sq1-order',
      label: '从上到下，严格排队',
      kind: '概念',
      companionMood: 'happy',
      companionLine: '我超级听话！你写几行指令，我就从第 1 行开始一行一行严格照做！',
      body: [
        '电脑和机器人不会“猜你的心思”，它们只遵守一条铁律：<strong>顺序执行</strong>——从上到下，做完第 1 行，再做第 2 行，绝不跳步。',
        '看舞台！阿派站在 0 号格，闪闪发光的能量块在 <strong>3 号格</strong>，后面 <strong>4 号格</strong>就是一堵障碍墙。',
      ],
      state: {
        scene: 'robot-loop',
        baseLabel: '顺序执行测试场',
        trackLength: 6,
        robotAt: 0,
        goalAt: 3,
        wallAt: 4,
        visited: [0],
        status: 'idle',
        tagText: '准备按行执行',
      },
      lines: [1],
      facts: {
        rows: [
          { label: '当前格号', value: 0 },
          { label: '目标格号', value: '3 号 ★' },
          { label: '障碍墙', value: '4 号墙' },
        ],
        note: '仔细数一数，从 0 到 3 需要跳几步？',
      },
    },
    {
      id: 'sq2-step3',
      label: '顺滑到达 3 号格',
      kind: '演示',
      companionMood: 'excited',
      companionLine: '第 2、3、4 行执行完，我刚好站到 3 号能量块上啦！等等…下面还有一行？',
      body: [
        '阿派乖乖执行了第 2 行、第 3 行、第 4 行，一路稳稳跳到了 <strong>3 号格</strong>。',
        '可是你看深色代码卡——粗心的程序员多写了一条<strong>第 5 行</strong>指令！电脑会停下来吗？',
      ],
      state: {
        scene: 'robot-loop',
        baseLabel: '顺序执行测试场',
        trackLength: 6,
        robotAt: 3,
        goalAt: 3,
        wallAt: 4,
        visited: [0, 1, 2, 3],
        status: 'step',
        tagText: '已到 3 号，但还有第 5 行！',
      },
      lines: [4],
      facts: {
        rows: [
          { label: '当前格号', value: 3, active: true },
          { label: '待执行行', value: '第 5 行（危险！）' },
        ],
        note: '点左下角「回放阿派跳跃」看看它怎么走到 3 号格的。',
      },
    },
    {
      id: 'sq3-bug',
      label: '咚！遇见第一只 Bug',
      kind: '发现',
      companionMood: 'oops',
      companionLine: '哎哟！我明明已经拿到星星了，可第 5 行还叫我往前跳，我就一头撞墙了！',
      body: [
        '因为第 5 行还在程序里，阿派死心塌地又往前跳了一次——<strong>咚！一头撞上了 4 号墙！</strong>',
        '像这样藏在代码里、让程序出错的小毛病，在编程世界里叫做 <strong>Bug（臭虫）</strong>。',
      ],
      note: {
        title: '趣闻：为什么叫 Bug？',
        icon: 'bulb',
        text: '1947 年，一只真飞蛾钻进巨型计算机导致死机，工程师把飞蛾贴在日志本上写着“抓到一只 Bug”，从此“除虫”就叫 Debug！',
      },
      quiz: {
        id: 'quiz-debug-meaning',
        question: '先猜一猜：程序员常说的 “Debug（除虫）” 是什么意思？',
        options: [
          { label: '拿苍蝇拍打电脑', feedback: '哈哈现在电脑里很少有真飞蛾啦！Debug 是找代码里的错误～' },
          { label: '找出代码里的错误并修好它', correct: true, feedback: '答对啦！厉害的程序员都不怕出错，反而最享受 Debug 破案的过程！' },
          { label: '把电脑关机重启', feedback: '重启可修不好写多了一行的代码哦，要修改出错的那一行！' },
        ],
        rewardStars: 10,
      },
      state: {
        scene: 'robot-loop',
        baseLabel: '顺序执行测试场',
        trackLength: 6,
        robotAt: 3,
        goalAt: 3,
        wallAt: 4,
        visited: [0, 1, 2, 3],
        status: 'bonk',
        tagText: 'Bug！第 5 行导致撞墙',
      },
      lines: [5],
      facts: {
        rows: [
          { label: '事故原因', value: '多写 1 行指令', active: true },
          { label: '报错类型', value: '顺序指令 Bug' },
        ],
        note: '电脑没有错，它只是忠实执行了我们写错的那一行。',
      },
    },
    {
      id: 'sq4-debug',
      label: '删掉臭虫：Debug 成功',
      kind: '实战',
      companionMood: 'proud',
      companionLine: '删掉多余的第 5 行，完美收工！接下来轮到你当一次除虫小侦探！',
      body: [
        '把多余的第 5 行删掉，只保留 3 行「向前跳 1 格」，阿派就能稳稳停在 3 号格拿下能量块！',
        '点击「进入动手挑战」，一份带 Bug 的指令清单正等着你亲手修好它！',
      ],
      overrideCode: FIXED_CODE,
      lines: [2, 3, 4],
      state: {
        scene: 'robot-loop',
        baseLabel: '顺序执行测试场',
        trackLength: 6,
        robotAt: 3,
        goalAt: 3,
        wallAt: 4,
        visited: [0, 1, 2, 3],
        status: 'victory',
        tagText: 'Debug 完成！稳稳拿星 ★',
      },
      facts: {
        rows: [
          { label: '指令行数', value: '3 行（刚刚好）', active: true },
          { label: '状态', value: '除虫成功' },
        ],
        note: '记住：遇到 Bug 别慌，一步步检查哪一行出问题就行！',
      },
    },
  ],
  challenge: {
    type: 'seq-debugger',
    title: '除虫小侦探：删掉多余的 Bug 指令',
    prompt: '这份程序里居然写了 5 条「向前跳 1 格」，但能量块在 3 号格、墙在 4 号格！请删掉多余的指令再点「测试运行」吧！',
    trackLength: 6,
    goalAt: 3,
    wallAt: 4,
    buggySteps: 5,
    correctSteps: 3,
  },
};

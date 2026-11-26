import { BilingualCodeLine, Lesson } from '../../types/course';

const VAR_CODE: BilingualCodeLine[] = [
  { line: 1, indent: 0, cn: '计分游戏():', py: 'def play_game():', isHead: true },
  { line: 2, indent: 4, cn: 'score = 0        // 创建空盒子', py: 'score = 0        # init' },
  { line: 3, indent: 4, cn: 'score = score + 1  // 吃 1 颗星', py: 'score = score + 1' },
  { line: 4, indent: 4, cn: 'score = score + 5  // 吃大金币', py: 'score = score + 5' },
  { line: 5, indent: 4, cn: '返回 score', py: 'return score' },
];

export const variablesBoxLesson: Lesson = {
  id: 'variables-box',
  chapterId: 'ch-2',
  chapterNum: '02',
  orderInChapter: 4,
  totalInChapter: 4,
  title: '魔法小盒子：变量与计分',
  subtitle: '贴上名字标签的记忆盒，随时读取和改写',
  concepts: ['变量', '赋值', '计分板', '内存', '覆盖'],
  status: 'ready',
  factsTitle: '内存盒子实时值',
  codeLines: VAR_CODE,
  steps: [
    {
      id: 'v1-box',
      label: '贴上名字的记忆盒',
      kind: '概念',
      companionMood: 'curious',
      companionLine: '打游戏时，屏幕右上角的得分是怎么随时变大的？全靠「变量」这个魔法小盒子！',
      body: [
        '<strong>变量（Variable）</strong>就像一个透明的 2.5D 小盒子：外面贴着一个名字标签（比如 <strong>score</strong>），里面装着一个随时可以换掉的数字。',
        '执行第 2 行 <strong>score = 0</strong>，就是拿出一个新盒子贴上 score，往里面放进数字 <strong>0</strong>。',
      ],
      note: {
        title: '小心等号“=”的真正含义',
        icon: 'bulb',
        text: '在编程里，“=”不是数学里的“等于”，而是“把右边的东西装进左边的盒子里”（叫做赋值）！',
      },
      state: {
        scene: 'variable-box',
        boxes: [{ name: 'score', value: 0, highlight: true, deltaText: '初始 = 0' }],
        tagText: '创建盒子 score = 0',
        tagTone: 'coral',
      },
      lines: [2],
      facts: {
        rows: [
          { label: '盒子名字', value: 'score' },
          { label: '盒子里的数', value: 0, active: true },
        ],
        note: '你可以把任何游戏得分、生命值、名字都装进变量盒子里。',
      },
    },
    {
      id: 'v2-add1',
      label: '读出来，加 1，再装回去',
      kind: '演示',
      companionMood: 'happy',
      companionLine: '吃掉一颗星星！先偷看盒子里是 0，算完 0 + 1 = 1，再把 1 盖回去！',
      body: [
        '看第 3 行神奇的写法：<strong>score = score + 1</strong>！数学课上这肯定不成立，但在编程里超好用：',
        '电脑先算出右边 <strong>0 + 1 = 1</strong>，再把新结果 <strong>1</strong> 放回 score 盒子里，原来的 0 就被新数字覆盖掉了！',
      ],
      state: {
        scene: 'variable-box',
        boxes: [{ name: 'score', value: 1, highlight: true, deltaText: '0 + 1 → 1' }],
        incomingToken: '+1',
        tagText: 'score 变成 1 了！',
        tagTone: 'coral',
      },
      lines: [3],
      facts: {
        rows: [
          { label: '原来是', value: 0 },
          { label: '计算右边', value: '0 + 1 = 1' },
          { label: '盒子新值', value: 1, active: true },
        ],
        note: '记住口诀：先算等号右边，再装进左边盒子！',
      },
    },
    {
      id: 'v3-add5',
      label: '吃掉大金币 +5 分',
      kind: '演示',
      companionMood: 'excited',
      companionLine: '哇，捡到一个 +5 大金币！盒子里的 1 瞬间升级成 6 啦！',
      body: [
        '紧接着执行第 4 行 <strong>score = score + 5</strong>。现在盒子里装的是 1，1 + 5 = <strong>6</strong>！',
        '你还可以同时在桌台上放好几个不同的盒子，比如一边用 <strong>score</strong> 记分数，一边用 <strong>lives</strong> 记还剩几条命。',
      ],
      quiz: {
        id: 'quiz-variable-overwrite',
        question: '先猜一猜：如果现在 score 盒子里装着 6，接着执行 score = 100，盒子里会变成什么？',
        options: [
          { label: '变成 106', feedback: '注意哦！这里写的是 score = 100，没有写 score + 100，旧值会被直接覆盖掉！' },
          { label: '变成 100（旧的 6 被盖掉了）', correct: true, feedback: '太敏锐了！变量盒子一次只能装 1 个值，放进新的就会替换掉旧的！' },
          { label: '同时装着 6 和 100', feedback: '单个变量盒子只能装 1 个值，想装一排值要用第 3 章的「数组」哦！' },
        ],
        rewardStars: 10,
      },
      state: {
        scene: 'variable-box',
        boxes: [
          { name: 'score', value: 6, highlight: true, deltaText: '1 + 5 → 6' },
          { name: 'lives', value: 3, highlight: false, deltaText: '生命值' },
        ],
        incomingToken: '+5',
        tagText: 'score = 6 · lives = 3',
        tagTone: 'coral',
      },
      lines: [4, 5],
      facts: {
        rows: [
          { label: 'score', value: 6, active: true },
          { label: 'lives', value: 3 },
        ],
        note: '每个变量都有独立的名字，互不打架！',
      },
    },
    {
      id: 'v4-ready',
      label: '冲刺 10 分开大门',
      kind: '实战',
      companionMood: 'proud',
      companionLine: '终点大门需要 score 刚好等于 10 才能打开！快来实验台点指令凑够 10 分！',
      body: [
        '变量让程序拥有了“记忆力”——没有变量，游戏就记不住你的最高分和背包里的道具。',
        '点击「进入动手挑战」，组合使用 <strong>+3</strong>、<strong>+2</strong> 和 <strong>-1</strong> 指令，把 score 盒子精准调到 <strong>10</strong>！',
      ],
      state: {
        scene: 'variable-box',
        boxes: [{ name: 'score', value: 0, highlight: true, deltaText: '目标 = 10' }],
        tagText: '目标：让 score 等于 10',
        tagTone: 'dark',
      },
      lines: [2, 3, 4],
      facts: {
        rows: [
          { label: '当前 score', value: 0 },
          { label: '开门密码', value: 10, active: true },
        ],
        note: '小心别加超了哦，超了也可以用 -1 扣回来！',
      },
    },
  ],
  challenge: {
    type: 'variable-counter',
    title: '魔法计分盒：精准把 score 调到 10',
    prompt: '点击下方赋值指令按钮，观察 2.5D 变量盒子里的数值变化，让 score 刚好等于 10 打开通关大门！',
    varName: 'score',
    targetValue: 10,
    operations: [
      { label: '+3 大星星', delta: 3, codePy: 'score = score + 3' },
      { label: '+2 小金币', delta: 2, codePy: 'score = score + 2' },
      { label: '-1 扣一分', delta: -1, codePy: 'score = score - 1' },
    ],
  },
};

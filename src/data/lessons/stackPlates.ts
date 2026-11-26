import { BilingualCodeLine, Lesson } from '../../types/course';

const STACK_CODE: BilingualCodeLine[] = [
  { line: 1, indent: 0, cn: '压入(x):', py: 'def push(stack, x):', isHead: true },
  { line: 2, indent: 4, cn: '把 x 叠到最顶上', py: 'stack.append(x)' },
  { line: 3, indent: 0, cn: ' ', py: ' ' },
  { line: 4, indent: 0, cn: '弹出():', py: 'def pop(stack):', isHead: true },
  { line: 5, indent: 4, cn: '如果 栈是空的: 报错', py: 'if len(stack) == 0: raise Error' },
  { line: 6, indent: 4, cn: '拿走最顶上那块并返回', py: 'return stack.pop()' },
  { line: 7, indent: 0, cn: ' ', py: ' ' },
  { line: 8, indent: 0, cn: '偷看顶部():', py: 'def top(stack):', isHead: true },
  { line: 9, indent: 4, cn: '只看最顶上那块，不拿走', py: 'return stack[-1]' },
];

const SUN = { id: 'p1', label: '画太阳' };
const SKY = { id: 'p2', label: '涂蓝天' };
const CLOUD = { id: 'p3', label: '画云朵' };
const BIRD = { id: 'p4', label: '画小鸟' };

export const stackPlatesLesson: Lesson = {
  id: 'stack-plates',
  chapterId: 'ch-3',
  chapterNum: '03',
  orderInChapter: 2,
  totalInChapter: 4,
  title: '像叠盘子一样的栈',
  subtitle: '画画软件的“撤回键”背后藏着什么秘密？',
  concepts: ['栈', 'Stack', 'LIFO', '后进先出', 'Push', 'Pop', '撤回'],
  status: 'ready',
  factsTitle: '当前栈状态',
  codeLines: STACK_CODE,
  steps: [
    {
      id: 's1-plates',
      label: '什么是栈？',
      kind: '概念',
      body: [
        '<strong>栈（Stack）</strong>就像厨房里一摞叠起来的盘子：新盘子只能叠到<strong>最顶上</strong>，拿盘子也只能从<strong>最顶上</strong>拿。',
        '所以最后放上去的那一块，一定会最先被拿出来——这就是程序员常说的 <strong>后进先出（LIFO）</strong>。',
      ],
      companionMood: 'curious',
      companionLine: '试试用鼠标点一下最底下的「画太阳」方块，猜猜能不能直接把它抽出来？',
      note: {
        title: '想象一下',
        icon: 'bulb',
        text: '舞台中央记录着你刚才画画的 3 步操作，左边输入托盘里正准备画第 4 步「画小鸟」。',
      },
      state: {
        scene: 'stack-plates',
        stack: [SUN, SKY, CLOUD],
        inbox: BIRD,
        out: [],
        op: 'idle',
        tagText: '最顶上：画云朵',
        tagAnchor: 'top',
      },
      facts: {
        rows: [
          { label: '栈内高度', value: 3 },
          { label: '当前栈顶', value: '画云朵', active: true },
          { label: '待压入', value: '画小鸟' },
        ],
        note: '没人会直接从盘子摞的正中间往外抽！',
      },
    },
    {
      id: 's2-push',
      label: 'Push：叠到顶上',
      kind: '操作',
      body: [
        '<strong>压入（Push）</strong>把新方块放到最顶上。看「画小鸟」离开左侧输入托盘，稳稳落到了整摞方块的最上面！',
        '下面的 3 块完全不用挪动位置，所以不管叠了 3 块还是 300 万块，压入永远只需要 <strong>1 步</strong>。',
      ],
      note: {
        title: '速度极快',
        icon: 'bolt',
        text: '每次 Push 只碰最顶上，复杂度是 O(1)——瞬间完成！',
      },
      lines: [1, 2],
      state: {
        scene: 'stack-plates',
        stack: [SUN, SKY, CLOUD, BIRD],
        out: [],
        op: 'push',
        highlightTop: true,
        tagText: 'push → 画小鸟',
        tagAnchor: 'top',
      },
      facts: {
        rows: [
          { label: '执行操作', value: 'push(画小鸟)', active: true },
          { label: '栈内高度', value: 4 },
          { label: '当前栈顶', value: '画小鸟' },
        ],
        note: '新元素成为新的栈顶。',
      },
    },
    {
      id: 's3-top',
      label: 'Top：只看不拿',
      kind: '操作',
      body: [
        '<strong>偷看顶部（Top / Peek）</strong>用来确认最上面那块是谁，但不会把它拿下来。',
        '看完之后，整摞方块的数量和顺序丝毫不变，依然是 4 块。',
      ],
      lines: [8, 9],
      state: {
        scene: 'stack-plates',
        stack: [SUN, SKY, CLOUD, BIRD],
        out: [],
        op: 'top',
        highlightTop: true,
        tagText: 'top() → 画小鸟',
        tagAnchor: 'top',
      },
      facts: {
        rows: [
          { label: '执行操作', value: 'top()', active: true },
          { label: '返回值', value: '画小鸟' },
          { label: '栈内高度', detail: '保持不变', value: 4 },
        ],
        note: '只查看不移走，安全无副作用。',
      },
    },
    {
      id: 's4-pop1',
      label: 'Pop：按一次撤回',
      kind: '操作',
      body: [
        '突然觉得小鸟画歪了，按一下「撤回键」！电脑立刻执行 <strong>弹出（Pop）</strong>，把最顶上的「画小鸟」移到右边输出托盘。',
        '刚才最后画的一步，第一个被撤掉，露出了下面的「画云朵」。',
      ],
      companionMood: 'excited',
      companionLine: '画小鸟被弹出来啦！如果现在再按一次撤回键，下一块飞出来的会是谁？',
      quiz: {
        id: 'quiz-stack-lifo',
        question: '先猜一猜：现在栈里从下到上是【画太阳 → 涂蓝天 → 画云朵】，再按一次 Pop 会拿走哪块？',
        options: [
          { label: '画太阳', feedback: '画太阳被压在最底下动弹不得呢，只能拿最顶上那一块！' },
          { label: '涂蓝天', feedback: '涂蓝天上面还压着一块云朵，要先拿走云朵才够得到它哦。' },
          { label: '画云朵', correct: true, feedback: '答对啦！永远是「后进先出」，最顶上的画云朵第一个飞出来！' },
        ],
        rewardStars: 10,
      },
      note: {
        title: '小心空栈',
        icon: 'alert',
        text: '如果盘子已经拿空了还强行 Pop，程序就会报错，所以代码里要先检查栈是不是空的。',
      },
      lines: [4, 5, 6],
      state: {
        scene: 'stack-plates',
        stack: [SUN, SKY, CLOUD],
        out: [BIRD],
        op: 'pop',
        tagText: 'pop() → 画小鸟',
        tagAnchor: 'out',
      },
      facts: {
        rows: [
          { label: '执行操作', value: 'pop()', active: true },
          { label: '已撤回', chips: [{ text: '画小鸟', tone: 'best' }] },
          { label: '新栈顶', value: '画云朵' },
          { label: '栈内高度', value: 3 },
        ],
        note: '最后进入的「画小鸟」最先被弹出。',
      },
    },
    {
      id: 's5-pop2',
      label: '再撤回一次',
      kind: '规律',
      body: [
        '再按一次撤回，「画云朵」也飞进了输出托盘。它们进去的顺序是太阳、蓝天、云朵、小鸟，出来的顺序却是<strong>小鸟、云朵…</strong>',
        '栈总会按<strong>完全相反的顺序</strong>把东西还给你！想拿到压在最底下的「画太阳」，必须先把上面的都拿走。',
      ],
      lines: [4, 5, 6],
      state: {
        scene: 'stack-plates',
        stack: [SUN, SKY],
        out: [BIRD, CLOUD],
        op: 'pop',
        tagText: 'pop() → 画云朵',
        tagAnchor: 'out',
      },
      facts: {
        rows: [
          { label: '已撤回顺序', chips: [{ text: '画小鸟' }, { text: '画云朵', tone: 'best' }] },
          { label: '新栈顶', value: '涂蓝天' },
          { label: '栈内高度', value: 2 },
        ],
        note: '先进后出、后进先出，正好倒序输出。',
      },
    },
    {
      id: 's6-realworld',
      label: '生活中的魔法栈',
      kind: '实战',
      body: [
        '除了画画软件的<strong>撤回键（Ctrl+Z）</strong>，浏览器的<strong>「返回上一页」</strong>按钮、甚至程序运行时的函数调用，全都在背后默默用着栈！',
        '点击下方「进入动手挑战」，亲自按 Push 和 Pop 按钮，把画错的两步撤回并补上正确的步骤吧！',
      ],
      state: {
        scene: 'stack-plates',
        stack: [
          { id: 'w1', label: '首页' },
          { id: 'w2', label: '搜索页' },
          { id: 'w3', label: '详情页' },
        ],
        out: [],
        op: 'idle',
        highlightTop: true,
        tagText: '浏览器返回栈',
        tagAnchor: 'top',
      },
      facts: {
        rows: [
          { label: '核心规则', value: '后进先出 LIFO', active: true },
          { label: '经典应用', chips: [{ text: '撤回键' }, { text: '网页返回' }] },
        ],
        note: '去动手实验台亲自操控 2.5D 栈方块吧！',
      },
    },
  ],
  challenge: {
    type: 'stack-undo',
    title: '动手实验：当一回“撤回键”管理员',
    prompt: '哎呀，画画时最后两步手抖画成了「打翻颜料」和「歪线条」！请先连续点「撤回 Pop」清掉它们，再点「压入 Push」叠上正确的「画彩虹」吧！',
    initialStack: [
      { id: 'c1', label: '画太阳' },
      { id: 'c2', label: '涂蓝天' },
      { id: 'c3', label: '歪线条' },
      { id: 'c4', label: '打翻颜料' },
    ],
    queueToPush: [{ id: 'c5', label: '画彩虹' }],
    targetStackLabels: ['画太阳', '涂蓝天', '画彩虹'],
  },
};

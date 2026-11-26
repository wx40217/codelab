import { BilingualCodeLine, Lesson } from '../../types/course';

const QUEUE_CODE: BilingualCodeLine[] = [
  { line: 1, indent: 0, cn: '入队(客人):', py: 'def enqueue(queue, guest):', isHead: true },
  { line: 2, indent: 4, cn: '客人排到队伍最后面', py: 'queue.append(guest)' },
  { line: 3, indent: 0, cn: ' ', py: ' ' },
  { line: 4, indent: 0, cn: '出队():', py: 'def dequeue(queue):', isHead: true },
  { line: 5, indent: 4, cn: '最前面那位领走奶茶并离开', py: 'return queue.pop(0)' },
];

const G1 = { id: 'g1', label: '小明' };
const G2 = { id: 'g2', label: '小红' };
const G3 = { id: 'g3', label: '阿派' };

export const queueLineLesson: Lesson = {
  id: 'queue-line',
  chapterId: 'ch-3',
  chapterNum: '03',
  orderInChapter: 3,
  totalInChapter: 4,
  title: '排队买奶茶：队列',
  subtitle: '先来的先拿到，公平的先进先出规则',
  concepts: ['队列', 'Queue', 'FIFO', '入队', '出队'],
  status: 'ready',
  factsTitle: '奶茶店排队状态',
  codeLines: QUEUE_CODE,
  steps: [
    {
      id: 'q1-fair',
      label: '公平排队的规则',
      kind: '概念',
      companionMood: 'happy',
      companionLine: '跟叠盘子的“栈”不一样，买奶茶可不能让最后来的人先拿，大家要乖乖排队！',
      body: [
        '<strong>队列（Queue）</strong>就像奶茶店门口的排队通道：新来的人必须排到<strong>队尾（后面）</strong>，最先排到的人从<strong>队头（前面）</strong>先拿奶茶！',
        '这种「先来的先拿到」的公平规则，叫做 <strong>先进先出（FIFO）</strong>。',
      ],
      state: {
        scene: 'queue-line',
        queue: [G1, G2],
        incoming: G3,
        served: [],
        op: 'idle',
        tagText: '队头是先来的小明',
        tagAnchor: 'front',
      },
      lines: [1, 4],
      facts: {
        rows: [
          { label: '队头（下一位）', value: '小明', active: true },
          { label: '排队人数', value: 2 },
          { label: '刚到门口', value: '阿派' },
        ],
        note: '栈是一头进出（后进先出），队列是两头进出（先进先出）！',
      },
    },
    {
      id: 'q2-enqueue',
      label: 'Enqueue：排到队尾',
      kind: '操作',
      companionMood: 'curious',
      companionLine: '我刚跑过来买奶茶，礼貌地站到小红后面，绝对不插队！',
      body: [
        '执行 <strong>入队（Enqueue）</strong>，阿派从左边进入通道，稳稳站到了队伍的最后面。',
        '现在队伍顺序是：<strong>小明（队头） → 小红 → 阿派（队尾）</strong>。',
      ],
      state: {
        scene: 'queue-line',
        queue: [G1, G2, G3],
        served: [],
        op: 'enqueue',
        tagText: 'enqueue → 阿派排到队尾',
        tagAnchor: 'back',
      },
      lines: [1, 2],
      facts: {
        rows: [
          { label: '执行操作', value: 'enqueue(阿派)', active: true },
          { label: '队头', value: '小明' },
          { label: '队尾', value: '阿派' },
        ],
        note: '不管来多少新客人，队头依然稳稳是排得最久的小明。',
      },
    },
    {
      id: 'q3-dequeue',
      label: 'Dequeue：队头先领奶茶',
      kind: '操作',
      companionMood: 'excited',
      companionLine: '叮咚！第一杯奶茶做好了，最前面的小明领走奶茶，小红自动往前走一步变成新队头！',
      body: [
        '执行 <strong>出队（Dequeue）</strong>，队头的小明拿走珍珠奶茶开心地离开，后面的小红和阿派一起往前迈一步！',
        '打印机排队打作业、王者荣耀排队匹配对手，幕后用的全都是队列！',
      ],
      quiz: {
        id: 'quiz-queue-vs-stack',
        question: '先猜一猜：小明、小红、阿派依次进入「队列」，谁会第一个离开队伍？',
        options: [
          { label: '阿派', feedback: '最后来最先走的是「栈」，排队买奶茶的「队列」要讲先来后到哦！' },
          { label: '小明', correct: true, feedback: '答对啦！先来的小明最先拿到奶茶，这就是 FIFO（先进先出）！' },
          { label: '小红', feedback: '小红排在第二位，要等前面的小明先领完才轮到她～' },
        ],
        rewardStars: 10,
      },
      state: {
        scene: 'queue-line',
        queue: [G2, G3],
        served: [G1],
        op: 'dequeue',
        tagText: 'dequeue() → 小明领走 🧋',
        tagAnchor: 'served',
      },
      lines: [4, 5],
      facts: {
        rows: [
          { label: '刚出队', value: '小明 🧋', active: true },
          { label: '新队头', value: '小红' },
          { label: '剩余排队', value: '2 人' },
        ],
        note: '接下来去挑战里当一回奶茶店小店长吧！',
      },
    },
  ],
  challenge: {
    type: 'queue-shop',
    title: '奶茶店小店长：指挥公平队列',
    prompt: '先点击「入队」让新来的「阿派」排到队尾，再连续点击「出队」按先后顺序给「小明」和「小红」发奶茶吧！（也可以直接点舞台上的方块哦）',
    initialQueue: [
      { id: 'q-xm', label: '小明' },
      { id: 'q-xh', label: '小红' },
    ],
    incomingList: [{ id: 'q-ap', label: '阿派' }],
    targetServedLabels: ['小明', '小红'],
  },
};

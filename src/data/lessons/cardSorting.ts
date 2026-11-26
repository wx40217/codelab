import { BilingualCodeLine, Lesson } from '../../types/course';

const SORT_CODE: BilingualCodeLine[] = [
  { line: 1, indent: 0, cn: '冒泡排序(方块列表):', py: 'def bubble_sort(arr):', isHead: true },
  { line: 2, indent: 4, cn: '重复多轮 直到排整齐:', py: 'for round in range(len(arr)):' },
  { line: 3, indent: 8, cn: '对比相邻的两个方块 i 和 i+1:', py: 'for i in range(len(arr) - 1):' },
  { line: 4, indent: 12, cn: '如果 左边 > 右边:', py: 'if arr[i] > arr[i + 1]:' },
  { line: 5, indent: 16, cn: '交换它们的位置！', py: 'arr[i], arr[i+1] = arr[i+1], arr[i]' },
];

export const cardSortingLesson: Lesson = {
  id: 'card-sorting',
  chapterId: 'ch-4',
  chapterNum: '04',
  orderInChapter: 3,
  totalInChapter: 3,
  title: '整理扑克牌：排序初体验',
  subtitle: '把高矮乱七八糟的数字方块从小到大排整齐',
  concepts: ['排序', '冒泡排序', '比较', '交换', '有序'],
  status: 'ready',
  factsTitle: '排序对比状态',
  codeLines: SORT_CODE,
  steps: [
    {
      id: 'st1-messy',
      label: '高矮不齐的方块队',
      kind: '概念',
      companionMood: 'curious',
      companionLine: '刚才学二分查找要先“排好队”，可如果拿到的数字是乱的，电脑怎么给它们排整齐呢？',
      body: [
        '看舞台上这 4 根高矮不同的 2.5D 数字柱：<strong>[8, 3, 5, 2]</strong>，乱七八糟的。',
        '最直观的办法叫<strong>冒泡排序（Bubble Sort）</strong>：就像体育课按身高排队，每次只看<strong>紧挨着的两个</strong>，谁更高就往右换！',
      ],
      state: {
        scene: 'iso-strip',
        baseLabel: '乱序方块 [8, 3, 5, 2]',
        pointerIdx: 0,
        tagText: '比一比：8 比 3 高 → 交换！',
        tagTone: 'coral',
        items: [
          { id: 'b8', top: '8', sub: '左', height: 64, tone: 'found', lift: 8 },
          { id: 'b3', top: '3', sub: '右', height: 28, tone: 'active', lift: 8 },
          { id: 'b5', top: '5', sub: ' ', height: 42, tone: 'paper' },
          { id: 'b2', top: '2', sub: ' ', height: 20, tone: 'paper' },
        ],
      },
      lines: [3, 4],
      facts: {
        rows: [
          { label: '正在比较', value: '8 和 3', active: true },
          { label: '需要交换？', value: '是（8 > 3）' },
        ],
        note: '电脑一次只能比较相邻的两个数字，但它手速超快！',
      },
    },
    {
      id: 'st2-bubble',
      label: '最大的数字一路“冒泡”到最右',
      kind: '演示',
      companionMood: 'excited',
      companionLine: '8 跟 3 换、跟 5 换、再跟 2 换——像水里的最大泡泡一样咕噜咕噜浮到了最右边！',
      body: [
        '第一轮扫描结束后，最高的 <strong>8</strong> 一路向右交换，稳稳站到了最右边终点位置！',
        '因为每跑完一轮，当前最大的数字就会像泡泡一样浮到最右边，所以这个经典算法才叫做<strong>冒泡排序</strong>。',
      ],
      quiz: {
        id: 'quiz-sort-rule',
        question: '先猜一猜：要从小到大排序，如果左边是 3、右边是 5，需要交换它们吗？',
        options: [
          { label: '需要交换', feedback: '如果换了就变成 [5, 3]，反而大的跑到左边去了哦！' },
          { label: '不用换，已经从小到大啦', correct: true, feedback: '完全正确！3 < 5 顺序本来就对，直接跳过看下一对！' },
        ],
        rewardStars: 10,
      },
      state: {
        scene: 'iso-strip',
        baseLabel: '第 1 轮完成：8 已就位',
        pointerIdx: 3,
        tagText: '最大方块 8 浮到最右边！',
        tagTone: 'coral',
        items: [
          { id: 'b3', top: '3', sub: ' ', height: 28, tone: 'paper' },
          { id: 'b5', top: '5', sub: ' ', height: 42, tone: 'paper' },
          { id: 'b2', top: '2', sub: ' ', height: 20, tone: 'paper' },
          { id: 'b8', top: '8', sub: '已就位', height: 64, tone: 'found', lift: 6 },
        ],
      },
      lines: [2, 5],
      facts: {
        rows: [
          { label: '第 1 轮结果', value: '[3, 5, 2, 8]' },
          { label: '已锁定终点', value: '8', active: true },
        ],
        note: '再来两轮，5 和 3 也会依次归位！',
      },
    },
    {
      id: 'st3-sorted',
      label: '整齐的上升阶梯！',
      kind: '实战',
      companionMood: 'proud',
      companionLine: '瞧！[2, 3, 5, 8] 排成了漂亮的 2.5D 小阶梯！快进挑战里亲手交换整理一次！',
      body: [
        '重复比较和交换，所有方块最终排成了从小到大的整齐阶梯：<strong>[2, 3, 5, 8]</strong>！',
        '点击「进入动手挑战」，亲自扮演冒泡排序机器人，点击交换相邻方块把打乱的队伍排整齐吧！',
      ],
      state: {
        scene: 'iso-strip',
        baseLabel: '排序完成 [2, 3, 5, 8]',
        pointerIdx: 3,
        tagText: '完美排成上升阶梯 ★',
        tagTone: 'coral',
        items: [
          { id: 'b2', top: '2', sub: '#1', height: 20, tone: 'active' },
          { id: 'b3', top: '3', sub: '#2', height: 28, tone: 'active' },
          { id: 'b5', top: '5', sub: '#3', height: 42, tone: 'active' },
          { id: 'b8', top: '8', sub: '#4', height: 64, tone: 'found', lift: 6 },
        ],
      },
      lines: [1, 2, 3, 4, 5],
      facts: {
        rows: [
          { label: '最终顺序', value: '2 < 3 < 5 < 8', active: true },
          { label: '掌握算法', value: '冒泡排序' },
        ],
        note: '排好序的数据，马上就可以配合二分查找飞速搜索啦！',
      },
    },
  ],
  challenge: {
    type: 'bubble-sorter',
    title: '动手排序师：交换相邻方块排成小阶梯',
    prompt: '点击下方任意「交换相邻两块」按钮（或直接点击舞台上的方块与右邻居交换），把 [7, 2, 9, 4] 从小到大排成 [2, 4, 7, 9]！',
    initialValues: [7, 2, 9, 4],
  },
};

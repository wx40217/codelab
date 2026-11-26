import { BilingualCodeLine, Lesson, TreeNodeItem } from '../../types/course';

const TREE_CODE: BilingualCodeLine[] = [
  { line: 1, indent: 0, cn: '树节点:', py: 'class Node:', isHead: true },
  { line: 2, indent: 4, cn: '名字        // 比如 A、B、C', py: 'value' },
  { line: 3, indent: 4, cn: '左孩子      // 另一个节点，或者空', py: 'left = None' },
  { line: 4, indent: 4, cn: '右孩子      // 另一个节点，或者空', py: 'right = None' },
  { line: 5, indent: 0, cn: ' ', py: ' ' },
  { line: 6, indent: 0, cn: '整棵树:', py: 'class Tree:', isHead: true },
  { line: 7, indent: 4, cn: '树根 = A    // 最顶上的唯一老大', py: 'root = Node("A")' },
];

const FULL_TREE: TreeNodeItem[] = [
  { id: 'A', label: 'A', level: 0, slot: 0 },
  { id: 'B', label: 'B', level: 1, slot: 0 },
  { id: 'C', label: 'C', level: 1, slot: 1 },
  { id: 'D', label: 'D', level: 2, slot: 0 },
  { id: 'E', label: 'E', level: 2, slot: 1 },
  { id: 'F', label: 'F', level: 2, slot: 2 },
  { id: 'G', label: 'G', level: 2, slot: 3 },
];

export const binaryTreeLesson: Lesson = {
  id: 'binary-tree-family',
  chapterId: 'ch-3',
  chapterNum: '03',
  orderInChapter: 4,
  totalInChapter: 4,
  title: '分叉的家族树：二叉树',
  subtitle: '一个节点长出左右两个分叉，信息瞬间翻倍',
  concepts: ['二叉树', '根节点', '叶子节点', '层级', '高度'],
  status: 'ready',
  factsTitle: '这棵树的数据',
  codeLines: TREE_CODE,
  steps: [
    {
      id: 'tr1-root',
      label: '一个节点，两个孩子',
      kind: '概念',
      companionMood: 'curious',
      companionLine: '把大树倒过来画：树根长在最顶上，树叶长在最下面，就是计算机里的「二叉树」！',
      body: [
        '在 <strong>二叉树（Binary Tree）</strong> 里，最顶上唯一的起点叫做<strong>根节点（Root）</strong>——这里是节点 <strong>A</strong>。',
        '每个节点最多可以往下分出两条树枝：左边是<strong>左孩子 B</strong>，右边是<strong>右孩子 C</strong>。',
      ],
      state: {
        scene: 'binary-tree',
        nodes: [
          { id: 'A', label: 'A', level: 0, slot: 0, tone: 'found' },
          { id: 'B', label: 'B', level: 1, slot: 0, tone: 'active' },
          { id: 'C', label: 'C', level: 1, slot: 1, tone: 'active' },
        ],
        focusNodeId: 'A',
        tagText: '树根 A 分出 B 和 C',
        tagTone: 'coral',
      },
      lines: [1, 3, 4, 7],
      facts: {
        rows: [
          { label: '树根', value: 'A', active: true },
          { label: '节点总数', value: 3 },
          { label: '每个节点最多', value: '2 个孩子' },
        ],
        note: '“二”叉树的意思就是每个分叉最多分成 2 条路！',
      },
    },
    {
      id: 'tr2-leaves',
      label: '它不断分叉，长出叶子',
      kind: '概念',
      companionMood: 'excited',
      companionLine: 'B 和 C 又各自生出了两个孩子！最底下一排没有孩子的节点，叫做「叶子」！',
      body: [
        '每个孩子还可以继续长出自己的两个孩子，一直往下分叉。',
        '最底下一排<strong>没有任何孩子</strong>的节点叫做<strong>叶子（Leaf）</strong>。这里 <strong>D、E、F、G</strong> 全都是叶子！',
      ],
      quiz: {
        id: 'quiz-tree-leaves',
        question: '先猜一猜：在这棵 7 个节点的二叉树里，一共有几片“叶子”（没有孩子的节点）？',
        options: [
          { label: '2 片', feedback: '最下面一排不止 2 个哦，数数看 D、E、F、G 一共有几个！' },
          { label: '4 片', correct: true, feedback: '眼睛雪亮！D、E、F、G 四个节点都没有孩子，一共有 4 片叶子！' },
          { label: '7 片', feedback: 'A、B、C 都有孩子，所以它们不是叶子节点哦～' },
        ],
        rewardStars: 10,
      },
      state: {
        scene: 'binary-tree',
        nodes: FULL_TREE.map((n) => ({
          ...n,
          tone: n.level === 2 ? 'active' : 'paper',
        })),
        focusNodeId: 'D',
        tagText: 'D 是一片叶子（没有孩子）',
        tagTone: 'coral',
      },
      lines: [1, 2, 3, 4],
      facts: {
        rows: [
          { label: '节点总数', value: 7 },
          { label: '叶子数量', detail: '没有孩子', value: 4, active: true },
          { label: '树高', detail: '最长的向下路径', value: 2 },
        ],
        note: '从树根往下的每一条路，最终都会停在一片叶子上。',
      },
    },
    {
      id: 'tr3-power',
      label: '每多一层，容量翻倍',
      kind: '规律',
      companionMood: 'proud',
      companionLine: '第 1 层 1 个、第 2 层 2 个、第 3 层 4 个……再长下去，只要 20 层就能装下超过 100 万个节点！',
      body: [
        '仔细数一数每一层有多少个节点：<strong>1 → 2 → 4 → 8 → 16…</strong> 又遇到了我们熟悉的“翻倍魔法”！',
        '电脑里的文件夹目录、游戏里的关卡技能树、甚至搜索引擎查找海量网页，全靠树结构飞速分流！',
      ],
      state: {
        scene: 'binary-tree',
        nodes: FULL_TREE.map((n) => ({
          ...n,
          tone: n.level === 0 ? 'found' : n.level === 1 ? 'active' : 'paper',
        })),
        focusNodeId: 'A',
        tagText: '1 + 2 + 4 = 7 个节点',
        tagTone: 'dark',
      },
      lines: [6, 7],
      facts: {
        rows: [
          { label: '每层节点数', chips: [{ text: '1' }, { text: '2' }, { text: '4', tone: 'best' }] },
          { label: '10 层最多装', value: '1,023 个', active: true },
        ],
        note: '接下来去挑战里亲手点亮这棵树上的所有“叶子”吧！',
      },
    },
  ],
  challenge: {
    type: 'tree-explorer',
    title: '森林小探险：点亮全部 4 片「叶子节点」',
    prompt: '直接点击 2.5D 二叉树舞台上所有「没有孩子」的叶子节点把它们全部点亮！（点到有孩子的树干节点阿派会提醒你哦）',
    nodes: FULL_TREE,
    leafIds: ['D', 'E', 'F', 'G'],
  },
};

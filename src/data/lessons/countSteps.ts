import { BilingualCodeLine, Lesson } from '../../types/course';

const BIGO_CODE: BilingualCodeLine[] = [
  { line: 1, indent: 0, cn: '拿第一个(列表):        // O(1)', py: 'def first(a):           # O(1)', isHead: true },
  { line: 2, indent: 4, cn: '返回 列表[0]', py: 'return a[0]' },
  { line: 3, indent: 0, cn: ' ', py: ' ' },
  { line: 4, indent: 0, cn: '折半猜(列表, 目标):    // O(log n)', py: 'def search(a, x):       # O(log n)', isHead: true },
  { line: 5, indent: 4, cn: '重复：看中间，扔掉一半', py: 'while lo <= hi: cut_half()' },
  { line: 6, indent: 0, cn: ' ', py: ' ' },
  { line: 7, indent: 0, cn: '逐个找(列表):          // O(n)', py: 'def scan(a):            # O(n)', isHead: true },
  { line: 8, indent: 4, cn: '对每个 项：看一遍', py: 'for item in a: check(item)' },
];

export const countStepsLesson: Lesson = {
  id: 'count-steps',
  chapterId: 'ch-4',
  chapterNum: '04',
  orderInChapter: 1,
  totalInChapter: 3,
  title: '数步数，不数秒数',
  subtitle: '怎么公平比较两个办法谁更聪明？大 O 初体验',
  concepts: ['效率', '步数', '大O表示法', '增长', '算法'],
  status: 'ready',
  factsTitle: '四种算法所用步数',
  codeLines: BIGO_CODE,
  steps: [
    {
      id: 'o1-n2',
      label: '数步数，不数秒数',
      kind: '概念',
      companionMood: 'curious',
      companionLine: '新电脑跑得快、老电脑跑得慢，所以比谁的办法更聪明，不能看秒表，要数「步数」！',
      body: [
        '一个算法有多快？秒数取决于电脑新不新。所以程序员改为<strong>数步数</strong>，看看当东西变多（n 变大）时，步数会怎么长高！',
        '这里有 4 座平台，各自处理 <strong>n = 2</strong> 个东西。每个小方块代表 1 步工作——现在它们看起来差不多高。',
      ],
      note: {
        title: '注意',
        icon: 'bulb',
        text: '东西很少的时候，几乎什么办法都很快。等 n 变大时，真正惊人的差别才会显现出来！',
      },
      state: {
        scene: 'growth-stairs',
        n: 2,
        tagText: 'n = 2（刚开始差不多）',
      },
      lines: [1, 2],
      facts: {
        rows: [
          { label: 'O(1)', detail: '永远 1 步', value: 1 },
          { label: 'O(log n)', detail: '每次折半', value: 1 },
          { label: 'O(n)', detail: '逐个看完', value: 2 },
          { label: 'O(n²)', detail: '两两配对', value: 4, active: true },
        ],
        note: 'n = 2 时，最慢的平台也才 4 步。',
      },
    },
    {
      id: 'o2-n4',
      label: '东西翻倍：n = 4',
      kind: '扩展',
      companionMood: 'excited',
      companionLine: '把东西翻倍变成 4 个！看最后面那座 O(n²) 平台，瞬间铺满了 16 块小方块！',
      body: [
        '现在给它们 <strong>4 个</strong>东西，而不是 2 个。仔细对比 4 座 2.5D 阶梯的变化：',
        '最前面的 <strong>O(1)</strong> 纹丝不动（依然 1 步），而最后面的 <strong>O(n²)</strong> 一下子暴涨到了 <strong>16 步</strong>！',
      ],
      state: {
        scene: 'growth-stairs',
        n: 4,
        focusTier: 3,
        tagText: 'n = 4 · O(n²) 暴涨到 16 步',
      },
      lines: [4, 5, 7, 8],
      facts: {
        rows: [
          { label: 'O(1)', detail: '常数', value: 1 },
          { label: 'O(log n)', detail: '折半', value: 2 },
          { label: 'O(n)', detail: '线性', value: 4 },
          { label: 'O(n²)', detail: '平方爆炸', value: 16, active: true },
        ],
        note: '这种“随数量增长的形状”，就是计算机界鼎鼎大名的大 O 表示法！',
      },
    },
    {
      id: 'o3-n8',
      label: '再翻一倍：n = 8！',
      kind: '规律',
      companionMood: 'proud',
      companionLine: '哇塞！n = 8 时，O(1) 还是 1 步，折半只要 3 步，而 O(n²) 已经堆出 64 块啦！',
      body: [
        '再翻一倍到 <strong>8 个</strong>东西！差距彻底拉开：最聪明的 <strong>O(log n)</strong> 只需要 <strong>3 步</strong>，而 <strong>O(n²)</strong> 要辛苦做完整整 <strong>64 步</strong>！',
        '选对聪明的算法，比买一台贵十倍的超级电脑还要管用！',
      ],
      quiz: {
        id: 'quiz-bigo-winner',
        question: '先猜一猜：如果要处理 100 万个数据，下面哪种算法步数最少、跑得最快？',
        options: [
          { label: 'O(n²)', feedback: '100 万 × 100 万可是一万亿步，电脑要算到天荒地老啦！' },
          { label: 'O(n)', feedback: '逐个看完 100 万个要 100 万步，还有更快的哦！' },
          { label: 'O(1)', correct: true, feedback: '答对啦！O(1) 不管有多少数据，永远只需要 1 步！就像用门牌号拿数组储物柜！' },
        ],
        rewardStars: 10,
      },
      state: {
        scene: 'growth-stairs',
        n: 8,
        tagText: 'n = 8 · 1 步 vs 64 步！',
      },
      lines: [1, 2, 4, 5],
      facts: {
        rows: [
          { label: 'O(1)', detail: '常数', value: 1 },
          { label: 'O(log n)', detail: '折半', value: 3, active: true },
          { label: 'O(n)', detail: '线性', value: 8 },
          { label: 'O(n²)', detail: '平方', value: 64 },
        ],
        note: '去动手实验台亲自拉动 n，亲眼看着 2.5D 方块生长吧！',
      },
    },
  ],
  challenge: {
    type: 'growth-explorer',
    title: '增长加速器：把输入规模推到 n = 8 见证差距',
    prompt: '点击下方按钮切换输入规模 n = 2、4、8，并把它们都观察一遍，最后停在 n = 8 见证 64 块方块的震撼差距！',
    optionsN: [2, 4, 8],
    targetN: 8,
  },
};

import { BilingualCodeLine, Lesson } from '../../types/course';

const BINARY_CODE: BilingualCodeLine[] = [
  { line: 1, indent: 0, cn: '算数值(开关列表):', py: 'def decode(bits):', isHead: true },
  { line: 2, indent: 4, cn: '权重 = [8, 4, 2, 1]', py: 'weights = [8, 4, 2, 1]' },
  { line: 3, indent: 4, cn: '总和 = 0', py: 'total = 0' },
  { line: 4, indent: 4, cn: '对每个 第 i 个开关:', py: 'for i in range(4):' },
  { line: 5, indent: 8, cn: '如果 开关[i] == 1:', py: 'if bits[i] == 1:' },
  { line: 6, indent: 12, cn: '总和 = 总和 + 权重[i]', py: 'total = total + weights[i]' },
  { line: 7, indent: 4, cn: '返回 总和', py: 'return total' },
];

export const binaryBitsLesson: Lesson = {
  id: 'binary-bits',
  chapterId: 'ch-1',
  chapterNum: '01',
  orderInChapter: 1,
  totalInChapter: 3,
  title: '0 和 1 魔法开关',
  subtitle: '电脑怎么只靠亮和灭记住所有数字？',
  concepts: ['二进制', '0和1', '比特', 'Bit', '权重', '开关'],
  status: 'ready',
  factsTitle: '当前开关读数',
  codeLines: BINARY_CODE,
  steps: [
    {
      id: 'b1-two-states',
      label: '只有两种状态',
      kind: '概念',
      body: [
        '电脑其实并不认识 0 到 9。它肚子里装的，全是像小灯泡一样的微型开关：<strong>亮起代表 1</strong>，<strong>熄灭代表 0</strong>。',
        '这一个只能表示 0 或 1 的小格子，就叫做一个 <strong>比特（Bit）</strong>。现在最右边第 1 个开关亮起，代表数字 1。',
      ],
      companionMood: 'curious',
      companionLine: '嗨！我是阿派 🤖 试试直接用鼠标戳一下左边的 2.5D 开关方块，看看会发出什么声音！',
      note: {
        title: '注意',
        icon: 'bulb',
        text: '只有“开”和“关”两种状态最不容易出错，电流强一点弱一点电脑都不会认错！',
      },
      state: {
        scene: 'binary-bits',
        bits: [0, 0, 0, 1],
        focusBit: 3,
        showWeights: false,
        tagText: '1 = 开 · 0 = 关',
        tagTone: 'coral',
      },
      lines: [1, 5],
      facts: {
        rows: [
          { label: '二进制编码', value: '0 0 0 1' },
          { label: '点亮开关', value: '1 个' },
          { label: '代表数字', value: 1, active: true },
        ],
        note: '最右边 1 个开关亮起，表示数字 1。',
      },
    },
    {
      id: 'b2-weights',
      label: '每往左翻一倍',
      kind: '规律',
      body: [
        '1 个开关最多表示 0 和 1。多加开关时，我们让左边每一格的“能量值”都<strong>翻一倍</strong>：从右往左分别是 <strong>1、2、4、8</strong>。',
        '看舞台！现在只把权重为 2 的那块开关点亮，得到的编码是 0010，代表的正好是数字 <strong>2</strong>。',
      ],
      note: {
        title: '可以这样理解',
        icon: 'bulb',
        text: '就像只有 1 元、2 元、4 元、8 元四种魔法硬币，每种硬币要么拿（1），要么不拿（0）。',
      },
      state: {
        scene: 'binary-bits',
        bits: [0, 0, 1, 0],
        focusBit: 2,
        showWeights: true,
        tagText: '权重 = 2',
        tagTone: 'coral',
      },
      lines: [2],
      facts: {
        rows: [
          { label: '格位权重', chips: [{ text: '8', tone: 'quiet' }, { text: '4', tone: 'quiet' }, { text: '2', tone: 'best' }, { text: '1', tone: 'quiet' }] },
          { label: '二进制编码', value: '0 0 1 0' },
          { label: '代表数字', value: 2, active: true },
        ],
        note: '每往左一格，代表的数字就乘以 2。',
      },
    },
    {
      id: 'b3-add-five',
      label: '开关组合做加法',
      kind: '演示',
      body: [
        '想知道一串 0 和 1 代表几？超级简单：<strong>把所有亮着（为 1）的位子权重加起来</strong>！',
        '这里权重 <strong>4</strong> 和权重 <strong>1</strong> 两个等距开关同时升起亮灯，4 + 1 = <strong>5</strong>。',
      ],
      companionMood: 'happy',
      companionLine: '把亮着的硬币加起来就行！先来考考你的眼力～',
      quiz: {
        id: 'quiz-binary-5',
        question: '先猜一猜：如果把权重 8 和权重 2 同时点亮（1010），代表数字几？',
        options: [
          { label: '82', feedback: '哈哈，不是拼在一起读哦！是把亮起来的权重做加法：8 + 2 = ?' },
          { label: '10', correct: true, feedback: '答对啦！8 + 2 = 10，你瞬间就掌握二进制密码啦！' },
          { label: '6', feedback: '再算算看～ 8 加上 2 会比 8 更大哦！' },
        ],
        rewardStars: 10,
      },
      state: {
        scene: 'binary-bits',
        bits: [0, 1, 0, 1],
        showWeights: true,
        tagText: '4 + 1 = 5',
        tagTone: 'coral',
      },
      lines: [4, 5, 6],
      facts: {
        rows: [
          { label: '二进制编码', value: '0 1 0 1' },
          { label: '亮起的权重', chips: [{ text: '4', tone: 'best' }, { text: '1', tone: 'best' }] },
          { label: '总和结果', value: 5, active: true },
        ],
        note: '熄灭的位子（8 和 2）直接跳过不加。',
      },
    },
    {
      id: 'b4-eleven',
      label: '拼出更大的数：11',
      kind: '演示',
      body: [
        '现在把 <strong>8、2、1</strong> 三个开关同时打开（编码 1011），权重 4 保持熄灭。',
        '电脑顺着代码从左到右扫描一遍：8 + 2 + 1 = <strong>11</strong>。全世界的照片、歌曲和游戏，底层全是这样的开关组合！',
      ],
      state: {
        scene: 'binary-bits',
        bits: [1, 0, 1, 1],
        showWeights: true,
        tagText: '8 + 2 + 1 = 11',
        tagTone: 'coral',
      },
      lines: [4, 5, 6, 7],
      facts: {
        rows: [
          { label: '二进制编码', value: '1 0 1 1' },
          { label: '亮起的权重', chips: [{ text: '8', tone: 'best' }, { text: '2', tone: 'best' }, { text: '1', tone: 'best' }] },
          { label: '总和结果', value: 11, active: true },
        ],
        note: '扫描完 4 个开关，返回最终结果 11。',
      },
    },
    {
      id: 'b5-max-15',
      label: '全部点亮是多少？',
      kind: '规律',
      body: [
        '如果 4 个开关全部打开（1111），8 + 4 + 2 + 1 = <strong>15</strong>。算上全关的 0，4 个开关一共能变出 <strong>16 种</strong>不同数字！',
        '如果再往左边多加 1 个开关（权重 16），能表示的数字范围瞬间就会再翻一倍。',
      ],
      companionMood: 'excited',
      companionLine: '4 个开关全亮啦！如果再往左多放 1 块新开关，它的权重应该是多少呢？',
      quiz: {
        id: 'quiz-binary-next-weight',
        question: '脑筋急转弯：从右往左是 1、2、4、8，第 5 个开关的权重是多少？',
        options: [
          { label: '10', feedback: '差一点！记住规律：每往左一格不是加 2，而是「翻一倍」哦！' },
          { label: '12', feedback: '8 翻一倍可不止 12 哦，再想想 8 × 2 等于几？' },
          { label: '16', correct: true, feedback: '太聪明了！8 × 2 = 16！电脑的世界就是这样不断翻倍变强大的！' },
        ],
        rewardStars: 10,
      },
      note: {
        title: '惊人的威力',
        icon: 'bolt',
        text: '只要 8 个开关（1 字节 Byte）就能表示 256 种状态；32 个开关就能数到超过 40 亿！',
      },
      state: {
        scene: 'binary-bits',
        bits: [1, 1, 1, 1],
        showWeights: true,
        tagText: '8 + 4 + 2 + 1 = 15',
        tagTone: 'coral',
      },
      lines: [7],
      facts: {
        rows: [
          { label: '二进制编码', value: '1 1 1 1' },
          { label: '4 位覆盖率', meter: 1, value: '15 / 15' },
          { label: '组合总数', value: '16 种', active: true },
        ],
        note: '0 到 15 共 16 个数字，全部装进 4 个开关。',
      },
    },
    {
      id: 'b6-ready-lab',
      label: '动手拼出你的数字',
      kind: '实战',
      body: [
        '你已经破译了电脑最底层的秘密语言！试试点一下下方深色代码卡右上角的 <strong>Python</strong>，看看真实代码怎么写出这个加法器。',
        '准备好后点击「进入动手挑战」，亲自点击舞台上的 2.5D 开关方块，帮电脑拼出目标数字 <strong>13</strong>！',
      ],
      state: {
        scene: 'binary-bits',
        bits: [0, 0, 0, 0],
        showWeights: true,
        tagText: '目标：拼出 13',
        tagTone: 'dark',
      },
      facts: {
        rows: [
          { label: '掌握概念', value: '二进制 + 比特' },
          { label: '下一站', value: '亲手点亮开关', active: true },
        ],
        note: '提示：想想哪几个权重加起来刚好等于 13？',
      },
    },
  ],
  challenge: {
    type: 'binary-builder',
    title: '动手拼数字：点亮 2.5D 魔法开关',
    prompt: '直接点击舞台上的 2.5D 开关方块（或下方按钮）切换 0 和 1，让亮起的权重加起来正好等于目标数字！',
    targets: [13, 6, 10, 15],
    hint: '提示：先看看最大权重 8 需不需要打开，再凑剩下的数字。',
  },
};

import { BilingualCodeLine, Lesson } from '../../types/course';

const PIXEL_CODE: BilingualCodeLine[] = [
  { line: 1, indent: 0, cn: '画像素图(网格):', py: 'def draw_pixels(grid):', isHead: true },
  { line: 2, indent: 4, cn: '对每个 这一行 在 网格里:', py: 'for row in grid:' },
  { line: 3, indent: 8, cn: '对每个 格子 在 这一行里:', py: 'for cell in row:' },
  { line: 4, indent: 12, cn: '如果 格子 == 1:', py: 'if cell == 1:' },
  { line: 5, indent: 16, cn: '点亮珊瑚方块', py: 'paint_coral()' },
  { line: 6, indent: 12, cn: '否则:', py: 'else:' },
  { line: 7, indent: 16, cn: '保持空白', py: 'leave_blank()' },
];

const SMILE = [
  0, 1, 0, 1, 0,
  0, 1, 0, 1, 0,
  0, 0, 0, 0, 0,
  1, 0, 0, 0, 1,
  0, 1, 1, 1, 0,
];

const HEART = [
  0, 1, 0, 1, 0,
  1, 1, 1, 1, 1,
  1, 1, 1, 1, 1,
  0, 1, 1, 1, 0,
  0, 0, 1, 0, 0,
];

export const pixelArtLesson: Lesson = {
  id: 'pixel-art',
  chapterId: 'ch-1',
  chapterNum: '01',
  orderInChapter: 2,
  totalInChapter: 3,
  title: '像素画是怎么存的',
  subtitle: '把 0 和 1 排成方格，变出笑脸和像素爱心',
  concepts: ['像素', 'Pixel', '图像编码', '黑白网格', '矩阵'],
  status: 'ready',
  factsTitle: '当前画板数据',
  codeLines: PIXEL_CODE,
  steps: [
    {
      id: 'p1-zoom',
      label: '放大镜下的屏幕',
      kind: '概念',
      companionMood: 'curious',
      companionLine: '如果拿超级放大镜贴近手机屏幕，你会发现所有图片都是密密麻麻的小方块！',
      body: [
        '手机和电脑屏幕上的每一张照片、游戏角色，其实都是由成千上万个微小的方格子拼出来的，每个小格子叫一个 <strong>像素（Pixel）</strong>。',
        '这里是一块 <strong>5×5</strong> 的微型画板。如果电脑用 <strong>0</strong> 表示空白，<strong>1</strong> 表示点亮，只需要 25 个数字就能存下一幅画！',
      ],
      state: {
        scene: 'pixel-grid',
        rows: 5,
        cols: 5,
        pixels: [
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
          0, 0, 1, 0, 0,
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
        ],
        highlightCell: 12,
        tagText: '1 个亮起的像素 = 1',
        tagTone: 'coral',
      },
      lines: [4, 5],
      facts: {
        rows: [
          { label: '画板尺寸', value: '5 × 5' },
          { label: '像素总数', value: '25 格' },
          { label: '已点亮', value: '1 格', active: true },
        ],
        note: '电脑不存“画笔轨迹”，而是记住每一个格子亮还是灭。',
      },
    },
    {
      id: 'p2-row-by-row',
      label: '一行一行扫描',
      kind: '规律',
      companionMood: 'happy',
      companionLine: '看第 1 行：0 1 0 1 0，正好点亮两只大眼睛！',
      body: [
        '电脑读图片就像读书一样，<strong>从上到下、一行一行</strong>扫描。',
        '第 1 行写着 <strong>0 1 0 1 0</strong>，第 2 行也是 <strong>0 1 0 1 0</strong>——瞧，一双可爱的像素眼睛已经立起来了！',
      ],
      state: {
        scene: 'pixel-grid',
        rows: 5,
        cols: 5,
        pixels: [
          0, 1, 0, 1, 0,
          0, 1, 0, 1, 0,
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
        ],
        highlightRow: 0,
        tagText: '第 1 行：0 1 0 1 0',
        tagTone: 'coral',
      },
      lines: [2, 3, 4, 5],
      facts: {
        rows: [
          { label: '第 1 行编码', value: '0 1 0 1 0', active: true },
          { label: '第 2 行编码', value: '0 1 0 1 0' },
          { label: '已点亮', value: '4 格' },
        ],
        note: '只要按行念出 0 和 1，远方的另一台电脑就能画出完全一样的图！',
      },
    },
    {
      id: 'p3-smile',
      label: '拼出像素笑脸',
      kind: '演示',
      companionMood: 'excited',
      companionLine: '加上第 4 行和第 5 行的微笑弧线，一串 0 和 1 居然变成了笑脸！',
      body: [
        '继续扫描完最后两行：第 4 行是 <strong>1 0 0 0 1</strong>（嘴角），第 5 行是 <strong>0 1 1 1 0</strong>（下巴）。',
        '一幅像素笑脸诞生了！你的表情包发给朋友时，网线里飞过去的其实就是这样一串串 0 和 1。',
      ],
      quiz: {
        id: 'quiz-pixel-row',
        question: '先猜一猜：笑脸的第 5 行（最下面那行）对应的 0 和 1 密码是哪一个？',
        options: [
          { label: '1 1 1 1 1', feedback: '最下面一行左右两角是空的哦，只有中间 3 格亮起来了！' },
          { label: '0 1 1 1 0', correct: true, feedback: '眼睛真尖！左右两个 0，中间三个 1，正好拼出弯弯的笑脸！' },
          { label: '1 0 0 0 1', feedback: '那是第 4 行两个上扬的嘴角，再看看最下面第 5 行～' },
        ],
        rewardStars: 10,
      },
      state: {
        scene: 'pixel-grid',
        rows: 5,
        cols: 5,
        pixels: SMILE,
        highlightRow: 4,
        tagText: '25 个 0/1 = 笑脸',
        tagTone: 'coral',
      },
      lines: [2, 3, 4, 5],
      facts: {
        rows: [
          { label: '亮起像素', value: '9 格', active: true },
          { label: '空白像素', value: '16 格' },
          { label: '需要数据', value: '25 比特' },
        ],
        note: '如果是彩色照片，每个像素还会多存红(R)、绿(G)、蓝(B)三种亮度。',
      },
    },
    {
      id: 'p4-heart-preview',
      label: '换你来当像素画家',
      kind: '实战',
      companionMood: 'proud',
      companionLine: '轮到你啦！点下方「进入动手挑战」，亲手点击 2.5D 格子点亮一颗像素爱心！',
      body: [
        '同样的 25 个方格，只要换一组 0 和 1，就能变成星星、小猫或游戏里的超级玛丽。',
        '准备好后点击「进入动手挑战」，直接在 2.5D 像素画板上点击格子，拼出这颗<strong>像素爱心</strong>（或者自由涂鸦）吧！',
      ],
      state: {
        scene: 'pixel-grid',
        rows: 5,
        cols: 5,
        pixels: HEART,
        tagText: '目标图案：像素爱心',
        tagTone: 'dark',
      },
      lines: [1],
      facts: {
        rows: [
          { label: '爱心亮格', value: '16 格', active: true },
          { label: '核心概念', value: '像素网格编码' },
        ],
        note: '记住爱心的形状，马上进入画板亲手点亮它！',
      },
    },
  ],
  challenge: {
    type: 'pixel-painter',
    title: '动手像素画：点亮一颗 2.5D 爱心',
    prompt: '直接点击 2.5D 像素画板上的格子切换 0 和 1！对照目标提示，把这颗像素爱心拼出来（或者点「对照示例」偷看一眼）！',
    rows: 5,
    cols: 5,
    targetPattern: HEART,
    targetName: '像素爱心',
  },
};

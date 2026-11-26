import { Chapter, Lesson, LessonMeta } from '../types/course';
import { binaryBitsLesson } from './lessons/binaryBits';
import { robotLoopLesson } from './lessons/robotLoop';
import { stackPlatesLesson } from './lessons/stackPlates';

const READY_LESSONS: Record<string, Lesson> = {
  [binaryBitsLesson.id]: binaryBitsLesson,
  [robotLoopLesson.id]: robotLoopLesson,
  [stackPlatesLesson.id]: stackPlatesLesson,
};

export const CHAPTERS: Chapter[] = [
  {
    id: 'ch-1',
    num: '01',
    title: '电脑的秘密语言',
    lessons: [
      binaryBitsLesson,
      {
        id: 'pixel-art',
        chapterId: 'ch-1',
        chapterNum: '01',
        orderInChapter: 2,
        totalInChapter: 3,
        title: '像素画是怎么存的',
        subtitle: '把 0 和 1 排成方格，变出超级玛丽和表情包',
        concepts: ['像素', 'Pixel', '图像编码', '黑白网格'],
        status: 'upcoming',
        previewDescription:
          '放大手机屏幕上的任何一张图片，其实全都是密密麻麻的小方块。本课用 2.5D 等距方格展示电脑如何把一串 0 和 1 变成可爱的像素画。',
        previewObjectives: [
          '理解屏幕上的画面是由一个个像素格子拼成的',
          '用 0（白）和 1（黑）亲手编码出一颗像素爱心',
          '认识彩色像素是如何用红绿蓝（RGB）调出来的',
        ],
      },
      {
        id: 'text-encoding',
        chapterId: 'ch-1',
        chapterNum: '01',
        orderInChapter: 3,
        totalInChapter: 3,
        title: '电脑如何给文字编号',
        subtitle: 'A 是 65？揭秘文字与表情的密码本',
        concepts: ['ASCII', 'Unicode', '字符编码', '密码本'],
        status: 'upcoming',
        previewDescription:
          '电脑既然只懂数字，怎么发微信和打汉字？答案是全世界约定好的“超级编号本”。',
        previewObjectives: [
          '查表把自己的英文名字翻译成一串数字密码',
          '理解为什么所有设备都要遵守同一套编码约定',
        ],
      },
    ],
  },
  {
    id: 'ch-2',
    num: '02',
    title: '指挥小机器人',
    lessons: [
      {
        id: 'seq-and-bug',
        chapterId: 'ch-2',
        chapterNum: '02',
        orderInChapter: 1,
        totalInChapter: 4,
        title: '顺序指令与 Bug',
        subtitle: '为什么小机器人直直撞墙了？',
        concepts: ['顺序执行', 'Bug', 'Debug', '调试'],
        status: 'upcoming',
        previewDescription:
          '计算机超听话但也超“死板”：从上到下一行一行严格执行。学习如何找出顺序错位的 Bug 并完成除虫。',
        previewObjectives: [
          '理解程序按顺序逐行运行的底层铁律',
          '认识编程世界里的 Bug 与 Debug 除虫思维',
        ],
      },
      robotLoopLesson,
      {
        id: 'if-conditions',
        chapterId: 'ch-2',
        chapterNum: '02',
        orderInChapter: 3,
        totalInChapter: 4,
        title: '如果遇到墙：条件判断',
        subtitle: '给小机器人装上雷达，自己做决定',
        concepts: ['条件判断', 'if', 'else', '分支'],
        status: 'upcoming',
        previewDescription:
          '当迷宫路线不固定时，用「如果前方有墙，就左转；否则继续走」让阿派学会随机应变。',
        previewObjectives: [
          '掌握 if / else 二选一的分支路口直觉',
          '组合循环与条件，自动走出拐弯走廊',
        ],
      },
      {
        id: 'variables-box',
        chapterId: 'ch-2',
        chapterNum: '02',
        orderInChapter: 4,
        totalInChapter: 4,
        title: '魔法小盒子：变量与计分',
        subtitle: '贴上名字标签的记忆盒，随时读取和改写',
        concepts: ['变量', '赋值', '计分板', '内存'],
        status: 'upcoming',
        previewDescription:
          '把变量想象成一个透明小盒子：外面贴着名字（如 score），里面装的数字可以随时加 1 覆盖更新。',
        previewObjectives: [
          '直观看到 score = score + 1 在盒子里的变化过程',
          '用变量记住收集的电池数量并打开终点大门',
        ],
      },
    ],
  },
  {
    id: 'ch-3',
    num: '03',
    title: '装数据的魔法盒子',
    lessons: [
      {
        id: 'arrays-lockers',
        chapterId: 'ch-3',
        chapterNum: '03',
        orderInChapter: 1,
        totalInChapter: 4,
        title: '一排储物柜：数组',
        subtitle: '为什么程序员总爱从 0 开始数数？',
        concepts: ['数组', 'Array', '索引', '下标'],
        status: 'upcoming',
        previewDescription:
          '把数据放进一整排连在一起的编号储物柜里，只要报出编号（下标），电脑一步就能瞬间拿到！',
        previewObjectives: [
          '理解数组连续摆放带来的“秒拿”超能力',
          '明白为什么下标从 0 开始数',
        ],
      },
      stackPlatesLesson,
      {
        id: 'queue-line',
        chapterId: 'ch-3',
        chapterNum: '03',
        orderInChapter: 3,
        totalInChapter: 4,
        title: '排队买奶茶：队列',
        subtitle: '先来的先拿到，公平的先进先出规则',
        concepts: ['队列', 'Queue', 'FIFO', '排队'],
        status: 'upcoming',
        previewDescription:
          '和叠盘子的栈正好相反，队列像食堂打饭：新来的人排到队尾，排在最前面的人最先拿到。',
        previewObjectives: [
          '对比栈（LIFO）与队列（FIFO）的根本区别',
          '看看打印机和游戏匹配池是怎么用队列排队的',
        ],
      },
      {
        id: 'binary-tree-family',
        chapterId: 'ch-3',
        chapterNum: '03',
        orderInChapter: 4,
        totalInChapter: 4,
        title: '分叉的家族树：二叉树',
        subtitle: '一个节点长出左右两个分叉，信息瞬间翻倍',
        concepts: ['二叉树', '根节点', '叶子节点', '层级'],
        status: 'upcoming',
        previewDescription:
          '把电脑里的文件夹目录倒过来画，就是一棵枝繁叶茂的树！每往下长一层，能装下的节点数量就翻一倍。',
        previewObjectives: [
          '认识树根、父节点、子节点与叶子节点',
          '感受只需几层就能装下成百上千条数据的威力',
        ],
      },
    ],
  },
  {
    id: 'ch-4',
    num: '04',
    title: '聪明的解题魔法',
    lessons: [
      {
        id: 'count-steps',
        chapterId: 'ch-4',
        chapterNum: '04',
        orderInChapter: 1,
        totalInChapter: 3,
        title: '数步数，不数秒数',
        subtitle: '怎么公平比较两个办法谁更聪明？',
        concepts: ['效率', '步数', '大O初体验', '增长'],
        status: 'upcoming',
        previewDescription:
          '用 2.5D 堆积方块直观对比数据变大时，不同算法的工作量怎么增长——有的几乎不动，有的瞬间堆成摩天大楼。',
        previewObjectives: [
          '明白为什么衡量算法快慢要“数步数”而不是看秒表',
          '感受线性增长与爆炸增长的视觉差距',
        ],
      },
      {
        id: 'binary-search-guess',
        chapterId: 'ch-4',
        chapterNum: '04',
        orderInChapter: 2,
        totalInChapter: 3,
        title: '猜数字二分魔法',
        subtitle: '1 到 100 猜数字，为什么 7 次必中？',
        concepts: ['二分查找', '折半', '猜数字', '有序'],
        status: 'upcoming',
        previewDescription:
          '每次都猜正中间，答“太大”或“太小”直接扔掉整整一半！这就是计算机最经典的折半魔法。',
        previewObjectives: [
          '对比一个一个猜与每次折半的巨大步数差距',
          '理解为什么二分查找要求数据先排好队',
        ],
      },
      {
        id: 'card-sorting',
        chapterId: 'ch-4',
        chapterNum: '04',
        orderInChapter: 3,
        totalInChapter: 3,
        title: '整理扑克牌：排序初体验',
        subtitle: '把打乱的数字方块从小到大排整齐',
        concepts: ['排序', '冒泡排序', '插入排序', '比较交换'],
        status: 'upcoming',
        previewDescription:
          '像手里抓牌整理扑克一样，观察等距方块如何一步步比较、腾出空位、滑进正确的位置。',
        previewObjectives: [
          '看懂相邻交换与插入整理两种经典排序直觉',
          '明白“先排好序”能给后续查找省下多少力气',
        ],
      },
    ],
  },
];

export const DEFAULT_LESSON_ID = binaryBitsLesson.id;
export const READY_LESSON_LIST: Lesson[] = [
  binaryBitsLesson,
  robotLoopLesson,
  stackPlatesLesson,
];

export function getAllLessonMetas(): LessonMeta[] {
  return CHAPTERS.flatMap((c) => c.lessons);
}

export function getLessonById(id: string): Lesson | undefined {
  return READY_LESSONS[id];
}

export function getLessonMetaById(id: string): LessonMeta | undefined {
  return getAllLessonMetas().find((l) => l.id === id);
}

export function getChapterById(id: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

export function getNextReadyLesson(currentId: string): Lesson | undefined {
  const idx = READY_LESSON_LIST.findIndex((l) => l.id === currentId);
  if (idx === -1) return READY_LESSON_LIST[0];
  return READY_LESSON_LIST[(idx + 1) % READY_LESSON_LIST.length];
}

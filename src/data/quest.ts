import { AppStorageState } from '../types/course';
import { CHAPTERS } from './course';

export type PiBotPartKey = 'chip' | 'wings' | 'backpack' | 'crown';

export interface PiBotUpgrades {
  chip: boolean;
  wings: boolean;
  backpack: boolean;
  crown: boolean;
}

export interface QuestStageDef {
  chapterId: string;
  stageNum: number;
  partKey: PiBotPartKey;
  partName: string;
  partEmoji: string;
  missionTitle: string;
  storyDesc: string;
  unlockRewardText: string;
}

export const QUEST_STAGES: QuestStageDef[] = [
  {
    chapterId: 'ch-1',
    stageNum: 1,
    partKey: 'chip',
    partName: '语言芯片',
    partEmoji: '📡',
    missionTitle: '第一站：唤醒阿派的语言芯片',
    storyDesc: '教阿派看懂 0 和 1 开关、像素画和 ASCII 密码，让它重新点亮信号天线！',
    unlockRewardText: '天线信号光环激活',
  },
  {
    chapterId: 'ch-2',
    stageNum: 2,
    partKey: 'wings',
    partName: '行动大脑',
    partEmoji: '🪽',
    missionTitle: '第二站：装上行动与自动驾驶大脑',
    storyDesc: '学会修 Bug、循环偷懒、雷达刹车和变量计分，帮阿派装上酷炫悬浮小推进翼！',
    unlockRewardText: '2.5D 悬浮推进翼装配',
  },
  {
    chapterId: 'ch-3',
    stageNum: 3,
    partKey: 'backpack',
    partName: '超级背包',
    partEmoji: '🎒',
    missionTitle: '第三站：整理阿派的超级记忆背包',
    storyDesc: '掌握数组柜子、撤回栈、奶茶队列和家族二叉树，给阿派背上井井有条的记忆背包！',
    unlockRewardText: '2.5D 记忆能量背包装配',
  },
  {
    chapterId: 'ch-4',
    stageNum: 4,
    partKey: 'crown',
    partName: '光速引擎',
    partEmoji: '👑',
    missionTitle: '第四站：升级超光速解题引擎',
    storyDesc: '掌握大 O 步数、二分寻宝和冒泡排序，让阿派戴上极客小皇冠变身算法大师！',
    unlockRewardText: '极客小皇冠 + 脚底光环解锁',
  },
];

export interface QuestStageProgress extends QuestStageDef {
  totalLessons: number;
  doneLessons: number;
  doneChallenges: number;
  pct: number;
  unlocked: boolean;
  lessonIds: string[];
}

export interface QuestOverview {
  stages: QuestStageProgress[];
  upgrades: PiBotUpgrades;
  unlockedPartsCount: number;
  recommendedLessonId: string;
  recommendedLessonTitle: string;
  recommendedStageName: string;
  recommendedIsChallenge: boolean;
  allComplete: boolean;
}

/**
 * Computes live 4-stage "Wake Up Pi-Bot" quest progress & visual hardware upgrades.
 * A part unlocks once the learner completes all lessons in that chapter OR beats >= 2 challenges in it
 * (so both curious readers and hands-on players feel rewarded fast!).
 */
export function computeQuestOverview(storage: AppStorageState): QuestOverview {
  const stages: QuestStageProgress[] = QUEST_STAGES.map((stage) => {
    const ch = CHAPTERS.find((c) => c.id === stage.chapterId);
    const lessons = ch?.lessons ?? [];
    const totalLessons = lessons.length;
    const doneLessons = lessons.filter((l) => storage.doneLessons.includes(l.id)).length;
    const doneChallenges = lessons.filter((l) => storage.doneChallenges.includes(l.id)).length;

    // Weight lessons + challenges for smooth visible progress bar
    const points = doneLessons + doneChallenges;
    const maxPoints = Math.max(1, totalLessons * 2);
    const pct = Math.min(100, Math.round((points / maxPoints) * 100));
    const unlocked =
      totalLessons > 0 && (doneLessons >= totalLessons || doneChallenges >= Math.min(2, totalLessons));

    return {
      ...stage,
      totalLessons,
      doneLessons,
      doneChallenges,
      pct,
      unlocked,
      lessonIds: lessons.map((l) => l.id),
    };
  });

  const upgrades: PiBotUpgrades = {
    chip: stages[0]?.unlocked ?? false,
    wings: stages[1]?.unlocked ?? false,
    backpack: stages[2]?.unlocked ?? false,
    crown: stages[3]?.unlocked ?? false,
  };

  const unlockedPartsCount = stages.filter((s) => s.unlocked).length;

  // Find recommended next lesson (first unfinished lesson, else first unfinished challenge)
  let recommendedLessonId = CHAPTERS[0].lessons[0].id;
  let recommendedLessonTitle = CHAPTERS[0].lessons[0].title;
  let recommendedStageName = QUEST_STAGES[0].partName;
  let recommendedIsChallenge = false;
  let found = false;

  for (let i = 0; i < CHAPTERS.length; i++) {
    const ch = CHAPTERS[i];
    for (const meta of ch.lessons) {
      if (!storage.doneLessons.includes(meta.id)) {
        recommendedLessonId = meta.id;
        recommendedLessonTitle = meta.title;
        recommendedStageName = QUEST_STAGES[i]?.partName ?? ch.title;
        recommendedIsChallenge = false;
        found = true;
        break;
      }
    }
    if (found) break;
  }

  if (!found) {
    for (let i = 0; i < CHAPTERS.length; i++) {
      const ch = CHAPTERS[i];
      for (const meta of ch.lessons) {
        if (!storage.doneChallenges.includes(meta.id)) {
          recommendedLessonId = meta.id;
          recommendedLessonTitle = meta.title;
          recommendedStageName = QUEST_STAGES[i]?.partName ?? ch.title;
          recommendedIsChallenge = true;
          found = true;
          break;
        }
      }
      if (found) break;
    }
  }

  return {
    stages,
    upgrades,
    unlockedPartsCount,
    recommendedLessonId,
    recommendedLessonTitle,
    recommendedStageName,
    recommendedIsChallenge,
    allComplete: !found,
  };
}

/** Rich Pi-Bot #314 persona lines keyed by lesson ID + playful pet interactions */
export const PIBOT_LESSON_BANTER: Record<string, string[]> = {
  'binary-bits': [
    '我脑子里其实只有 0 和 1 两种电信号，像一排闪闪发亮的小灯泡！',
    '小秘密：8 + 4 + 2 + 1 = 15，4 盏灯就能变出 16 种密码哦！',
  ],
  'pixel-art': [
    '凑近看我的屏幕脸，其实我也是一颗一颗小像素拼出来的～',
    '点亮是 1，关掉是 0，给我画一颗像素大爱心吧！',
  ],
  'text-encoding': [
    '哔哔！在 ASCII 密码本里，67-65-84 翻译过来是喵星人 CAT！',
    '只要记住 A 是 65，整个英文字母表我都能心算出来！',
  ],
  'seq-and-bug': [
    '我超听话的！你写 5 行我就走 5 步，多一行我真的会撞墙哦…',
    '不怕写出 Bug！最酷的程序员都是抓 Bug 小能手！',
  ],
  'robot-loop': [
    '聪明人绝不把同一句话抄 10 遍，用 for 循环偷懒才帅！',
    '偷偷告诉你：故意让我撞一次墙，好像能解锁神秘彩蛋徽章…',
  ],
  'if-conditions': [
    '装上 if / else 雷达后，我终于不会一头撞上障碍墙啦！',
    '如果(if)前面有星光饼干，就张嘴；否则(else)继续巡逻！',
  ],
  'variables-box': [
    '变量就像贴了名字的魔法盒，新数字放进去就会盖掉旧数字！',
    '我肚子里也有个变量叫 mood，你摸我头它就会 +1 哦！',
  ],
  'arrays-lockers': [
    '千万别忘啦：程序员数储物柜永远从 [0] 开始数，不是从 1！',
    '只要喊出下标门牌号，我 O(1) 一瞬移就能帮你拿到宝贝！',
  ],
  'stack-plates': [
    '栈就像叠煎饼：最后放上去的那块，必须第一个吃掉（LIFO）！',
    '画画按 Ctrl+Z 撤回时，就是栈在背后默默施法哦～',
  ],
  'queue-line': [
    '排队买奶茶要讲规矩：先来先喝（FIFO），绝不许插队！',
    '栈是后进先出，队列是先进先出，我再也不会搞混啦！',
  ],
  'binary-tree-family': [
    '这棵树是倒着长的：树根 A 在最顶上，叶子 D E F G 在最下面！',
    '点一点树上的小方块，我可以悄悄告诉你它是树根还是叶子～',
  ],
  'count-steps': [
    '比谁快不能只看跑 2 步，把 n 拉到 8，O(n²) 直接长出 64 块大高楼！',
    'O(1) 是闪电侠，不管数据多大永远只要 1 步！',
  ],
  'binary-search-guess': [
    '排好序的箱子别一个一个翻！每次戳正中间，一口气砍掉一半！',
    '100 个数字里找宝藏，用二分搜索只要 7 步就能稳稳抓到！',
  ],
  'card-sorting': [
    '冒泡排序就像汽水里的大泡泡，每次比相邻两个，大的往右冒！',
    '排整齐之后不仅看着舒服，还能马上开启超快的二分搜索！',
  ],
};

export const PIBOT_PET_LINES = {
  pet: [
    '嘿嘿～摸天线会痒痒的！电路板都开心得冒暖气啦！',
    '嘀嘀！好感度 UP！有你当指挥官我一点都不怕 Bug！',
    '蹭蹭～等会我们再去点亮一块新芯片吧！',
    '我的 2.5D 纸壳脑袋是不是摸起来脆脆的？嘻嘻！',
  ],
  snack: [
    '咔哧咔哧！星光饼干是 0 和 1 烤出来的，脆甜满分！',
    '啊呜～能量槽瞬间加满！我可以一口气跳 100 次 for 循环！',
    '好吃到天线发光！谢谢指挥官投喂～',
  ],
  trick: [
    '看我的 360° 等距托马斯回旋空翻！稳稳落地！',
    '咻——！重力算什么，我可是 2.5D 纸桌特技王阿派！',
    '嘀哩哩！炫技成功，记得给我鼓掌呀！',
  ],
  drag: [
    '哇呀呀！要飞起来啦！轻点拎我的天线呀～',
    '悬空啦悬空啦！我要去舞台另一边巡逻吗？',
  ],
  sleepy: [
    '呼噜…0101…梦里全是脆脆的星光饼干…zZ',
    '进入低功耗待机中…戳我一下马上复活！zZ',
  ],
  wakeup: [
    '呀！我没打盹！我刚才是在后台悄悄整理内存呢！',
    '哔哔重启成功！指挥官，下一关我们去哪探险？',
  ],
};

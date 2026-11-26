import {
  AppStorageState,
  BadgeDef,
  BadgeId,
  CodeLang,
  RecentVisit,
  ThemeMode,
} from '../types/course';

const THEME_KEY = 'codelab:theme';
const STATE_KEY = 'codelab:state_v2';

export const BADGE_CATALOG: BadgeDef[] = [
  {
    id: 'binary-hero',
    title: '解码小神探',
    desc: '完成《0 和 1 魔法开关》挑战，破译电脑底层密码。',
    emoji: '💡',
    stars: 30,
  },
  {
    id: 'loop-captain',
    title: '机器人指挥官',
    desc: '完成《循环偷懒术》挑战，精准指挥阿派稳稳刹停！',
    emoji: '🤖',
    stars: 30,
  },
  {
    id: 'stack-master',
    title: '叠盘子大师',
    desc: '完成《像叠盘子一样的栈》挑战，玩转后进先出！',
    emoji: '🥞',
    stars: 30,
  },
  {
    id: 'bug-hunter',
    title: '勇敢试错家',
    desc: '隐藏彩蛋：故意让阿派撞一次墙，亲眼抓住一只越界 Bug！',
    emoji: '💥',
    stars: 20,
    secret: true,
  },
  {
    id: 'python-explorer',
    title: '双语小极客',
    desc: '把中文指令切换成真正的 Python 代码一探究竟！',
    emoji: '🐍',
    stars: 15,
  },
  {
    id: 'quiz-whiz',
    title: '神算预测王',
    desc: '在课程的「先猜一猜」或随堂练习里累计答对 2 题！',
    emoji: '🎯',
    stars: 25,
  },
  {
    id: 'algo-wizard',
    title: '算法魔术师',
    desc: '通关第 4 章任意一节算法挑战（大O / 二分 / 排序）！',
    emoji: '🪄',
    stars: 35,
  },
  {
    id: 'grand-explorer',
    title: '全章大满贯',
    desc: '完成全部 4 章中至少 6 节动手挑战，晋级指令大师！',
    emoji: '👑',
    stars: 50,
  },
];

export function getBadgeById(id: BadgeId): BadgeDef | undefined {
  return BADGE_CATALOG.find((b) => b.id === id);
}

export function getExplorerRank(stars: number): { title: string; nextAt: number } {
  if (stars >= 260) return { title: '传奇算法小博士', nextAt: 400 };
  if (stars >= 160) return { title: '超级指令架构师', nextAt: 260 };
  if (stars >= 90) return { title: '算法探险队长', nextAt: 160 };
  if (stars >= 35) return { title: '代码小魔术师', nextAt: 90 };
  return { title: '见习指令探险员', nextAt: 35 };
}

const DEFAULT_STATE: AppStorageState = {
  doneLessons: [],
  doneChallenges: [],
  recent: [],
  codeLang: 'cn',
  stars: 0,
  badges: [],
  solvedQuizzes: [],
  solvedPractice: [],
  soundEnabled: true,
};

export function loadTheme(): ThemeMode {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // ignore
  }
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function applyAndSaveTheme(theme: ThemeMode): void {
  const apply = () => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b0c0e' : '#f7f4ee');
  };

  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }

  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => void;
  };
  if (typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(apply);
  } else {
    apply();
  }
}

export function loadAppState(): AppStorageState {
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<AppStorageState>;
    return {
      doneLessons: Array.isArray(parsed.doneLessons) ? parsed.doneLessons : [],
      doneChallenges: Array.isArray(parsed.doneChallenges) ? parsed.doneChallenges : [],
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
      codeLang: parsed.codeLang === 'py' ? 'py' : 'cn',
      stars: typeof parsed.stars === 'number' && Number.isFinite(parsed.stars) ? parsed.stars : 0,
      badges: Array.isArray(parsed.badges) ? (parsed.badges as BadgeId[]) : [],
      solvedQuizzes: Array.isArray(parsed.solvedQuizzes) ? parsed.solvedQuizzes : [],
      solvedPractice: Array.isArray(parsed.solvedPractice) ? parsed.solvedPractice : [],
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveAppState(next: AppStorageState): void {
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function markLessonDone(state: AppStorageState, lessonId: string): AppStorageState {
  if (state.doneLessons.includes(lessonId)) return state;
  const next: AppStorageState = {
    ...state,
    doneLessons: [...state.doneLessons, lessonId],
    stars: state.stars + 10,
  };
  saveAppState(next);
  return next;
}

export function markChallengeDone(state: AppStorageState, lessonId: string): AppStorageState {
  const alreadyChallenge = state.doneChallenges.includes(lessonId);
  const doneLessons = state.doneLessons.includes(lessonId)
    ? state.doneLessons
    : [...state.doneLessons, lessonId];
  const doneChallenges = alreadyChallenge
    ? state.doneChallenges
    : [...state.doneChallenges, lessonId];
  const next: AppStorageState = {
    ...state,
    doneLessons,
    doneChallenges,
    stars: alreadyChallenge ? state.stars : state.stars + 20,
  };
  saveAppState(next);
  return next;
}

export function unlockBadge(
  state: AppStorageState,
  badgeId: BadgeId
): { state: AppStorageState; unlockedNow: boolean; badge?: BadgeDef } {
  if (state.badges.includes(badgeId)) {
    return { state, unlockedNow: false };
  }
  const badge = getBadgeById(badgeId);
  const reward = badge?.stars ?? 15;
  const next: AppStorageState = {
    ...state,
    badges: [...state.badges, badgeId],
    stars: state.stars + reward,
  };
  saveAppState(next);
  return { state: next, unlockedNow: true, badge };
}

export function recordQuizSolved(
  state: AppStorageState,
  quizId: string,
  rewardStars = 10
): { state: AppStorageState; newlySolved: boolean } {
  if (state.solvedQuizzes.includes(quizId)) {
    return { state, newlySolved: false };
  }
  const next: AppStorageState = {
    ...state,
    solvedQuizzes: [...state.solvedQuizzes, quizId],
    stars: state.stars + rewardStars,
  };
  saveAppState(next);
  return { state: next, newlySolved: true };
}

export function recordPracticeSolved(
  state: AppStorageState,
  questionId: string,
  rewardStars = 10
): { state: AppStorageState; newlySolved: boolean } {
  if (state.solvedPractice.includes(questionId)) {
    return { state, newlySolved: false };
  }
  const next: AppStorageState = {
    ...state,
    solvedPractice: [...state.solvedPractice, questionId],
    stars: state.stars + rewardStars,
  };
  saveAppState(next);
  return { state: next, newlySolved: true };
}

export function recordRecentVisit(
  state: AppStorageState,
  lessonId: string,
  step: number
): AppStorageState {
  const existing = state.recent[0];
  if (existing && existing.lessonId === lessonId && existing.step === step) {
    return state;
  }
  const filtered = state.recent.filter((r) => r.lessonId !== lessonId);
  const entry: RecentVisit = { lessonId, step, visitedAt: Date.now() };
  const next: AppStorageState = {
    ...state,
    recent: [entry, ...filtered].slice(0, 6),
  };
  saveAppState(next);
  return next;
}

export function setStoredCodeLang(state: AppStorageState, codeLang: CodeLang): AppStorageState {
  if (state.codeLang === codeLang) return state;
  const next: AppStorageState = { ...state, codeLang };
  saveAppState(next);
  return next;
}

export function setStoredSoundEnabled(
  state: AppStorageState,
  soundEnabled: boolean
): AppStorageState {
  if (state.soundEnabled === soundEnabled) return state;
  const next: AppStorageState = { ...state, soundEnabled };
  saveAppState(next);
  return next;
}

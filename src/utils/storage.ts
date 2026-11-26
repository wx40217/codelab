import { AppStorageState, CodeLang, RecentVisit, ThemeMode } from '../types/course';

const THEME_KEY = 'codelab:theme';
const STATE_KEY = 'codelab:state_v2';

const DEFAULT_STATE: AppStorageState = {
  doneLessons: [],
  doneChallenges: [],
  recent: [],
  codeLang: 'cn',
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
  };
  saveAppState(next);
  return next;
}

export function markChallengeDone(state: AppStorageState, lessonId: string): AppStorageState {
  const doneLessons = state.doneLessons.includes(lessonId)
    ? state.doneLessons
    : [...state.doneLessons, lessonId];
  const doneChallenges = state.doneChallenges.includes(lessonId)
    ? state.doneChallenges
    : [...state.doneChallenges, lessonId];
  const next: AppStorageState = { ...state, doneLessons, doneChallenges };
  saveAppState(next);
  return next;
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

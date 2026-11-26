export type ThemeMode = 'light' | 'dark';
export type CodeLang = 'cn' | 'py';

export interface BilingualCodeLine {
  line: number;
  indent: number;
  cn: string;
  py: string;
  isHead?: boolean;
}

export interface FactChip {
  text: string;
  tone?: 'default' | 'best' | 'quiet';
}

export interface FactRow {
  label: string;
  detail?: string;
  value?: string | number;
  chips?: FactChip[];
  meter?: number; // 0..1
  active?: boolean;
}

export interface StepNote {
  title: string;
  icon?: 'bulb' | 'bolt' | 'alert';
  text: string;
}

export interface BinaryBitsSceneState {
  scene: 'binary-bits';
  bits: [0 | 1, 0 | 1, 0 | 1, 0 | 1]; // [8, 4, 2, 1]
  focusBit?: number; // 0..3
  showWeights?: boolean;
  tagText?: string;
  tagTone?: 'dark' | 'coral';
  interactive?: boolean;
}

export interface RobotLoopSceneState {
  scene: 'robot-loop';
  trackLength: number;
  robotAt: number;
  goalAt: number;
  wallAt: number;
  visited: number[];
  loopCurrent?: number;
  loopTotal?: number;
  status: 'idle' | 'step' | 'bonk' | 'victory' | 'short';
  tagText?: string;
}

export interface StackBlockItem {
  id: string;
  label: string;
}

export interface StackPlatesSceneState {
  scene: 'stack-plates';
  stack: StackBlockItem[];
  inbox?: StackBlockItem;
  out: StackBlockItem[];
  highlightTop?: boolean;
  op?: 'idle' | 'push' | 'top' | 'pop' | 'undo';
  tagText?: string;
  tagAnchor?: 'top' | 'out' | 'inbox';
}

export type SceneState =
  | BinaryBitsSceneState
  | RobotLoopSceneState
  | StackPlatesSceneState;

export interface LessonStep {
  id: string;
  label: string;
  kind: string;
  body: string[];
  note?: StepNote;
  state: SceneState;
  lines?: number[];
  overrideCode?: BilingualCodeLine[];
  facts?: {
    title?: string;
    rows: FactRow[];
    note?: string;
  };
}

export type MicroChallengeConfig =
  | {
      type: 'binary-builder';
      title: string;
      prompt: string;
      targets: number[];
      hint: string;
    }
  | {
      type: 'loop-tuner';
      title: string;
      prompt: string;
      trackLength: number;
      goalAt: number;
      wallAt: number;
      minN: number;
      maxN: number;
      defaultN: number;
    }
  | {
      type: 'stack-undo';
      title: string;
      prompt: string;
      initialStack: StackBlockItem[];
      queueToPush: StackBlockItem[];
      targetStackLabels: string[];
    };

export interface LessonMeta {
  id: string;
  chapterId: string;
  chapterNum: string;
  orderInChapter: number;
  totalInChapter: number;
  title: string;
  subtitle: string;
  concepts: string[];
  status: 'ready' | 'upcoming';
  previewDescription?: string;
  previewObjectives?: string[];
}

export interface Lesson extends LessonMeta {
  status: 'ready';
  factsTitle: string;
  codeLines: BilingualCodeLine[];
  steps: LessonStep[];
  challenge: MicroChallengeConfig;
}

export interface Chapter {
  id: string;
  num: string;
  title: string;
  lessons: LessonMeta[];
}

export interface RecentVisit {
  lessonId: string;
  step: number; // 0-based
  visitedAt: number;
}

export interface AppStorageState {
  doneLessons: string[];
  doneChallenges: string[];
  recent: RecentVisit[];
  codeLang: CodeLang;
}

export type ThemeMode = 'light' | 'dark';
export type CodeLang = 'cn' | 'py';

export type CompanionMood =
  | 'happy'
  | 'curious'
  | 'excited'
  | 'oops'
  | 'proud'
  | 'sleepy'
  | 'loved';

export type BadgeId =
  | 'binary-hero'
  | 'loop-captain'
  | 'stack-master'
  | 'bug-hunter'
  | 'python-explorer'
  | 'quiz-whiz'
  | 'algo-wizard'
  | 'grand-explorer'
  | 'pet-bestie';

export interface BadgeDef {
  id: BadgeId;
  title: string;
  desc: string;
  emoji: string;
  stars: number;
  secret?: boolean;
}

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

export interface StepQuizOption {
  label: string;
  correct?: boolean;
  feedback: string;
}

export interface StepQuiz {
  id: string;
  question: string;
  options: StepQuizOption[];
  rewardStars?: number;
}

/* ==================== 2.5D ISOMETRIC SCENE STATES ==================== */

export interface BinaryBitsSceneState {
  scene: 'binary-bits';
  bits: [0 | 1, 0 | 1, 0 | 1, 0 | 1]; // [8, 4, 2, 1]
  focusBit?: number;
  showWeights?: boolean;
  tagText?: string;
  tagTone?: 'dark' | 'coral';
  interactive?: boolean;
}

export interface PixelGridSceneState {
  scene: 'pixel-grid';
  rows: number;
  cols: number;
  pixels: number[]; // row-major 0 | 1
  highlightRow?: number;
  highlightCell?: number;
  baseLabel?: string;
  tagText?: string;
  tagTone?: 'dark' | 'coral';
  interactive?: boolean;
}

export interface IsoStripItem {
  id: string;
  top: string;
  sub?: string; // plaque in front (e.g. index 0..5 or ASCII code 65..)
  height?: number; // for sorting bars
  tone?: 'paper' | 'active' | 'found' | 'dim' | 'ink';
  lift?: number;
}

export interface IsoStripSceneState {
  scene: 'iso-strip';
  items: IsoStripItem[];
  baseLabel?: string;
  pointerIdx?: number;
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
  radarAt?: number; // optional radar highlight for if-conditions
  baseLabel?: string;
  status: 'idle' | 'step' | 'bonk' | 'victory' | 'short';
  tagText?: string;
}

export interface VariableBoxSceneState {
  scene: 'variable-box';
  boxes: Array<{
    name: string;
    value: string | number;
    highlight?: boolean;
    deltaText?: string;
  }>;
  incomingToken?: string;
  tagText?: string;
  tagTone?: 'dark' | 'coral';
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
  interactive?: boolean;
}

export interface QueueLineSceneState {
  scene: 'queue-line';
  queue: StackBlockItem[];
  incoming?: StackBlockItem;
  served: StackBlockItem[];
  op?: 'idle' | 'enqueue' | 'dequeue';
  tagText?: string;
  tagAnchor?: 'front' | 'back' | 'served';
  interactive?: boolean;
}

export interface TreeNodeItem {
  id: string;
  label: string;
  level: 0 | 1 | 2;
  slot: number; // level0: 0; level1: 0..1; level2: 0..3
  tone?: 'paper' | 'active' | 'found' | 'dim';
}

export interface BinaryTreeSceneState {
  scene: 'binary-tree';
  nodes: TreeNodeItem[];
  focusNodeId?: string;
  tagText?: string;
  tagTone?: 'dark' | 'coral';
  interactive?: boolean;
}

export interface GrowthStairsSceneState {
  scene: 'growth-stairs';
  n: number; // 2, 4, 8
  focusTier?: 0 | 1 | 2 | 3; // O(1), O(log n), O(n), O(n^2)
  tagText?: string;
}

export type SceneState =
  | BinaryBitsSceneState
  | PixelGridSceneState
  | IsoStripSceneState
  | RobotLoopSceneState
  | VariableBoxSceneState
  | StackPlatesSceneState
  | QueueLineSceneState
  | BinaryTreeSceneState
  | GrowthStairsSceneState;

/* ==================== LESSON & CHALLENGE SCHEMAS ==================== */

export interface LessonStep {
  id: string;
  label: string;
  kind: string;
  body: string[];
  note?: StepNote;
  companionMood?: CompanionMood;
  companionLine?: string;
  quiz?: StepQuiz;
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
      type: 'pixel-painter';
      title: string;
      prompt: string;
      rows: number;
      cols: number;
      targetPattern: number[];
      targetName: string;
    }
  | {
      type: 'ascii-decoder';
      title: string;
      prompt: string;
      codeMap: Array<{ char: string; code: number }>;
      targetWord: string;
    }
  | {
      type: 'seq-debugger';
      title: string;
      prompt: string;
      trackLength: number;
      goalAt: number;
      wallAt: number;
      buggySteps: number; // e.g., 5 (hits wall at 4)
      correctSteps: number; // e.g., 3
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
      type: 'if-radar';
      title: string;
      prompt: string;
      scenarios: Array<{
        id: string;
        label: string;
        wallAhead: boolean;
        correctAction: 'stop' | 'move';
        robotAt: number;
        wallAt: number;
        goalAt: number;
      }>;
    }
  | {
      type: 'variable-counter';
      title: string;
      prompt: string;
      varName: string;
      targetValue: number;
      operations: Array<{ label: string; delta: number; codePy: string }>;
    }
  | {
      type: 'array-lookup';
      title: string;
      prompt: string;
      items: string[];
      targetItem: string;
      targetIndex: number;
    }
  | {
      type: 'stack-undo';
      title: string;
      prompt: string;
      initialStack: StackBlockItem[];
      queueToPush: StackBlockItem[];
      targetStackLabels: string[];
    }
  | {
      type: 'queue-shop';
      title: string;
      prompt: string;
      initialQueue: StackBlockItem[];
      incomingList: StackBlockItem[];
      targetServedLabels: string[];
    }
  | {
      type: 'tree-explorer';
      title: string;
      prompt: string;
      nodes: TreeNodeItem[];
      leafIds: string[];
    }
  | {
      type: 'growth-explorer';
      title: string;
      prompt: string;
      optionsN: number[];
      targetN: number;
    }
  | {
      type: 'binary-search-game';
      title: string;
      prompt: string;
      values: number[];
      targetValue: number;
    }
  | {
      type: 'bubble-sorter';
      title: string;
      prompt: string;
      initialValues: number[];
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
  stars: number;
  badges: BadgeId[];
  solvedQuizzes: string[];
  solvedPractice: string[];
  soundEnabled: boolean;
  hasSeenIntro: boolean;
  petBond: number;
  petSnacksFed: number;
  petMinimized: boolean;
}

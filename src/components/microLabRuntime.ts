import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BilingualCodeLine,
  CompanionMood,
  FactRow,
  IsoStripItem,
  Lesson,
  SceneState,
  StackBlockItem,
} from '../types/course';
import {
  playBlocked,
  playBonk,
  playHop,
  playPop,
  playPush,
  playQuizCorrect,
  playQuizTryAgain,
  playStep,
  playSwitch,
  playVictory,
} from '../utils/sound';
import { StageInteractionHandlers } from './stage/IsoStageRouter';

export const BIT_WEIGHTS = [8, 4, 2, 1] as const;

export const BONUS_STACK_ITEMS: StackBlockItem[] = [
  { id: 'bonus-rocket', label: '画火箭' },
  { id: 'bonus-dino', label: '画恐龙' },
  { id: 'bonus-star', label: '画星星' },
];

export interface MicroLabRuntime {
  sceneState: SceneState;
  highlightLines: number[];
  codeLines: BilingualCodeLine[];
  facts: {
    title: string;
    rows: FactRow[];
    note?: string;
  };
  isSolved: boolean;
  companionMood: CompanionMood;
  companionLine: string;
  stageHandlers: StageInteractionHandlers;
  binary?: {
    targetValue: number;
    targets: number[];
    solvedTargets: number[];
    bits: [0 | 1, 0 | 1, 0 | 1, 0 | 1];
    sum: number;
    selectTarget: (val: number) => void;
    pickRandomTarget: () => void;
    toggleBit: (idx: number) => void;
    reset: () => void;
  };
  pixel?: {
    rows: number;
    cols: number;
    pixels: number[];
    targetPattern: number[];
    targetName: string;
    matchCount: number;
    totalCells: number;
    showGuide: boolean;
    toggleGuide: () => void;
    togglePixel: (idx: number) => void;
    clear: () => void;
  };
  ascii?: {
    codeMap: Array<{ char: string; code: number }>;
    targetWord: string;
    pickedChars: string[];
    pickChar: (char: string) => void;
    backspace: () => void;
    reset: () => void;
  };
  seqDebug?: {
    stepCount: number;
    minSteps: number;
    maxSteps: number;
    running: boolean;
    status: 'idle' | 'step' | 'bonk' | 'victory' | 'short';
    removeStep: () => void;
    addStep: () => void;
    run: () => void;
    reset: () => void;
  };
  loop?: {
    loopN: number;
    minN: number;
    maxN: number;
    running: boolean;
    status: 'idle' | 'step' | 'bonk' | 'victory' | 'short';
    robotAt: number;
    goalAt: number;
    wallAt: number;
    setLoopN: (n: number) => void;
    run: () => void;
    reset: () => void;
  };
  ifRadar?: {
    scenarioIndex: number;
    totalScenarios: number;
    clearedCount: number;
    currentLabel: string;
    wallAhead: boolean;
    lastResult: 'idle' | 'correct' | 'wrong';
    choose: (action: 'stop' | 'move') => void;
    reset: () => void;
  };
  variable?: {
    varName: string;
    value: number;
    targetValue: number;
    stepsTaken: number;
    operations: Array<{ label: string; delta: number; codePy: string }>;
    applyOp: (delta: number, label: string, codePy: string) => void;
    reset: () => void;
  };
  arrayLookup?: {
    items: string[];
    targetItem: string;
    pickedIndex: number | null;
    pickIndex: (idx: number) => void;
    reset: () => void;
  };
  stack?: {
    stack: StackBlockItem[];
    queue: StackBlockItem[];
    out: StackBlockItem[];
    targetLabels: string[];
    hasSolvedOnce: boolean;
    pop: () => void;
    push: () => void;
    addBonusBlock: (item: StackBlockItem) => void;
    reset: () => void;
  };
  queueShop?: {
    queue: StackBlockItem[];
    incoming: StackBlockItem[];
    served: StackBlockItem[];
    enqueue: () => void;
    dequeue: () => void;
    reset: () => void;
  };
  tree?: {
    foundLeafIds: string[];
    totalLeaves: number;
    lastHint: string | null;
    clickNode: (nodeId: string) => void;
    reset: () => void;
  };
  growth?: {
    currentN: number;
    optionsN: number[];
    visitedN: number[];
    targetN: number;
    focusTier: 0 | 1 | 2 | 3 | undefined;
    selectN: (n: number) => void;
    selectTier: (tier: 0 | 1 | 2 | 3 | undefined) => void;
  };
  binarySearch?: {
    values: number[];
    targetValue: number;
    low: number;
    high: number;
    revealed: number[];
    tries: number;
    found: boolean;
    pickIndex: (idx: number) => void;
    reset: () => void;
  };
  bubbleSort?: {
    values: number[];
    swaps: number;
    lastPair: [number, number] | null;
    swapPair: (leftIdx: number) => void;
    reset: () => void;
  };
}

export function useMicroLabRuntime(
  lesson: Lesson | undefined,
  active: boolean,
  onSolved: (lessonId: string) => void,
  onBonkWall: () => void,
  onShowToast: (msg: string) => void
): MicroLabRuntime | null {
  const challenge = lesson?.challenge;

  // Guard to prevent firing victory audio/onSolved repeatedly on re-render
  const solvedFiredRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 1. binary-builder
  const [targetValue, setTargetValue] = useState(13);
  const [solvedTargets, setSolvedTargets] = useState<number[]>([]);
  const [bits, setBits] = useState<[0 | 1, 0 | 1, 0 | 1, 0 | 1]>([0, 0, 0, 0]);
  const [focusBit, setFocusBit] = useState<number | undefined>(undefined);

  // 2. pixel-painter
  const [pixels, setPixels] = useState<number[]>(() => Array(25).fill(0));
  const [highlightCell, setHighlightCell] = useState<number | undefined>(undefined);
  const [showPixelGuide, setShowPixelGuide] = useState(false);

  // 3. ascii-decoder
  const [pickedChars, setPickedChars] = useState<string[]>([]);

  // 4. seq-debugger
  const [seqCount, setSeqCount] = useState(5);
  const [seqRunning, setSeqRunning] = useState(false);
  const [seqRobotAt, setSeqRobotAt] = useState(0);
  const [seqVisited, setSeqVisited] = useState<number[]>([0]);
  const [seqStatus, setSeqStatus] = useState<'idle' | 'step' | 'bonk' | 'victory' | 'short'>('idle');

  // 5. loop-tuner
  const [loopN, setLoopNState] = useState(2);
  const [loopRunning, setLoopRunning] = useState(false);
  const [loopRobotAt, setLoopRobotAt] = useState(0);
  const [loopVisited, setLoopVisited] = useState<number[]>([0]);
  const [loopCurrent, setLoopCurrent] = useState(0);
  const [loopStatus, setLoopStatus] = useState<'idle' | 'step' | 'bonk' | 'victory' | 'short'>('idle');

  // 6. if-radar
  const [radarIndex, setRadarIndex] = useState(0);
  const [radarCleared, setRadarCleared] = useState(0);
  const [radarResult, setRadarResult] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [radarRobotOverride, setRadarRobotOverride] = useState<number | null>(null);

  // 7. variable-counter
  const [varVal, setVarVal] = useState(0);
  const [varSteps, setVarSteps] = useState(0);
  const [varDeltaText, setVarDeltaText] = useState<string | undefined>(undefined);
  const [varIncoming, setVarIncoming] = useState<string | undefined>(undefined);
  const [varLastPy, setVarLastPy] = useState<string>('score = 0');

  // 8. array-lookup
  const [arrayPicked, setArrayPicked] = useState<number | null>(null);

  // 9. stack-undo
  const [stackItems, setStackItems] = useState<StackBlockItem[]>([]);
  const [queueItems, setQueueItems] = useState<StackBlockItem[]>([]);
  const [outItems, setOutItems] = useState<StackBlockItem[]>([]);
  const [stackOp, setStackOp] = useState<'idle' | 'push' | 'pop'>('idle');
  const [stackLastLabel, setStackLastLabel] = useState('');
  const [stackHasSolvedOnce, setStackHasSolvedOnce] = useState(false);

  // 10. queue-shop
  const [qLine, setQLine] = useState<StackBlockItem[]>([]);
  const [qIncoming, setQIncoming] = useState<StackBlockItem[]>([]);
  const [qServed, setQServed] = useState<StackBlockItem[]>([]);
  const [qOp, setQOp] = useState<'idle' | 'enqueue' | 'dequeue'>('idle');
  const [qLastLabel, setQLastLabel] = useState('');

  // 11. tree-explorer
  const [foundLeafIds, setFoundLeafIds] = useState<string[]>([]);
  const [treeFocusId, setTreeFocusId] = useState<string | undefined>(undefined);
  const [treeHint, setTreeHint] = useState<string | null>(null);

  // 12. growth-explorer
  const [growthN, setGrowthN] = useState(2);
  const [visitedN, setVisitedN] = useState<number[]>([2]);
  const [growthFocusTier, setGrowthFocusTier] = useState<0 | 1 | 2 | 3 | undefined>(undefined);

  // 13. binary-search-game
  const [bsLow, setBsLow] = useState(0);
  const [bsHigh, setBsHigh] = useState(6);
  const [bsRevealed, setBsRevealed] = useState<number[]>([]);
  const [bsLastPick, setBsLastPick] = useState<number | null>(null);
  const [bsHint, setBsHint] = useState<string>('点最中间的 3 号箱，一口气砍掉一半！');

  // 14. bubble-sorter
  const [sortValues, setSortValues] = useState<number[]>([7, 2, 9, 4]);
  const [sortSwaps, setSortSwaps] = useState(0);
  const [sortLastPair, setSortLastPair] = useState<[number, number] | null>(null);

  // Reset state when switching lessons or entering challenge mode
  useEffect(() => {
    clearTimer();
    solvedFiredRef.current = null;
    if (!lesson || !active) return;

    const ch = lesson.challenge;
    switch (ch.type) {
      case 'binary-builder':
        setTargetValue(ch.targets[0] ?? 13);
        setSolvedTargets([]);
        setBits([0, 0, 0, 0]);
        setFocusBit(undefined);
        break;
      case 'pixel-painter':
        setPixels(Array(ch.rows * ch.cols).fill(0));
        setHighlightCell(undefined);
        setShowPixelGuide(false);
        break;
      case 'ascii-decoder':
        setPickedChars([]);
        break;
      case 'seq-debugger':
        setSeqCount(ch.buggySteps);
        setSeqRunning(false);
        setSeqRobotAt(0);
        setSeqVisited([0]);
        setSeqStatus('idle');
        break;
      case 'loop-tuner':
        setLoopNState(ch.defaultN);
        setLoopRunning(false);
        setLoopRobotAt(0);
        setLoopVisited([0]);
        setLoopCurrent(0);
        setLoopStatus('idle');
        break;
      case 'if-radar':
        setRadarIndex(0);
        setRadarCleared(0);
        setRadarResult('idle');
        setRadarRobotOverride(null);
        break;
      case 'variable-counter':
        setVarVal(0);
        setVarSteps(0);
        setVarDeltaText(undefined);
        setVarIncoming(undefined);
        setVarLastPy(`${ch.varName} = 0`);
        break;
      case 'array-lookup':
        setArrayPicked(null);
        break;
      case 'stack-undo':
        setStackItems(ch.initialStack);
        setQueueItems(ch.queueToPush);
        setOutItems([]);
        setStackOp('idle');
        setStackLastLabel('');
        setStackHasSolvedOnce(false);
        break;
      case 'queue-shop':
        setQLine(ch.initialQueue);
        setQIncoming(ch.incomingList);
        setQServed([]);
        setQOp('idle');
        setQLastLabel('');
        break;
      case 'tree-explorer':
        setFoundLeafIds([]);
        setTreeFocusId(undefined);
        setTreeHint(null);
        break;
      case 'growth-explorer':
        setGrowthN(ch.optionsN[0] ?? 2);
        setVisitedN([ch.optionsN[0] ?? 2]);
        setGrowthFocusTier(undefined);
        break;
      case 'binary-search-game':
        setBsLow(0);
        setBsHigh(ch.values.length - 1);
        setBsRevealed([]);
        setBsLastPick(null);
        setBsHint('先戳最中间的箱子，一口气排除一半吧！');
        break;
      case 'bubble-sorter':
        setSortValues([...ch.initialValues]);
        setSortSwaps(0);
        setSortLastPair(null);
        break;
    }

    return () => clearTimer();
  }, [lesson, active, clearTimer]);

  const fireSolvedOnce = useCallback(
    (key: string) => {
      if (!lesson) return;
      if (solvedFiredRef.current === key) return;
      solvedFiredRef.current = key;
      playVictory();
      onSolved(lesson.id);
    },
    [lesson, onSolved]
  );

  // ==================== HANDLERS ====================

  // 1. binary-builder
  const toggleBit = useCallback((idx: number) => {
    setBits((prev) => {
      const next = [...prev] as [0 | 1, 0 | 1, 0 | 1, 0 | 1];
      const nextVal: 0 | 1 = next[idx] === 1 ? 0 : 1;
      next[idx] = nextVal;
      playSwitch(nextVal === 1);
      return next;
    });
    setFocusBit(idx);
  }, []);

  const selectBinaryTarget = useCallback((val: number) => {
    solvedFiredRef.current = null;
    setTargetValue(val);
    setBits([0, 0, 0, 0]);
    setFocusBit(undefined);
  }, []);

  const pickRandomBinaryTarget = useCallback(() => {
    solvedFiredRef.current = null;
    setTargetValue((prev) => {
      let next = prev;
      while (next === prev) {
        next = Math.floor(Math.random() * 15) + 1;
      }
      return next;
    });
    setBits([0, 0, 0, 0]);
    setFocusBit(undefined);
  }, []);

  const resetBinary = useCallback(() => {
    setBits([0, 0, 0, 0]);
    setFocusBit(undefined);
    playSwitch(false);
  }, []);

  // 2. pixel-painter
  const togglePixel = useCallback((cellIndex: number) => {
    setPixels((prev) => {
      const next = [...prev];
      const nextVal = next[cellIndex] ? 0 : 1;
      next[cellIndex] = nextVal;
      playSwitch(nextVal === 1);
      return next;
    });
    setHighlightCell(cellIndex);
  }, []);

  const clearPixels = useCallback(() => {
    if (!challenge || challenge.type !== 'pixel-painter') return;
    setPixels(Array(challenge.rows * challenge.cols).fill(0));
    setHighlightCell(undefined);
    playSwitch(false);
  }, [challenge]);

  // 3. ascii-decoder
  const pickAsciiChar = useCallback(
    (char: string) => {
      if (!challenge || challenge.type !== 'ascii-decoder') return;
      setPickedChars((prev) => {
        if (prev.length >= challenge.targetWord.length) return prev;
        playPush();
        return [...prev, char];
      });
    },
    [challenge]
  );

  const backspaceAscii = useCallback(() => {
    setPickedChars((prev) => {
      if (prev.length === 0) return prev;
      playPop();
      return prev.slice(0, -1);
    });
  }, []);

  const resetAscii = useCallback(() => {
    setPickedChars([]);
    playSwitch(false);
  }, []);

  // 4. seq-debugger
  const removeSeqStep = useCallback(() => {
    clearTimer();
    setSeqRunning(false);
    setSeqRobotAt(0);
    setSeqVisited([0]);
    setSeqStatus('idle');
    setSeqCount((c) => {
      const next = Math.max(1, c - 1);
      playPop();
      return next;
    });
  }, [clearTimer]);

  const addSeqStep = useCallback(() => {
    clearTimer();
    setSeqRunning(false);
    setSeqRobotAt(0);
    setSeqVisited([0]);
    setSeqStatus('idle');
    setSeqCount((c) => {
      const next = Math.min(6, c + 1);
      playPush();
      return next;
    });
  }, [clearTimer]);

  const resetSeqDebug = useCallback(() => {
    if (!challenge || challenge.type !== 'seq-debugger') return;
    clearTimer();
    setSeqCount(challenge.buggySteps);
    setSeqRunning(false);
    setSeqRobotAt(0);
    setSeqVisited([0]);
    setSeqStatus('idle');
  }, [challenge, clearTimer]);

  const runSeqDebug = useCallback(() => {
    if (!lesson || !challenge || challenge.type !== 'seq-debugger') return;
    clearTimer();
    setSeqRunning(true);
    setSeqRobotAt(0);
    setSeqVisited([0]);
    setSeqStatus('step');

    const total = seqCount;
    const goalAt = challenge.goalAt;
    const wallAt = challenge.wallAt;
    let step = 0;

    timerRef.current = window.setInterval(() => {
      step += 1;
      if (step >= wallAt) {
        clearTimer();
        playBonk();
        setSeqRobotAt(wallAt - 1);
        setSeqStatus('bonk');
        setSeqRunning(false);
        onBonkWall();
        return;
      }

      playHop(step);
      setSeqRobotAt(step);
      setSeqVisited((prev) => (prev.includes(step) ? prev : [...prev, step]));

      if (step >= total) {
        clearTimer();
        setSeqRunning(false);
        if (step === goalAt) {
          setSeqStatus('victory');
          fireSolvedOnce(`seq-${lesson.id}`);
        } else {
          setSeqStatus('short');
        }
      }
    }, 450);
  }, [lesson, challenge, seqCount, clearTimer, onBonkWall, fireSolvedOnce]);

  // 5. loop-tuner
  const setLoopN = useCallback(
    (nextN: number) => {
      if (!challenge || challenge.type !== 'loop-tuner') return;
      clearTimer();
      const clamped = Math.max(challenge.minN, Math.min(challenge.maxN, nextN));
      setLoopNState(clamped);
      setLoopRunning(false);
      setLoopRobotAt(0);
      setLoopVisited([0]);
      setLoopCurrent(0);
      setLoopStatus('idle');
    },
    [challenge, clearTimer]
  );

  const resetLoop = useCallback(() => {
    clearTimer();
    setLoopRunning(false);
    setLoopRobotAt(0);
    setLoopVisited([0]);
    setLoopCurrent(0);
    setLoopStatus('idle');
  }, [clearTimer]);

  const runLoop = useCallback(() => {
    if (!lesson || !challenge || challenge.type !== 'loop-tuner') return;
    clearTimer();
    setLoopRunning(true);
    setLoopRobotAt(0);
    setLoopVisited([0]);
    setLoopCurrent(0);
    setLoopStatus('step');

    const total = loopN;
    const goalAt = challenge.goalAt;
    const wallAt = challenge.wallAt;
    let step = 0;

    timerRef.current = window.setInterval(() => {
      step += 1;
      if (step >= wallAt) {
        clearTimer();
        playBonk();
        setLoopCurrent(step);
        setLoopRobotAt(wallAt - 1);
        setLoopStatus('bonk');
        setLoopRunning(false);
        onBonkWall();
        return;
      }

      playHop(step);
      setLoopCurrent(step);
      setLoopRobotAt(step);
      setLoopVisited((prev) => (prev.includes(step) ? prev : [...prev, step]));

      if (step >= total) {
        clearTimer();
        setLoopRunning(false);
        if (step === goalAt) {
          setLoopStatus('victory');
          fireSolvedOnce(`loop-${lesson.id}`);
        } else {
          setLoopStatus('short');
        }
      }
    }, 450);
  }, [lesson, challenge, loopN, clearTimer, onBonkWall, fireSolvedOnce]);

  // 6. if-radar
  const chooseRadarAction = useCallback(
    (action: 'stop' | 'move') => {
      if (!lesson || !challenge || challenge.type !== 'if-radar') return;
      const sc = challenge.scenarios[radarIndex];
      if (!sc || radarCleared >= challenge.scenarios.length) return;

      if (action === sc.correctAction) {
        playQuizCorrect();
        setRadarResult('correct');
        if (action === 'move') {
          setRadarRobotOverride(sc.robotAt + 1);
        } else {
          setRadarRobotOverride(sc.robotAt);
        }
        const nextCleared = radarCleared + 1;
        setRadarCleared(nextCleared);

        if (nextCleared >= challenge.scenarios.length) {
          fireSolvedOnce(`radar-${lesson.id}`);
        } else {
          window.setTimeout(() => {
            setRadarIndex((idx) => Math.min(challenge.scenarios.length - 1, idx + 1));
            setRadarResult('idle');
            setRadarRobotOverride(null);
          }, 720);
        }
      } else {
        if (sc.wallAhead && action === 'move') {
          playBonk();
          onBonkWall();
        } else {
          playQuizTryAgain();
        }
        setRadarResult('wrong');
      }
    },
    [lesson, challenge, radarIndex, radarCleared, fireSolvedOnce, onBonkWall]
  );

  const resetRadar = useCallback(() => {
    solvedFiredRef.current = null;
    setRadarIndex(0);
    setRadarCleared(0);
    setRadarResult('idle');
    setRadarRobotOverride(null);
  }, []);

  // 7. variable-counter
  const applyVarOp = useCallback((delta: number, label: string, codePy: string) => {
    setVarVal((prev) => {
      const next = Math.max(0, prev + delta);
      if (delta >= 0) playPush();
      else playPop();
      return next;
    });
    setVarSteps((s) => s + 1);
    setVarDeltaText(delta >= 0 ? `+${delta}` : String(delta));
    setVarIncoming(label);
    setVarLastPy(codePy);
  }, []);

  const resetVar = useCallback(() => {
    if (!challenge || challenge.type !== 'variable-counter') return;
    solvedFiredRef.current = null;
    setVarVal(0);
    setVarSteps(0);
    setVarDeltaText(undefined);
    setVarIncoming(undefined);
    setVarLastPy(`${challenge.varName} = 0`);
    playSwitch(false);
  }, [challenge]);

  // 8. array-lookup
  const pickArrayIndex = useCallback(
    (idx: number) => {
      if (!lesson || !challenge || challenge.type !== 'array-lookup') return;
      setArrayPicked(idx);
      if (idx === challenge.targetIndex) {
        fireSolvedOnce(`array-${lesson.id}`);
      } else {
        playQuizTryAgain();
      }
    },
    [lesson, challenge, fireSolvedOnce]
  );

  const resetArray = useCallback(() => {
    solvedFiredRef.current = null;
    setArrayPicked(null);
  }, []);

  // 9. stack-undo
  const popStack = useCallback(() => {
    if (!challenge || challenge.type !== 'stack-undo') return;
    setStackItems((prev) => {
      if (prev.length === 0) return prev;
      const popped = prev[prev.length - 1];
      const nextStack = prev.slice(0, -1);
      playPop();
      setOutItems((o) => [...o, popped]);
      const isFromQueue = challenge.queueToPush.some((q) => q.id === popped.id);
      if (isFromQueue) {
        setQueueItems((q) => (q.some((item) => item.id === popped.id) ? q : [popped, ...q]));
      }
      setStackOp('pop');
      setStackLastLabel(popped.label);
      return nextStack;
    });
  }, [challenge]);

  const pushStack = useCallback(() => {
    setQueueItems((prevQueue) => {
      if (prevQueue.length === 0) return prevQueue;
      const [item, ...rest] = prevQueue;
      playPush();
      setStackItems((prevStack) => [...prevStack, item]);
      setStackOp('push');
      setStackLastLabel(item.label);
      return rest;
    });
  }, []);

  const addBonusBlock = useCallback((item: StackBlockItem) => {
    playPush();
    const uniqueItem: StackBlockItem = {
      id: `${item.id}-${Date.now()}`,
      label: item.label,
    };
    setStackItems((prev) => (prev.length >= 6 ? prev : [...prev, uniqueItem]));
    setStackOp('push');
    setStackLastLabel(item.label);
  }, []);

  const handleClickStackBlocked = useCallback(
    (label: string) => {
      playBlocked();
      onShowToast(`「${label}」被压在下面啦！必须先把上面的方块 Pop 掉才能拿到它哦～`);
    },
    [onShowToast]
  );

  const resetStack = useCallback(() => {
    if (!challenge || challenge.type !== 'stack-undo') return;
    solvedFiredRef.current = null;
    setStackItems(challenge.initialStack);
    setQueueItems(challenge.queueToPush);
    setOutItems([]);
    setStackOp('idle');
    setStackLastLabel('');
  }, [challenge]);

  // 10. queue-shop
  const enqueueCustomer = useCallback(() => {
    setQIncoming((prev) => {
      if (prev.length === 0) return prev;
      const [nextPerson, ...rest] = prev;
      playPush();
      setQLine((line) => [...line, nextPerson]);
      setQOp('enqueue');
      setQLastLabel(nextPerson.label);
      return rest;
    });
  }, []);

  const dequeueCustomer = useCallback(() => {
    setQLine((prev) => {
      if (prev.length === 0) return prev;
      const [front, ...rest] = prev;
      playPop();
      setQServed((s) => [...s, front]);
      setQOp('dequeue');
      setQLastLabel(front.label);
      return rest;
    });
  }, []);

  const handleQueueMiddleBlocked = useCallback(
    (label: string) => {
      playBlocked();
      onShowToast(`「${label}」还在后面排队呢！公平队列（FIFO）必须先服务最前面的队头～`);
    },
    [onShowToast]
  );

  const resetQueue = useCallback(() => {
    if (!challenge || challenge.type !== 'queue-shop') return;
    solvedFiredRef.current = null;
    setQLine(challenge.initialQueue);
    setQIncoming(challenge.incomingList);
    setQServed([]);
    setQOp('idle');
    setQLastLabel('');
  }, [challenge]);

  // 11. tree-explorer
  const clickTreeNode = useCallback(
    (nodeId: string) => {
      if (!challenge || challenge.type !== 'tree-explorer') return;
      setTreeFocusId(nodeId);
      if (challenge.leafIds.includes(nodeId)) {
        if (!foundLeafIds.includes(nodeId)) {
          playQuizCorrect();
          setFoundLeafIds((prev) => [...prev, nodeId]);
          setTreeHint(`点亮叶子 ${nodeId}！它下面没有任何子节点啦！`);
        } else {
          playStep();
          setTreeHint(`叶子 ${nodeId} 已经点亮啦，找找别的叶子吧！`);
        }
      } else {
        playBlocked();
        const role = nodeId === 'A' ? '树根（Root）' : '分叉节点';
        const msg = `节点 ${nodeId} 是${role}，它下面还有两个孩子，不是叶子哦！`;
        setTreeHint(msg);
        onShowToast(msg);
      }
    },
    [challenge, foundLeafIds, onShowToast]
  );

  const resetTree = useCallback(() => {
    solvedFiredRef.current = null;
    setFoundLeafIds([]);
    setTreeFocusId(undefined);
    setTreeHint(null);
  }, []);

  // 12. growth-explorer
  const selectGrowthN = useCallback((n: number) => {
    playStep();
    setGrowthN(n);
    setVisitedN((prev) => (prev.includes(n) ? prev : [...prev, n]));
  }, []);

  // 13. binary-search-game
  const pickBinarySearchIdx = useCallback(
    (idx: number) => {
      if (!lesson || !challenge || challenge.type !== 'binary-search-game') return;
      if (idx < bsLow || idx > bsHigh) {
        playBlocked();
        onShowToast('这个箱子已经被排除掉啦，去高亮区间里找吧！');
        return;
      }
      const val = challenge.values[idx];
      setBsLastPick(idx);
      setBsRevealed((prev) => (prev.includes(idx) ? prev : [...prev, idx]));

      if (val === challenge.targetValue) {
        setBsHint(`太准啦！在 ${idx} 号箱找到 ${val}！`);
        fireSolvedOnce(`bs-${lesson.id}`);
      } else if (val < challenge.targetValue) {
        playHop(1);
        setBsLow(idx + 1);
        setBsHint(`${val} 太小了！把 ${idx} 号和左边全部划掉，去右边找！`);
      } else {
        playHop(2);
        setBsHigh(idx - 1);
        setBsHint(`${val} 太大了！把 ${idx} 号和右边全部划掉，去左边找！`);
      }
    },
    [lesson, challenge, bsLow, bsHigh, fireSolvedOnce, onShowToast]
  );

  const resetBinarySearch = useCallback(() => {
    if (!challenge || challenge.type !== 'binary-search-game') return;
    solvedFiredRef.current = null;
    setBsLow(0);
    setBsHigh(challenge.values.length - 1);
    setBsRevealed([]);
    setBsLastPick(null);
    setBsHint('先戳最中间的箱子，一口气排除一半吧！');
  }, [challenge]);

  // 14. bubble-sorter
  const swapBubblePair = useCallback((leftIdx: number) => {
    setSortValues((prev) => {
      if (leftIdx < 0 || leftIdx >= prev.length - 1) return prev;
      const next = [...prev];
      const tmp = next[leftIdx];
      next[leftIdx] = next[leftIdx + 1];
      next[leftIdx + 1] = tmp;
      playSwitch(true);
      return next;
    });
    setSortSwaps((s) => s + 1);
    setSortLastPair([leftIdx, leftIdx + 1]);
  }, []);

  const resetBubbleSort = useCallback(() => {
    if (!challenge || challenge.type !== 'bubble-sorter') return;
    solvedFiredRef.current = null;
    setSortValues([...challenge.initialValues]);
    setSortSwaps(0);
    setSortLastPair(null);
    playSwitch(false);
  }, [challenge]);

  // ==================== REACTIVE WIN CHECKS ====================
  const binarySum = bits[0] * 8 + bits[1] * 4 + bits[2] * 2 + bits[3] * 1;
  const binarySolved =
    active && challenge?.type === 'binary-builder' && binarySum === targetValue;

  const pixelMatchCount =
    challenge?.type === 'pixel-painter'
      ? challenge.targetPattern.reduce((acc, v, i) => acc + (pixels[i] === v ? 1 : 0), 0)
      : 0;
  const pixelSolved =
    active &&
    challenge?.type === 'pixel-painter' &&
    pixelMatchCount === challenge.targetPattern.length;

  const asciiSolved =
    active &&
    challenge?.type === 'ascii-decoder' &&
    pickedChars.join('') === challenge.targetWord;

  const varSolved =
    active && challenge?.type === 'variable-counter' && varVal === challenge.targetValue;

  const stackSolved =
    active &&
    challenge?.type === 'stack-undo' &&
    stackItems.length === challenge.targetStackLabels.length &&
    stackItems.every((item, idx) => item.label === challenge.targetStackLabels[idx]);

  const queueSolved =
    active &&
    challenge?.type === 'queue-shop' &&
    qIncoming.length === 0 &&
    challenge.targetServedLabels.every((lbl, idx) => qServed[idx]?.label === lbl);

  const treeSolved =
    active &&
    challenge?.type === 'tree-explorer' &&
    challenge.leafIds.every((id) => foundLeafIds.includes(id));

  const growthSolved =
    active &&
    challenge?.type === 'growth-explorer' &&
    growthN === challenge.targetN &&
    challenge.optionsN.every((n) => visitedN.includes(n));

  const bsFound =
    active &&
    challenge?.type === 'binary-search-game' &&
    bsRevealed.some((idx) => challenge.values[idx] === challenge.targetValue);

  const bubbleSorted =
    active &&
    challenge?.type === 'bubble-sorter' &&
    sortValues.every((v, i, arr) => i === 0 || arr[i - 1] <= v);

  useEffect(() => {
    if (!lesson || !active) return;
    if (binarySolved) {
      setSolvedTargets((prev) => (prev.includes(targetValue) ? prev : [...prev, targetValue]));
      fireSolvedOnce(`bin-${lesson.id}-${targetValue}`);
    } else if (pixelSolved) {
      fireSolvedOnce(`pixel-${lesson.id}`);
    } else if (asciiSolved) {
      fireSolvedOnce(`ascii-${lesson.id}`);
    } else if (varSolved) {
      fireSolvedOnce(`var-${lesson.id}`);
    } else if (stackSolved) {
      setStackHasSolvedOnce(true);
      fireSolvedOnce(`stack-${lesson.id}`);
    } else if (queueSolved) {
      fireSolvedOnce(`queue-${lesson.id}`);
    } else if (treeSolved) {
      fireSolvedOnce(`tree-${lesson.id}`);
    } else if (growthSolved) {
      fireSolvedOnce(`growth-${lesson.id}`);
    } else if (bubbleSorted) {
      fireSolvedOnce(`bubble-${lesson.id}`);
    }
  }, [
    lesson,
    active,
    binarySolved,
    targetValue,
    pixelSolved,
    asciiSolved,
    varSolved,
    stackSolved,
    queueSolved,
    treeSolved,
    growthSolved,
    bubbleSorted,
    fireSolvedOnce,
  ]);

  // ==================== RUNTIME PROJECTION ====================
  return useMemo<MicroLabRuntime | null>(() => {
    if (!lesson || !active || !challenge) return null;

    // 1. binary-builder
    if (challenge.type === 'binary-builder') {
      const litChips = BIT_WEIGHTS.map((w, idx) => ({
        text: String(w),
        tone: bits[idx] === 1 ? ('best' as const) : ('quiet' as const),
      }));

      let companionMood: CompanionMood = 'happy';
      let companionLine = `试试直接点左边的 2.5D 方块，把亮灯的数字加起来凑成 ${targetValue}！`;
      if (binarySolved) {
        companionMood = 'proud';
        companionLine = `哇！密码 ${targetValue} 破解成功！要不要点「随机出题」再挑战一个？`;
      } else if (binarySum > targetValue) {
        companionMood = 'oops';
        companionLine = `哎呀，超过目标 ${binarySum - targetValue} 啦！关掉一个亮着的方块试试～`;
      }

      return {
        sceneState: {
          scene: 'binary-bits',
          bits,
          focusBit,
          showWeights: true,
          interactive: true,
          tagText: binarySolved
            ? `密码破译！正好等于 ${targetValue}`
            : `当前总和 = ${binarySum}（目标 ${targetValue}）`,
          tagTone: binarySolved ? 'coral' : 'dark',
        },
        highlightLines: binarySolved ? [4, 5, 6, 7] : focusBit !== undefined ? [5, 6] : [2, 3],
        codeLines: lesson.codeLines,
        facts: {
          title: '开关实验读数',
          rows: [
            { label: '目标密码', value: targetValue },
            { label: '二进制编码', value: bits.join(' ') },
            { label: '权重状态', chips: litChips },
            {
              label: '当前总和',
              value: binarySum,
              meter: Math.min(1, targetValue > 0 ? binarySum / targetValue : 0),
              active: binarySolved,
            },
          ],
          note: binarySolved
            ? '所有亮起开关的权重之和正好等于目标密码！'
            : binarySum > targetValue
              ? `现在比目标大了 ${binarySum - targetValue}，关掉一个亮着的开关试试。`
              : `距离目标还差 ${targetValue - binarySum}，点击舞台上的 2.5D 方块试试！`,
        },
        isSolved: binarySolved,
        companionMood,
        companionLine,
        stageHandlers: { onToggleBit: toggleBit },
        binary: {
          targetValue,
          targets: challenge.targets,
          solvedTargets,
          bits,
          sum: binarySum,
          selectTarget: selectBinaryTarget,
          pickRandomTarget: pickRandomBinaryTarget,
          toggleBit,
          reset: resetBinary,
        },
      };
    }

    // 2. pixel-painter
    if (challenge.type === 'pixel-painter') {
      const total = challenge.rows * challenge.cols;
      const litCount = pixels.filter((p) => p === 1).length;
      const companionMood: CompanionMood = pixelSolved
        ? 'proud'
        : pixelMatchCount >= 20
          ? 'excited'
          : 'happy';
      const companionLine = pixelSolved
        ? `大功告成！你用 25 个 0 和 1 亲手点亮了「${challenge.targetName}」！`
        : `直接点击 2.5D 网格点亮小像素块，目标是画出一颗对称的「${challenge.targetName}」（可点下方小抄查看）！`;

      return {
        sceneState: {
          scene: 'pixel-grid',
          rows: challenge.rows,
          cols: challenge.cols,
          pixels,
          highlightCell,
          baseLabel: '5×5 像素画板',
          tagText: pixelSolved
            ? `画好啦！完美的${challenge.targetName}`
            : `匹配度 ${pixelMatchCount} / ${total}`,
          tagTone: pixelSolved ? 'coral' : 'dark',
          interactive: true,
        },
        highlightLines: pixelSolved ? [4, 5, 6] : [3, 4],
        codeLines: lesson.codeLines,
        facts: {
          title: '像素矩阵读数',
          rows: [
            { label: '目标图案', value: challenge.targetName },
            { label: '已点亮像素', value: `${litCount} 颗` },
            {
              label: '匹配进度',
              value: `${pixelMatchCount} / ${total}`,
              meter: pixelMatchCount / total,
              active: pixelSolved,
            },
          ],
          note: pixelSolved
            ? '屏幕上的每个图案，本质上都是一张由 0 和 1 组成的点阵表格！'
            : '点亮 1 表示珊瑚橙像素，点暗 0 表示空白背景。',
        },
        isSolved: pixelSolved,
        companionMood,
        companionLine,
        stageHandlers: { onTogglePixel: togglePixel },
        pixel: {
          rows: challenge.rows,
          cols: challenge.cols,
          pixels,
          targetPattern: challenge.targetPattern,
          targetName: challenge.targetName,
          matchCount: pixelMatchCount,
          totalCells: total,
          showGuide: showPixelGuide,
          toggleGuide: () => {
            playStep();
            setShowPixelGuide((g) => !g);
          },
          togglePixel,
          clear: clearPixels,
        },
      };
    }

    // 3. ascii-decoder
    if (challenge.type === 'ascii-decoder') {
      const targetCodes = challenge.targetWord.split('').map((ch) => {
        const found = challenge.codeMap.find((m) => m.char === ch);
        return found ? found.code : ch.charCodeAt(0);
      });
      const currentWord = pickedChars.join('');
      const hasWrong =
        pickedChars.length > 0 &&
        pickedChars.some((c, i) => c !== challenge.targetWord[i]);

      const items: IsoStripItem[] = targetCodes.map((code, idx) => {
        const picked = pickedChars[idx];
        const isCorrectSlot = picked === challenge.targetWord[idx];
        return {
          id: `ascii-slot-${idx}`,
          top: picked ?? '?',
          sub: String(code),
          tone: picked
            ? isCorrectSlot
              ? 'found'
              : 'active'
            : idx === pickedChars.length
              ? 'ink'
              : 'paper',
          lift: picked && isCorrectSlot ? 6 : 0,
        };
      });

      const companionMood: CompanionMood = asciiSolved
        ? 'proud'
        : hasWrong
          ? 'oops'
          : 'curious';
      const companionLine = asciiSolved
        ? `破译成功！[67, 65, 84] 翻译出来就是可爱的「${challenge.targetWord}」！`
        : hasWrong
          ? '咦，好像有一个字母对错号啦！点「退格」删掉重新查一下 ASCII 编号吧～'
          : '对照下面密码本里的数字编号，按顺序点出 67、65、84 对应的字母吧！';

      return {
        sceneState: {
          scene: 'iso-strip',
          items,
          baseLabel: 'ASCII 解码器',
          pointerIdx: pickedChars.length < targetCodes.length ? pickedChars.length : undefined,
          tagText: asciiSolved
            ? `解码成功：${challenge.targetWord} 🐱`
            : `已破译：${currentWord || '等待输入...'}`,
          tagTone: asciiSolved ? 'coral' : 'dark',
        },
        highlightLines: asciiSolved ? [4, 5, 6] : [2, 3, 4],
        codeLines: lesson.codeLines,
        facts: {
          title: 'ASCII 译码台',
          rows: [
            { label: '密文编号', value: targetCodes.join(' · ') },
            { label: '当前译文', value: currentWord || '---', active: asciiSolved },
            {
              label: '破译进度',
              value: `${pickedChars.length} / ${challenge.targetWord.length}`,
              meter: pickedChars.length / challenge.targetWord.length,
            },
          ],
          note: '电脑不直接存字母，而是靠全球统一的 ASCII 编号表把数字翻译成文字！',
        },
        isSolved: asciiSolved,
        companionMood,
        companionLine,
        stageHandlers: {},
        ascii: {
          codeMap: challenge.codeMap,
          targetWord: challenge.targetWord,
          pickedChars,
          pickChar: pickAsciiChar,
          backspace: backspaceAscii,
          reset: resetAscii,
        },
      };
    }

    // 4. seq-debugger
    if (challenge.type === 'seq-debugger') {
      const dynamicCode: BilingualCodeLine[] = [
        { line: 1, indent: 0, cn: '走到能量块():', py: 'def walk_to_star():', isHead: true },
        ...Array.from({ length: seqCount }, (_, idx) => ({
          line: idx + 2,
          indent: 4,
          cn: `向前跳 1 格  # 第 ${idx + 1} 步`,
          py: `robot.move()  # step ${idx + 1}`,
        })),
      ];

      let tagText = `当前共有 ${seqCount} 行指令`;
      let companionMood: CompanionMood = 'curious';
      let companionLine = '原程序写了 5 行「向前跳」，阿派会撞到 4 号墙！删掉多余的行再运行试试！';

      if (seqStatus === 'step') {
        tagText = `正在执行第 ${seqRobotAt} 行指令`;
        companionMood = 'excited';
        companionLine = `一步一步照着你的代码走，现在在第 ${seqRobotAt} 格！`;
      } else if (seqStatus === 'victory') {
        tagText = `Bug 修复！正好 ${seqCount} 步到达`;
        companionMood = 'proud';
        companionLine = '太酷了！你亲手删掉了多余指令，修好了你的第一个程序 Bug！';
      } else if (seqStatus === 'bonk') {
        tagText = '咚！多余的指令让我撞墙啦';
        companionMood = 'oops';
        companionLine = '哎哟！指令还是太多行，我刹不住车撞到 4 号墙了！试着删掉几行吧～';
      } else if (seqStatus === 'short') {
        tagText = `停在 ${seqRobotAt} 号格，还差一点`;
        companionMood = 'curious';
        companionLine = '哎呀删得有点多啦，还差几步才摸到星星，点「加一行」补回来吧！';
      }

      return {
        sceneState: {
          scene: 'robot-loop',
          trackLength: challenge.trackLength,
          robotAt: seqRobotAt,
          goalAt: challenge.goalAt,
          wallAt: challenge.wallAt,
          visited: seqVisited,
          baseLabel: '顺序排错跑道',
          status: seqStatus,
          tagText,
        },
        highlightLines:
          seqStatus === 'step' ? [Math.min(seqCount + 1, seqRobotAt + 1)] : [1, 2],
        codeLines: dynamicCode,
        facts: {
          title: 'Bug 修复工作台',
          rows: [
            { label: '目标星星', value: `${challenge.goalAt} 号格` },
            { label: '障碍墙', value: `${challenge.wallAt} 号格` },
            { label: '当前指令行数', value: `${seqCount} 行`, active: seqStatus === 'victory' },
          ],
          note:
            seqStatus === 'victory'
              ? '计算机非常听话，写几行就做几步——找到并修正错误就叫 Debug！'
              : '先点「运行测试」看看原来的 Bug，再调整指令行数！',
        },
        isSolved: seqStatus === 'victory',
        companionMood,
        companionLine,
        stageHandlers: {},
        seqDebug: {
          stepCount: seqCount,
          minSteps: 1,
          maxSteps: 6,
          running: seqRunning,
          status: seqStatus,
          removeStep: removeSeqStep,
          addStep: addSeqStep,
          run: runSeqDebug,
          reset: resetSeqDebug,
        },
      };
    }

    // 5. loop-tuner
    if (challenge.type === 'loop-tuner') {
      const dynamicCode: BilingualCodeLine[] = [
        { line: 1, indent: 0, cn: '循环出发():', py: 'def walk_smart():', isHead: true },
        { line: 2, indent: 4, cn: `重复 ${loopN} 次:`, py: `for i in range(${loopN}):` },
        { line: 3, indent: 8, cn: '向前跳 1 格', py: 'robot.move()' },
      ];

      let tagText = `准备执行 ${loopN} 次循环`;
      let companionMood: CompanionMood = 'curious';
      let companionLine = '拖动滑块决定我要跳几次！听说故意撞一次墙还有神秘彩蛋哦…';

      if (loopStatus === 'step') {
        tagText = `循环 i = ${loopCurrent} / ${loopN}`;
        companionMood = 'excited';
        companionLine = `冲呀！正在跳第 ${loopCurrent} 步！`;
      } else if (loopStatus === 'victory') {
        tagText = `精准刹车！${loopN} 次收集成功`;
        companionMood = 'proud';
        companionLine = '稳稳停在能量块上，一格不多、一格不少！你是天才指挥官！';
      } else if (loopStatus === 'bonk') {
        tagText = `咚！第 ${loopCurrent} 次撞墙啦`;
        companionMood = 'oops';
        companionLine = '哎哟我的小脑袋！循环次数设大了就会冲进 5 号障碍墙，这就是「越界 Bug」～';
      } else if (loopStatus === 'short') {
        tagText = `停在 ${loopRobotAt} 号格，还差 ${challenge.goalAt - loopRobotAt} 格`;
        companionMood = 'curious';
        companionLine = `差 ${challenge.goalAt - loopRobotAt} 步就摸到星星啦！把 N 再调大一点试试！`;
      }

      return {
        sceneState: {
          scene: 'robot-loop',
          trackLength: challenge.trackLength,
          robotAt: loopRobotAt,
          goalAt: challenge.goalAt,
          wallAt: challenge.wallAt,
          visited: loopVisited,
          loopCurrent,
          loopTotal: loopN,
          status: loopStatus,
          tagText,
        },
        highlightLines:
          loopStatus === 'idle' ? [2] : loopStatus === 'step' ? [3] : [2, 3],
        codeLines: dynamicCode,
        facts: {
          title: '调参实验状态',
          rows: [
            { label: '目标位置', value: `${challenge.goalAt} 号格` },
            { label: '障碍墙位置', value: `${challenge.wallAt} 号格` },
            { label: '设定循环 N', value: `${loopN} 次`, active: loopStatus === 'idle' },
            {
              label: '当前进度',
              value: `${loopCurrent} / ${loopN}`,
              meter: loopN > 0 ? Math.min(1, loopCurrent / loopN) : 0,
              active: loopStatus === 'victory',
            },
          ],
          note:
            loopStatus === 'bonk'
              ? '循环次数设大了（越界 Bug），阿派冲进了障碍墙！'
              : loopStatus === 'short'
                ? '循环次数偏小，阿派提前刹停在半路上了。'
                : loopStatus === 'victory'
                  ? '刚好 4 步到达能量块，一格不多、一格不少！'
                  : '调节 N 的大小，再点击「运行我的指令」观察动画。',
        },
        isSolved: loopStatus === 'victory',
        companionMood,
        companionLine,
        stageHandlers: {},
        loop: {
          loopN,
          minN: challenge.minN,
          maxN: challenge.maxN,
          running: loopRunning,
          status: loopStatus,
          robotAt: loopRobotAt,
          goalAt: challenge.goalAt,
          wallAt: challenge.wallAt,
          setLoopN,
          run: runLoop,
          reset: resetLoop,
        },
      };
    }

    // 6. if-radar
    if (challenge.type === 'if-radar') {
      const sc = challenge.scenarios[radarIndex] ?? challenge.scenarios[0];
      const allCleared = radarCleared >= challenge.scenarios.length;
      const robotPos = radarRobotOverride ?? sc.robotAt;

      let companionMood: CompanionMood = 'curious';
      let companionLine = `第 ${radarIndex + 1} 关雷达扫描中：看看阿派前面一格有没有墙，帮我选 if 还是 else！`;
      if (allCleared) {
        companionMood = 'proud';
        companionLine = '3 次路况全部判断满分！阿派现在拥有超灵敏的自动驾驶大脑啦！';
      } else if (radarResult === 'correct') {
        companionMood = 'excited';
        companionLine = '判断超准确！正在切换到下一段路况...';
      } else if (radarResult === 'wrong') {
        companionMood = 'oops';
        companionLine = sc.wallAhead
          ? '咚！雷达明明看到前方紧挨着障碍墙，应该立刻刹车（走 if 分支）呀！'
          : '前方明明安全畅通呢，不要白白停在原地，大胆前进（走 else 分支）吧！';
      }

      return {
        sceneState: {
          scene: 'robot-loop',
          trackLength: 6,
          robotAt: robotPos,
          goalAt: sc.goalAt,
          wallAt: sc.wallAt,
          visited: Array.from({ length: robotPos + 1 }, (_, i) => i),
          radarAt: sc.robotAt + 1,
          baseLabel: 'if / else 雷达跑道',
          status:
            radarResult === 'wrong' && sc.wallAhead
              ? 'bonk'
              : allCleared
                ? 'victory'
                : radarResult === 'correct'
                  ? 'step'
                  : 'idle',
          tagText: allCleared
            ? '3/3 全部安全通关！'
            : sc.wallAhead
              ? `雷达警报：${sc.robotAt + 1} 号格有墙！`
              : `雷达安全：${sc.robotAt + 1} 号格畅通`,
        },
        highlightLines:
          radarResult === 'correct'
            ? sc.wallAhead
              ? [2, 3]
              : [4, 5]
            : [2, 4],
        codeLines: lesson.codeLines,
        facts: {
          title: '雷达条件判定',
          rows: [
            { label: '当前路况', value: sc.label },
            {
              label: '前方有墙？',
              value: sc.wallAhead ? 'True (是)' : 'False (否)',
              active: true,
            },
            {
              label: '通关进度',
              value: `${radarCleared} / ${challenge.scenarios.length}`,
              meter: radarCleared / challenge.scenarios.length,
              active: allCleared,
            },
          ],
          note: '条件判断 if / else 让程序拥有「看情况做决定」的聪明大脑！',
        },
        isSolved: allCleared,
        companionMood,
        companionLine,
        stageHandlers: {},
        ifRadar: {
          scenarioIndex: radarIndex,
          totalScenarios: challenge.scenarios.length,
          clearedCount: radarCleared,
          currentLabel: sc.label,
          wallAhead: sc.wallAhead,
          lastResult: radarResult,
          choose: chooseRadarAction,
          reset: resetRadar,
        },
      };
    }

    // 7. variable-counter
    if (challenge.type === 'variable-counter') {
      const dynamicCode: BilingualCodeLine[] = [
        { line: 1, indent: 0, cn: `${challenge.varName} = 0  # 初始化盒子`, py: `${challenge.varName} = 0` },
        { line: 2, indent: 0, cn: `# 最近一次操作（当前值 = ${varVal}）`, py: `# latest value = ${varVal}` },
        { line: 3, indent: 0, cn: `${challenge.varName} = ${challenge.varName} ${varDeltaText ? `${varDeltaText[0]} ${varDeltaText.slice(1)}` : '+ 0'}`, py: varLastPy },
      ];

      let companionMood: CompanionMood = 'happy';
      let companionLine = `点下面按钮往「${challenge.varName}」盒子里加减分数，把盒子里的数正好凑成 ${challenge.targetValue}！`;
      if (varSolved) {
        companionMood = 'proud';
        companionLine = `耶！${challenge.varName} 刚好等于 ${challenge.targetValue}！你已经掌握变量「覆盖更新」的精髓啦！`;
      } else if (varVal > challenge.targetValue) {
        companionMood = 'oops';
        companionLine = `哇，超过 ${challenge.targetValue} 了！赶紧点扣分按钮减回来一点～`;
      }

      return {
        sceneState: {
          scene: 'variable-box',
          boxes: [
            {
              name: challenge.varName,
              value: varVal,
              highlight: true,
              deltaText: varDeltaText,
            },
            {
              name: 'target',
              value: challenge.targetValue,
            },
          ],
          incomingToken: varIncoming,
          tagText: varSolved
            ? `${challenge.varName} == ${challenge.targetValue} 达成！`
            : `盒子 ${challenge.varName} = ${varVal}`,
          tagTone: varSolved ? 'coral' : 'dark',
        },
        highlightLines: varSteps === 0 ? [1] : [3],
        codeLines: dynamicCode,
        facts: {
          title: '变量内存状态',
          rows: [
            { label: '盒子名字', value: challenge.varName },
            { label: '当前存的值', value: varVal, active: varSolved },
            { label: '目标分数', value: challenge.targetValue },
            {
              label: '接近目标',
              value: `${varVal} / ${challenge.targetValue}`,
              meter: Math.min(1, varVal / challenge.targetValue),
            },
          ],
          note: '变量盒子一次只记住最新的数字：新值装进去，旧值就自动替换掉。',
        },
        isSolved: varSolved,
        companionMood,
        companionLine,
        stageHandlers: {},
        variable: {
          varName: challenge.varName,
          value: varVal,
          targetValue: challenge.targetValue,
          stepsTaken: varSteps,
          operations: challenge.operations,
          applyOp: applyVarOp,
          reset: resetVar,
        },
      };
    }

    // 8. array-lookup
    if (challenge.type === 'array-lookup') {
      const isRight = arrayPicked === challenge.targetIndex;
      const items: IsoStripItem[] = challenge.items.map((item, idx) => ({
        id: `arr-${idx}`,
        top: item,
        sub: `[${idx}]`,
        tone:
          arrayPicked === idx
            ? idx === challenge.targetIndex
              ? 'found'
              : 'active'
            : 'paper',
        lift: arrayPicked === idx ? 10 : 0,
      }));

      let companionMood: CompanionMood = 'curious';
      let companionLine = `小心陷阱哦！数组是从 [0] 开始数的，直接点舞台上装着 ${challenge.targetItem} 的那格吧！`;
      if (isRight) {
        companionMood = 'proud';
        companionLine = `秒杀！items[${challenge.targetIndex}] 正好就是 ${challenge.targetItem}，记住程序员都从 0 开始数！`;
      } else if (arrayPicked !== null) {
        companionMood = 'oops';
        companionLine = `哎呀，[${arrayPicked}] 号柜子里装的是 ${challenge.items[arrayPicked]}！别忘了最左边是 0 号哦～`;
      }

      return {
        sceneState: {
          scene: 'iso-strip',
          items,
          baseLabel: '数组储物柜 items[]',
          pointerIdx: arrayPicked ?? undefined,
          tagText: isRight
            ? `精准命中 items[${challenge.targetIndex}] = ${challenge.targetItem}`
            : arrayPicked !== null
              ? `items[${arrayPicked}] 是 ${challenge.items[arrayPicked]}，再找找！`
              : `找出 ${challenge.targetItem} 的下标`,
          tagTone: isRight ? 'coral' : 'dark',
          interactive: true,
        },
        highlightLines: isRight ? [3, 4] : [1, 2],
        codeLines: lesson.codeLines,
        facts: {
          title: '数组 O(1) 寻址',
          rows: [
            { label: '要找的宝物', value: challenge.targetItem },
            { label: '你点的下标', value: arrayPicked !== null ? `[${arrayPicked}]` : '未选择', active: isRight },
            { label: '查询步数', value: '只要 1 步 O(1)' },
          ],
          note: '数组下标从 0 开始：第 4 个柜子的门牌号其实是 [3]！',
        },
        isSolved: isRight,
        companionMood,
        companionLine,
        stageHandlers: { onClickStripItem: pickArrayIndex },
        arrayLookup: {
          items: challenge.items,
          targetItem: challenge.targetItem,
          pickedIndex: arrayPicked,
          pickIndex: pickArrayIndex,
          reset: resetArray,
        },
      };
    }

    // 9. stack-undo
    if (challenge.type === 'stack-undo') {
      let tagText = '点最顶上的方块 Pop，或点左边方块 Push';
      let tagAnchor: 'top' | 'out' | 'inbox' = 'top';
      let companionMood: CompanionMood = 'curious';
      let companionLine = '也可以直接用鼠标点舞台最顶上的方块撤回哦！点下面的块试试会发生啥？';

      if (stackSolved) {
        tagText = '完美修复！作品大功告成';
        tagAnchor = 'top';
        companionMood = 'proud';
        companionLine = '太棒啦！画画修好了，下方还解锁了「自由叠叠乐」新方块可以随便玩！';
      } else if (stackOp === 'pop') {
        tagText = `pop() → ${stackLastLabel}`;
        tagAnchor = 'out';
        companionMood = 'excited';
        companionLine = `嗖！把「${stackLastLabel}」从栈顶弹出去啦！`;
      } else if (stackOp === 'push') {
        tagText = `push → ${stackLastLabel}`;
        tagAnchor = 'top';
        companionMood = 'happy';
        companionLine = `啪嗒！「${stackLastLabel}」稳稳叠到最顶上了！`;
      }

      const topItem = stackItems[stackItems.length - 1];
      return {
        sceneState: {
          scene: 'stack-plates',
          stack: stackItems,
          inbox: queueItems[0],
          out: outItems,
          highlightTop: stackOp === 'push' || stackSolved,
          op: stackOp,
          tagText,
          tagAnchor,
          interactive: true,
        },
        highlightLines: stackOp === 'push' ? [1, 2] : stackOp === 'pop' ? [4, 5, 6] : [1, 4],
        codeLines: lesson.codeLines,
        facts: {
          title: '撤回栈实验状态',
          rows: [
            {
              label: '目标顺序',
              detail: '从底到顶',
              chips: challenge.targetStackLabels.map((t) => ({ text: t })),
            },
            { label: '当前栈顶', value: topItem ? topItem.label : '空栈', active: stackSolved },
            { label: '栈内高度', value: stackItems.length },
            { label: '已弹出数量', value: outItems.length },
          ],
          note: stackSolved
            ? '先 Pop 清掉后进来的错误步骤，再 Push 新步骤——你已经完全掌握 LIFO！'
            : '提示：栈只能从最顶上拿走元素，不能直接抽走中间那一块。',
        },
        isSolved: stackSolved,
        companionMood,
        companionLine,
        stageHandlers: {
          onClickStackInbox: queueItems.length > 0 ? pushStack : undefined,
          onClickStackTop: stackItems.length > 0 ? popStack : undefined,
          onClickStackBlocked: handleClickStackBlocked,
        },
        stack: {
          stack: stackItems,
          queue: queueItems,
          out: outItems,
          targetLabels: challenge.targetStackLabels,
          hasSolvedOnce: stackHasSolvedOnce,
          pop: popStack,
          push: pushStack,
          addBonusBlock,
          reset: resetStack,
        },
      };
    }

    // 10. queue-shop
    if (challenge.type === 'queue-shop') {
      let companionMood: CompanionMood = 'happy';
      let companionLine = '点「入队」让阿派排到队尾，再点「出队」按先后顺序给小明和小红发奶茶吧！';
      if (queueSolved) {
        companionMood = 'proud';
        companionLine = '超公平的小店长！先来的小明、小红先拿到了奶茶，阿派也稳稳排上了队！';
      } else if (qOp === 'enqueue') {
        companionMood = 'excited';
        companionLine = `「${qLastLabel}」乖乖排到队伍最后面啦！现在点队头方块或「出队」发奶茶吧！`;
      } else if (qOp === 'dequeue') {
        companionMood = 'happy';
        companionLine = `「${qLastLabel}」拿到奶茶开心走啦！队列后面的人往前挪了一步！`;
      }

      return {
        sceneState: {
          scene: 'queue-line',
          queue: qLine,
          incoming: qIncoming[0],
          served: qServed,
          op: qOp,
          tagText: queueSolved
            ? 'FIFO 公平出餐完成 🧋'
            : qOp === 'enqueue'
              ? `入队 → ${qLastLabel}`
              : qOp === 'dequeue'
                ? `出队 → ${qLastLabel}`
                : '点最前面的队头出队，或点左边入队',
          tagAnchor: qOp === 'enqueue' ? 'back' : qOp === 'dequeue' ? 'served' : 'front',
          interactive: true,
        },
        highlightLines: qOp === 'enqueue' ? [1, 2] : qOp === 'dequeue' ? [4, 5, 6] : [1, 4],
        codeLines: lesson.codeLines,
        facts: {
          title: '奶茶店队列状态',
          rows: [
            { label: '当前队头', value: qLine[0]?.label ?? '空队' },
            { label: '排队人数', value: `${qLine.length} 人` },
            {
              label: '已取餐顺序',
              chips:
                qServed.length > 0
                  ? qServed.map((p) => ({ text: p.label, tone: 'best' as const }))
                  : [{ text: '暂无', tone: 'quiet' as const }],
            },
          ],
          note: queueSolved
            ? '先进先出（FIFO）：谁先排在队头，谁就第一个被服务！'
            : '试试直接点舞台中间排队的人，看看能不能插队？',
        },
        isSolved: queueSolved,
        companionMood,
        companionLine,
        stageHandlers: {
          onClickQueueIncoming: qIncoming.length > 0 ? enqueueCustomer : undefined,
          onClickQueueFront: qLine.length > 0 ? dequeueCustomer : undefined,
          onClickQueueMiddle: handleQueueMiddleBlocked,
        },
        queueShop: {
          queue: qLine,
          incoming: qIncoming,
          served: qServed,
          enqueue: enqueueCustomer,
          dequeue: dequeueCustomer,
          reset: resetQueue,
        },
      };
    }

    // 11. tree-explorer
    if (challenge.type === 'tree-explorer') {
      const dynamicNodes = challenge.nodes.map((node) => ({
        ...node,
        tone: foundLeafIds.includes(node.id)
          ? ('found' as const)
          : treeFocusId === node.id
            ? ('active' as const)
            : ('paper' as const),
      }));

      const companionMood: CompanionMood = treeSolved
        ? 'proud'
        : treeHint && treeHint.includes('不是叶子')
          ? 'oops'
          : 'curious';
      const companionLine = treeSolved
        ? '全部 4 片叶子 D、E、F、G 都亮起来啦！你一眼就能看穿树的结构！'
        : treeHint ?? '直接点击 2.5D 树上的方块，找出所有「下面没有孩子」的叶子节点！';

      return {
        sceneState: {
          scene: 'binary-tree',
          nodes: dynamicNodes,
          focusNodeId: treeFocusId,
          tagText: treeSolved
            ? '4 片叶子全部点亮！'
            : `已找到叶子 ${foundLeafIds.length} / ${challenge.leafIds.length}`,
          tagTone: treeSolved ? 'coral' : 'dark',
          interactive: true,
        },
        highlightLines: treeSolved ? [5, 6, 7] : [2, 3, 4],
        codeLines: lesson.codeLines,
        facts: {
          title: '二叉树侦察记录',
          rows: [
            { label: '总节点数', value: challenge.nodes.length },
            {
              label: '已点亮叶子',
              chips: challenge.leafIds.map((id) => ({
                text: id,
                tone: foundLeafIds.includes(id) ? ('best' as const) : ('quiet' as const),
              })),
            },
            {
              label: '找齐进度',
              value: `${foundLeafIds.length} / ${challenge.leafIds.length}`,
              meter: foundLeafIds.length / challenge.leafIds.length,
              active: treeSolved,
            },
          ],
          note: '没有左孩子、也没有右孩子的末端节点叫做「叶子（Leaf）」。',
        },
        isSolved: treeSolved,
        companionMood,
        companionLine,
        stageHandlers: { onClickTreeNode: clickTreeNode },
        tree: {
          foundLeafIds,
          totalLeaves: challenge.leafIds.length,
          lastHint: treeHint,
          clickNode: clickTreeNode,
          reset: resetTree,
        },
      };
    }

    // 12. growth-explorer
    if (challenge.type === 'growth-explorer') {
      const logSteps = Math.max(1, Math.round(Math.log2(growthN)));
      const sqSteps = growthN * growthN;
      const companionMood: CompanionMood = growthSolved ? 'proud' : 'excited';
      const companionLine = growthSolved
        ? '太震撼了对不对？n = 8 时，O(1) 还是 1 步，而 O(n²) 已经暴涨到 64 步啦！'
        : `点下方按钮把 n = 2、4、8 都体验一遍，最后停在 n = ${challenge.targetN} 亲眼对比差距！`;

      return {
        sceneState: {
          scene: 'growth-stairs',
          n: growthN,
          focusTier: growthFocusTier,
          tagText: `n = ${growthN}`,
        },
        highlightLines:
          growthFocusTier === 0
            ? [1, 2]
            : growthFocusTier === 1
              ? [4, 5]
              : growthFocusTier === 2
                ? [7, 8]
                : [4, 5, 8],
        codeLines: lesson.codeLines,
        facts: {
          title: `n = ${growthN} 时的工作量`,
          rows: [
            { label: 'O(1)', detail: '常数', value: 1, active: growthFocusTier === 0 },
            { label: 'O(log n)', detail: '对数', value: logSteps, active: growthFocusTier === 1 },
            { label: 'O(n)', detail: '线性', value: growthN, active: growthFocusTier === 2 },
            { label: 'O(n²)', detail: '平方', value: sqSteps, active: growthFocusTier === 3 || growthSolved },
          ],
          note: `已观察规模：${visitedN.sort((a, b) => a - b).map((v) => `n=${v}`).join('、')}`,
        },
        isSolved: growthSolved,
        companionMood,
        companionLine,
        stageHandlers: {},
        growth: {
          currentN: growthN,
          optionsN: challenge.optionsN,
          visitedN,
          targetN: challenge.targetN,
          focusTier: growthFocusTier,
          selectN: selectGrowthN,
          selectTier: setGrowthFocusTier,
        },
      };
    }

    // 13. binary-search-game
    if (challenge.type === 'binary-search-game') {
      const items: IsoStripItem[] = challenge.values.map((val, idx) => {
        const isRevealed = bsRevealed.includes(idx);
        const isEliminated = idx < bsLow || idx > bsHigh;
        const isTarget = isRevealed && val === challenge.targetValue;
        return {
          id: `bs-${idx}`,
          top: isRevealed ? String(val) : '?',
          sub: `${idx}号`,
          tone: isTarget
            ? 'found'
            : isEliminated
              ? 'dim'
              : bsLastPick === idx
                ? 'active'
                : 'paper',
          lift: isTarget ? 10 : isEliminated ? 0 : 3,
        };
      });

      const companionMood: CompanionMood = bsFound ? 'proud' : 'excited';
      const companionLine = bsFound
        ? bsRevealed.length <= 3
          ? `神级操作！只用了 ${bsRevealed.length} 步就抓住了 ${challenge.targetValue}，二分搜索大师非你莫属！`
          : `找到了！用了 ${bsRevealed.length} 步，下次试着每次都戳正中间，3 步就能搞定哦！`
        : bsHint;

      return {
        sceneState: {
          scene: 'iso-strip',
          items,
          baseLabel: '有序神秘箱（从小到大）',
          pointerIdx: bsLastPick ?? Math.floor((bsLow + bsHigh) / 2),
          tagText: bsFound
            ? `找到 ${challenge.targetValue}！（共 ${bsRevealed.length} 步）`
            : `剩余范围 [${bsLow} .. ${bsHigh}]`,
          tagTone: bsFound ? 'coral' : 'dark',
          interactive: !bsFound,
        },
        highlightLines: bsFound ? [5, 6] : [3, 4, 7, 8],
        codeLines: lesson.codeLines,
        facts: {
          title: '二分寻宝仪',
          rows: [
            { label: '目标数字', value: challenge.targetValue },
            { label: '有效区间', value: `[${bsLow} .. ${bsHigh}]` },
            { label: '已掀开次数', value: `${bsRevealed.length} 次`, active: bsFound },
          ],
          note: '每次点最中间的箱子，就能把搜索范围直接砍半！',
        },
        isSolved: bsFound,
        companionMood,
        companionLine,
        stageHandlers: { onClickStripItem: bsFound ? undefined : pickBinarySearchIdx },
        binarySearch: {
          values: challenge.values,
          targetValue: challenge.targetValue,
          low: bsLow,
          high: bsHigh,
          revealed: bsRevealed,
          tries: bsRevealed.length,
          found: bsFound,
          pickIndex: pickBinarySearchIdx,
          reset: resetBinarySearch,
        },
      };
    }

    // 14. bubble-sorter
    const items: IsoStripItem[] = sortValues.map((val, idx) => ({
      id: `sort-${idx}-${val}`,
      top: String(val),
      sub: `${idx}号`,
      height: 16 + val * 6.5,
      tone: bubbleSorted
        ? 'found'
        : sortLastPair && (sortLastPair[0] === idx || sortLastPair[1] === idx)
          ? 'active'
          : 'paper',
      lift: bubbleSorted ? 4 : 0,
    }));

    const companionMood: CompanionMood = bubbleSorted ? 'proud' : 'happy';
    const companionLine = bubbleSorted
      ? `整齐极啦！[${sortValues.join(', ')}] 从矮到高排成阶梯，一共只交换了 ${sortSwaps} 次！`
      : '只要左边方块比右边高，就点按钮把它们俩交换位置（也可以直接点左边方块和右边交换哦）！';

    return {
      sceneState: {
        scene: 'iso-strip',
        items,
        baseLabel: '冒泡排序阶梯',
        pointerIdx: sortLastPair ? sortLastPair[0] : undefined,
        tagText: bubbleSorted
          ? `排序完成！共交换 ${sortSwaps} 次`
          : `当前顺序：[${sortValues.join(', ')}]`,
        tagTone: bubbleSorted ? 'coral' : 'dark',
        interactive: !bubbleSorted,
      },
      highlightLines: bubbleSorted ? [1, 2] : [3, 4, 5],
      codeLines: lesson.codeLines,
      facts: {
        title: '冒泡交换记录',
        rows: [
          { label: '目标方向', value: '从小到大（左矮右高）' },
          { label: '当前序列', value: sortValues.join(' · '), active: bubbleSorted },
          { label: '交换次数', value: `${sortSwaps} 次` },
        ],
        note: bubbleSorted
          ? '相邻比较、大的往右冒——你已经亲手跑完了一遍冒泡排序！'
          : '提示：找到「左大右小」的相邻一对，把它们交换过来！',
      },
      isSolved: bubbleSorted,
      companionMood,
      companionLine,
      stageHandlers: {
        onClickStripItem: bubbleSorted
          ? undefined
          : (idx) => {
              const pairLeft = idx >= sortValues.length - 1 ? sortValues.length - 2 : idx;
              swapBubblePair(pairLeft);
            },
      },
      bubbleSort: {
        values: sortValues,
        swaps: sortSwaps,
        lastPair: sortLastPair,
        swapPair: swapBubblePair,
        reset: resetBubbleSort,
      },
    };
  }, [
    lesson,
    active,
    challenge,
    bits,
    focusBit,
    binarySolved,
    binarySum,
    targetValue,
    solvedTargets,
    toggleBit,
    selectBinaryTarget,
    pickRandomBinaryTarget,
    resetBinary,
    pixels,
    highlightCell,
    pixelMatchCount,
    pixelSolved,
    showPixelGuide,
    togglePixel,
    clearPixels,
    pickedChars,
    asciiSolved,
    pickAsciiChar,
    backspaceAscii,
    resetAscii,
    seqCount,
    seqRunning,
    seqRobotAt,
    seqVisited,
    seqStatus,
    removeSeqStep,
    addSeqStep,
    runSeqDebug,
    resetSeqDebug,
    loopN,
    loopRunning,
    loopRobotAt,
    loopVisited,
    loopCurrent,
    loopStatus,
    setLoopN,
    runLoop,
    resetLoop,
    radarIndex,
    radarCleared,
    radarResult,
    radarRobotOverride,
    chooseRadarAction,
    resetRadar,
    varVal,
    varSteps,
    varDeltaText,
    varIncoming,
    varLastPy,
    varSolved,
    applyVarOp,
    resetVar,
    arrayPicked,
    pickArrayIndex,
    resetArray,
    stackItems,
    queueItems,
    outItems,
    stackOp,
    stackLastLabel,
    stackSolved,
    stackHasSolvedOnce,
    popStack,
    pushStack,
    addBonusBlock,
    handleClickStackBlocked,
    resetStack,
    qLine,
    qIncoming,
    qServed,
    qOp,
    qLastLabel,
    queueSolved,
    enqueueCustomer,
    dequeueCustomer,
    handleQueueMiddleBlocked,
    resetQueue,
    foundLeafIds,
    treeFocusId,
    treeHint,
    treeSolved,
    clickTreeNode,
    resetTree,
    growthN,
    visitedN,
    growthFocusTier,
    growthSolved,
    selectGrowthN,
    bsLow,
    bsHigh,
    bsRevealed,
    bsLastPick,
    bsHint,
    bsFound,
    pickBinarySearchIdx,
    resetBinarySearch,
    sortValues,
    sortSwaps,
    sortLastPair,
    bubbleSorted,
    swapBubblePair,
    resetBubbleSort,
  ]);
}

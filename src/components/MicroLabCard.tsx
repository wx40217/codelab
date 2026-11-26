import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpFromLine,
  CheckCircle2,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import {
  BilingualCodeLine,
  FactRow,
  Lesson,
  SceneState,
  StackBlockItem,
} from '../types/course';

const WEIGHTS = [8, 4, 2, 1] as const;

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
  onToggleBit?: (index: number) => void;
  // Internal controls consumed by MicroLabCard
  binary?: {
    targetIdx: number;
    targets: number[];
    bits: [0 | 1, 0 | 1, 0 | 1, 0 | 1];
    sum: number;
    target: number;
    selectTarget: (idx: number) => void;
    toggleBit: (idx: number) => void;
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
  stack?: {
    stack: StackBlockItem[];
    queue: StackBlockItem[];
    out: StackBlockItem[];
    targetLabels: string[];
    pop: () => void;
    push: () => void;
    reset: () => void;
  };
}

export function useMicroLabRuntime(
  lesson: Lesson | undefined,
  active: boolean,
  onSolved: (lessonId: string) => void
): MicroLabRuntime | null {
  const challenge = lesson?.challenge;

  // --- 1. Binary builder state ---
  const [targetIdx, setTargetIdx] = useState(0);
  const [bits, setBits] = useState<[0 | 1, 0 | 1, 0 | 1, 0 | 1]>([0, 0, 0, 0]);
  const [focusBit, setFocusBit] = useState<number | undefined>(undefined);

  // --- 2. Loop tuner state ---
  const [loopN, setLoopNState] = useState(2);
  const [running, setRunning] = useState(false);
  const [robotAt, setRobotAt] = useState(0);
  const [visited, setVisited] = useState<number[]>([0]);
  const [loopCurrent, setLoopCurrent] = useState(0);
  const [loopStatus, setLoopStatus] = useState<'idle' | 'step' | 'bonk' | 'victory' | 'short'>('idle');
  const timerRef = useRef<number | null>(null);

  // --- 3. Stack undo state ---
  const [stackItems, setStackItems] = useState<StackBlockItem[]>([]);
  const [queueItems, setQueueItems] = useState<StackBlockItem[]>([]);
  const [outItems, setOutItems] = useState<StackBlockItem[]>([]);
  const [stackOp, setStackOp] = useState<'idle' | 'push' | 'pop'>('idle');
  const [stackLastLabel, setStackLastLabel] = useState('');

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Reset challenge state whenever lesson changes or entering challenge mode
  useEffect(() => {
    clearTimer();
    if (!lesson || !active) return;

    const ch = lesson.challenge;
    if (ch.type === 'binary-builder') {
      setTargetIdx(0);
      setBits([0, 0, 0, 0]);
      setFocusBit(undefined);
    } else if (ch.type === 'loop-tuner') {
      setLoopNState(ch.defaultN);
      setRunning(false);
      setRobotAt(0);
      setVisited([0]);
      setLoopCurrent(0);
      setLoopStatus('idle');
    } else if (ch.type === 'stack-undo') {
      setStackItems(ch.initialStack);
      setQueueItems(ch.queueToPush);
      setOutItems([]);
      setStackOp('idle');
      setStackLastLabel('');
    }

    return () => clearTimer();
  }, [lesson, active, clearTimer]);

  // --- Handlers ---
  const toggleBit = useCallback((idx: number) => {
    setBits((prev) => {
      const next: [0 | 1, 0 | 1, 0 | 1, 0 | 1] = [...prev] as [0 | 1, 0 | 1, 0 | 1, 0 | 1];
      next[idx] = next[idx] === 1 ? 0 : 1;
      return next;
    });
    setFocusBit(idx);
  }, []);

  const selectTarget = useCallback((idx: number) => {
    setTargetIdx(idx);
    setBits([0, 0, 0, 0]);
    setFocusBit(undefined);
  }, []);

  const resetBinary = useCallback(() => {
    setBits([0, 0, 0, 0]);
    setFocusBit(undefined);
  }, []);

  const setLoopN = useCallback(
    (nextN: number) => {
      if (!challenge || challenge.type !== 'loop-tuner') return;
      clearTimer();
      const clamped = Math.max(challenge.minN, Math.min(challenge.maxN, nextN));
      setLoopNState(clamped);
      setRunning(false);
      setRobotAt(0);
      setVisited([0]);
      setLoopCurrent(0);
      setLoopStatus('idle');
    },
    [challenge, clearTimer]
  );

  const resetLoop = useCallback(() => {
    clearTimer();
    setRunning(false);
    setRobotAt(0);
    setVisited([0]);
    setLoopCurrent(0);
    setLoopStatus('idle');
  }, [clearTimer]);

  const runLoop = useCallback(() => {
    if (!lesson || !challenge || challenge.type !== 'loop-tuner') return;
    clearTimer();
    setRunning(true);
    setRobotAt(0);
    setVisited([0]);
    setLoopCurrent(0);
    setLoopStatus('step');

    const total = loopN;
    const goalAt = challenge.goalAt;
    const wallAt = challenge.wallAt;
    const lessonId = lesson.id;
    let step = 0;

    timerRef.current = window.setInterval(() => {
      step += 1;
      if (step >= wallAt) {
        clearTimer();
        setLoopCurrent(step);
        setRobotAt(wallAt - 1);
        setLoopStatus('bonk');
        setRunning(false);
        return;
      }

      const nextPos = step;
      setLoopCurrent(step);
      setRobotAt(nextPos);
      setVisited((prev) => (prev.includes(nextPos) ? prev : [...prev, nextPos]));

      if (step >= total) {
        clearTimer();
        setRunning(false);
        if (nextPos === goalAt) {
          setLoopStatus('victory');
          onSolved(lessonId);
        } else {
          setLoopStatus('short');
        }
      }
    }, 480);
  }, [lesson, challenge, loopN, clearTimer, onSolved]);

  const popStack = useCallback(() => {
    if (!challenge || challenge.type !== 'stack-undo') return;
    setStackItems((prev) => {
      if (prev.length === 0) return prev;
      const popped = prev[prev.length - 1];
      const nextStack = prev.slice(0, -1);
      setOutItems((o) => [...o, popped]);
      // If user accidentally pushed a queue item before clearing mistakes, return it so they can push again
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
      setStackItems((prevStack) => [...prevStack, item]);
      setStackOp('push');
      setStackLastLabel(item.label);
      return rest;
    });
  }, []);

  const resetStack = useCallback(() => {
    if (!challenge || challenge.type !== 'stack-undo') return;
    setStackItems(challenge.initialStack);
    setQueueItems(challenge.queueToPush);
    setOutItems([]);
    setStackOp('idle');
    setStackLastLabel('');
  }, [challenge]);

  // --- Solved detection for reactive challenges (binary & stack) ---
  const binarySum = bits[0] * 8 + bits[1] * 4 + bits[2] * 2 + bits[3] * 1;
  const binaryTarget =
    challenge && challenge.type === 'binary-builder'
      ? challenge.targets[targetIdx] ?? challenge.targets[0]
      : 13;
  const binarySolved =
    active && challenge?.type === 'binary-builder' && binarySum === binaryTarget;

  const stackSolved =
    active &&
    challenge?.type === 'stack-undo' &&
    stackItems.length === challenge.targetStackLabels.length &&
    stackItems.every((item, idx) => item.label === challenge.targetStackLabels[idx]);

  useEffect(() => {
    if (!lesson || !active) return;
    if (binarySolved || stackSolved) {
      onSolved(lesson.id);
    }
  }, [lesson, active, binarySolved, stackSolved, onSolved]);

  return useMemo<MicroLabRuntime | null>(() => {
    if (!lesson || !active || !challenge) return null;

    if (challenge.type === 'binary-builder') {
      const litChips = WEIGHTS.map((w, idx) => ({
        text: String(w),
        tone: bits[idx] === 1 ? ('best' as const) : ('quiet' as const),
      }));

      return {
        sceneState: {
          scene: 'binary-bits',
          bits,
          focusBit,
          showWeights: true,
          interactive: true,
          tagText: binarySolved
            ? `太棒了！正好拼出 ${binaryTarget}`
            : `当前总和 = ${binarySum}（目标 ${binaryTarget}）`,
          tagTone: binarySolved ? 'coral' : 'dark',
        },
        highlightLines: binarySolved ? [4, 5, 6, 7] : focusBit !== undefined ? [5, 6] : [2, 3],
        codeLines: lesson.codeLines,
        facts: {
          title: '开关实验读数',
          rows: [
            { label: '目标数字', value: binaryTarget },
            { label: '二进制编码', value: bits.join(' ') },
            { label: '权重状态', chips: litChips },
            {
              label: '当前总和',
              value: binarySum,
              meter: Math.min(1, binaryTarget > 0 ? binarySum / binaryTarget : 0),
              active: binarySolved,
            },
          ],
          note: binarySolved
            ? '所有亮起开关的权重之和正好等于目标数字！'
            : binarySum > binaryTarget
              ? `现在比目标大了 ${binarySum - binaryTarget}，试着关掉一个亮着的开关。`
              : `距离目标还差 ${binaryTarget - binarySum}，点击舞台上的 2.5D 方块试试！`,
        },
        isSolved: binarySolved,
        onToggleBit: toggleBit,
        binary: {
          targetIdx,
          targets: challenge.targets,
          bits,
          sum: binarySum,
          target: binaryTarget,
          selectTarget,
          toggleBit,
          reset: resetBinary,
        },
      };
    }

    if (challenge.type === 'loop-tuner') {
      const dynamicCode: BilingualCodeLine[] = [
        { line: 1, indent: 0, cn: '循环出发():', py: 'def walk_smart():', isHead: true },
        { line: 2, indent: 4, cn: `重复 ${loopN} 次:`, py: `for i in range(${loopN}):` },
        { line: 3, indent: 8, cn: '向前跳 1 格', py: 'robot.move()' },
      ];

      let tagText = `准备执行 ${loopN} 次循环`;
      if (loopStatus === 'step') tagText = `循环 i = ${loopCurrent} / ${loopN}`;
      if (loopStatus === 'victory') tagText = `精准刹车！${loopN} 次收集成功`;
      if (loopStatus === 'bonk') tagText = `哎呀！第 ${loopCurrent} 次撞墙了`;
      if (loopStatus === 'short') tagText = `停在 ${robotAt} 号格，还差 ${challenge.goalAt - robotAt} 格`;

      return {
        sceneState: {
          scene: 'robot-loop',
          trackLength: challenge.trackLength,
          robotAt,
          goalAt: challenge.goalAt,
          wallAt: challenge.wallAt,
          visited,
          loopCurrent,
          loopTotal: loopN,
          status: loopStatus,
          tagText,
        },
        highlightLines:
          loopStatus === 'idle'
            ? [2]
            : loopStatus === 'step'
              ? [3]
              : [2, 3],
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
              ? '循环次数设大了（越界 Bug），阿派冲进了 5 号障碍墙！'
              : loopStatus === 'short'
                ? '循环次数偏小，阿派提前刹停在半路上了。'
                : loopStatus === 'victory'
                  ? '刚好 4 步到达能量块，一格不多、一格不少！'
                  : '调节 N 的大小，再点击「运行我的指令」观察动画。',
        },
        isSolved: loopStatus === 'victory',
        loop: {
          loopN,
          minN: challenge.minN,
          maxN: challenge.maxN,
          running,
          status: loopStatus,
          robotAt,
          goalAt: challenge.goalAt,
          wallAt: challenge.wallAt,
          setLoopN,
          run: runLoop,
          reset: resetLoop,
        },
      };
    }

    // Stack undo
    let tagText = '先把顶上画错的两步 Pop 掉';
    let tagAnchor: 'top' | 'out' | 'inbox' = 'top';
    if (stackSolved) {
      tagText = '完美修复！作品大功告成';
      tagAnchor = 'top';
    } else if (stackOp === 'pop') {
      tagText = `pop() → ${stackLastLabel}`;
      tagAnchor = 'out';
    } else if (stackOp === 'push') {
      tagText = `push → ${stackLastLabel}`;
      tagAnchor = 'top';
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
      },
      highlightLines: stackOp === 'push' ? [1, 2] : stackOp === 'pop' ? [4, 5, 6] : [1, 4],
      codeLines: lesson.codeLines,
      facts: {
        title: '撤回栈实验状态',
        rows: [
          { label: '目标顺序', detail: '从底到顶', chips: challenge.targetStackLabels.map((t) => ({ text: t })) },
          { label: '当前栈顶', value: topItem ? topItem.label : '空栈', active: stackSolved },
          { label: '栈内高度', value: stackItems.length },
          { label: '已弹出数量', value: outItems.length },
        ],
        note: stackSolved
          ? '先 Pop 清掉后进来的错误步骤，再 Push 新步骤——你已经完全掌握 LIFO！'
          : '提示：栈只能从最顶上拿走元素，不能直接抽走中间那一块。',
      },
      isSolved: stackSolved,
      stack: {
        stack: stackItems,
        queue: queueItems,
        out: outItems,
        targetLabels: challenge.targetStackLabels,
        pop: popStack,
        push: pushStack,
        reset: resetStack,
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
    binaryTarget,
    targetIdx,
    toggleBit,
    selectTarget,
    resetBinary,
    loopN,
    running,
    robotAt,
    visited,
    loopCurrent,
    loopStatus,
    setLoopN,
    runLoop,
    resetLoop,
    stackItems,
    queueItems,
    outItems,
    stackOp,
    stackLastLabel,
    stackSolved,
    popStack,
    pushStack,
    resetStack,
  ]);
}

interface MicroLabCardProps {
  lesson: Lesson;
  runtime: MicroLabRuntime;
  nextLessonTitle?: string;
  onExitChallenge: () => void;
  onGoNextLesson?: () => void;
}

export function MicroLabCard({
  lesson,
  runtime,
  nextLessonTitle,
  onExitChallenge,
  onGoNextLesson,
}: MicroLabCardProps) {
  const challenge = lesson.challenge;

  return (
    <section className="card step-card" aria-label="课尾动手挑战">
      <div className="step-card__head">
        <span className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Sparkles size={13} style={{ color: 'var(--coral)' }} />
          课尾微实验
        </span>
        <span className="chip chip--tag">{runtime.isSolved ? '挑战达成' : '互动挑战'}</span>
      </div>

      <h2 className="step-card__title">{challenge.title}</h2>
      <div className="step-card__body">
        <p>{challenge.prompt}</p>
      </div>

      {/* 1. Binary Builder Controls */}
      {challenge.type === 'binary-builder' && runtime.binary && (
        <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <span className="eyebrow" style={{ marginRight: 4 }}>
              切换目标：
            </span>
            {runtime.binary.targets.map((t, idx) => {
              const isCurrent = idx === runtime.binary!.targetIdx;
              return (
                <button
                  key={t}
                  type="button"
                  className={`btn ${isCurrent ? 'btn--primary' : ''}`}
                  style={{ height: 30, padding: '0 10px', fontSize: 12.5 }}
                  onClick={() => runtime.binary!.selectTarget(idx)}
                >
                  拼出 {t}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {WEIGHTS.map((weight, idx) => {
              const isOn = runtime.binary!.bits[idx] === 1;
              return (
                <button
                  key={weight}
                  type="button"
                  className={`btn ${isOn ? 'btn--primary' : ''}`}
                  style={{
                    height: 54,
                    flexDirection: 'column',
                    gap: 2,
                    padding: '4px 6px',
                  }}
                  onClick={() => runtime.binary!.toggleBit(idx)}
                >
                  <span style={{ fontSize: 16, fontWeight: 800 }} className="tabular-nums">
                    {isOn ? '1' : '0'}
                  </span>
                  <span style={{ fontSize: 11, opacity: isOn ? 0.92 : 0.7 }}>×{weight}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Loop Tuner Controls */}
      {challenge.type === 'loop-tuner' && runtime.loop && (
        <div style={{ marginTop: 14, display: 'grid', gap: 11 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 10,
              background: 'var(--paper-raised)',
              border: '1px solid var(--line)',
            }}
          >
            <div>
              <div className="eyebrow">循环次数 N</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>
                重复执行向前跳 {runtime.loop.loopN} 遍
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className="btn"
                style={{ width: 34, height: 34, padding: 0 }}
                disabled={runtime.loop.running || runtime.loop.loopN <= runtime.loop.minN}
                onClick={() => runtime.loop!.setLoopN(runtime.loop!.loopN - 1)}
                aria-label="减少循环次数"
              >
                <Minus size={15} />
              </button>
              <span
                className="tabular-nums"
                style={{
                  minWidth: 28,
                  textAlign: 'center',
                  fontSize: 20,
                  fontWeight: 800,
                  color: 'var(--coral)',
                }}
              >
                {runtime.loop.loopN}
              </span>
              <button
                type="button"
                className="btn"
                style={{ width: 34, height: 34, padding: 0 }}
                disabled={runtime.loop.running || runtime.loop.loopN >= runtime.loop.maxN}
                onClick={() => runtime.loop!.setLoopN(runtime.loop!.loopN + 1)}
                aria-label="增加循环次数"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          <input
            type="range"
            min={runtime.loop.minN}
            max={runtime.loop.maxN}
            step={1}
            value={runtime.loop.loopN}
            disabled={runtime.loop.running}
            onChange={(e) => runtime.loop!.setLoopN(Number(e.target.value))}
            aria-label="调节循环次数 N"
            style={{ accentColor: 'var(--coral)', width: '100%', cursor: 'pointer' }}
          />

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn--primary"
              style={{ flex: 1 }}
              disabled={runtime.loop.running}
              onClick={runtime.loop.run}
            >
              <Play size={15} strokeWidth={2.2} />
              <span>{runtime.loop.running ? '阿派奔跑中...' : '运行我的指令'}</span>
            </button>
            <button
              type="button"
              className="btn"
              onClick={runtime.loop.reset}
              aria-label="重置机器人"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 3. Stack Undo Controls */}
      {challenge.type === 'stack-undo' && runtime.stack && (
        <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn--primary"
              style={{ flex: 1 }}
              disabled={runtime.stack.stack.length === 0}
              onClick={runtime.stack.pop}
            >
              <ArrowUpFromLine size={15} strokeWidth={2.2} />
              <span>撤回 Pop</span>
            </button>

            <button
              type="button"
              className="btn"
              style={{ flex: 1 }}
              disabled={runtime.stack.queue.length === 0}
              onClick={runtime.stack.push}
            >
              <ArrowDownToLine size={15} strokeWidth={2.2} />
              <span>
                {runtime.stack.queue[0]
                  ? `压入「${runtime.stack.queue[0].label}」`
                  : '无待压入项'}
              </span>
            </button>

            <button
              type="button"
              className="btn"
              onClick={runtime.stack.reset}
              aria-label="重置栈实验"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Feedback / Victory Callout */}
      {runtime.isSolved ? (
        <div className="note" role="status">
          <div className="note__icon" aria-hidden="true">
            <Trophy size={15} strokeWidth={2.2} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow">挑战成功</div>
            <p>
              太厉害了！你已经亲手在 2.5D 实验台上跑通了「{lesson.title}」的核心原理。
            </p>
          </div>
        </div>
      ) : (
        challenge.type === 'binary-builder' && (
          <div className="note" role="note">
            <div className="note__icon" aria-hidden="true">
              <CheckCircle2 size={15} strokeWidth={2.1} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="eyebrow">小提示</div>
              <p>{challenge.hint}</p>
            </div>
          </div>
        )
      )}

      <div className="step-card__nav">
        <button type="button" className="btn" onClick={onExitChallenge}>
          <ArrowLeft size={15} />
          <span>返回讲解</span>
        </button>

        {runtime.isSolved && onGoNextLesson && nextLessonTitle ? (
          <button type="button" className="btn btn--primary" onClick={onGoNextLesson}>
            <span>下一节：{nextLessonTitle}</span>
            <ArrowRight size={15} style={{ flex: 'none' }} />
          </button>
        ) : (
          challenge.type === 'binary-builder' &&
          runtime.binary && (
            <button type="button" className="btn" style={{ flex: 1 }} onClick={runtime.binary.reset}>
              <RotateCcw size={14} />
              <span>全部清零</span>
            </button>
          )
        )}
      </div>
    </section>
  );
}

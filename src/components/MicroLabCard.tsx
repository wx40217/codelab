import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpFromLine,
  CheckCircle2,
  Delete,
  Dices,
  Eye,
  EyeOff,
  Minus,
  Play,
  Plus,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { Lesson } from '../types/course';
import { PiBotAvatar } from './PiBotAvatar';
import {
  BIT_WEIGHTS,
  BONUS_STACK_ITEMS,
  MicroLabRuntime,
  useMicroLabRuntime,
} from './microLabRuntime';

export { useMicroLabRuntime };
export type { MicroLabRuntime };

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
          2.5D 动手游乐场
        </span>
        <span className="chip chip--tag">{runtime.isSolved ? '挑战达成 ★' : '互动闯关'}</span>
      </div>

      <h2 className="step-card__title">{challenge.title}</h2>

      {/* Reactive Pi-Bot Companion Bubble */}
      <div
        style={{
          marginTop: 10,
          padding: '8px 11px',
          borderRadius: 10,
          background: 'var(--paper-raised)',
          border: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <PiBotAvatar mood={runtime.companionMood} size={36} />
        <p style={{ margin: 0, fontSize: 12.8, lineHeight: 1.45, color: 'var(--ink)', fontWeight: 550 }}>
          {runtime.companionLine}
        </p>
      </div>

      {/* 1. Binary Builder */}
      {challenge.type === 'binary-builder' && runtime.binary && (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {runtime.binary.targets.map((t) => {
              const isCurrent = t === runtime.binary!.targetValue;
              const isCleared = runtime.binary!.solvedTargets.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  className={`btn ${isCurrent ? 'btn--primary' : ''}`}
                  style={{ height: 30, padding: '0 10px', fontSize: 12.5 }}
                  onClick={() => runtime.binary!.selectTarget(t)}
                >
                  {isCleared && !isCurrent && <CheckCircle2 size={12} style={{ color: 'var(--coral)' }} />}
                  <span>拼 {t}</span>
                </button>
              );
            })}

            <button
              type="button"
              className="btn"
              style={{ height: 30, padding: '0 10px', fontSize: 12.5 }}
              onClick={runtime.binary.pickRandomTarget}
              title="随机出一个 1 到 15 的新数字！"
            >
              <Dices size={13} style={{ color: 'var(--coral)' }} />
              <span>随机出题</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {BIT_WEIGHTS.map((weight, idx) => {
              const isOn = runtime.binary!.bits[idx] === 1;
              return (
                <button
                  key={weight}
                  type="button"
                  className={`btn ${isOn ? 'btn--primary' : ''}`}
                  style={{ height: 54, flexDirection: 'column', gap: 2, padding: '4px 6px' }}
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

      {/* 2. Pixel Painter */}
      {challenge.type === 'pixel-painter' && runtime.pixel && (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn ${runtime.pixel.showGuide ? 'btn--primary' : ''}`}
              style={{ flex: 1, height: 34, fontSize: 12.5 }}
              onClick={runtime.pixel.toggleGuide}
            >
              {runtime.pixel.showGuide ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{runtime.pixel.showGuide ? '收起目标小抄' : '偷看目标图案'}</span>
            </button>
            <button
              type="button"
              className="btn"
              style={{ height: 34, padding: '0 12px', fontSize: 12.5 }}
              onClick={runtime.pixel.clear}
            >
              <RotateCcw size={13} />
              <span>清空画板</span>
            </button>
          </div>

          {runtime.pixel.showGuide && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                background: 'var(--paper-raised)',
                border: '1px dashed var(--coral-300)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div className="eyebrow">目标参考：{runtime.pixel.targetName}</div>
                <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
                  照着右边的 0 / 1 阵点亮 2.5D 网格吧！
                </p>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${runtime.pixel.cols}, 14px)`,
                  gap: 3,
                  flex: 'none',
                }}
              >
                {runtime.pixel.targetPattern.map((val, idx) => (
                  <span
                    key={idx}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      background: val ? 'var(--coral)' : 'var(--paper-sunk)',
                      border: '1px solid var(--line)',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. ASCII Decoder */}
      {challenge.type === 'ascii-decoder' && runtime.ascii && (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
            {runtime.ascii.codeMap.map((entry) => (
              <button
                key={entry.char}
                type="button"
                className="btn"
                style={{ height: 46, flexDirection: 'column', gap: 1, padding: '4px 6px' }}
                disabled={runtime.ascii!.pickedChars.length >= runtime.ascii!.targetWord.length}
                onClick={() => runtime.ascii!.pickChar(entry.char)}
              >
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--coral)' }}>{entry.char}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }} className="tabular-nums">
                  {entry.code}
                </span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn"
              style={{ flex: 1, height: 34, fontSize: 12.5 }}
              disabled={runtime.ascii.pickedChars.length === 0}
              onClick={runtime.ascii.backspace}
            >
              <Delete size={14} />
              <span>退格删除</span>
            </button>
            <button
              type="button"
              className="btn"
              style={{ height: 34, padding: '0 12px', fontSize: 12.5 }}
              onClick={runtime.ascii.reset}
            >
              <RotateCcw size={13} />
              <span>重来</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Seq Debugger */}
      {challenge.type === 'seq-debugger' && runtime.seqDebug && (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 12px',
              borderRadius: 10,
              background: 'var(--paper-raised)',
              border: '1px solid var(--line)',
            }}
          >
            <div>
              <div className="eyebrow">指令清单行数</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>
                当前共 {runtime.seqDebug.stepCount} 行「向前跳 1 格」
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="btn"
                style={{ height: 32, padding: '0 10px', fontSize: 12 }}
                disabled={runtime.seqDebug.running || runtime.seqDebug.stepCount <= runtime.seqDebug.minSteps}
                onClick={runtime.seqDebug.removeStep}
              >
                <Minus size={13} />
                <span>删一行</span>
              </button>
              <button
                type="button"
                className="btn"
                style={{ height: 32, padding: '0 10px', fontSize: 12 }}
                disabled={runtime.seqDebug.running || runtime.seqDebug.stepCount >= runtime.seqDebug.maxSteps}
                onClick={runtime.seqDebug.addStep}
              >
                <Plus size={13} />
                <span>加一行</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn--primary"
              style={{ flex: 1 }}
              disabled={runtime.seqDebug.running}
              onClick={runtime.seqDebug.run}
            >
              <Play size={15} strokeWidth={2.2} />
              <span>{runtime.seqDebug.running ? '测试运行中...' : '测试运行代码'}</span>
            </button>
            <button
              type="button"
              className="btn"
              onClick={runtime.seqDebug.reset}
              aria-label="重置Bug代码"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 5. Loop Tuner */}
      {challenge.type === 'loop-tuner' && runtime.loop && (
        <div style={{ marginTop: 12, display: 'grid', gap: 11 }}>
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
                style={{ minWidth: 28, textAlign: 'center', fontSize: 20, fontWeight: 800, color: 'var(--coral)' }}
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
              <span>{runtime.loop.running ? '阿派蹦跶中...' : '运行我的指令'}</span>
            </button>
            <button type="button" className="btn" onClick={runtime.loop.reset} aria-label="重置机器人">
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 6. If Radar */}
      {challenge.type === 'if-radar' && runtime.ifRadar && (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="eyebrow">
              路况关卡 {Math.min(runtime.ifRadar.scenarioIndex + 1, runtime.ifRadar.totalScenarios)} /{' '}
              {runtime.ifRadar.totalScenarios}
            </span>
            <span className="chip">{runtime.ifRadar.currentLabel}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              className="btn btn--primary"
              style={{ height: 46, flexDirection: 'column', gap: 1 }}
              disabled={runtime.isSolved || runtime.ifRadar.lastResult === 'correct'}
              onClick={() => runtime.ifRadar!.choose('stop')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13.5 }}>
                <ShieldAlert size={14} /> 立刻刹车
              </span>
              <span style={{ fontSize: 10.5, opacity: 0.9 }}>走 if 分支</span>
            </button>

            <button
              type="button"
              className="btn"
              style={{ height: 46, flexDirection: 'column', gap: 1 }}
              disabled={runtime.isSolved || runtime.ifRadar.lastResult === 'correct'}
              onClick={() => runtime.ifRadar!.choose('move')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13.5 }}>
                <Zap size={14} style={{ color: 'var(--coral)' }} /> 安心前进
              </span>
              <span style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>走 else 分支</span>
            </button>
          </div>

          {runtime.isSolved && (
            <button type="button" className="btn" style={{ height: 34 }} onClick={runtime.ifRadar.reset}>
              <RotateCcw size={13} />
              <span>再测一遍 3 组路况</span>
            </button>
          )}
        </div>
      )}

      {/* 7. Variable Counter */}
      {challenge.type === 'variable-counter' && runtime.variable && (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {runtime.variable.operations.map((op) => (
              <button
                key={op.label}
                type="button"
                className={`btn ${op.delta > 0 ? 'btn--primary' : ''}`}
                style={{ height: 46, flexDirection: 'column', gap: 2, padding: '4px 6px' }}
                onClick={() => runtime.variable!.applyOp(op.delta, op.label, op.codePy)}
              >
                <span style={{ fontSize: 14, fontWeight: 800 }}>{op.label}</span>
                <span style={{ fontSize: 10.5, opacity: op.delta > 0 ? 0.9 : 0.7 }} className="mono">
                  {op.delta > 0 ? `+${op.delta}` : op.delta}
                </span>
              </button>
            ))}
          </div>

          <button type="button" className="btn" style={{ height: 34 }} onClick={runtime.variable.reset}>
            <RotateCcw size={13} />
            <span>清空盒子（score = 0）</span>
          </button>
        </div>
      )}

      {/* 8. Array Lookup */}
      {challenge.type === 'array-lookup' && runtime.arrayLookup && (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {runtime.arrayLookup.items.map((item, idx) => {
              const isPicked = runtime.arrayLookup!.pickedIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  className={`btn ${isPicked ? 'btn--primary' : ''}`}
                  style={{ height: 50, flexDirection: 'column', gap: 1, padding: '4px 2px' }}
                  onClick={() => runtime.arrayLookup!.pickIndex(idx)}
                >
                  <span style={{ fontSize: 16 }}>{item}</span>
                  <span style={{ fontSize: 11, opacity: isPicked ? 0.95 : 0.7 }} className="mono">
                    [{idx}]
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 9. Stack Undo */}
      {challenge.type === 'stack-undo' && runtime.stack && (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
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
                  : '队列已空'}
              </span>
            </button>

            <button type="button" className="btn" onClick={runtime.stack.reset} aria-label="重置栈实验">
              <RotateCcw size={15} />
            </button>
          </div>

          {runtime.stack.hasSolvedOnce && (
            <div
              style={{
                padding: '9px 11px',
                borderRadius: 10,
                background: 'var(--paper-raised)',
                border: '1px dashed var(--coral-300)',
                display: 'grid',
                gap: 7,
              }}
            >
              <span className="eyebrow" style={{ color: 'var(--coral-ink)' }}>
                🎁 自由叠叠乐已解锁：随便压入新方块试试（最多叠 6 块）
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {BONUS_STACK_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="btn"
                    style={{ height: 30, padding: '0 10px', fontSize: 12.5 }}
                    disabled={runtime.stack!.stack.length >= 6}
                    onClick={() => runtime.stack!.addBonusBlock(item)}
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 10. Queue Shop */}
      {challenge.type === 'queue-shop' && runtime.queueShop && (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn"
              style={{ flex: 1 }}
              disabled={runtime.queueShop.incoming.length === 0}
              onClick={runtime.queueShop.enqueue}
            >
              <ArrowDownToLine size={15} />
              <span>
                {runtime.queueShop.incoming[0]
                  ? `入队「${runtime.queueShop.incoming[0].label}」`
                  : '无人等待入队'}
              </span>
            </button>

            <button
              type="button"
              className="btn btn--primary"
              style={{ flex: 1 }}
              disabled={runtime.queueShop.queue.length === 0}
              onClick={runtime.queueShop.dequeue}
            >
              <ArrowUpFromLine size={15} />
              <span>
                {runtime.queueShop.queue[0]
                  ? `出队「${runtime.queueShop.queue[0].label}」`
                  : '队列已空'}
              </span>
            </button>

            <button type="button" className="btn" onClick={runtime.queueShop.reset} aria-label="重置队列">
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 11. Tree Explorer */}
      {challenge.type === 'tree-explorer' && runtime.tree && (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((id) => {
              const found = runtime.tree!.foundLeafIds.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  className={`btn ${found ? 'btn--primary' : ''}`}
                  style={{ flex: '1 0 36px', height: 34, padding: 0, fontSize: 13 }}
                  onClick={() => runtime.tree!.clickNode(id)}
                >
                  {id}
                </button>
              );
            })}
          </div>
          <button type="button" className="btn" style={{ height: 34 }} onClick={runtime.tree.reset}>
            <RotateCcw size={13} />
            <span>重新点亮叶子</span>
          </button>
        </div>
      )}

      {/* 12. Growth Explorer */}
      {challenge.type === 'growth-explorer' && runtime.growth && (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {runtime.growth.optionsN.map((n) => {
              const isCurrent = runtime.growth!.currentN === n;
              const visited = runtime.growth!.visitedN.includes(n);
              return (
                <button
                  key={n}
                  type="button"
                  className={`btn ${isCurrent ? 'btn--primary' : ''}`}
                  style={{ height: 42, fontSize: 13.5 }}
                  onClick={() => runtime.growth!.selectN(n)}
                >
                  {visited && !isCurrent && <CheckCircle2 size={13} style={{ color: 'var(--coral)' }} />}
                  <span className="tabular-nums">n = {n}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {(['O(1)', 'O(log n)', 'O(n)', 'O(n²)'] as const).map((lbl, idx) => {
              const tier = idx as 0 | 1 | 2 | 3;
              const activeTier = runtime.growth!.focusTier === tier;
              return (
                <button
                  key={lbl}
                  type="button"
                  className={`btn ${activeTier ? 'btn--primary' : ''}`}
                  style={{ height: 30, padding: '0 4px', fontSize: 11.5 }}
                  onClick={() =>
                    runtime.growth!.selectTier(activeTier ? undefined : tier)
                  }
                >
                  {lbl}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 13. Binary Search Game */}
      {challenge.type === 'binary-search-game' && runtime.binarySearch && (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
            {runtime.binarySearch.values.map((val, idx) => {
              const revealed = runtime.binarySearch!.revealed.includes(idx);
              const inRange = idx >= runtime.binarySearch!.low && idx <= runtime.binarySearch!.high;
              const isHit = revealed && val === runtime.binarySearch!.targetValue;
              return (
                <button
                  key={idx}
                  type="button"
                  className={`btn ${isHit ? 'btn--primary' : ''}`}
                  style={{
                    height: 44,
                    flexDirection: 'column',
                    gap: 1,
                    padding: 0,
                    opacity: inRange || isHit ? 1 : 0.35,
                  }}
                  disabled={runtime.binarySearch!.found || !inRange}
                  onClick={() => runtime.binarySearch!.pickIndex(idx)}
                >
                  <span style={{ fontSize: 13.5, fontWeight: 800 }} className="tabular-nums">
                    {revealed ? val : '?'}
                  </span>
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{idx}号</span>
                </button>
              );
            })}
          </div>

          <button type="button" className="btn" style={{ height: 34 }} onClick={runtime.binarySearch.reset}>
            <RotateCcw size={13} />
            <span>重新寻宝</span>
          </button>
        </div>
      )}

      {/* 14. Bubble Sorter */}
      {challenge.type === 'bubble-sorter' && runtime.bubbleSort && (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
            {[0, 1, 2].map((leftIdx) => {
              const a = runtime.bubbleSort!.values[leftIdx];
              const b = runtime.bubbleSort!.values[leftIdx + 1];
              const needsSwap = a > b;
              return (
                <button
                  key={leftIdx}
                  type="button"
                  className={`btn ${needsSwap && !runtime.isSolved ? 'btn--primary' : ''}`}
                  style={{ height: 46, flexDirection: 'column', gap: 1, padding: '4px 4px' }}
                  disabled={runtime.isSolved}
                  onClick={() => runtime.bubbleSort!.swapPair(leftIdx)}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 750 }}>
                    {a} <ArrowLeftRight size={12} /> {b}
                  </span>
                  <span style={{ fontSize: 10.5, opacity: 0.8 }}>
                    交换 {leftIdx}↔{leftIdx + 1}
                  </span>
                </button>
              );
            })}
          </div>

          <button type="button" className="btn" style={{ height: 34 }} onClick={runtime.bubbleSort.reset}>
            <RotateCcw size={13} />
            <span>打乱重排</span>
          </button>
        </div>
      )}

      {/* Victory Callout */}
      {runtime.isSolved && (
        <div className="note" role="status">
          <div className="note__icon" aria-hidden="true">
            <Trophy size={15} strokeWidth={2.2} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow">挑战通关</div>
            <p>太厉害了！你已经在 2.5D 实验台上亲手掌握了「{lesson.title}」的秘密！</p>
          </div>
        </div>
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

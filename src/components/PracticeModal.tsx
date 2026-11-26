import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Sparkles,
  Star,
  X,
  XCircle,
} from 'lucide-react';
import { AppStorageState } from '../types/course';
import { playQuizCorrect, playQuizTryAgain, playStep } from '../utils/sound';
import { PiBotAvatar } from './PiBotAvatar';

interface PracticeQuestion {
  id: string;
  chapterId: 'ch-1' | 'ch-2' | 'ch-3' | 'ch-4';
  chapterLabel: string;
  lessonId: string;
  question: string;
  codeSnippet?: string;
  options: Array<{ label: string; correct?: boolean; explain: string }>;
}

const PRACTICE_BANK: PracticeQuestion[] = [
  {
    id: 'p-bin-1',
    chapterId: 'ch-1',
    chapterLabel: '01 · 电脑的秘密语言',
    lessonId: 'binary-bits',
    question: '4 盏魔法灯泡的权重从左到右是 [8, 4, 2, 1]。如果二进制编码是 1 0 1 0，代表数字几？',
    codeSnippet: 'bits = [1, 0, 1, 0]  # 权重 [8, 4, 2, 1]',
    options: [
      { label: '9', explain: '再算算看：亮着的是 8 和 2，8 + 2 等于多少呀？' },
      { label: '10', correct: true, explain: '答对啦！8 + 0 + 2 + 0 = 10！' },
      { label: '12', explain: '12 是 8 + 4（1 1 0 0），这里第 2 盏灯是关着的哦。' },
    ],
  },
  {
    id: 'p-pix-1',
    chapterId: 'ch-1',
    chapterLabel: '01 · 电脑的秘密语言',
    lessonId: 'pixel-art',
    question: '把一张 5×5 的黑白像素画存进电脑里，一共需要多少个 0 或 1 的开关？',
    options: [
      { label: '10 个', explain: '5 + 5 是 10，但网格有 5 行、每行 5 列，要用乘法哦！' },
      { label: '25 个', correct: true, explain: '满分！5 × 5 = 25 个小格子，每个格子只要 1 个 0 或 1！' },
      { label: '50 个', explain: '黑白两色每格只需要 1 个开关，不用 50 个那么多哦。' },
    ],
  },
  {
    id: 'p-asc-1',
    chapterId: 'ch-1',
    chapterLabel: '01 · 电脑的秘密语言',
    lessonId: 'text-encoding',
    question: '在 ASCII 密码本里，大写字母 A 是 65，B 是 66。那大写字母 D 应该是多少？',
    codeSnippet: 'ord("A") == 65, ord("B") == 66, ord("D") == ?',
    options: [
      { label: '67', explain: '67 是字母 C 哦，再往后数 1 个就是 D 啦！' },
      { label: '68', correct: true, explain: '神准！A=65, B=66, C=67, D=68，字母编号是整整齐齐连着排的！' },
      { label: '70', explain: '跳太远啦，70 已经是字母 F 了。' },
    ],
  },
  {
    id: 'p-loop-1',
    chapterId: 'ch-2',
    chapterLabel: '02 · 指挥小机器人',
    lessonId: 'robot-loop',
    question: '阿派站在 0 号起点，运行下面这段 Python 循环后，它会停在几号格？',
    codeSnippet: 'for i in range(4):\n    robot.move()  # 每次向前 1 格',
    options: [
      { label: '3 号格', explain: 'range(4) 会让机器人跑满 4 遍，0 + 4 可不是 3 哦。' },
      { label: '4 号格', correct: true, explain: '太棒了！重复 4 次每次走 1 格，正好停在 4 号格！' },
      { label: '5 号格', explain: '多算了 1 格！range(4) 一共执行 4 次，不会走 5 步。' },
    ],
  },
  {
    id: 'p-if-1',
    chapterId: 'ch-2',
    chapterLabel: '02 · 指挥小机器人',
    lessonId: 'if-conditions',
    question: '如果雷达检测到「前方没墙（wall_ahead == False）」，程序会执行哪一块？',
    codeSnippet: 'if wall_ahead:\n    robot.stop()\nelse:\n    robot.move()',
    options: [
      { label: '执行 if 里的 robot.stop()', explain: '条件 wall_ahead 是 False（没墙），所以不会进 if 哦。' },
      { label: '执行 else 里的 robot.move()', correct: true, explain: '正解！条件不成立时，程序会自动走 else 这条岔路继续前进！' },
      { label: '两行代码都会执行', explain: 'if 和 else 是二选一的岔路口，每次只会走其中一条！' },
    ],
  },
  {
    id: 'p-var-1',
    chapterId: 'ch-2',
    chapterLabel: '02 · 指挥小机器人',
    lessonId: 'variables-box',
    question: '运行完下面三行代码后，变量盒子 score 里最后装的数字是多少？',
    codeSnippet: 'score = 5\nscore = score + 3\nscore = score - 2',
    options: [
      { label: '6', correct: true, explain: '心算小达人！5 → 8 → 6，每次赋值都会把旧值替换成新结果！' },
      { label: '8', explain: '那是第二行结束时的值，别忘了第三行还减掉了 2 哦！' },
      { label: '5', explain: '变量盒子的内容是可以随时改写的，不会一直停留在 5。' },
    ],
  },
  {
    id: 'p-arr-1',
    chapterId: 'ch-3',
    chapterLabel: '03 · 装数据的魔法盒子',
    lessonId: 'arrays-lockers',
    question: '小零食数组 snacks = ["🍪", "🍎", "🍩", "🍓"]，那么 snacks[2] 拿到的是哪个？',
    codeSnippet: 'snacks = ["🍪", "🍎", "🍩", "🍓"]\nprint(snacks[2])',
    options: [
      { label: '🍎（第 2 个）', explain: '差点掉坑里！数组是从 0 开始数的：0 是 🍪，1 是 🍎。' },
      { label: '🍩（第 3 个）', correct: true, explain: '完全没掉坑！下标 0→🍪、1→🍎、2→🍩！' },
      { label: '🍓（第 4 个）', explain: '🍓 的门牌号是 snacks[3] 哦！' },
    ],
  },
  {
    id: 'p-stack-1',
    chapterId: 'ch-3',
    chapterLabel: '03 · 装数据的魔法盒子',
    lessonId: 'stack-plates',
    question: '按顺序往栈里压入「A」「B」「C」三个方块，此时执行一次 pop()，哪一块会飞出来？',
    codeSnippet: 'stack.append("A")\nstack.append("B")\nstack.append("C")\nstack.pop()',
    options: [
      { label: 'A', explain: 'A 被压在最底下啦，那是队列（FIFO）才会先出的！' },
      { label: 'C', correct: true, explain: '没错！栈是后进先出（LIFO），最后进来的 C 在最顶上，第一个被弹出！' },
      { label: 'B', explain: 'B 夹在中间，必须先把顶上的 C 拿走才轮得到 B。' },
    ],
  },
  {
    id: 'p-bs-1',
    chapterId: 'ch-4',
    chapterLabel: '04 · 聪明的解题魔法',
    lessonId: 'binary-search-guess',
    question: '在 1 到 100 排好序的数字里玩猜数字，每次都猜正中间，最多大约需要猜几次？',
    options: [
      { label: '大约 7 次', correct: true, explain: '超厉害！每次砍一半：100→50→25→12→6→3→1，7 次必中！' },
      { label: '大约 50 次', explain: '那是运气一般时一个一个猜（线性查找）的次数，二分搜索快得多！' },
      { label: '100 次', explain: '只有从 1 开始傻傻挨个问，最坏才要 100 次呢。' },
    ],
  },
  {
    id: 'p-bigo-1',
    chapterId: 'ch-4',
    chapterLabel: '04 · 聪明的解题魔法',
    lessonId: 'count-steps',
    question: '当数据量 n 变得特别大时，下面哪种时间复杂度增长得最快、最慢吞吞？',
    options: [
      { label: 'O(1) 常数', explain: 'O(1) 永远只要 1 步，是最快闪电侠！' },
      { label: 'O(log n) 对数', explain: 'O(log n) 每次砍一半，也是超级飞毛腿哦。' },
      { label: 'O(n²) 平方', correct: true, explain: '抓到了！n 翻倍时 O(n²) 的步数会变成 4 倍，数据一大就会暴涨！' },
    ],
  },
];

const CHAPTER_FILTERS: Array<{ id: 'all' | 'ch-1' | 'ch-2' | 'ch-3' | 'ch-4'; label: string }> = [
  { id: 'all', label: '全部 10 题' },
  { id: 'ch-1', label: '01 秘密语言' },
  { id: 'ch-2', label: '02 机器人' },
  { id: 'ch-3', label: '03 数据结构' },
  { id: 'ch-4', label: '04 算法魔法' },
];

interface PracticeModalProps {
  open: boolean;
  storage: AppStorageState;
  onClose: () => void;
  onSolveQuestion: (questionId: string, rewardStars: number) => void;
  onJumpLesson: (lessonId: string) => void;
}

export function PracticeModal({
  open,
  storage,
  onClose,
  onSolveQuestion,
  onJumpLesson,
}: PracticeModalProps) {
  const [filter, setFilter] = useState<'all' | 'ch-1' | 'ch-2' | 'ch-3' | 'ch-4'>('all');
  const [qIndex, setQIndex] = useState(0);
  const [pickedOpt, setPickedOpt] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const filteredQuestions = useMemo(
    () => (filter === 'all' ? PRACTICE_BANK : PRACTICE_BANK.filter((q) => q.chapterId === filter)),
    [filter]
  );

  const safeIdx = Math.min(qIndex, Math.max(0, filteredQuestions.length - 1));
  const current = filteredQuestions[safeIdx];

  if (!open || !current) return null;

  const solvedCount = PRACTICE_BANK.filter((q) => storage.solvedPractice.includes(q.id)).length;
  const isCurrentAlreadySolved = storage.solvedPractice.includes(current.id);
  const chosenOption = pickedOpt !== null ? current.options[pickedOpt] : null;
  const isCorrectNow = Boolean(chosenOption?.correct);

  const handleChoose = (idx: number) => {
    setPickedOpt(idx);
    const opt = current.options[idx];
    if (opt.correct) {
      playQuizCorrect();
      onSolveQuestion(current.id, 10);
    } else {
      playQuizTryAgain();
    }
  };

  const goToIndex = (next: number) => {
    playStep();
    setQIndex(next);
    setPickedOpt(null);
  };

  return (
    <div
      className="finder"
      role="dialog"
      aria-modal="true"
      aria-label="趣味刷题练习道场"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="finder__panel" style={{ maxWidth: 680 }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '15px 20px',
            borderBottom: '1px solid var(--line)',
            background: 'var(--paper)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <PiBotAvatar
              mood={isCorrectNow ? 'proud' : chosenOption ? 'oops' : 'curious'}
              size={38}
            />
            <div>
              <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Code2 size={13} style={{ color: 'var(--coral)' }} />
                趣味闯关练习道场
              </div>
              <div style={{ fontSize: 17.5, fontWeight: 800, marginTop: 2 }}>
                已攻克 {solvedCount} / {PRACTICE_BANK.length} 题
              </div>
            </div>
          </div>

          <button
            type="button"
            className="tool-btn tool-btn--icon"
            style={{ width: 34, height: 34 }}
            onClick={onClose}
            aria-label="关闭练习"
          >
            <X size={16} />
          </button>
        </div>

        <div className="finder__list" style={{ padding: '16px 20px 20px', display: 'grid', gap: 16 }}>
          {/* Chapter Filter Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CHAPTER_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`btn ${filter === f.id ? 'btn--primary' : ''}`}
                style={{ height: 30, padding: '0 11px', fontSize: 12.5 }}
                onClick={() => {
                  playStep();
                  setFilter(f.id);
                  setQIndex(0);
                  setPickedOpt(null);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Question Dots */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {filteredQuestions.map((q, idx) => {
              const done = storage.solvedPractice.includes(q.id);
              const active = idx === safeIdx;
              return (
                <button
                  key={q.id}
                  type="button"
                  className={`btn ${active ? 'btn--primary' : ''}`}
                  style={{
                    width: 32,
                    height: 30,
                    padding: 0,
                    fontSize: 12,
                    borderColor: done && !active ? 'var(--coral-300)' : undefined,
                    background: done && !active ? 'var(--coral-50)' : undefined,
                  }}
                  onClick={() => goToIndex(idx)}
                  aria-label={`第 ${idx + 1} 题`}
                >
                  {done && !active ? <CheckCircle2 size={13} style={{ color: 'var(--coral)' }} /> : idx + 1}
                </button>
              );
            })}
          </div>

          {/* Question Card */}
          <div
            style={{
              padding: '16px 18px',
              borderRadius: 12,
              background: 'var(--paper-raised)',
              border: '1px solid var(--line)',
              display: 'grid',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span className="eyebrow">{current.chapterLabel}</span>
              <span className="chip" style={{ fontSize: 11.5 }}>
                {isCurrentAlreadySolved ? '✅ 已获得 +10 ★' : '答对奖励 +10 ★'}
              </span>
            </div>

            <div style={{ fontSize: 16, fontWeight: 750, lineHeight: 1.5, color: 'var(--ink)' }}>
              {current.question}
            </div>

            {current.codeSnippet && (
              <pre
                className="mono"
                style={{
                  margin: 0,
                  padding: '10px 13px',
                  borderRadius: 9,
                  background: '#161614',
                  color: '#ebeae4',
                  fontSize: 13,
                  lineHeight: 1.6,
                  overflowX: 'auto',
                }}
              >
                {current.codeSnippet}
              </pre>
            )}

            <div style={{ display: 'grid', gap: 8 }}>
              {current.options.map((opt, idx) => {
                const isSelected = pickedOpt === idx;
                const showGreen = isSelected && opt.correct;
                const showWarn = isSelected && !opt.correct;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    className={`btn ${showGreen ? 'btn--primary' : ''}`}
                    style={{
                      height: 'auto',
                      minHeight: 42,
                      padding: '9px 14px',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      whiteSpace: 'normal',
                      borderColor: showWarn ? 'var(--coral-300)' : undefined,
                      background: showWarn ? 'var(--coral-50)' : undefined,
                    }}
                    onClick={() => handleChoose(idx)}
                  >
                    <span style={{ fontWeight: 650, fontSize: 14 }}>{opt.label}</span>
                    {showGreen && <CheckCircle2 size={16} />}
                    {showWarn && <XCircle size={16} style={{ color: 'var(--coral)' }} />}
                  </button>
                );
              })}
            </div>

            {chosenOption && (
              <div
                className="note"
                style={{ marginTop: 2 }}
                role="status"
              >
                <div className="note__icon">
                  {chosenOption.correct ? <Star size={14} fill="currentColor" /> : <Sparkles size={14} />}
                </div>
                <div>
                  <div className="eyebrow">{chosenOption.correct ? '回答正确！' : '差一点点，再想想！'}</div>
                  <p>{chosenOption.explain}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <button
              type="button"
              className="btn"
              style={{ height: 36, fontSize: 13 }}
              onClick={() => {
                onJumpLesson(current.lessonId);
                onClose();
              }}
            >
              <span>回到对应课程复习</span>
            </button>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn"
                style={{ height: 36 }}
                disabled={safeIdx <= 0}
                onClick={() => goToIndex(safeIdx - 1)}
              >
                上一题
              </button>
              <button
                type="button"
                className="btn btn--primary"
                style={{ height: 36 }}
                disabled={safeIdx >= filteredQuestions.length - 1}
                onClick={() => goToIndex(safeIdx + 1)}
              >
                <span>下一题</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

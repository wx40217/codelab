import { useEffect, useState } from 'react';
import { ArrowRight, FileText, X } from 'lucide-react';
import { playStep } from '../utils/sound';
import { PiBotAvatar } from './PiBotAvatar';

interface CheatsheetCard {
  id: string;
  chapterId: 'ch-1' | 'ch-2' | 'ch-3' | 'ch-4';
  chapterBadge: string;
  title: string;
  analogy: string;
  cnCode: string;
  pyCode: string;
  tip: string;
  lessonId: string;
}

const CHEATSHEET_CARDS: CheatsheetCard[] = [
  {
    id: 'cs-bin',
    chapterId: 'ch-1',
    chapterBadge: '01 · 底层编码',
    title: '二进制 8-4-2-1 魔法开关',
    analogy: '4 盏电灯开(1)或关(0)，把亮着的数字加起来就是十进制！',
    cnCode: '总和 = 8×灯0 + 4×灯1 + 2×灯2 + 1×灯3',
    pyCode: 'int("1101", 2)  # 结果是 13',
    tip: '每向左移 1 位，灯的魔力就翻 2 倍：1 → 2 → 4 → 8 → 16。',
    lessonId: 'binary-bits',
  },
  {
    id: 'cs-pix',
    chapterId: 'ch-1',
    chapterBadge: '01 · 底层编码',
    title: '像素点阵（图片 = 0 和 1 格子）',
    analogy: '放大镜下的屏幕，是由一排排发亮的小方格拼出来的。',
    cnCode: '画布[第r行][第c列] = 1  # 点亮一颗像素',
    pyCode: 'grid[row][col] = 1',
    tip: '5×5 网格只需要 25 个比特就能画出一颗像素爱心！',
    lessonId: 'pixel-art',
  },
  {
    id: 'cs-ascii',
    chapterId: 'ch-1',
    chapterBadge: '01 · 底层编码',
    title: 'ASCII 文字密码本',
    analogy: '全球电脑共用的一本查号簿，每个字母都有唯一编号。',
    cnCode: '编号转字母(65) → "A"，67-65-84 → "CAT"',
    pyCode: 'ord("A")  # 65\nchr(65)   # "A"',
    tip: '记住 A = 65，往后 B=66、C=67 顺着数就能推出来！',
    lessonId: 'text-encoding',
  },
  {
    id: 'cs-loop',
    chapterId: 'ch-2',
    chapterBadge: '02 · 控制流',
    title: 'for 循环偷懒术',
    analogy: '不用傻傻复制粘贴 10 遍，用一句话让电脑自动重复！',
    cnCode: '重复 4 次:\n    向前跳 1 格',
    pyCode: 'for i in range(4):\n    robot.move()',
    tip: '循环次数 N 设大了会撞墙（越界 Bug），设小了会停在半路。',
    lessonId: 'robot-loop',
  },
  {
    id: 'cs-if',
    chapterId: 'ch-2',
    chapterBadge: '02 · 控制流',
    title: 'if / else 雷达岔路口',
    analogy: '遇到障碍就刹车，安全就前进——给程序装上眼睛和大脑。',
    cnCode: '如果 前方有墙:\n    立刻刹车\n否则:\n    向前跳 1 格',
    pyCode: 'if wall_ahead:\n    robot.stop()\nelse:\n    robot.move()',
    tip: 'if 和 else 是二选一，每次运行只会走其中一条路。',
    lessonId: 'if-conditions',
  },
  {
    id: 'cs-var',
    chapterId: 'ch-2',
    chapterBadge: '02 · 控制流',
    title: '变量（贴标签的魔法盒子）',
    analogy: '贴着名字 score 的盒子，新数字放进去会盖掉旧数字。',
    cnCode: 'score = 0\nscore = score + 3  # 变成 3',
    pyCode: 'score = 0\nscore += 3  # 等价于 score = score + 3',
    tip: '编程里的「=」不是数学相等，而是「把右边装进左边盒子里」！',
    lessonId: 'variables-box',
  },
  {
    id: 'cs-arr',
    chapterId: 'ch-3',
    chapterBadge: '03 · 数据结构',
    title: '数组储物柜（下标从 0 开始）',
    analogy: '一整排连着编号的柜子，喊门牌号 1 步就能拿到东西！',
    cnCode: '第 1 个格子 = items[0]\n第 4 个格子 = items[3]',
    pyCode: 'items = ["🍪", "🧸", "🎨", "💎"]\nitems[3]  # "💎"',
    tip: '记住：永远从 [0] 开始数，按门牌找东西只需要 O(1) 一步！',
    lessonId: 'arrays-lockers',
  },
  {
    id: 'cs-stack',
    chapterId: 'ch-3',
    chapterBadge: '03 · 数据结构',
    title: '栈 Stack（后进先出 LIFO）',
    analogy: '像洗完叠起来的盘子，也像画画时的「撤回 Ctrl+Z」。',
    cnCode: '压入栈顶: stack.压入(新步骤)\n弹出栈顶: stack.弹出()',
    pyCode: 'stack.append("画彩虹")\nstack.pop()  # 弹出最顶上的',
    tip: '只能操作最顶上的方块，压在底下的必须等上面的拿走。',
    lessonId: 'stack-plates',
  },
  {
    id: 'cs-queue',
    chapterId: 'ch-3',
    chapterBadge: '03 · 数据结构',
    title: '队列 Queue（先进先出 FIFO）',
    analogy: '像奶茶店乖乖排队：新人排队尾，队头第一个拿奶茶！',
    cnCode: '排到队尾: queue.入队("阿派")\n队头取餐: queue.出队()',
    pyCode: 'queue.append("阿派")\nqueue.pop(0)  # 队头先出',
    tip: '栈是「后来先出」，队列是「先来先出」，千万别搞混啦！',
    lessonId: 'queue-line',
  },
  {
    id: 'cs-tree',
    chapterId: 'ch-3',
    chapterBadge: '03 · 数据结构',
    title: '二叉树（倒挂的家族树）',
    analogy: '最顶上叫树根（Root），每个节点最多分出左右两个孩子。',
    cnCode: '节点: 值 + 左孩子 + 右孩子',
    pyCode: 'class Node:\n    def __init__(self, val):\n        self.val = val\n        self.left = self.right = None',
    tip: '下面没有任何孩子的末端节点叫做「叶子（Leaf）」。',
    lessonId: 'binary-tree-family',
  },
  {
    id: 'cs-bigo',
    chapterId: 'ch-4',
    chapterBadge: '04 · 算法思维',
    title: '大 O 速度排行榜',
    analogy: '比算法快慢不看秒表，看「数据翻倍时步数怎么涨」。',
    cnCode: '超快 O(1) < 砍半 O(log n) < 挨个 O(n) < 暴涨 O(n²)',
    pyCode: '# n = 8 时：\n# O(1)=1, O(log n)=3, O(n)=8, O(n²)=64',
    tip: 'n 很小时大家都很快；n 一变大，好算法和慢算法天差地别！',
    lessonId: 'count-steps',
  },
  {
    id: 'cs-bs-sort',
    chapterId: 'ch-4',
    chapterBadge: '04 · 算法思维',
    title: '二分搜索 & 冒泡排序',
    analogy: '排好队才能砍半猜！冒泡让大数右移，二分每次砍掉一半范围。',
    cnCode: '中间 = (左 + 右) // 2\n如果 左边 > 右边: 交换它们',
    pyCode: 'mid = (low + high) // 2\nif a[i] > a[i+1]:\n    a[i], a[i+1] = a[i+1], a[i]',
    tip: '二分搜索的前提是「数据必须已经排好序」！',
    lessonId: 'binary-search-guess',
  },
];

const TABS: Array<{ id: 'all' | 'ch-1' | 'ch-2' | 'ch-3' | 'ch-4'; label: string }> = [
  { id: 'all', label: '全部秘籍' },
  { id: 'ch-1', label: '01 编码' },
  { id: 'ch-2', label: '02 控制流' },
  { id: 'ch-3', label: '03 数据结构' },
  { id: 'ch-4', label: '04 算法' },
];

interface CheatsheetModalProps {
  open: boolean;
  onClose: () => void;
  onJumpLesson: (lessonId: string) => void;
}

export function CheatsheetModal({ open, onClose, onJumpLesson }: CheatsheetModalProps) {
  const [tab, setTab] = useState<'all' | 'ch-1' | 'ch-2' | 'ch-3' | 'ch-4'>('all');

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

  if (!open) return null;

  const cards = tab === 'all' ? CHEATSHEET_CARDS : CHEATSHEET_CARDS.filter((c) => c.chapterId === tab);

  return (
    <div
      className="finder"
      role="dialog"
      aria-modal="true"
      aria-label="魔法指令速查表"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="finder__panel" style={{ maxWidth: 760 }}>
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
            <PiBotAvatar mood="happy" size={38} />
            <div>
              <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <FileText size={13} style={{ color: 'var(--coral)' }} />
                双语指令速查秘籍
              </div>
              <div style={{ fontSize: 17.5, fontWeight: 800, marginTop: 2 }}>
                生活比喻 · 中文思路 · Python 写法一页看懂
              </div>
            </div>
          </div>

          <button
            type="button"
            className="tool-btn tool-btn--icon"
            style={{ width: 34, height: 34 }}
            onClick={onClose}
            aria-label="关闭速查表"
          >
            <X size={16} />
          </button>
        </div>

        <div className="finder__list" style={{ padding: '15px 20px 20px', display: 'grid', gap: 14 }}>
          {/* Filter Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`btn ${tab === t.id ? 'btn--primary' : ''}`}
                style={{ height: 30, padding: '0 11px', fontSize: 12.5 }}
                onClick={() => {
                  playStep();
                  setTab(t.id);
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
              gap: 12,
            }}
          >
            {cards.map((card) => (
              <article
                key={card.id}
                style={{
                  padding: '13px 14px',
                  borderRadius: 12,
                  background: 'var(--paper-raised)',
                  border: '1px solid var(--line)',
                  display: 'grid',
                  gap: 9,
                  alignContent: 'start',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span className="eyebrow" style={{ color: 'var(--coral-ink)' }}>
                    {card.chapterBadge}
                  </span>
                  <button
                    type="button"
                    className="btn"
                    style={{ height: 24, padding: '0 8px', fontSize: 11.5 }}
                    onClick={() => {
                      onJumpLesson(card.lessonId);
                      onClose();
                    }}
                  >
                    <span>去这课</span>
                    <ArrowRight size={11} />
                  </button>
                </div>

                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>{card.title}</div>
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.45 }}>
                  {card.analogy}
                </p>

                <div
                  style={{
                    borderRadius: 9,
                    background: '#161614',
                    color: '#ebeae4',
                    padding: '9px 11px',
                    display: 'grid',
                    gap: 6,
                    fontSize: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 10.5, color: '#9c9b92', marginBottom: 2 }}>中文步骤</div>
                    <pre className="mono" style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      {card.cnCode}
                    </pre>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.09)', paddingTop: 6 }}>
                    <div style={{ fontSize: 10.5, color: '#ef7658', marginBottom: 2 }}>Python</div>
                    <pre className="mono" style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      {card.pyCode}
                    </pre>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.4 }}>
                  💡 {card.tip}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Clock, FileText, History, Search } from 'lucide-react';
import { AppStorageState, Chapter, LessonMeta } from '../types/course';
import { getLessonById, getLessonMetaById } from '../data/course';

interface FinderModalProps {
  open: boolean;
  chapters: Chapter[];
  storage: AppStorageState;
  onClose: () => void;
  onSelect: (lessonId: string, stepIndex?: number) => void;
}

interface SearchHit {
  key: string;
  lessonId: string;
  stepIndex: number;
  title: string;
  subtitle: string;
  chapterLabel: string;
  badge: string;
  isRecent?: boolean;
  isUpcoming?: boolean;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function HighlightText({ text, query }: { text: string; query: string }) {
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;
  const regex = new RegExp(`(${escapeRegExp(trimmed)})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, idx) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark key={idx}>{part}</mark>
        ) : (
          <Fragment key={idx}>{part}</Fragment>
        )
      )}
    </>
  );
}

export function FinderModal({
  open,
  chapters,
  storage,
  onClose,
  onSelect,
}: FinderModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      window.setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const chapterMap = useMemo(() => {
    const map: Record<string, Chapter> = {};
    for (const ch of chapters) map[ch.id] = ch;
    return map;
  }, [chapters]);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list: Array<{ title: string; right?: string; items: SearchHit[] }> = [];

    if (!q) {
      // Recent visits section
      const recentHits: SearchHit[] = [];
      for (const rec of storage.recent) {
        const meta = getLessonMetaById(rec.lessonId);
        if (!meta) continue;
        const full = getLessonById(rec.lessonId);
        const stepObj = full?.steps[rec.step];
        const ch = chapterMap[meta.chapterId];
        recentHits.push({
          key: `recent-${rec.lessonId}`,
          lessonId: meta.id,
          stepIndex: rec.step,
          title: meta.title,
          subtitle: stepObj
            ? `从第 ${rec.step + 1} 步继续：${stepObj.label}`
            : meta.subtitle,
          chapterLabel: ch ? `${ch.num} · ${ch.title}` : '',
          badge: full ? `${full.steps.length} 步` : '预告',
          isRecent: true,
          isUpcoming: meta.status === 'upcoming',
        });
      }
      if (recentHits.length > 0) {
        list.push({ title: '最近学习', items: recentHits });
      }

      // Grouped by chapter
      for (const ch of chapters) {
        const doneInCh = ch.lessons.filter((l) => storage.doneLessons.includes(l.id)).length;
        list.push({
          title: `${ch.num} · ${ch.title}`,
          right: `已完成 ${doneInCh}/${ch.lessons.length}`,
          items: ch.lessons.map((meta: LessonMeta) => {
            const full = getLessonById(meta.id);
            return {
              key: `ch-${meta.id}`,
              lessonId: meta.id,
              stepIndex: 0,
              title: meta.title,
              subtitle: meta.subtitle,
              chapterLabel: '',
              badge: full ? `${full.steps.length} 步` : '即将推出',
              isUpcoming: meta.status === 'upcoming',
            };
          }),
        });
      }
      return list;
    }

    // Filtered search across lessons + concepts + steps
    const lessonHits: SearchHit[] = [];
    const stepHits: SearchHit[] = [];

    for (const ch of chapters) {
      for (const meta of ch.lessons) {
        const full = getLessonById(meta.id);
        const matchesLesson =
          meta.title.toLowerCase().includes(q) ||
          meta.subtitle.toLowerCase().includes(q) ||
          meta.concepts.some((c) => c.toLowerCase().includes(q));

        if (matchesLesson) {
          lessonHits.push({
            key: `hit-lesson-${meta.id}`,
            lessonId: meta.id,
            stepIndex: 0,
            title: meta.title,
            subtitle: meta.subtitle,
            chapterLabel: `${ch.num} · ${ch.title}`,
            badge: full ? `${full.steps.length} 步` : '即将推出',
            isUpcoming: meta.status === 'upcoming',
          });
        }

        if (full) {
          full.steps.forEach((st, idx) => {
            const matchesStep =
              st.label.toLowerCase().includes(q) ||
              st.body.some((b) => b.toLowerCase().includes(q));
            if (matchesStep) {
              stepHits.push({
                key: `hit-step-${meta.id}-${st.id}`,
                lessonId: meta.id,
                stepIndex: idx,
                title: st.label,
                subtitle: `${meta.title} · 第 ${idx + 1} 步`,
                chapterLabel: `${ch.num} · ${ch.title}`,
                badge: st.kind,
              });
            }
          });
        }
      }
    }

    if (lessonHits.length > 0) {
      list.push({ title: '匹配课程', right: `${lessonHits.length} 项`, items: lessonHits });
    }
    if (stepHits.length > 0) {
      list.push({ title: '匹配步骤', right: `${stepHits.length} 项`, items: stepHits.slice(0, 8) });
    }
    return list;
  }, [query, chapters, storage, chapterMap]);

  const flatItems = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((prev) => (flatItems.length ? (prev + 1) % flatItems.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((prev) =>
          flatItems.length ? (prev - 1 + flatItems.length) % flatItems.length : 0
        );
      } else if (e.key === 'Enter' && flatItems[selectedIdx]) {
        e.preventDefault();
        const picked = flatItems[selectedIdx];
        onSelect(picked.lessonId, picked.stepIndex);
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, flatItems, selectedIdx, onSelect, onClose]);

  if (!open) return null;

  let runningIndex = -1;
  const totalLessons = chapters.reduce((acc, c) => acc + c.lessons.length, 0);

  return (
    <div
      className="finder"
      role="dialog"
      aria-modal="true"
      aria-label="快捷搜索课程与概念"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="finder__panel">
        <div className="finder__field">
          <Search size={18} style={{ color: 'var(--ink-3)', flex: 'none' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索课程、概念、指令（如：二进制、循环、栈、撤回）..."
          />
          <kbd>ESC</kbd>
        </div>

        <div className="finder__list">
          {flatItems.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--ink-3)' }}>
              没有找到包含「{query}」的课程或步骤，试试搜「开关」「循环」或「栈」吧！
            </div>
          ) : (
            sections.map((sec) => (
              <div key={sec.title}>
                <div className="finder__section">
                  <span>{sec.title}</span>
                  {sec.right && <span>{sec.right}</span>}
                </div>

                {sec.items.map((item) => {
                  runningIndex += 1;
                  const idx = runningIndex;
                  const isSelected = idx === selectedIdx;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={`finder__row ${isSelected ? 'is-selected' : ''}`}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      onClick={() => {
                        onSelect(item.lessonId, item.stepIndex);
                        onClose();
                      }}
                    >
                      <span className="finder__tile" aria-hidden="true">
                        {item.isRecent ? (
                          <History size={16} />
                        ) : item.isUpcoming ? (
                          <Clock size={15} />
                        ) : (
                          <FileText size={16} />
                        )}
                      </span>

                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 8,
                            fontWeight: 650,
                            fontSize: 14.5,
                            color: item.isUpcoming ? 'var(--ink-2)' : 'var(--ink)',
                          }}
                        >
                          <HighlightText text={item.title} query={query} />
                          {item.chapterLabel && (
                            <span style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 500 }}>
                              {item.chapterLabel}
                            </span>
                          )}
                        </span>
                        <span
                          style={{
                            display: 'block',
                            fontSize: 12.5,
                            color: 'var(--ink-3)',
                            marginTop: 2,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          <HighlightText text={item.subtitle} query={query} />
                        </span>
                      </span>

                      <span
                        className="tabular-nums"
                        style={{
                          fontSize: 12,
                          color: 'var(--ink-3)',
                          flex: 'none',
                          fontWeight: 600,
                        }}
                      >
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="finder__foot">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <kbd>↑</kbd>
            <kbd>↓</kbd> 移动
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <kbd>↵</kbd> 打开
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <kbd>ESC</kbd> 关闭
          </span>
          <span style={{ marginLeft: 'auto' }} className="tabular-nums">
            共 {totalLessons} 课 · 3 节互动示范课已开放
          </span>
        </div>
      </div>
    </div>
  );
}

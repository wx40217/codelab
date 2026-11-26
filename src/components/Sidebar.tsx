import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  FileText,
  Folder,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { AppStorageState, Chapter } from '../types/course';
import { QuestOverview } from '../data/quest';
import { PiBotAvatar } from './PiBotAvatar';

interface SidebarProps {
  chapters: Chapter[];
  activeLessonId: string;
  activeChapterId: string;
  storage: AppStorageState;
  questOverview: QuestOverview;
  onSelectLesson: (lessonId: string) => void;
  onOpenQuestMap: () => void;
}

export function Sidebar({
  chapters,
  activeLessonId,
  activeChapterId,
  storage,
  questOverview,
  onSelectLesson,
  onOpenQuestMap,
}: SidebarProps) {
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const ch of chapters) {
      initial[ch.id] = ch.id === activeChapterId || ch.id === 'ch-1' || ch.id === 'ch-2' || ch.id === 'ch-3';
    }
    return initial;
  });

  // Always auto-expand the active lesson's chapter when navigating via search/URL
  useEffect(() => {
    if (activeChapterId) {
      setOpenChapters((prev) => (prev[activeChapterId] ? prev : { ...prev, [activeChapterId]: true }));
    }
  }, [activeChapterId]);

  const toggleChapter = (chapterId: string) => {
    setOpenChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const totalLessons = chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
  const doneCount = storage.doneLessons.length;
  const pct = totalLessons > 0 ? Math.min(100, Math.round((doneCount / totalLessons) * 100)) : 0;

  return (
    <aside className="sidebar" aria-label="课程目录">
      {/* Compact 4-Stage Guided Quest Spine Card */}
      <button
        type="button"
        className="quest-banner"
        onClick={onOpenQuestMap}
        title="打开「唤醒阿派」4 阶段探险主线地图"
      >
        <div className="quest-banner__top">
          <PiBotAvatar
            mood={questOverview.allComplete ? 'proud' : 'happy'}
            size={34}
            upgrades={questOverview.upgrades}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="quest-banner__eyebrow">
              <Compass size={11} style={{ color: 'var(--coral)' }} />
              <span>唤醒阿派主线</span>
            </div>
            <div className="quest-banner__next">
              {questOverview.allComplete
                ? '全部 4 部件已满格觉醒！'
                : `下一站：${questOverview.recommendedStageName}`}
            </div>
          </div>
          <span className="quest-banner__ratio tabular-nums">
            {questOverview.unlockedPartsCount}/4
          </span>
        </div>

        <div className="quest-banner__dots" aria-hidden="true">
          {questOverview.stages.map((st) => (
            <span
              key={st.chapterId}
              className={`quest-dot ${st.unlocked ? 'is-unlocked' : st.pct > 0 ? 'is-charging' : ''}`}
              title={`${st.partName} (${st.pct}%)`}
            >
              <span style={{ width: `${st.pct}%` }} />
            </span>
          ))}
        </div>
      </button>

      <div className="sidebar__head">
        <Folder size={17} strokeWidth={2.1} style={{ color: 'var(--ink)' }} />
        <h2>课程</h2>
        <span className="tabular-nums">{totalLessons} 课</span>
      </div>

      <div className="tree" role="tree">
        {chapters.map((chapter) => {
          const isOpen = !!openChapters[chapter.id];
          const isCurrent = chapter.id === activeChapterId;
          const doneInChapter = chapter.lessons.filter((l) =>
            storage.doneLessons.includes(l.id)
          ).length;

          return (
            <div
              key={chapter.id}
              className={`tree__chapter ${isOpen ? 'is-open' : ''} ${isCurrent ? 'is-current' : ''}`}
              role="treeitem"
              aria-expanded={isOpen}
            >
              <button
                type="button"
                className="tree__row"
                onClick={() => toggleChapter(chapter.id)}
              >
                <ChevronRight size={14} className="tree__caret" />
                {isOpen ? (
                  <FolderOpen size={16} className="tree__folder" strokeWidth={2} />
                ) : (
                  <Folder size={16} className="tree__folder" strokeWidth={2} />
                )}
                <span className="tree__title">
                  {chapter.num}. {chapter.title}
                </span>
                <span className="tree__count">
                  {doneInChapter}/{chapter.lessons.length}
                </span>
              </button>

              {isOpen && (
                <ul className="tree__lessons" role="group">
                  {chapter.lessons.map((lesson) => {
                    const isActive = lesson.id === activeLessonId;
                    const isDone = storage.doneLessons.includes(lesson.id);
                    const isChallengeDone = storage.doneChallenges.includes(lesson.id);
                    const isUpcoming = lesson.status === 'upcoming';

                    return (
                      <li key={lesson.id} role="none">
                        <button
                          type="button"
                          role="treeitem"
                          aria-current={isActive ? 'page' : undefined}
                          className={`tree__lesson ${isActive ? 'is-active' : ''} ${isUpcoming ? 'is-soon' : ''}`}
                          onClick={() => onSelectLesson(lesson.id)}
                        >
                          {isDone ? (
                            <CheckCircle2
                              size={15}
                              strokeWidth={2.2}
                              style={{ color: 'var(--coral)', flex: 'none' }}
                            />
                          ) : isUpcoming ? (
                            <Clock
                              size={14}
                              strokeWidth={1.8}
                              style={{ color: 'var(--ink-4)', flex: 'none' }}
                            />
                          ) : (
                            <FileText
                              size={15}
                              strokeWidth={1.9}
                              style={{
                                color: isActive ? 'var(--coral)' : 'var(--ink-3)',
                                flex: 'none',
                              }}
                            />
                          )}

                          <span style={{ flex: 1, minWidth: 0 }}>{lesson.title}</span>

                          {isChallengeDone && (
                            <Sparkles
                              size={13}
                              style={{ color: 'var(--coral)', flex: 'none' }}
                              aria-label="已完成课尾挑战"
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div className="progress-pill" title={`已完成 ${doneCount} / ${totalLessons} 节互动课程`}>
        <strong>进度</strong>
        <span className="meter" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </span>
        <span className="tabular-nums" style={{ color: 'var(--ink-2)', fontWeight: 600 }}>
          {doneCount} / {totalLessons}
        </span>
      </div>
    </aside>
  );
}

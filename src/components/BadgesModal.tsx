import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Lock, Sparkles, Star, Trophy, X } from 'lucide-react';
import { AppStorageState, Chapter, Lesson } from '../types/course';
import { BADGE_CATALOG, getExplorerRank } from '../utils/storage';
import { playStep } from '../utils/sound';
import { PiBotAvatar } from './PiBotAvatar';

interface BadgesModalProps {
  open: boolean;
  initialTab?: 'badges' | 'playgrounds';
  storage: AppStorageState;
  chapters: Chapter[];
  readyLessons: Lesson[];
  onClose: () => void;
  onStartChallenge: (lessonId: string) => void;
}

export function BadgesModal({
  open,
  initialTab = 'badges',
  storage,
  chapters,
  readyLessons,
  onClose,
  onStartChallenge,
}: BadgesModalProps) {
  const [activeTab, setActiveTab] = useState<'badges' | 'playgrounds'>(initialTab);

  useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [open, initialTab]);

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

  const rank = getExplorerRank(storage.stars);
  const rankPct = Math.min(100, Math.round((storage.stars / rank.nextAt) * 100));

  return (
    <div
      className="finder"
      role="dialog"
      aria-modal="true"
      aria-label="探险勋章与游乐场"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="finder__panel" style={{ maxWidth: 720 }}>
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
              mood={storage.badges.length >= 4 ? 'proud' : 'excited'}
              size={38}
            />
            <div>
              <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Trophy size={12} style={{ color: 'var(--coral)' }} />
                {activeTab === 'playgrounds' ? '全部 14 关 2.5D 动手挑战' : '小探险家成长档案'}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{rank.title}</div>
            </div>
          </div>

          <button
            type="button"
            className="tool-btn tool-btn--icon"
            style={{ width: 34, height: 34 }}
            onClick={onClose}
            aria-label="关闭窗口"
          >
            <X size={16} />
          </button>
        </div>

        <div className="finder__list" style={{ padding: '16px 20px 20px', display: 'grid', gap: 16 }}>
          {/* Star Meter Summary */}
          <div
            style={{
              padding: '13px 16px',
              borderRadius: 12,
              background: 'var(--coral-50)',
              border: '1px solid var(--coral-200)',
              display: 'grid',
              gap: 9,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Star size={18} fill="var(--coral)" color="var(--coral)" />
                <span style={{ fontWeight: 800, fontSize: 17 }} className="tabular-nums">
                  {storage.stars} 颗能量星
                </span>
              </div>
              <span style={{ fontSize: 12.5, color: 'var(--coral-ink)', fontWeight: 650 }}>
                已通关 {storage.doneChallenges.length}/{readyLessons.length} 关 · 徽章{' '}
                {storage.badges.length}/{BADGE_CATALOG.length} 枚
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="meter" style={{ height: 8 }}>
                <span style={{ width: `${rankPct}%` }} />
              </span>
              <span className="tabular-nums" style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>
                下一称号 {rank.nextAt} ★
              </span>
            </div>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn ${activeTab === 'playgrounds' ? 'btn--primary' : ''}`}
              style={{ flex: 1, height: 36, fontSize: 13 }}
              onClick={() => {
                playStep();
                setActiveTab('playgrounds');
              }}
            >
              <Sparkles size={14} />
              <span>2.5D 游乐场（{readyLessons.length} 关）</span>
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'badges' ? 'btn--primary' : ''}`}
              style={{ flex: 1, height: 36, fontSize: 13 }}
              onClick={() => {
                playStep();
                setActiveTab('badges');
              }}
            >
              <Trophy size={14} />
              <span>探险徽章墙（{BADGE_CATALOG.length} 枚）</span>
            </button>
          </div>

          {/* Tab 1: All 14 Playgrounds Grouped by Chapter */}
          {activeTab === 'playgrounds' && (
            <div style={{ display: 'grid', gap: 14 }}>
              {chapters.map((chapter) => (
                <div key={chapter.id} style={{ display: 'grid', gap: 8 }}>
                  <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="trail__num">{chapter.num}</span>
                    <span>{chapter.title}</span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))',
                      gap: 8,
                    }}
                  >
                    {chapter.lessons.map((meta) => {
                      const done = storage.doneChallenges.includes(meta.id);
                      return (
                        <button
                          key={meta.id}
                          type="button"
                          className="btn"
                          style={{
                            height: 'auto',
                            padding: '10px 12px',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: 4,
                            whiteSpace: 'normal',
                            textAlign: 'left',
                            borderColor: done ? 'var(--coral-300)' : undefined,
                            background: done ? 'var(--coral-50)' : undefined,
                          }}
                          onClick={() => {
                            onStartChallenge(meta.id);
                            onClose();
                          }}
                        >
                          <div
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 6,
                            }}
                          >
                            <span style={{ fontWeight: 750, fontSize: 13.5 }}>{meta.title}</span>
                            {done ? (
                              <CheckCircle2 size={14} style={{ color: 'var(--coral)', flex: 'none' }} />
                            ) : (
                              <ArrowRight size={14} style={{ color: 'var(--coral)', flex: 'none' }} />
                            )}
                          </div>
                          <span style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 500 }}>
                            {done ? '已通关 · 再玩一次' : meta.subtitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: All 8 Collectible Badges */}
          {activeTab === 'badges' && (
            <div style={{ display: 'grid', gap: 9 }}>
              <div className="eyebrow">
                点亮全部 {BADGE_CATALOG.length} 枚徽章，成为传奇算法小博士！
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
                  gap: 10,
                }}
              >
                {BADGE_CATALOG.map((badge) => {
                  const unlocked = storage.badges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 11,
                        padding: '11px 12px',
                        borderRadius: 11,
                        border: `1px solid ${unlocked ? 'var(--coral-300)' : 'var(--line)'}`,
                        background: unlocked ? 'var(--paper)' : 'var(--paper-raised)',
                        opacity: unlocked ? 1 : 0.74,
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 9,
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: 19,
                          flex: 'none',
                          background: unlocked ? 'var(--coral-100)' : 'var(--paper-sunk)',
                          border: `1px solid ${unlocked ? 'var(--coral-300)' : 'var(--line)'}`,
                        }}
                      >
                        {unlocked ? badge.emoji : <Lock size={15} style={{ color: 'var(--ink-3)' }} />}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                          <span style={{ fontWeight: 750, fontSize: 13.8 }}>
                            {badge.secret && !unlocked ? '神秘彩蛋徽章' : badge.title}
                          </span>
                          <span
                            className="chip"
                            style={{
                              height: 20,
                              fontSize: 11,
                              padding: '0 6px',
                              background: unlocked ? 'var(--coral)' : 'var(--paper-sunk)',
                              color: unlocked ? 'var(--on-coral)' : 'var(--ink-3)',
                            }}
                          >
                            +{badge.stars} ★
                          </span>
                        </div>
                        <p style={{ fontSize: 12.2, color: 'var(--ink-3)', marginTop: 3, lineHeight: 1.4 }}>
                          {badge.secret && !unlocked
                            ? '小提示：在机器人实验里，故意让阿派撞一次障碍墙试试看？'
                            : badge.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

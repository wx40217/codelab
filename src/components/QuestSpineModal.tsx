import { useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Lock,
  Rocket,
  Sparkles,
  X,
} from 'lucide-react';
import { AppStorageState, Chapter } from '../types/course';
import { QuestOverview } from '../data/quest';
import { playStep } from '../utils/sound';
import { PiBotAvatar } from './PiBotAvatar';

interface QuestSpineModalProps {
  open: boolean;
  isFirstWelcome: boolean;
  overview: QuestOverview;
  chapters: Chapter[];
  storage: AppStorageState;
  onClose: () => void;
  onJumpLesson: (lessonId: string, startChallenge?: boolean) => void;
}

/**
 * 4-Stage Guided Quest Spine ("唤醒阿派 · 探险主线") & First-Visit Welcome Story Modal.
 * Visually links all 4 chapters (14 lessons) to repairing Pi-Bot #314's 4 hardware modules,
 * with a live evolving 2.5D Pi-Bot showcase and one-click "Continue Next Stop" button.
 */
export function QuestSpineModal({
  open,
  isFirstWelcome,
  overview,
  chapters,
  storage,
  onClose,
  onJumpLesson,
}: QuestSpineModalProps) {
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

  return (
    <div
      className="finder"
      role="dialog"
      aria-modal="true"
      aria-label="唤醒阿派：探险主线地图"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="finder__panel" style={{ maxWidth: 740 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Compass size={17} style={{ color: 'var(--coral)' }} />
            <span className="eyebrow" style={{ color: 'var(--coral-ink)' }}>
              {isFirstWelcome ? '欢迎来到指令实验室 · CodeLab' : '唤醒小机器人阿派 · 探险主线'}
            </span>
          </div>

          <button
            type="button"
            className="tool-btn tool-btn--icon"
            style={{ width: 34, height: 34 }}
            onClick={onClose}
            aria-label="关闭主线地图"
          >
            <X size={16} />
          </button>
        </div>

        <div className="finder__list" style={{ padding: '18px 20px 20px', display: 'grid', gap: 16 }}>
          {/* Hero Story Banner with Evolving 2.5D Pi-Bot */}
          <div className="quest-hero">
            <div className="quest-hero__bot">
              <PiBotAvatar
                mood={overview.allComplete ? 'proud' : overview.unlockedPartsCount > 0 ? 'excited' : 'curious'}
                size={92}
                upgrades={overview.upgrades}
                showShadow
              />
            </div>

            <div style={{ minWidth: 0, flex: 1, display: 'grid', gap: 7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, lineHeight: 1.25 }}>
                  {overview.allComplete
                    ? '终极形态已觉醒！阿派全副武装啦！'
                    : isFirstWelcome
                      ? '嗨！我是迫降在纸桌上的阿派 #314！'
                      : `已修复 ${overview.unlockedPartsCount} / 4 块核心部件`}
                </h2>
                <span className="chip chip--tag">
                  {overview.unlockedPartsCount} / 4 部件点亮
                </span>
              </div>

              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)' }}>
                {overview.allComplete
                  ? '你已经帮我找回了语言芯片、推进翼、记忆背包和极客皇冠！随时点我右下角的宠物小身体陪你玩！'
                  : '我的 4 块电脑核心部件正在休眠——只要跟着下面 4 站边玩边学，每修复一站，我身上的 2.5D 装备就会当场进化升级哦！'}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  className="btn btn--primary"
                  style={{ height: 38, padding: '0 16px' }}
                  onClick={() => {
                    playStep();
                    onJumpLesson(overview.recommendedLessonId, overview.recommendedIsChallenge);
                    onClose();
                  }}
                >
                  <Rocket size={15} />
                  <span>
                    {overview.allComplete
                      ? '重温精彩第一课'
                      : isFirstWelcome
                        ? `出发第一站：${overview.recommendedLessonTitle}`
                        : overview.recommendedIsChallenge
                          ? `继续挑战：${overview.recommendedLessonTitle}`
                          : `继续下一站：${overview.recommendedLessonTitle}`}
                  </span>
                  <ArrowRight size={15} />
                </button>

                {isFirstWelcome && (
                  <button
                    type="button"
                    className="btn"
                    style={{ height: 38, padding: '0 14px' }}
                    onClick={onClose}
                  >
                    <span>先自己逛逛</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 4-Stage Connected Spine */}
          <div style={{ display: 'grid', gap: 10 }}>
            {overview.stages.map((stage) => {
              const ch = chapters.find((c) => c.id === stage.chapterId);
              const isRecommendedStage =
                ch?.lessons.some((l) => l.id === overview.recommendedLessonId) &&
                !overview.allComplete;

              return (
                <section
                  key={stage.chapterId}
                  className={`quest-stage ${stage.unlocked ? 'is-unlocked' : ''} ${
                    isRecommendedStage ? 'is-current' : ''
                  }`}
                >
                  <div className="quest-stage__head">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <span className="quest-stage__badge" aria-hidden="true">
                        {stage.unlocked ? stage.partEmoji : <Lock size={14} style={{ color: 'var(--ink-3)' }} />}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: 15 }}>{stage.missionTitle}</span>
                          {stage.unlocked ? (
                            <span
                              className="chip"
                              style={{
                                height: 20,
                                fontSize: 11,
                                padding: '0 7px',
                                background: 'var(--coral)',
                                color: 'var(--on-coral)',
                              }}
                            >
                              ✓ {stage.unlockRewardText}
                            </span>
                          ) : (
                            <span className="chip" style={{ height: 20, fontSize: 11, padding: '0 7px' }}>
                              奖励：{stage.unlockRewardText}
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.45 }}>
                          {stage.storyDesc}
                        </p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flex: 'none' }}>
                      <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 800, color: 'var(--coral-ink)' }}>
                        {stage.pct}%
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                        学完 {stage.doneLessons}/{stage.totalLessons} · 挑战 {stage.doneChallenges}/{stage.totalLessons}
                      </div>
                    </div>
                  </div>

                  {/* Charge Bar */}
                  <div className="meter" style={{ height: 6 }}>
                    <span style={{ width: `${stage.pct}%` }} />
                  </div>

                  {/* Clickable Lesson Nodes inside this stage */}
                  {ch && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {ch.lessons.map((meta) => {
                        const doneL = storage.doneLessons.includes(meta.id);
                        const doneC = storage.doneChallenges.includes(meta.id);
                        const isRec = meta.id === overview.recommendedLessonId && !overview.allComplete;

                        return (
                          <button
                            key={meta.id}
                            type="button"
                            className={`btn ${isRec ? 'btn--primary' : ''}`}
                            style={{
                              height: 30,
                              padding: '0 10px',
                              fontSize: 12.2,
                              borderColor: doneL && !isRec ? 'var(--coral-300)' : undefined,
                              background: doneL && !isRec ? 'var(--coral-50)' : undefined,
                            }}
                            onClick={() => {
                              playStep();
                              onJumpLesson(meta.id, false);
                              onClose();
                            }}
                          >
                            {doneL && !isRec && (
                              <CheckCircle2 size={12} style={{ color: 'var(--coral)' }} />
                            )}
                            <span>{meta.title}</span>
                            {doneC && (
                              <Sparkles
                                size={11}
                                style={{ color: isRec ? 'var(--on-coral)' : 'var(--coral)' }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

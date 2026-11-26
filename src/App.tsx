/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import {
  CHAPTERS,
  DEFAULT_LESSON_ID,
  READY_LESSON_LIST,
  getChapterById,
  getLessonById,
  getNextReadyLesson,
} from './data/course';
import { useHashRoute } from './hooks/useHashRoute';
import {
  applyAndSaveTheme,
  loadAppState,
  loadTheme,
  markChallengeDone,
  markLessonDone,
  recordPracticeSolved,
  recordQuizSolved,
  recordRecentVisit,
  setStoredCodeLang,
  setStoredSoundEnabled,
  unlockBadge,
} from './utils/storage';
import {
  playBlocked,
  playHop,
  playStep,
  playSwitch,
  setSoundEnabled,
} from './utils/sound';
import { AppStorageState, BadgeId, CodeLang, SceneState, ThemeMode } from './types/course';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { IsoStageRouter, StageInteractionHandlers } from './components/stage/IsoStageRouter';
import { StairsIcon } from './components/stage/IsoPrimitives';
import { StepsTimeline } from './components/StepsTimeline';
import { StepExplainCard } from './components/StepExplainCard';
import { DarkCodePanel } from './components/DarkCodePanel';
import { FactsCard } from './components/FactsCard';
import { MicroLabCard, useMicroLabRuntime } from './components/MicroLabCard';
import { FinderModal } from './components/FinderModal';
import { BadgesModal } from './components/BadgesModal';
import { PracticeModal } from './components/PracticeModal';
import { CheatsheetModal } from './components/CheatsheetModal';
import { Toast } from './components/Toast';

const BIT_WEIGHTS = [8, 4, 2, 1] as const;
const ALGO_LESSON_IDS = new Set(['count-steps', 'binary-search-guess', 'card-sorting']);

export default function App() {
  const { route, navigateLesson, replaceStep } = useHashRoute(DEFAULT_LESSON_ID);
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());
  const [storage, setStorage] = useState<AppStorageState>(() => {
    const loaded = loadAppState();
    setSoundEnabled(loaded.soundEnabled);
    return loaded;
  });
  const [inChallenge, setInChallenge] = useState(false);
  const [finderOpen, setFinderOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [badgesModal, setBadgesModal] = useState<{ open: boolean; tab: 'badges' | 'playgrounds' }>({
    open: false,
    tab: 'badges',
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const toastTimerRef = useRef<number | null>(null);

  // Learn-mode playful sandbox overrides
  const [sandboxBits, setSandboxBits] = useState<[0 | 1, 0 | 1, 0 | 1, 0 | 1] | null>(null);
  const [sandboxFocusBit, setSandboxFocusBit] = useState<number | undefined>(undefined);
  const [sandboxPixels, setSandboxPixels] = useState<number[] | null>(null);
  const [sandboxFocusPixel, setSandboxFocusPixel] = useState<number | undefined>(undefined);
  const [replayPos, setReplayPos] = useState<number | null>(null);
  const replayTimerRef = useRef<number | null>(null);

  const activeLesson = getLessonById(route.lessonId) ?? READY_LESSON_LIST[0];
  const activeChapter = getChapterById(activeLesson.chapterId);

  const clampedStepIndex = Math.max(
    0,
    Math.min(route.stepIndex, activeLesson.steps.length - 1)
  );

  const activeStep = activeLesson.steps[clampedStepIndex];
  const nextStep =
    clampedStepIndex < activeLesson.steps.length - 1
      ? activeLesson.steps[clampedStepIndex + 1]
      : undefined;
  const nextReadyLesson = getNextReadyLesson(activeLesson.id);

  const triggerConfetti = useCallback(() => {
    setConfettiKey((k) => k + 1);
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMsg(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
      toastTimerRef.current = null;
    }, 2800);
  }, []);

  const clearReplayTimer = useCallback(() => {
    if (replayTimerRef.current !== null) {
      window.clearInterval(replayTimerRef.current);
      replayTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
      clearReplayTimer();
    };
  }, [clearReplayTimer]);

  // Reset learn-mode sandboxes & replay whenever lesson or step changes
  useEffect(() => {
    setSandboxBits(null);
    setSandboxFocusBit(undefined);
    setSandboxPixels(null);
    setSandboxFocusPixel(undefined);
    clearReplayTimer();
    setReplayPos(null);
  }, [activeLesson.id, clampedStepIndex, inChallenge, clearReplayTimer]);

  // Reset challenge mode when switching lessons
  useEffect(() => {
    setInChallenge(false);
  }, [activeLesson.id]);

  // Persist recent visit & mark lesson done upon reaching final step
  useEffect(() => {
    setStorage((prev) => {
      let next = recordRecentVisit(prev, activeLesson.id, clampedStepIndex);
      if (clampedStepIndex >= activeLesson.steps.length - 1) {
        next = markLessonDone(next, activeLesson.id);
      }
      return next;
    });
  }, [activeLesson.id, activeLesson.steps.length, clampedStepIndex]);

  const tryUnlockBadge = useCallback(
    (badgeId: BadgeId, customToast?: string) => {
      setStorage((prev) => {
        const res = unlockBadge(prev, badgeId);
        if (res.unlockedNow && res.badge) {
          triggerConfetti();
          showToast(
            customToast ??
              `${res.badge.emoji} 解锁徽章「${res.badge.title}」+${res.badge.stars} ★`
          );
        }
        return res.state;
      });
    },
    [showToast, triggerConfetti]
  );

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      applyAndSaveTheme(next);
      return next;
    });
  }, []);

  const handleToggleSound = useCallback(() => {
    setStorage((prev) => {
      const nextEnabled = !prev.soundEnabled;
      setSoundEnabled(nextEnabled);
      if (nextEnabled) playStep();
      showToast(nextEnabled ? '🔊 互动音效已开启！' : '🔇 已切换为静音模式');
      return setStoredSoundEnabled(prev, nextEnabled);
    });
  }, [showToast]);

  const handleCodeLangChange = useCallback(
    (lang: CodeLang) => {
      setStorage((prev) => {
        let next = setStoredCodeLang(prev, lang);
        if (lang === 'py') {
          const res = unlockBadge(next, 'python-explorer');
          if (res.unlockedNow && res.badge) {
            triggerConfetti();
            showToast(`${res.badge.emoji} 解锁徽章「${res.badge.title}」+${res.badge.stars} ★`);
          }
          next = res.state;
        }
        return next;
      });
    },
    [showToast, triggerConfetti]
  );

  const closeAllModals = useCallback(() => {
    setFinderOpen(false);
    setPracticeOpen(false);
    setCheatsheetOpen(false);
    setBadgesModal((prev) => ({ ...prev, open: false }));
  }, []);

  const handleSelectLesson = useCallback(
    (lessonId: string, stepIndex = 0) => {
      setInChallenge(false);
      setMenuOpen(false);
      closeAllModals();
      navigateLesson(lessonId, stepIndex);
    },
    [navigateLesson, closeAllModals]
  );

  const handleStartChallengeDirect = useCallback(
    (lessonId: string) => {
      const targetLesson = getLessonById(lessonId);
      if (!targetLesson) return;
      setMenuOpen(false);
      closeAllModals();
      navigateLesson(lessonId, targetLesson.steps.length - 1);
      window.setTimeout(() => setInChallenge(true), 0);
    },
    [navigateLesson, closeAllModals]
  );

  const handleSelectStep = useCallback(
    (idx: number) => {
      const bounded = Math.max(0, Math.min(idx, activeLesson.steps.length - 1));
      playStep();
      setInChallenge(false);
      replaceStep(activeLesson.id, bounded);
    },
    [activeLesson, replaceStep]
  );

  const handleSolveQuiz = useCallback(
    (quizId: string, rewardStars: number) => {
      triggerConfetti();
      setStorage((prev) => {
        const res = recordQuizSolved(prev, quizId, rewardStars);
        let next = res.state;
        if (res.newlySolved) {
          showToast(`🎯 猜中啦！获得 +${rewardStars} 能量星！`);
        }
        if (next.solvedQuizzes.length + next.solvedPractice.length >= 2) {
          const bRes = unlockBadge(next, 'quiz-whiz');
          if (bRes.unlockedNow && bRes.badge) {
            showToast(`${bRes.badge.emoji} 解锁徽章「${bRes.badge.title}」+${bRes.badge.stars} ★`);
          }
          next = bRes.state;
        }
        return next;
      });
    },
    [showToast, triggerConfetti]
  );

  const handleSolvePractice = useCallback(
    (questionId: string, rewardStars: number) => {
      triggerConfetti();
      setStorage((prev) => {
        const res = recordPracticeSolved(prev, questionId, rewardStars);
        let next = res.state;
        if (res.newlySolved) {
          showToast(`⭐ 练习答对啦！获得 +${rewardStars} 能量星！`);
        }
        if (next.solvedQuizzes.length + next.solvedPractice.length >= 2) {
          const bRes = unlockBadge(next, 'quiz-whiz');
          if (bRes.unlockedNow && bRes.badge) {
            showToast(`${bRes.badge.emoji} 解锁徽章「${bRes.badge.title}」+${bRes.badge.stars} ★`);
          }
          next = bRes.state;
        }
        return next;
      });
    },
    [showToast, triggerConfetti]
  );

  const handleChallengeSolved = useCallback(
    (lessonId: string) => {
      triggerConfetti();
      setStorage((prev) => {
        let next = markChallengeDone(prev, lessonId);
        let toastToShow: string | null = null;

        const badgeMap: Record<string, BadgeId> = {
          'binary-bits': 'binary-hero',
          'robot-loop': 'loop-captain',
          'stack-plates': 'stack-master',
        };
        const directBadge = badgeMap[lessonId];
        if (directBadge) {
          const bRes = unlockBadge(next, directBadge);
          if (bRes.unlockedNow && bRes.badge) {
            toastToShow = `${bRes.badge.emoji} 解锁徽章「${bRes.badge.title}」+${bRes.badge.stars} ★`;
          }
          next = bRes.state;
        }

        if (ALGO_LESSON_IDS.has(lessonId)) {
          const bRes = unlockBadge(next, 'algo-wizard');
          if (bRes.unlockedNow && bRes.badge) {
            toastToShow = `${bRes.badge.emoji} 解锁徽章「${bRes.badge.title}」+${bRes.badge.stars} ★`;
          }
          next = bRes.state;
        }

        if (next.doneChallenges.length >= 6) {
          const bRes = unlockBadge(next, 'grand-explorer');
          if (bRes.unlockedNow && bRes.badge) {
            toastToShow = `${bRes.badge.emoji} 解锁徽章「${bRes.badge.title}」+${bRes.badge.stars} ★`;
          }
          next = bRes.state;
        }

        if (toastToShow) {
          showToast(toastToShow);
        } else if (!prev.doneChallenges.includes(lessonId)) {
          showToast('🏆 挑战通关！获得 +20 能量星！');
        }

        return next;
      });
    },
    [showToast, triggerConfetti]
  );

  const handleBonkWall = useCallback(() => {
    tryUnlockBadge(
      'bug-hunter',
      '💥 发现隐藏徽章「勇敢试错家」+20 ★ 抓到一只越界 Bug！'
    );
  }, [tryUnlockBadge]);

  const microLab = useMicroLabRuntime(
    activeLesson,
    inChallenge,
    handleChallengeSolved,
    handleBonkWall,
    showToast
  );

  // Learn-mode direct stage interactions!
  const handleLearnToggleBit = useCallback(
    (idx: number) => {
      if (activeStep.state.scene !== 'binary-bits') return;
      const base = sandboxBits ?? activeStep.state.bits;
      const next = [...base] as [0 | 1, 0 | 1, 0 | 1, 0 | 1];
      const nextVal: 0 | 1 = next[idx] === 1 ? 0 : 1;
      next[idx] = nextVal;
      playSwitch(nextVal === 1);
      setSandboxBits(next);
      setSandboxFocusBit(idx);
    },
    [activeStep, sandboxBits]
  );

  const handleLearnTogglePixel = useCallback(
    (cellIdx: number) => {
      if (activeStep.state.scene !== 'pixel-grid') return;
      const base = sandboxPixels ?? activeStep.state.pixels;
      const next = [...base];
      const nextVal = next[cellIdx] ? 0 : 1;
      next[cellIdx] = nextVal;
      playSwitch(nextVal === 1);
      setSandboxPixels(next);
      setSandboxFocusPixel(cellIdx);
    },
    [activeStep, sandboxPixels]
  );

  const handleReplayRobotHops = useCallback(() => {
    if (activeStep.state.scene !== 'robot-loop') return;
    const targetPos = activeStep.state.robotAt;
    if (targetPos <= 0) return;

    clearReplayTimer();
    setReplayPos(0);
    let step = 0;

    replayTimerRef.current = window.setInterval(() => {
      step += 1;
      playHop(step);
      setReplayPos(step);
      if (step >= targetPos) {
        clearReplayTimer();
        window.setTimeout(() => setReplayPos(null), 450);
      }
    }, 360);
  }, [activeStep, clearReplayTimer]);

  const handleLearnStackBlocked = useCallback(
    (label: string) => {
      playBlocked();
      showToast(`「${label}」被压在下面啦！栈只能从最顶上拿走哦～`);
    },
    [showToast]
  );

  const handleLearnStackTop = useCallback(() => {
    if (activeStep.state.scene !== 'stack-plates') return;
    const top = activeStep.state.stack[activeStep.state.stack.length - 1];
    if (!top) return;
    playStep();
    showToast(`没错！「${top.label}」就在最顶上，按撤回键时它会第一个飞出去！`);
  }, [activeStep, showToast]);

  const handleLearnQueueFront = useCallback(() => {
    if (activeStep.state.scene !== 'queue-line') return;
    const front = activeStep.state.queue[0];
    if (!front) return;
    playStep();
    showToast(`「${front.label}」排在最前面（队头），下一杯奶茶就是 TA 的！`);
  }, [activeStep, showToast]);

  const handleLearnQueueMiddle = useCallback(
    (label: string) => {
      playBlocked();
      showToast(`「${label}」还在排队中，公平队列不能插队哦！`);
    },
    [showToast]
  );

  const handleLearnTreeNode = useCallback(
    (nodeId: string) => {
      if (activeStep.state.scene !== 'binary-tree') return;
      const node = activeStep.state.nodes.find((n) => n.id === nodeId);
      if (!node) return;
      playStep();
      const role =
        node.level === 0
          ? '树根（Root）：整棵树最顶上的出发点！'
          : node.level === 1
            ? '分叉节点：承上启下，下面还有两个子节点！'
            : '叶子节点（Leaf）：已经到最底端啦，下面没有孩子！';
      showToast(`节点 ${node.label} → ${role}`);
    },
    [activeStep, showToast]
  );

  const anyModalOpen = finderOpen || practiceOpen || cheatsheetOpen || badgesModal.open;

  // Global keyboard shortcuts (Cmd/Ctrl+K, ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setFinderOpen((open) => !open);
        return;
      }

      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        return;
      }

      if (anyModalOpen) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (inChallenge) return;

      if (e.key === 'ArrowRight') {
        if (clampedStepIndex < activeLesson.steps.length - 1) {
          e.preventDefault();
          handleSelectStep(clampedStepIndex + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (clampedStepIndex > 0) {
          e.preventDefault();
          handleSelectStep(clampedStepIndex - 1);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    activeLesson.steps.length,
    clampedStepIndex,
    anyModalOpen,
    inChallenge,
    menuOpen,
    handleSelectStep,
  ]);

  // Compute synchronized stage state (incorporating learn-mode sandboxes or hop replay)
  let stageState: SceneState = inChallenge && microLab ? microLab.sceneState : activeStep.state;

  let factsData =
    inChallenge && microLab
      ? microLab.facts
      : activeStep.facts
        ? {
            title: activeStep.facts.title ?? activeLesson.factsTitle ?? '当前状态',
            rows: activeStep.facts.rows,
            note: activeStep.facts.note,
          }
        : null;

  if (!inChallenge && stageState.scene === 'binary-bits' && sandboxBits) {
    const sum =
      sandboxBits[0] * 8 + sandboxBits[1] * 4 + sandboxBits[2] * 2 + sandboxBits[3] * 1;
    stageState = {
      ...stageState,
      bits: sandboxBits,
      focusBit: sandboxFocusBit,
      showWeights: true,
      tagText: `自由试玩：当前总和 = ${sum}`,
      tagTone: 'coral',
    };
    factsData = {
      title: '自由试玩读数',
      rows: [
        { label: '二进制编码', value: sandboxBits.join(' ') },
        {
          label: '亮起权重',
          chips: BIT_WEIGHTS.map((w, i) => ({
            text: String(w),
            tone: sandboxBits[i] === 1 ? 'best' : 'quiet',
          })),
        },
        { label: '当前总和', value: sum, active: true },
      ],
      note: '随时点舞台左下角「恢复本步演示」回到原图！',
    };
  } else if (!inChallenge && stageState.scene === 'pixel-grid' && sandboxPixels) {
    const lit = sandboxPixels.filter((p) => p === 1).length;
    stageState = {
      ...stageState,
      pixels: sandboxPixels,
      highlightCell: sandboxFocusPixel,
      tagText: `自由涂鸦：已点亮 ${lit} 颗像素`,
      tagTone: 'coral',
      interactive: true,
    };
  } else if (!inChallenge && stageState.scene === 'robot-loop' && replayPos !== null) {
    stageState = {
      ...stageState,
      robotAt: replayPos,
      visited: Array.from({ length: replayPos + 1 }, (_, i) => i),
      status: replayPos === stageState.goalAt ? 'victory' : 'step',
      tagText: `回放第 ${replayPos} 步`,
    };
  }

  // Enable clickability hints on learn-mode scenes that support playful taps
  if (!inChallenge) {
    if (stageState.scene === 'pixel-grid' || stageState.scene === 'binary-tree') {
      stageState = { ...stageState, interactive: true };
    }
  }

  const stageHandlers: StageInteractionHandlers =
    inChallenge && microLab
      ? microLab.stageHandlers
      : {
          onToggleBit:
            activeStep.state.scene === 'binary-bits' ? handleLearnToggleBit : undefined,
          onTogglePixel:
            activeStep.state.scene === 'pixel-grid' ? handleLearnTogglePixel : undefined,
          onClickStackTop:
            activeStep.state.scene === 'stack-plates' ? handleLearnStackTop : undefined,
          onClickStackBlocked:
            activeStep.state.scene === 'stack-plates' ? handleLearnStackBlocked : undefined,
          onClickQueueFront:
            activeStep.state.scene === 'queue-line' ? handleLearnQueueFront : undefined,
          onClickQueueMiddle:
            activeStep.state.scene === 'queue-line' ? handleLearnQueueMiddle : undefined,
          onClickTreeNode:
            activeStep.state.scene === 'binary-tree' ? handleLearnTreeNode : undefined,
        };

  const codeLines =
    inChallenge && microLab
      ? microLab.codeLines
      : activeStep.overrideCode ?? activeLesson.codeLines;
  const highlightLines =
    inChallenge && microLab ? microLab.highlightLines : activeStep.lines;

  const hasLearnSandbox = Boolean(sandboxBits || sandboxPixels);

  // Optional floating play/reset overlay in the bottom-left of the 2.5D stage
  const stageOverlay = !inChallenge ? (
    hasLearnSandbox ? (
      <button
        type="button"
        className="btn"
        style={{ height: 32, padding: '0 11px', fontSize: 12.5 }}
        onClick={() => {
          setSandboxBits(null);
          setSandboxFocusBit(undefined);
          setSandboxPixels(null);
          setSandboxFocusPixel(undefined);
        }}
      >
        <RotateCcw size={13} />
        <span>恢复本步演示</span>
      </button>
    ) : activeStep.state.scene === 'robot-loop' && activeStep.state.robotAt > 0 ? (
      <button
        type="button"
        className="btn"
        style={{ height: 32, padding: '0 12px', fontSize: 12.5 }}
        disabled={replayPos !== null}
        onClick={handleReplayRobotHops}
      >
        <Play size={13} style={{ color: 'var(--coral)' }} />
        <span>{replayPos !== null ? '阿派跳跃中...' : '回放阿派跳跃'}</span>
      </button>
    ) : null
  ) : null;

  const activeNav = practiceOpen
    ? 'practice'
    : cheatsheetOpen
      ? 'cheatsheet'
      : badgesModal.open
        ? badgesModal.tab
        : 'learn';

  return (
    <div className={`app ${menuOpen ? 'is-menu-open' : ''}`}>
      <Topbar
        theme={theme}
        stars={storage.stars}
        badgeCount={storage.badges.length}
        soundEnabled={storage.soundEnabled}
        activeNav={activeNav}
        onToggleTheme={handleToggleTheme}
        onToggleSound={handleToggleSound}
        onOpenFinder={() => {
          closeAllModals();
          setFinderOpen(true);
        }}
        onOpenPractice={() => {
          closeAllModals();
          setPracticeOpen(true);
        }}
        onOpenCheatsheet={() => {
          closeAllModals();
          setCheatsheetOpen(true);
        }}
        onOpenPlaygrounds={() => {
          closeAllModals();
          setBadgesModal({ open: true, tab: 'playgrounds' });
        }}
        onOpenBadges={() => {
          closeAllModals();
          setBadgesModal({ open: true, tab: 'badges' });
        }}
        onToggleMenu={() => setMenuOpen((o) => !o)}
        onGoHome={() => handleSelectLesson(DEFAULT_LESSON_ID, 0)}
        onClickLearn={() => {
          closeAllModals();
          setInChallenge(false);
          setMenuOpen(false);
        }}
      />

      <div className="scrim" onClick={() => setMenuOpen(false)} aria-hidden="true" />

      <div className="workspace">
        <Sidebar
          chapters={CHAPTERS}
          activeLessonId={activeLesson.id}
          activeChapterId={activeLesson.chapterId}
          storage={storage}
          onSelectLesson={(id) => handleSelectLesson(id, 0)}
        />

        <main className="lesson">
          <div className="lesson__head">
            <h1>{activeLesson.title}</h1>
            <div className="trail">
              <div className="trail__text">
                <div className="trail__chapter">
                  <span className="trail__num">{activeLesson.chapterNum}</span>
                  <span>{activeChapter?.title}</span>
                </div>
                <div className="trail__lesson">
                  第 {activeLesson.orderInChapter} 课，共 {activeLesson.totalInChapter} 课
                </div>
              </div>
              <StairsIcon
                total={activeLesson.totalInChapter}
                current={activeLesson.orderInChapter}
              />
            </div>
          </div>

          <IsoStageRouter
            state={stageState}
            confettiKey={confettiKey}
            stageOverlay={stageOverlay}
            {...stageHandlers}
          />

          <StepsTimeline
            steps={activeLesson.steps}
            stepIndex={clampedStepIndex}
            inChallenge={inChallenge}
            onSelectStep={handleSelectStep}
          />
        </main>

        <aside className="rail" aria-label="讲解与代码同步区">
          {inChallenge && microLab ? (
            <MicroLabCard
              lesson={activeLesson}
              runtime={microLab}
              nextLessonTitle={
                nextReadyLesson && nextReadyLesson.id !== activeLesson.id
                  ? nextReadyLesson.title
                  : undefined
              }
              onExitChallenge={() => setInChallenge(false)}
              onGoNextLesson={
                nextReadyLesson && nextReadyLesson.id !== activeLesson.id
                  ? () => handleSelectLesson(nextReadyLesson.id, 0)
                  : undefined
              }
            />
          ) : (
            <StepExplainCard
              step={activeStep}
              stepIndex={clampedStepIndex}
              totalSteps={activeLesson.steps.length}
              nextStepLabel={nextStep?.label}
              challengeDone={storage.doneChallenges.includes(activeLesson.id)}
              quizAlreadySolved={
                activeStep.quiz
                  ? storage.solvedQuizzes.includes(activeStep.quiz.id)
                  : false
              }
              onPrev={() => handleSelectStep(clampedStepIndex - 1)}
              onNext={() => handleSelectStep(clampedStepIndex + 1)}
              onEnterChallenge={() => {
                playStep();
                setInChallenge(true);
              }}
              onSolveQuiz={handleSolveQuiz}
            />
          )}

          <DarkCodePanel
            lines={codeLines}
            highlightLines={highlightLines}
            codeLang={storage.codeLang}
            onChangeCodeLang={handleCodeLangChange}
          />

          {factsData && (
            <FactsCard
              title={factsData.title}
              rows={factsData.rows}
              note={factsData.note}
            />
          )}
        </aside>
      </div>

      <FinderModal
        open={finderOpen}
        chapters={CHAPTERS}
        storage={storage}
        onClose={() => setFinderOpen(false)}
        onSelect={handleSelectLesson}
      />

      <PracticeModal
        open={practiceOpen}
        storage={storage}
        onClose={() => setPracticeOpen(false)}
        onSolveQuestion={handleSolvePractice}
        onJumpLesson={(id) => handleSelectLesson(id, 0)}
      />

      <CheatsheetModal
        open={cheatsheetOpen}
        onClose={() => setCheatsheetOpen(false)}
        onJumpLesson={(id) => handleSelectLesson(id, 0)}
      />

      <BadgesModal
        open={badgesModal.open}
        initialTab={badgesModal.tab}
        storage={storage}
        chapters={CHAPTERS}
        readyLessons={READY_LESSON_LIST}
        onClose={() => setBadgesModal((prev) => ({ ...prev, open: false }))}
        onStartChallenge={handleStartChallengeDirect}
      />

      <Toast message={toastMsg} />
    </div>
  );
}

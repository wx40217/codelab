/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CHAPTERS,
  DEFAULT_LESSON_ID,
  READY_LESSON_LIST,
  getChapterById,
  getLessonById,
  getLessonMetaById,
  getNextReadyLesson,
} from './data/course';
import { useHashRoute } from './hooks/useHashRoute';
import {
  applyAndSaveTheme,
  loadAppState,
  loadTheme,
  markChallengeDone,
  markLessonDone,
  recordRecentVisit,
  setStoredCodeLang,
} from './utils/storage';
import { AppStorageState, CodeLang, ThemeMode } from './types/course';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { IsoStageRouter } from './components/stage/IsoStageRouter';
import { StairsIcon } from './components/stage/IsoPrimitives';
import { StepsTimeline } from './components/StepsTimeline';
import { StepExplainCard } from './components/StepExplainCard';
import { DarkCodePanel } from './components/DarkCodePanel';
import { FactsCard } from './components/FactsCard';
import { MicroLabCard, useMicroLabRuntime } from './components/MicroLabCard';
import { FinderModal } from './components/FinderModal';
import { Toast } from './components/Toast';
import { UpcomingLessonView } from './components/UpcomingLessonView';

export default function App() {
  const { route, navigateLesson, replaceStep } = useHashRoute(DEFAULT_LESSON_ID);
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());
  const [storage, setStorage] = useState<AppStorageState>(() => loadAppState());
  const [inChallenge, setInChallenge] = useState(false);
  const [finderOpen, setFinderOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const activeMeta = getLessonMetaById(route.lessonId) ?? getLessonMetaById(DEFAULT_LESSON_ID)!;
  const activeLesson = getLessonById(activeMeta.id);
  const activeChapter = getChapterById(activeMeta.chapterId);

  const clampedStepIndex = activeLesson
    ? Math.max(0, Math.min(route.stepIndex, activeLesson.steps.length - 1))
    : 0;

  const activeStep = activeLesson ? activeLesson.steps[clampedStepIndex] : undefined;
  const nextStep =
    activeLesson && clampedStepIndex < activeLesson.steps.length - 1
      ? activeLesson.steps[clampedStepIndex + 1]
      : undefined;
  const nextReadyLesson = activeLesson ? getNextReadyLesson(activeLesson.id) : undefined;

  const showToast = useCallback((message: string) => {
    setToastMsg(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
      toastTimerRef.current = null;
    }, 2400);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Reset challenge mode when switching lessons
  useEffect(() => {
    setInChallenge(false);
  }, [activeMeta.id]);

  // Persist recent visit & mark lesson done upon reaching final step
  useEffect(() => {
    setStorage((prev) => {
      let next = recordRecentVisit(prev, activeMeta.id, clampedStepIndex);
      if (activeLesson && clampedStepIndex >= activeLesson.steps.length - 1) {
        next = markLessonDone(next, activeLesson.id);
      }
      return next;
    });
  }, [activeMeta.id, activeLesson, clampedStepIndex]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      applyAndSaveTheme(next);
      return next;
    });
  }, []);

  const handleCodeLangChange = useCallback((lang: CodeLang) => {
    setStorage((prev) => setStoredCodeLang(prev, lang));
  }, []);

  const handleSelectLesson = useCallback(
    (lessonId: string, stepIndex = 0) => {
      setInChallenge(false);
      setMenuOpen(false);
      navigateLesson(lessonId, stepIndex);
    },
    [navigateLesson]
  );

  const handleSelectStep = useCallback(
    (idx: number) => {
      if (!activeLesson) return;
      const bounded = Math.max(0, Math.min(idx, activeLesson.steps.length - 1));
      setInChallenge(false);
      replaceStep(activeLesson.id, bounded);
    },
    [activeLesson, replaceStep]
  );

  const handleChallengeSolved = useCallback((lessonId: string) => {
    setStorage((prev) => markChallengeDone(prev, lessonId));
  }, []);

  const microLab = useMicroLabRuntime(activeLesson, inChallenge, handleChallengeSolved);

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

      if (finderOpen) return;

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

      if (!activeLesson || inChallenge) return;

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
  }, [activeLesson, clampedStepIndex, finderOpen, inChallenge, menuOpen, handleSelectStep]);

  // Resolve synchronized stage, code, and facts for Learn vs Challenge mode
  const stageState =
    inChallenge && microLab ? microLab.sceneState : activeStep?.state;
  const codeLines =
    inChallenge && microLab
      ? microLab.codeLines
      : activeStep?.overrideCode ?? activeLesson?.codeLines ?? [];
  const highlightLines =
    inChallenge && microLab ? microLab.highlightLines : activeStep?.lines;
  const factsData =
    inChallenge && microLab
      ? microLab.facts
      : activeStep?.facts
        ? {
            title: activeStep.facts.title ?? activeLesson?.factsTitle ?? '当前状态',
            rows: activeStep.facts.rows,
            note: activeStep.facts.note,
          }
        : null;

  return (
    <div className={`app ${menuOpen ? 'is-menu-open' : ''}`}>
      <Topbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenFinder={() => setFinderOpen(true)}
        onToggleMenu={() => setMenuOpen((o) => !o)}
        onGoHome={() => handleSelectLesson(DEFAULT_LESSON_ID, 0)}
        onClickLearn={() => {
          setInChallenge(false);
          setMenuOpen(false);
        }}
        onShowToast={showToast}
      />

      <div className="scrim" onClick={() => setMenuOpen(false)} aria-hidden="true" />

      <div className="workspace">
        <Sidebar
          chapters={CHAPTERS}
          activeLessonId={activeMeta.id}
          activeChapterId={activeMeta.chapterId}
          storage={storage}
          onSelectLesson={(id) => handleSelectLesson(id, 0)}
        />

        {activeLesson && activeStep && stageState ? (
          <>
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
                onToggleBit={inChallenge ? microLab?.onToggleBit : undefined}
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
                  onPrev={() => handleSelectStep(clampedStepIndex - 1)}
                  onNext={() => handleSelectStep(clampedStepIndex + 1)}
                  onEnterChallenge={() => setInChallenge(true)}
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
          </>
        ) : (
          <UpcomingLessonView
            meta={activeMeta}
            chapter={activeChapter}
            readyLessons={READY_LESSON_LIST}
            onJumpToLesson={(id) => handleSelectLesson(id, 0)}
          />
        )}
      </div>

      <FinderModal
        open={finderOpen}
        chapters={CHAPTERS}
        storage={storage}
        onClose={() => setFinderOpen(false)}
        onSelect={handleSelectLesson}
      />

      <Toast message={toastMsg} />
    </div>
  );
}

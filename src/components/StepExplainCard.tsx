import { Fragment, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Zap,
} from 'lucide-react';
import { LessonStep } from '../types/course';
import { PiBotUpgrades } from '../data/quest';
import { playQuizCorrect, playQuizTryAgain, playStep } from '../utils/sound';
import { PiBotAvatar } from './PiBotAvatar';

interface StepExplainCardProps {
  step: LessonStep;
  stepIndex: number;
  totalSteps: number;
  nextStepLabel?: string;
  challengeDone: boolean;
  quizAlreadySolved: boolean;
  petUpgrades?: PiBotUpgrades;
  onPrev: () => void;
  onNext: () => void;
  onEnterChallenge: () => void;
  onSolveQuiz: (quizId: string, rewardStars: number) => void;
}

/**
 * Safely converts inline <strong>...</strong> markers in lesson copy into JSX nodes
 * without ever using raw HTML injection.
 */
function renderRichCopy(text: string) {
  const parts = text.split(/(<strong>.*?<\/strong>)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
      return <strong key={idx}>{part.slice(8, -9)}</strong>;
    }
    return <Fragment key={idx}>{part}</Fragment>;
  });
}

/**
 * Extracts a crisp single-sentence picture-book caption from a step,
 * keeping initial reading load feather-light for 9-12 year olds.
 */
function pickPictureBookLine(step: LessonStep): { primary: string; usedCompanion: boolean } {
  if (step.companionLine && step.companionLine.trim().length > 0) {
    return { primary: step.companionLine.trim(), usedCompanion: true };
  }
  const first = step.body[0] ?? '';
  // Split at first Chinese sentence end so it stays punchy like a picture book
  const match = first.match(/^[^。！？!?]+[。！？!?]/);
  return { primary: match ? match[0] : first, usedCompanion: false };
}

export function StepExplainCard({
  step,
  stepIndex,
  totalSteps,
  nextStepLabel,
  challengeDone,
  quizAlreadySolved,
  petUpgrades,
  onPrev,
  onNext,
  onEnterChallenge,
  onSolveQuiz,
}: StepExplainCardProps) {
  const isFirst = stepIndex === 0;
  const isLast = stepIndex >= totalSteps - 1;
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const [storyExpanded, setStoryExpanded] = useState(false);

  useEffect(() => {
    setPickedIdx(null);
    setStoryExpanded(false);
  }, [step.id]);

  const quiz = step.quiz;
  const pickedOption = quiz && pickedIdx !== null ? quiz.options[pickedIdx] : undefined;

  const { primary, usedCompanion } = pickPictureBookLine(step);
  const extraParagraphs = usedCompanion ? step.body : step.body.slice(1);
  const hasMoreDetails = extraParagraphs.length > 0 || Boolean(step.note);

  const handlePickOption = (idx: number) => {
    if (!quiz) return;
    setPickedIdx(idx);
    const opt = quiz.options[idx];
    if (opt.correct) {
      playQuizCorrect();
      onSolveQuiz(quiz.id, quiz.rewardStars ?? 10);
    } else {
      playQuizTryAgain();
    }
  };

  const renderNoteIcon = () => {
    const icon = step.note?.icon ?? 'bulb';
    if (icon === 'bolt') return <Zap size={14} strokeWidth={2.1} />;
    if (icon === 'alert') return <AlertTriangle size={14} strokeWidth={2.1} />;
    return <Lightbulb size={14} strokeWidth={2.1} />;
  };

  return (
    <section className="card step-card" aria-label="绘本步骤讲解">
      <div className="step-card__head">
        <span className="eyebrow tabular-nums">
          第 {stepIndex + 1} / {totalSteps} 页
        </span>
        <span className="chip chip--tag">{step.kind}</span>
      </div>

      <h2 className="step-card__title">{step.label}</h2>

      {/* Picture-Book One-Sentence Visual Story with Pi-Bot */}
      <div
        style={{
          marginTop: 12,
          padding: '13px 14px',
          borderRadius: 14,
          background: 'var(--coral-50)',
          border: '1px solid var(--coral-200)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <PiBotAvatar
          mood={
            pickedOption?.correct
              ? 'proud'
              : pickedOption && !pickedOption.correct
                ? 'oops'
                : step.companionMood ?? 'happy'
          }
          size={44}
          upgrades={petUpgrades}
        />
        <p
          style={{
            margin: 0,
            fontSize: 15,
            lineHeight: 1.6,
            color: 'var(--ink)',
            fontWeight: 600,
          }}
        >
          {renderRichCopy(primary)}
        </p>
      </div>

      {/* Playful "先猜一猜" Inline Micro-Prediction Quiz */}
      {quiz && (
        <div
          style={{
            marginTop: 12,
            padding: '12px 13px',
            borderRadius: 14,
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            display: 'grid',
            gap: 9,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span
              className="eyebrow"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--coral-ink)' }}
            >
              <HelpCircle size={13} style={{ color: 'var(--coral)' }} />
              猜猜看
            </span>
            <span
              className="chip"
              style={{
                height: 20,
                fontSize: 11,
                padding: '0 7px',
                background: quizAlreadySolved || pickedOption?.correct ? 'var(--coral)' : 'var(--coral-100)',
                color: quizAlreadySolved || pickedOption?.correct ? 'var(--on-coral)' : 'var(--coral-ink)',
              }}
            >
              {quizAlreadySolved || pickedOption?.correct ? '答对啦 ★' : `+${quiz.rewardStars ?? 10} ★`}
            </span>
          </div>

          <p style={{ margin: 0, fontSize: 13.8, fontWeight: 650, color: 'var(--ink)', lineHeight: 1.48 }}>
            {quiz.question}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {quiz.options.map((opt, idx) => {
              const isPicked = pickedIdx === idx;
              const isRight = Boolean(opt.correct);
              return (
                <button
                  key={opt.label}
                  type="button"
                  className={`btn ${isPicked && isRight ? 'btn--primary' : ''}`}
                  style={{
                    height: 34,
                    padding: '0 13px',
                    fontSize: 13.2,
                    borderColor: isPicked && !isRight ? 'var(--coral-300)' : undefined,
                    background: isPicked && !isRight ? 'var(--coral-50)' : undefined,
                  }}
                  onClick={() => handlePickOption(idx)}
                >
                  {isPicked && isRight && <CheckCircle2 size={13} />}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {pickedOption && (
            <p
              style={{
                margin: 0,
                fontSize: 12.8,
                lineHeight: 1.5,
                color: pickedOption.correct ? 'var(--coral-ink)' : 'var(--ink-2)',
                fontWeight: pickedOption.correct ? 650 : 500,
              }}
            >
              {pickedOption.feedback}
            </p>
          )}
        </div>
      )}

      {/* Optional Soft Drawer for Curious Readers (Zero Text-Wall Pressure!) */}
      {hasMoreDetails && (
        <div style={{ marginTop: 11 }}>
          <button
            type="button"
            className="soft-drawer-toggle"
            aria-expanded={storyExpanded}
            onClick={() => {
              playStep();
              setStoryExpanded((open) => !open);
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={13} style={{ color: 'var(--coral)' }} />
              <span>{storyExpanded ? '收起详细原理' : '好奇原理？点我听详细小秘密'}</span>
            </span>
            {storyExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {storyExpanded && (
            <div style={{ marginTop: 10, display: 'grid', gap: 9 }}>
              <div className="step-card__body" style={{ marginTop: 0 }}>
                {extraParagraphs.map((paragraph, idx) => (
                  <p key={idx}>{renderRichCopy(paragraph)}</p>
                ))}
              </div>

              {step.note && (
                <div className="note" style={{ marginTop: 2 }} role="note">
                  <div className="note__icon" aria-hidden="true">
                    {renderNoteIcon()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="eyebrow">{step.note.title}</div>
                    <p>{step.note.text}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="step-card__nav">
        <button
          type="button"
          className="btn"
          onClick={onPrev}
          disabled={isFirst}
        >
          <ArrowLeft size={15} strokeWidth={2} />
          <span>上一页</span>
        </button>

        {isLast ? (
          <button
            type="button"
            className="btn btn--primary"
            onClick={onEnterChallenge}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={15} strokeWidth={2.1} />
              {challengeDone ? '再玩一次动手实验' : '轮到我动手玩啦'}
            </span>
            <ArrowRight size={15} strokeWidth={2.1} style={{ flex: 'none' }} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--primary"
            onClick={onNext}
          >
            <span>下一页：{nextStepLabel}</span>
            <ArrowRight size={15} strokeWidth={2.1} style={{ flex: 'none' }} />
          </button>
        )}
      </div>
    </section>
  );
}

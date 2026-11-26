import { Fragment, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Zap,
} from 'lucide-react';
import { LessonStep } from '../types/course';
import { playQuizCorrect, playQuizTryAgain } from '../utils/sound';
import { PiBotAvatar } from './PiBotAvatar';

interface StepExplainCardProps {
  step: LessonStep;
  stepIndex: number;
  totalSteps: number;
  nextStepLabel?: string;
  challengeDone: boolean;
  quizAlreadySolved: boolean;
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

export function StepExplainCard({
  step,
  stepIndex,
  totalSteps,
  nextStepLabel,
  challengeDone,
  quizAlreadySolved,
  onPrev,
  onNext,
  onEnterChallenge,
  onSolveQuiz,
}: StepExplainCardProps) {
  const isFirst = stepIndex === 0;
  const isLast = stepIndex >= totalSteps - 1;
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);

  useEffect(() => {
    setPickedIdx(null);
  }, [step.id]);

  const quiz = step.quiz;
  const pickedOption = quiz && pickedIdx !== null ? quiz.options[pickedIdx] : undefined;

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
    if (icon === 'bolt') return <Zap size={15} strokeWidth={2.2} />;
    if (icon === 'alert') return <AlertTriangle size={15} strokeWidth={2.2} />;
    return <Lightbulb size={15} strokeWidth={2.2} />;
  };

  return (
    <section className="card step-card" aria-label="步骤讲解">
      <div className="step-card__head">
        <span className="eyebrow tabular-nums">
          步骤 {stepIndex + 1} / {totalSteps}
        </span>
        <span className="chip chip--tag">{step.kind}</span>
      </div>

      <h2 className="step-card__title">{step.label}</h2>

      {/* Friendly Pi-Bot Companion Strip */}
      {step.companionLine && (
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
          <PiBotAvatar
            mood={
              pickedOption?.correct
                ? 'proud'
                : pickedOption && !pickedOption.correct
                  ? 'oops'
                  : step.companionMood ?? 'happy'
            }
            size={34}
          />
          <p
            style={{
              margin: 0,
              fontSize: 12.8,
              lineHeight: 1.45,
              color: 'var(--ink)',
              fontWeight: 550,
            }}
          >
            {step.companionLine}
          </p>
        </div>
      )}

      <div className="step-card__body">
        {step.body.map((paragraph, idx) => (
          <p key={idx}>{renderRichCopy(paragraph)}</p>
        ))}
      </div>

      {/* Playful "先猜一猜" Inline Micro-Prediction Quiz */}
      {quiz && (
        <div
          style={{
            marginTop: 12,
            padding: '11px 12px',
            borderRadius: 10,
            background: 'var(--paper-raised)',
            border: '1px solid var(--line-strong)',
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
              先猜一猜
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
              {quizAlreadySolved || pickedOption?.correct ? '已答对 ★' : `+${quiz.rewardStars ?? 10} ★`}
            </span>
          </div>

          <p style={{ margin: 0, fontSize: 13.4, fontWeight: 650, color: 'var(--ink)', lineHeight: 1.45 }}>
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
                    height: 32,
                    padding: '0 12px',
                    fontSize: 13,
                    borderColor:
                      isPicked && !isRight
                        ? 'var(--coral-300)'
                        : undefined,
                    background:
                      isPicked && !isRight
                        ? 'var(--coral-50)'
                        : undefined,
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
                fontSize: 12.6,
                lineHeight: 1.45,
                color: pickedOption.correct ? 'var(--coral-ink)' : 'var(--ink-2)',
                fontWeight: pickedOption.correct ? 650 : 500,
              }}
            >
              {pickedOption.feedback}
            </p>
          )}
        </div>
      )}

      {step.note && (
        <div className="note" role="note">
          <div className="note__icon" aria-hidden="true">
            {renderNoteIcon()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow">{step.note.title}</div>
            <p>{step.note.text}</p>
          </div>
        </div>
      )}

      <div className="step-card__nav">
        <button
          type="button"
          className="btn"
          onClick={onPrev}
          disabled={isFirst}
        >
          <ArrowLeft size={15} strokeWidth={2.1} />
          <span>上一步</span>
        </button>

        {isLast ? (
          <button
            type="button"
            className="btn btn--primary"
            onClick={onEnterChallenge}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={15} strokeWidth={2.2} />
              {challengeDone ? '再玩一次动手挑战' : '进入动手挑战'}
            </span>
            <ArrowRight size={15} strokeWidth={2.2} style={{ flex: 'none' }} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--primary"
            onClick={onNext}
          >
            <span>下一步：{nextStepLabel}</span>
            <ArrowRight size={15} strokeWidth={2.2} style={{ flex: 'none' }} />
          </button>
        )}
      </div>
    </section>
  );
}

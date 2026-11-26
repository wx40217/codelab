import { Fragment } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  Sparkles,
  Zap,
} from 'lucide-react';
import { LessonStep } from '../types/course';

interface StepExplainCardProps {
  step: LessonStep;
  stepIndex: number;
  totalSteps: number;
  nextStepLabel?: string;
  challengeDone: boolean;
  onPrev: () => void;
  onNext: () => void;
  onEnterChallenge: () => void;
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
  onPrev,
  onNext,
  onEnterChallenge,
}: StepExplainCardProps) {
  const isFirst = stepIndex === 0;
  const isLast = stepIndex >= totalSteps - 1;

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

      <div className="step-card__body">
        {step.body.map((paragraph, idx) => (
          <p key={idx}>{renderRichCopy(paragraph)}</p>
        ))}
      </div>

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

import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LessonStep } from '../types/course';

interface StepsTimelineProps {
  steps: LessonStep[];
  stepIndex: number;
  inChallenge: boolean;
  onSelectStep: (index: number) => void;
}

export function StepsTimeline({
  steps,
  stepIndex,
  inChallenge,
  onSelectStep,
}: StepsTimelineProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const activeEl = itemRefs.current[stepIndex];
    if (activeEl && typeof activeEl.scrollIntoView === 'function') {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [stepIndex, inChallenge]);

  const scrollRail = (delta: number) => {
    if (!railRef.current) return;
    railRef.current.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <section className="card steps" aria-label="本课步骤导航">
      <div className="steps__head">
        <span className="eyebrow">本课内容</span>
        <span className="steps__keys">
          <kbd>←</kbd>
          <kbd>→</kbd>
          <span>切换步骤</span>
        </span>
        <span className="eyebrow tabular-nums" style={{ color: 'var(--ink-3)' }}>
          {inChallenge
            ? '动手挑战模式'
            : `第 ${stepIndex + 1} 步，共 ${steps.length} 步`}
        </span>
      </div>

      <div className="steps__track">
        <button
          type="button"
          className="steps__arrow"
          onClick={() => scrollRail(-180)}
          aria-label="向左滚动步骤列表"
        >
          <ChevronLeft size={15} />
        </button>

        <div className="steps__rail" ref={railRef}>
          {steps.map((step, idx) => {
            const isActive = !inChallenge && idx === stepIndex;
            const isDone = inChallenge || idx < stepIndex;

            return (
              <div
                key={step.id}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                className={`steps__item ${isDone ? 'is-done' : ''} ${isActive ? 'is-active' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => onSelectStep(idx)}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span className="steps__num">{idx + 1}</span>
                  <span className="steps__label">{step.label}</span>
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="steps__arrow"
          onClick={() => scrollRail(180)}
          aria-label="向右滚动步骤列表"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </section>
  );
}

import { ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Chapter, Lesson, LessonMeta } from '../types/course';
import { StairsIcon } from './stage/IsoPrimitives';

interface UpcomingLessonViewProps {
  meta: LessonMeta;
  chapter?: Chapter;
  readyLessons: Lesson[];
  onJumpToLesson: (lessonId: string) => void;
}

export function UpcomingLessonView({
  meta,
  chapter,
  readyLessons,
  onJumpToLesson,
}: UpcomingLessonViewProps) {
  return (
    <>
      <main className="lesson">
        <div className="lesson__head">
          <h1>{meta.title}</h1>
          <div className="trail">
            <div className="trail__text">
              <div className="trail__chapter">
                <span className="trail__num">{meta.chapterNum}</span>
                <span>{chapter?.title ?? '课程预告'}</span>
              </div>
              <div className="trail__lesson">
                第 {meta.orderInChapter} 课，共 {meta.totalInChapter} 课
              </div>
            </div>
            <StairsIcon total={meta.totalInChapter} current={meta.orderInChapter} />
          </div>
        </div>

        <section
          className="panel system-view"
          style={{ alignItems: 'center', justifyContent: 'center', padding: 28 }}
        >
          <div
            className="card"
            style={{
              maxWidth: 540,
              width: '100%',
              padding: '24px 26px',
              zIndex: 2,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span className="chip chip--tag" style={{ gap: 5 }}>
                <Clock size={12} />
                即将上线
              </span>
              <span className="eyebrow">2.5D 等距互动课程筹备中</span>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.3 }}>{meta.subtitle}</h2>

            {meta.previewDescription && (
              <p style={{ marginTop: 10, color: 'var(--ink-2)', fontSize: 14.5, lineHeight: 1.6 }}>
                {meta.previewDescription}
              </p>
            )}

            {meta.previewObjectives && meta.previewObjectives.length > 0 && (
              <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
                <div className="eyebrow">本课将解锁的新能力</div>
                {meta.previewObjectives.map((obj, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      fontSize: 13.8,
                      color: 'var(--ink)',
                    }}
                  >
                    <CheckCircle2
                      size={16}
                      style={{ color: 'var(--coral)', marginTop: 2, flex: 'none' }}
                    />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {meta.concepts.map((tag) => (
                <span
                  key={tag}
                  className="chip"
                  style={{ background: 'var(--paper-sunk)', color: 'var(--ink-2)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <aside className="rail" aria-label="已开放示范课推荐">
        <section className="card step-card">
          <div className="step-card__head">
            <span className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Sparkles size={13} style={{ color: 'var(--coral)' }} />
              现在就可以动手玩
            </span>
            <span className="chip chip--tag">3 节完整课</span>
          </div>

          <h2 className="step-card__title">先来体验已开放的 2.5D 互动示范课</h2>
          <div className="step-card__body">
            <p>
              这 3 节示范课已经做好了完整的 2.5D 等距动画、中文/Python 双语代码和课尾动手实验台！
            </p>
          </div>

          <div style={{ display: 'grid', gap: 9, marginTop: 14 }}>
            {readyLessons.map((ready) => (
              <button
                key={ready.id}
                type="button"
                className="btn"
                style={{
                  height: 'auto',
                  padding: '10px 13px',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  whiteSpace: 'normal',
                }}
                onClick={() => onJumpToLesson(ready.id)}
              >
                <span style={{ display: 'grid', gap: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{ready.title}</span>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 500 }}>
                    {ready.subtitle}
                  </span>
                </span>
                <ArrowRight size={15} style={{ color: 'var(--coral)', flex: 'none' }} />
              </button>
            ))}
          </div>
        </section>
      </aside>
    </>
  );
}

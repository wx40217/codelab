import { ChevronDown, ChevronUp, Gauge } from 'lucide-react';
import { FactRow } from '../types/course';
import { playStep } from '../utils/sound';

interface FactsCardProps {
  title: string;
  rows: FactRow[];
  note?: string;
  expanded: boolean;
  onToggleExpanded: () => void;
}

export function FactsCard({
  title,
  rows,
  note,
  expanded,
  onToggleExpanded,
}: FactsCardProps) {
  return (
    <section
      className="card facts-card"
      aria-label={title}
      style={{ padding: expanded ? '13px 14px 15px 17px' : '10px 14px 10px 17px' }}
    >
      <button
        type="button"
        onClick={() => {
          playStep();
          onToggleExpanded();
        }}
        aria-expanded={expanded}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Gauge size={15} style={{ color: 'var(--coral)', flex: 'none' }} />
          <h3 className="card__title" style={{ margin: 0, fontSize: 14 }}>
            {expanded ? title : `展开：${title}`}
          </h3>
        </span>
        {expanded ? (
          <ChevronUp size={15} style={{ color: 'var(--ink-3)' }} />
        ) : (
          <ChevronDown size={15} style={{ color: 'var(--ink-3)' }} />
        )}
      </button>

      {expanded && (
        <>
          <dl>
            {rows.map((row, idx) => (
              <div key={`${row.label}-${idx}`} className={row.active ? 'is-active' : undefined}>
                <dt>
                  {row.label}
                  {row.detail && <small>{row.detail}</small>}
                </dt>
                <dd>
                  {typeof row.meter === 'number' && (
                    <span className="meter" aria-hidden="true">
                      <span
                        style={{
                          width: `${Math.round(Math.max(0, Math.min(1, row.meter)) * 100)}%`,
                        }}
                      />
                    </span>
                  )}

                  {row.chips &&
                    row.chips.map((chip, cIdx) => (
                      <span
                        key={`${chip.text}-${cIdx}`}
                        className={`chip ${chip.tone === 'best' ? 'is-best' : ''}`}
                        style={chip.tone === 'quiet' ? { opacity: 0.45 } : undefined}
                      >
                        {chip.text}
                      </span>
                    ))}

                  {row.value !== undefined && <span className="chip">{row.value}</span>}
                </dd>
              </div>
            ))}
          </dl>

          {note && <p className="facts-card__note">{note}</p>}
        </>
      )}
    </section>
  );
}

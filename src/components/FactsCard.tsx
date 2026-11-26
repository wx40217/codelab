import { FactRow } from '../types/course';

interface FactsCardProps {
  title: string;
  rows: FactRow[];
  note?: string;
}

export function FactsCard({ title, rows, note }: FactsCardProps) {
  return (
    <section className="card facts-card" aria-label={title}>
      <h3 className="card__title">{title}</h3>

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
                  <span style={{ width: `${Math.round(Math.max(0, Math.min(1, row.meter)) * 100)}%` }} />
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
    </section>
  );
}

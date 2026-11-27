import { Fragment } from 'react';
import { ChevronDown, ChevronUp, Code2 } from 'lucide-react';
import { BilingualCodeLine, CodeLang } from '../types/course';
import { playStep } from '../utils/sound';

interface DarkCodePanelProps {
  lines: BilingualCodeLine[];
  highlightLines?: number[];
  codeLang: CodeLang;
  expanded: boolean;
  onToggleExpanded: () => void;
  onChangeCodeLang: (lang: CodeLang) => void;
}

const TOKEN_PATTERN =
  /(\/\/.*$|#.*$|\b(?:def|for|if|else|return|raise|in|range|len)\b|对每个|如果|否则|重复|返回|报错|==|!=|<=|>=|\+|-|=)/g;

const KEYWORDS = new Set([
  'def',
  'for',
  'if',
  'else',
  'return',
  'raise',
  'in',
  'range',
  'len',
  '对每个',
  '如果',
  '否则',
  '重复',
  '返回',
  '报错',
]);

const OPERATORS = new Set(['==', '!=', '<=', '>=', '+', '-', '=']);

function renderHighlightedLine(source: string) {
  if (!source.trim()) return ' ';
  const parts = source.split(TOKEN_PATTERN);
  return parts.map((part, idx) => {
    if (!part) return null;
    if (part.startsWith('//') || part.startsWith('#')) {
      return (
        <span key={idx} className="tok-com">
          {part}
        </span>
      );
    }
    if (KEYWORDS.has(part)) {
      return (
        <span key={idx} className="tok-kw">
          {part}
        </span>
      );
    }
    if (OPERATORS.has(part)) {
      return (
        <span key={idx} className="tok-op">
          {part}
        </span>
      );
    }
    return <Fragment key={idx}>{part}</Fragment>;
  });
}

export function DarkCodePanel({
  lines,
  highlightLines,
  codeLang,
  expanded,
  onToggleExpanded,
  onChangeCodeLang,
}: DarkCodePanelProps) {
  const focusSet = new Set(highlightLines ?? []);
  const hasFocus = focusSet.size > 0;

  return (
    <section className="card code-panel" aria-label="同步魔法代码">
      <div className="code-panel__head">
        <button
          type="button"
          onClick={() => {
            playStep();
            onToggleExpanded();
          }}
          aria-expanded={expanded}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            flex: 1,
            minWidth: 0,
            textAlign: 'left',
            padding: '4px 0',
          }}
        >
          <Code2 size={16} strokeWidth={2.1} style={{ color: 'var(--coral)', flex: 'none' }} />
          <h3 className="card__title" style={{ margin: 0, fontSize: 14 }}>
            {expanded ? (codeLang === 'cn' ? '魔法指令' : 'Python 代码') : '偷看背后的魔法代码'}
          </h3>
          {expanded ? (
            <ChevronUp size={15} style={{ color: 'var(--ink-3)', flex: 'none' }} />
          ) : (
            <ChevronDown size={15} style={{ color: 'var(--ink-3)', flex: 'none' }} />
          )}
        </button>

        {expanded && (
          <div className="code-lang-switch" role="tablist" aria-label="切换代码显示语言">
            <button
              type="button"
              role="tab"
              aria-selected={codeLang === 'cn'}
              className={codeLang === 'cn' ? 'is-active' : ''}
              onClick={() => onChangeCodeLang('cn')}
            >
              中文
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={codeLang === 'py'}
              className={codeLang === 'py' ? 'is-active' : ''}
              onClick={() => onChangeCodeLang('py')}
            >
              Python
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <pre className={`code ${hasFocus ? 'has-focus' : ''}`}>
          <code>
            {lines.map((row) => {
              const isFocus = focusSet.has(row.line);
              const rawText = codeLang === 'cn' ? row.cn : row.py;
              const indentPrefix = ' '.repeat(row.indent);

              return (
                <span
                  key={row.line}
                  className={`code__line ${row.isHead ? 'is-head' : ''} ${isFocus ? 'is-focus' : ''}`}
                >
                  <i>{row.line}</i>
                  <span>
                    {indentPrefix}
                    {renderHighlightedLine(rawText)}
                  </span>
                </span>
              );
            })}
          </code>
        </pre>
      )}
    </section>
  );
}

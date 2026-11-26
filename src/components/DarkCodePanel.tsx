import { Fragment } from 'react';
import { List } from 'lucide-react';
import { BilingualCodeLine, CodeLang } from '../types/course';

interface DarkCodePanelProps {
  lines: BilingualCodeLine[];
  highlightLines?: number[];
  codeLang: CodeLang;
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
  onChangeCodeLang,
}: DarkCodePanelProps) {
  const focusSet = new Set(highlightLines ?? []);
  const hasFocus = focusSet.size > 0;

  return (
    <section className="card code-panel" aria-label="同步代码面板">
      <div className="code-panel__head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <List size={17} strokeWidth={2.2} style={{ color: 'var(--coral)', flex: 'none' }} />
          <h3 className="card__title">{codeLang === 'cn' ? '伪代码' : 'Python'}</h3>
        </div>

        <div className="code-lang-switch" role="tablist" aria-label="切换代码显示语言">
          <button
            type="button"
            role="tab"
            aria-selected={codeLang === 'cn'}
            className={codeLang === 'cn' ? 'is-active' : ''}
            onClick={() => onChangeCodeLang('cn')}
          >
            中文指令
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
      </div>

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
    </section>
  );
}

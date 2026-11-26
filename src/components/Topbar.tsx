import {
  BarChart3,
  BookOpen,
  Code2,
  FileText,
  Menu,
  Moon,
  Search,
  Sun,
  Trophy,
} from 'lucide-react';
import { ThemeMode } from '../types/course';

interface TopbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenFinder: () => void;
  onToggleMenu: () => void;
  onGoHome: () => void;
  onClickLearn: () => void;
  onShowToast: (message: string) => void;
}

const SECONDARY_NAV = [
  { id: 'practice', label: '练习', icon: Code2 },
  { id: 'cheatsheet', label: '速查表', icon: FileText },
  { id: 'challenge', label: '挑战', icon: Trophy },
  { id: 'progress', label: '进度', icon: BarChart3 },
] as const;

export function Topbar({
  theme,
  onToggleTheme,
  onOpenFinder,
  onToggleMenu,
  onGoHome,
  onClickLearn,
  onShowToast,
}: TopbarProps) {
  const isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.platform);

  return (
    <header className="topbar">
      <button
        type="button"
        className="tool-btn tool-btn--icon topbar__menu"
        onClick={onToggleMenu}
        aria-label="打开课程目录"
      >
        <Menu size={18} />
      </button>

      <button
        type="button"
        className="brand"
        onClick={onGoHome}
        aria-label="回到指令实验室首页"
      >
        <span className="brand__mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="32" height="32">
            <rect width="32" height="32" rx="8" fill="var(--brand-tile)" />
            <path
              d="M7.5 19.6 L16 23.6 L24.5 19.6"
              fill="none"
              stroke="var(--brand-line)"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.6"
            />
            <path
              d="M7.5 15.8 L16 19.8 L24.5 15.8"
              fill="none"
              stroke="var(--brand-line)"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.88"
            />
            <polygon
              points="16,7.4 24.5,11.6 16,15.8 7.5,11.6"
              fill="var(--coral)"
              stroke="var(--brand-line)"
              strokeWidth="1.15"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="brand__name">
          Code <mark>Lab</mark>
        </span>
      </button>

      <nav className="nav" aria-label="主导航">
        <button
          type="button"
          className="nav__item is-active"
          onClick={onClickLearn}
          aria-current="page"
        >
          <BookOpen size={17} strokeWidth={2.1} />
          <span>学习</span>
        </button>

        {SECONDARY_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className="nav__item"
              onClick={() => onShowToast(`${item.label}模块即将推出，先在课尾体验动手挑战吧！`)}
              title={`${item.label}（即将推出）`}
            >
              <Icon size={17} strokeWidth={1.9} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="topbar__tools">
        <button
          type="button"
          className="search-btn"
          onClick={onOpenFinder}
          aria-label="快捷搜索课程与概念"
        >
          <Search size={16} strokeWidth={2} style={{ color: 'var(--ink-3)', flex: 'none' }} />
          <span className="search-btn__hint">搜索主题、概念、指令...</span>
          <kbd>{isMac ? '⌘ K' : 'Ctrl K'}</kbd>
        </button>

        <button
          type="button"
          className="tool-btn tool-btn--icon"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? '切换到浅色纸感模式' : '切换到深色模式'}
          title={theme === 'dark' ? '切换浅色纸感模式' : '切换深色模式'}
        >
          {theme === 'dark' ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
        </button>
      </div>
    </header>
  );
}

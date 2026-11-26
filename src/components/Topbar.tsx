import {
  BarChart3,
  BookOpen,
  Code2,
  FileText,
  Menu,
  Moon,
  Search,
  Star,
  Sun,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ThemeMode } from '../types/course';

interface TopbarProps {
  theme: ThemeMode;
  stars: number;
  badgeCount: number;
  soundEnabled: boolean;
  activeNav?: 'learn' | 'practice' | 'cheatsheet' | 'playgrounds' | 'badges';
  onToggleTheme: () => void;
  onToggleSound: () => void;
  onOpenFinder: () => void;
  onOpenPractice: () => void;
  onOpenCheatsheet: () => void;
  onOpenPlaygrounds: () => void;
  onOpenBadges: () => void;
  onToggleMenu: () => void;
  onGoHome: () => void;
  onClickLearn: () => void;
}

export function Topbar({
  theme,
  stars,
  badgeCount,
  soundEnabled,
  activeNav = 'learn',
  onToggleTheme,
  onToggleSound,
  onOpenFinder,
  onOpenPractice,
  onOpenCheatsheet,
  onOpenPlaygrounds,
  onOpenBadges,
  onToggleMenu,
  onGoHome,
  onClickLearn,
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
          className={`nav__item ${activeNav === 'learn' ? 'is-active' : ''}`}
          onClick={onClickLearn}
          aria-current={activeNav === 'learn' ? 'page' : undefined}
        >
          <BookOpen size={17} strokeWidth={2.1} />
          <span>学习</span>
        </button>

        <button
          type="button"
          className={`nav__item ${activeNav === 'practice' ? 'is-active' : ''}`}
          onClick={onOpenPractice}
          title="趣味刷题练习道场"
        >
          <Code2 size={17} strokeWidth={1.9} />
          <span>练习</span>
        </button>

        <button
          type="button"
          className={`nav__item ${activeNav === 'cheatsheet' ? 'is-active' : ''}`}
          onClick={onOpenCheatsheet}
          title="双语魔法指令速查表"
        >
          <FileText size={17} strokeWidth={1.9} />
          <span>速查表</span>
        </button>

        <button
          type="button"
          className={`nav__item ${activeNav === 'playgrounds' ? 'is-active' : ''}`}
          onClick={onOpenPlaygrounds}
          title="直达全部 14 关 2.5D 动手挑战游乐场"
        >
          <Trophy size={17} strokeWidth={1.9} />
          <span>挑战</span>
        </button>

        <button
          type="button"
          className={`nav__item ${activeNav === 'badges' ? 'is-active' : ''}`}
          onClick={onOpenBadges}
          title="查看能量星与探险徽章墙"
        >
          <BarChart3 size={17} strokeWidth={1.9} />
          <span>勋章</span>
        </button>
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
          className="tool-btn"
          onClick={onOpenBadges}
          title={`已收集 ${stars} 颗能量星、${badgeCount} 枚徽章，点击打开勋章墙`}
          aria-label={`已收集 ${stars} 颗能量星，打开勋章墙`}
        >
          <Star size={15} fill="var(--coral)" color="var(--coral)" />
          <span className="tabular-nums">{stars}</span>
        </button>

        <button
          type="button"
          className="tool-btn tool-btn--icon"
          onClick={onToggleSound}
          aria-label={soundEnabled ? '关闭互动音效' : '开启互动音效'}
          title={soundEnabled ? '互动音效：已开启' : '互动音效：已静音'}
        >
          {soundEnabled ? (
            <Volume2 size={17} strokeWidth={2} />
          ) : (
            <VolumeX size={17} strokeWidth={2} style={{ color: 'var(--ink-3)' }} />
          )}
        </button>

        <button
          type="button"
          className="tool-btn tool-btn--icon"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? '切换到浅色纸感模式' : '切换到深色模式'}
          title={theme === 'dark' ? '切换浅色纸感模式' : '切换深色模式'}
        >
          {theme === 'dark' ? (
            <Sun size={17} strokeWidth={2} />
          ) : (
            <Moon size={17} strokeWidth={2} />
          )}
        </button>
      </div>
    </header>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Compass,
  Cookie,
  Heart,
  Minus,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { CompanionMood } from '../types/course';
import {
  PIBOT_LESSON_BANTER,
  PIBOT_PET_LINES,
  PiBotUpgrades,
} from '../data/quest';
import {
  playFlip,
  playMunch,
  playPetGiggle,
  playWakeUp,
} from '../utils/sound';
import { PiBotAvatar, PiBotTrick } from './PiBotAvatar';

export interface PetReactionSignal {
  key: number;
  mood: CompanionMood;
  line: string;
  trick?: PiBotTrick;
}

interface FloatingParticle {
  id: number;
  text: string;
  x: number;
}

interface PiBotPetWidgetProps {
  lessonId: string;
  upgrades: PiBotUpgrades;
  unlockedPartsCount: number;
  petBond: number;
  minimized: boolean;
  reaction: PetReactionSignal | null;
  onSetMinimized: (min: boolean) => void;
  onInteract: (kind: 'pet' | 'snack' | 'trick') => void;
  onOpenQuestMap: () => void;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Interactive 2.5D Isometric Web Pet ("阿派 #314"):
 * - Draggable around the screen (kicks legs while lifted!)
 * - Tap to pet/poke, feed star biscuits, do a 360° backflip, or open the 4-stage Quest Map
 * - Falls asleep with floating zZ if left idle for 45s
 * - Celebrates in real time with lesson quizzes, challenges, and badges
 * - Can be minimized into a quiet sleeping antenna pill at any time
 */
export function PiBotPetWidget({
  lessonId,
  upgrades,
  unlockedPartsCount,
  petBond,
  minimized,
  reaction,
  onSetMinimized,
  onInteract,
  onOpenQuestMap,
}: PiBotPetWidgetProps) {
  const [mood, setMood] = useState<CompanionMood>('happy');
  const [trick, setTrick] = useState<PiBotTrick>('idle');
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [dockOpen, setDockOpen] = useState(false);
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const idleTimerRef = useRef<number | null>(null);
  const bubbleTimerRef = useRef<number | null>(null);
  const trickTimerRef = useRef<number | null>(null);
  const dragMovedRef = useRef(false);
  const particleIdRef = useRef(1);

  const spawnParticles = useCallback((symbols: string[]) => {
    const batch = symbols.map((text, idx) => ({
      id: particleIdRef.current++,
      text,
      x: (idx - (symbols.length - 1) / 2) * 20 + (Math.random() * 10 - 5),
    }));
    setParticles((prev) => [...prev.slice(-6), ...batch]);
    window.setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !batch.some((b) => b.id === p.id)));
    }, 950);
  }, []);

  const say = useCallback((text: string, duration = 4200) => {
    setBubbleText(text);
    if (bubbleTimerRef.current !== null) window.clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = window.setTimeout(() => {
      setBubbleText(null);
      bubbleTimerRef.current = null;
    }, duration);
  }, []);

  const triggerTrick = useCallback((nextTrick: PiBotTrick, ms = 760) => {
    setTrick(nextTrick);
    if (trickTimerRef.current !== null) window.clearTimeout(trickTimerRef.current);
    trickTimerRef.current = window.setTimeout(() => {
      setTrick('idle');
      trickTimerRef.current = null;
    }, ms);
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      setMood('sleepy');
      setBubbleText(pickRandom(PIBOT_PET_LINES.sleepy));
    }, 45000);
  }, []);

  useEffect(() => {
    if (!minimized) {
      resetIdleTimer();
    }
    return () => {
      if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current);
      if (bubbleTimerRef.current !== null) window.clearTimeout(bubbleTimerRef.current);
      if (trickTimerRef.current !== null) window.clearTimeout(trickTimerRef.current);
    };
  }, [minimized, resetIdleTimer]);

  // React to global learning events (quiz correct, challenge victory, bonk, badge)
  useEffect(() => {
    if (!reaction || minimized) return;
    resetIdleTimer();
    setMood(reaction.mood);
    say(reaction.line, 4800);
    if (reaction.trick) {
      triggerTrick(reaction.trick, 820);
    } else if (reaction.mood === 'proud' || reaction.mood === 'excited') {
      triggerTrick('hop', 650);
      spawnParticles(['★', '✨', '★']);
    }
    const calmTimer = window.setTimeout(() => {
      setMood('happy');
    }, 3600);
    return () => window.clearTimeout(calmTimer);
  }, [reaction, minimized, resetIdleTimer, say, triggerTrick, spawnParticles]);

  const handlePetAction = useCallback(
    (kind: 'pet' | 'snack' | 'trick') => {
      resetIdleTimer();
      onInteract(kind);

      if (kind === 'pet') {
        playPetGiggle();
        setMood('loved');
        triggerTrick('hop', 580);
        spawnParticles(['♥', '✨', '♥']);
        const lessonLines = PIBOT_LESSON_BANTER[lessonId] ?? [];
        const pool = [...PIBOT_PET_LINES.pet, ...lessonLines];
        say(pickRandom(pool), 4400);
      } else if (kind === 'snack') {
        playMunch();
        setMood('excited');
        triggerTrick('munch', 720);
        spawnParticles(['🍪', '★', '😋']);
        say(pickRandom(PIBOT_PET_LINES.snack), 4400);
      } else {
        playFlip();
        setMood('proud');
        triggerTrick('flip', 780);
        spawnParticles(['⚡', '✨', '🌟']);
        say(pickRandom(PIBOT_PET_LINES.trick), 4400);
      }

      window.setTimeout(() => setMood('happy'), 2800);
    },
    [lessonId, onInteract, resetIdleTimer, say, spawnParticles, triggerTrick]
  );

  const handleTapBody = () => {
    if (dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }

    if (mood === 'sleepy') {
      playWakeUp();
      setMood('curious');
      triggerTrick('hop', 540);
      say(pickRandom(PIBOT_PET_LINES.wakeup), 4200);
      resetIdleTimer();
      setDockOpen(true);
      window.setTimeout(() => setMood('happy'), 2400);
      return;
    }

    setDockOpen((open) => !open);
    handlePetAction('pet');
  };

  if (minimized) {
    return (
      <div className="pet-minimized-wrap">
        <button
          type="button"
          className="pet-minimized-pill"
          onClick={() => {
            playWakeUp();
            onSetMinimized(false);
            setMood('happy');
            say('哔哔！阿派满血回来陪你写代码啦！', 3400);
          }}
          title="唤醒桌面宠物阿派"
        >
          <PiBotAvatar mood="sleepy" size={28} upgrades={upgrades} />
          <span>唤醒阿派</span>
          <span className="pet-mini-badge tabular-nums">{unlockedPartsCount}/4</span>
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="pet-widget"
      drag
      dragMomentum={false}
      dragElastic={0.12}
      onDragStart={() => {
        dragMovedRef.current = true;
        setIsDragging(true);
        setMood('curious');
        say(pickRandom(PIBOT_PET_LINES.drag), 2600);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        setMood('happy');
        triggerTrick('hop', 450);
        window.setTimeout(() => {
          dragMovedRef.current = false;
        }, 120);
      }}
      aria-label="桌面宠物机器人阿派"
    >
      {/* Speech Bubble */}
      <AnimatePresence>
        {bubbleText && (
          <motion.div
            key={bubbleText}
            className="pet-bubble"
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.18 }}
          >
            <div className="pet-bubble__head">
              <span className="pet-bubble__name">阿派 #314</span>
              <span className="pet-bubble__bond tabular-nums">♥ {petBond}</span>
            </div>
            <p>{bubbleText}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expandable Pet Toy Dock */}
      <AnimatePresence>
        {dockOpen && (
          <motion.div
            className="pet-dock"
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.16 }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="pet-dock__btn"
              onClick={() => handlePetAction('pet')}
              title="摸摸阿派的头"
            >
              <Heart size={13} style={{ color: 'var(--coral)' }} />
              <span>摸头</span>
            </button>
            <button
              type="button"
              className="pet-dock__btn"
              onClick={() => handlePetAction('snack')}
              title="喂一颗星光饼干"
            >
              <Cookie size={13} style={{ color: 'var(--coral)' }} />
              <span>喂饼干</span>
            </button>
            <button
              type="button"
              className="pet-dock__btn"
              onClick={() => handlePetAction('trick')}
              title="让阿派表演 360° 后空翻"
            >
              <RotateCw size={13} style={{ color: 'var(--coral)' }} />
              <span>翻跟头</span>
            </button>
            <button
              type="button"
              className="pet-dock__btn pet-dock__btn--quest"
              onClick={() => {
                setDockOpen(false);
                onOpenQuestMap();
              }}
              title="查看 4 阶段唤醒主线地图"
            >
              <Compass size={13} />
              <span>主线 {unlockedPartsCount}/4</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pet Stage Pedestal + Floating Particles */}
      <div className="pet-body-wrap">
        <div className="pet-particles" aria-hidden="true">
          <AnimatePresence>
            {particles.map((p) => (
              <motion.span
                key={p.id}
                className="pet-particle"
                initial={{ opacity: 1, y: 0, x: p.x, scale: 0.7 }}
                animate={{ opacity: 0, y: -38, x: p.x * 1.2, scale: 1.25 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
              >
                {p.text}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        <button
          type="button"
          className="pet-avatar-btn"
          onClick={handleTapBody}
          title="点击摸摸阿派，或者按住把我拖到屏幕任意角落！"
        >
          <PiBotAvatar
            mood={mood}
            size={68}
            upgrades={upgrades}
            trick={isDragging ? 'drag' : trick}
            showShadow
          />
          <span className="pet-tag">
            <Sparkles size={10} style={{ color: 'var(--coral)' }} />
            <span>阿派</span>
          </span>
        </button>

        <button
          type="button"
          className="pet-min-btn"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            setDockOpen(false);
            onSetMinimized(true);
          }}
          title="让阿派先去角落休眠"
          aria-label="收起桌面宠物阿派"
        >
          <Minus size={12} />
        </button>
      </div>
    </motion.div>
  );
}

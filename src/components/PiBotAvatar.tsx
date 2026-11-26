import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CompanionMood } from '../types/course';
import { PiBotUpgrades } from '../data/quest';

export type PiBotTrick = 'idle' | 'flip' | 'munch' | 'hop' | 'drag';

interface PiBotAvatarProps {
  mood?: CompanionMood;
  size?: number;
  upgrades?: Partial<PiBotUpgrades>;
  trick?: PiBotTrick;
  showShadow?: boolean;
}

/**
 * Expressive 2.5D isometric Pi-Bot ("阿派 #314") styled in Warm Paper Lab tokens.
 * Supports automatic blinking, 7 moods, playful trick animations, and 4 visual hardware
 * upgrades unlocked along the "Wake Up Pi-Bot" 4-chapter quest spine.
 */
export function PiBotAvatar({
  mood = 'happy',
  size = 40,
  upgrades,
  trick = 'idle',
  showShadow = false,
}: PiBotAvatarProps) {
  const [blinking, setBlinking] = useState(false);

  // Subtle natural eye blink for awake calm moods
  useEffect(() => {
    if (mood !== 'happy' && mood !== 'curious') return;
    let blinkTimeout: number | null = null;
    const interval = window.setInterval(() => {
      setBlinking(true);
      blinkTimeout = window.setTimeout(() => setBlinking(false), 150);
    }, 3600 + Math.floor(Math.random() * 1400));

    return () => {
      window.clearInterval(interval);
      if (blinkTimeout !== null) window.clearTimeout(blinkTimeout);
    };
  }, [mood]);

  const topColor =
    mood === 'proud' || mood === 'excited' || mood === 'loved'
      ? 'var(--coral)'
      : mood === 'oops'
        ? 'var(--coral-300)'
        : 'var(--iso-top)';

  // Compute body animation from trick first, then mood
  const bodyAnimate =
    trick === 'flip'
      ? { rotate: [0, -18, 360], y: [0, -14, 0], scale: [1, 1.08, 1] }
      : trick === 'munch'
        ? { scaleY: [1, 0.88, 1.07, 0.91, 1.04, 1], scaleX: [1, 1.09, 0.96, 1.06, 0.98, 1] }
        : trick === 'hop'
          ? { y: [0, -10, 0, -5, 0], rotate: [0, -6, 6, 0] }
          : trick === 'drag'
            ? { rotate: [-9, 9, -9], y: -2 }
            : mood === 'excited' || mood === 'proud' || mood === 'loved'
              ? { y: [0, -3.5, 0] }
              : mood === 'oops'
                ? { x: [0, -2.5, 2.5, -1.5, 0] }
                : mood === 'sleepy'
                  ? { y: [0, 1.4, 0], scaleY: [1, 0.97, 1] }
                  : { y: [0, -1.8, 0] };

  const bodyTransition =
    trick === 'flip'
      ? { duration: 0.72, ease: 'easeInOut' as const }
      : trick === 'munch'
        ? { duration: 0.65, ease: 'easeInOut' as const }
        : trick === 'hop'
          ? { duration: 0.56, ease: 'easeOut' as const }
          : trick === 'drag'
            ? { duration: 0.4, repeat: Infinity, ease: 'easeInOut' as const }
            : {
                duration: mood === 'oops' ? 0.45 : mood === 'sleepy' ? 3.2 : 2.2,
                repeat: mood === 'oops' ? 0 : Infinity,
                ease: 'easeInOut' as const,
              };

  return (
    <svg
      viewBox="-6 -8 60 66"
      width={size}
      height={Math.round(size * (66 / 60))}
      aria-hidden="true"
      style={{ flex: 'none', overflow: 'visible' }}
    >
      {/* Optional soft isometric ground shadow for Web Pet / Showcase */}
      {showShadow && (
        <ellipse
          cx="24"
          cy="51"
          rx={trick === 'drag' ? 11 : 16}
          ry={trick === 'drag' ? 4 : 5.6}
          fill="var(--ink)"
          opacity={trick === 'drag' ? 0.1 : 0.18}
        />
      )}

      {/* Stage 4 Crown Unlock: Subtle Floating Base Aura */}
      {upgrades?.crown && showShadow && (
        <ellipse
          cx="24"
          cy="51"
          rx="20"
          ry="7.5"
          fill="none"
          stroke="var(--coral)"
          strokeWidth="1.4"
          strokeDasharray="4 3"
          opacity="0.7"
        />
      )}

      <motion.g
        style={{ transformOrigin: '24px 28px' }}
        animate={bodyAnimate}
        transition={bodyTransition}
      >
        {/* Stage 3 Upgrade: 2.5D Isometric Memory Backpack behind right-top edge */}
        {upgrades?.backpack && (
          <g>
            <polygon
              points="36,15 45,19 45,34 36,30"
              fill="var(--coral-200)"
              stroke="var(--ink)"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <polygon
              points="31,12 40,16 45,19 36,15"
              fill="var(--coral)"
              stroke="var(--ink)"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <line
              x1="39"
              y1="21"
              x2="43"
              y2="23"
              stroke="var(--ink)"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Stage 2 Upgrade: Hover Wings on Left & Right */}
        {upgrades?.wings && (
          <g>
            <motion.polygon
              points="7,27 -3,23 -1,31 7,34"
              fill="var(--coral-100)"
              stroke="var(--ink)"
              strokeWidth="1.4"
              strokeLinejoin="round"
              style={{ transformOrigin: '7px 30px' }}
              animate={{ rotate: [-6, 8, -6] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.polygon
              points="41,27 51,23 49,31 41,34"
              fill="var(--coral-100)"
              stroke="var(--ink)"
              strokeWidth="1.4"
              strokeLinejoin="round"
              style={{ transformOrigin: '41px 30px' }}
              animate={{ rotate: [6, -8, 6] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </g>
        )}

        {/* Stage 1 Upgrade: Glowing Antenna Signal Waves */}
        {upgrades?.chip && (
          <motion.g
            stroke="var(--coral)"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            animate={{ opacity: [0.25, 0.95, 0.25], scale: [0.92, 1.08, 0.92] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '24px 4px' }}
          >
            <path d="M 18 3 Q 24 -2 30 3" />
            <path d="M 15 0 Q 24 -6 33 0" opacity="0.65" />
          </motion.g>
        )}

        {/* Antenna */}
        <line
          x1="24"
          y1="14"
          x2="24"
          y2="5.5"
          stroke="var(--ink)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle
          cx="24"
          cy="4.5"
          r={upgrades?.chip ? 3.6 : 3.1}
          fill={mood === 'sleepy' ? 'var(--ink-3)' : 'var(--coral)'}
          stroke="var(--ink)"
          strokeWidth="1.5"
        />

        {/* Stage 4 Upgrade: Tiny Geek Crown */}
        {upgrades?.crown && (
          <polygon
            points="16.5,11.5 18.5,5.5 22,9 24,4.5 26,9 29.5,5.5 31.5,11.5"
            fill="#f4b740"
            stroke="var(--ink)"
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
        )}

        {/* Isometric Cube Top Face */}
        <polygon
          points="24,11 41,19 24,27 7,19"
          fill={topColor}
          stroke="var(--ink)"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        {/* Left-Front Dark Visor Face */}
        <polygon
          points="7,19 24,27 24,46 7,38"
          fill="var(--ink)"
          stroke="var(--ink)"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        {/* Right-Front Blush Striped Face */}
        <polygon
          points="24,27 41,19 41,38 24,46"
          fill="var(--coral-100)"
          stroke="var(--ink)"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <g stroke="var(--coral)" strokeWidth="1.4" opacity="0.75">
          <line x1="27" y1="44" x2="39" y2="23" />
          <line x1="33" y1="41" x2="40.5" y2="28" />
          <line x1="24.5" y1="37" x2="33.5" y2="22.5" />
        </g>

        {/* Little Isometric Feet (dangle cutely when dragged!) */}
        <g stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round">
          <line x1="16" y1="42.5" x2={trick === 'drag' ? '14' : '16'} y2="47.5" />
          <line x1="30" y1="43.5" x2={trick === 'drag' ? '32' : '30'} y2="48" />
        </g>

        {/* Expressive Visor Eyes + Blush + Mouth */}
        <g transform="translate(15.5, 32.5) skewY(25)">
          {mood === 'oops' ? (
            <g stroke="#f08a6d" strokeWidth="1.8" strokeLinecap="round">
              <line x1="-5" y1="-2" x2="-1.5" y2="1.5" />
              <line x1="-1.5" y1="-2" x2="-5" y2="1.5" />
              <line x1="1.5" y1="-2" x2="5" y2="1.5" />
              <line x1="5" y1="-2" x2="1.5" y2="1.5" />
            </g>
          ) : mood === 'sleepy' ? (
            <g stroke="#d2cdc4" strokeWidth="1.8" fill="none" strokeLinecap="round">
              <path d="M -5.2 -0.2 Q -3.3 2 -1.3 -0.2" />
              <path d="M 1.3 -0.2 Q 3.3 2 5.2 -0.2" />
            </g>
          ) : mood === 'loved' ? (
            <g>
              {/* Glowing happy arcs + rosy cheeks */}
              <g stroke="#ff9578" strokeWidth="2" fill="none" strokeLinecap="round">
                <path d="M -5.4 0.4 Q -3.3 -2.8 -1.2 0.4" />
                <path d="M 1.2 0.4 Q 3.3 -2.8 5.4 0.4" />
              </g>
              <circle cx="-5.3" cy="2.6" r="1.2" fill="#e86f51" opacity="0.85" />
              <circle cx="5.3" cy="2.6" r="1.2" fill="#e86f51" opacity="0.85" />
            </g>
          ) : mood === 'proud' || mood === 'excited' ? (
            <g stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round">
              <path d="M -5.5 0.5 Q -3.3 -3 -1.2 0.5" />
              <path d="M 1.2 0.5 Q 3.3 -3 5.5 0.5" />
            </g>
          ) : blinking ? (
            <g stroke="#f08a6d" strokeWidth="1.8" strokeLinecap="round">
              <line x1="-5" y1="0" x2="-1.6" y2="0" />
              <line x1="1.6" y1="0" x2="5" y2="0" />
            </g>
          ) : mood === 'curious' ? (
            <g fill="#f08a6d">
              <circle cx="-3.3" cy="-0.5" r="2.2" />
              <circle cx="3.3" cy="0.4" r="1.5" />
              <circle cx="-3.9" cy="-1.2" r="0.65" fill="#ffffff" />
            </g>
          ) : (
            <g fill="#f08a6d">
              <circle cx="-3.3" cy="0" r="1.95" />
              <circle cx="3.3" cy="0" r="1.95" />
              <circle cx="-3.9" cy="-0.6" r="0.6" fill="#ffffff" />
              <circle cx="2.7" cy="-0.6" r="0.6" fill="#ffffff" />
            </g>
          )}

          {/* Tiny Munching Mouth during Snack */}
          {trick === 'munch' && (
            <ellipse cx="0" cy="4.2" rx="2.1" ry="1.5" fill="#f08a6d" />
          )}
        </g>

        {/* Floating zZ when Sleepy */}
        {mood === 'sleepy' && (
          <motion.g
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            fill="var(--ink-3)"
            fontWeight="800"
          >
            <text x="36" y="10" fontSize="8">
              z
            </text>
            <text x="41" y="4" fontSize="10">
              Z
            </text>
          </motion.g>
        )}
      </motion.g>
    </svg>
  );
}

import { motion } from 'motion/react';
import { CompanionMood } from '../types/course';

interface PiBotAvatarProps {
  mood?: CompanionMood;
  size?: number;
}

/**
 * Cute 2.5D isometric mini Pi-Bot companion ("阿派") styled in Warm Paper Lab tokens.
 * Expresses real-time moods to make lessons feel like an adventure with a robotic sidekick.
 */
export function PiBotAvatar({ mood = 'happy', size = 40 }: PiBotAvatarProps) {
  const topColor =
    mood === 'proud' || mood === 'excited'
      ? 'var(--coral)'
      : mood === 'oops'
        ? 'var(--coral-300)'
        : 'var(--iso-top)';

  return (
    <motion.svg
      viewBox="0 0 48 52"
      width={size}
      height={Math.round(size * (52 / 48))}
      aria-hidden="true"
      animate={
        mood === 'excited' || mood === 'proud'
          ? { y: [0, -3.5, 0] }
          : mood === 'oops'
            ? { x: [0, -2, 2, -1.5, 0] }
            : { y: [0, -1.5, 0] }
      }
      transition={{
        duration: mood === 'oops' ? 0.45 : 2.2,
        repeat: mood === 'oops' ? 0 : Infinity,
        ease: 'easeInOut',
      }}
      style={{ flex: 'none', overflow: 'visible' }}
    >
      {/* Antenna */}
      <line
        x1="24"
        y1="14"
        x2="24"
        y2="6"
        stroke="var(--ink)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="24"
        cy="5"
        r="3.2"
        fill="var(--coral)"
        stroke="var(--ink)"
        strokeWidth="1.5"
      />

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

      {/* Right-Front Blush Face */}
      <polygon
        points="24,27 41,19 41,38 24,46"
        fill="var(--coral-100)"
        stroke="var(--ink)"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      {/* Signature subtle diagonal coral stripes on right face */}
      <g stroke="var(--coral)" strokeWidth="1.4" opacity="0.75">
        <line x1="27" y1="44" x2="39" y2="23" />
        <line x1="33" y1="41" x2="40.5" y2="28" />
        <line x1="24.5" y1="37" x2="33.5" y2="22.5" />
      </g>

      {/* Expressive Visor Eyes */}
      <g transform="translate(15.5, 32.5) skewY(25)">
        {mood === 'oops' ? (
          <g stroke="#f08a6d" strokeWidth="1.8" strokeLinecap="round">
            <line x1="-5" y1="-2" x2="-1.5" y2="1.5" />
            <line x1="-1.5" y1="-2" x2="-5" y2="1.5" />
            <line x1="1.5" y1="-2" x2="5" y2="1.5" />
            <line x1="5" y1="-2" x2="1.5" y2="1.5" />
          </g>
        ) : mood === 'proud' || mood === 'excited' ? (
          <g stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M -5.5 0.5 Q -3.3 -3 -1.2 0.5" />
            <path d="M 1.2 0.5 Q 3.3 -3 5.5 0.5" />
          </g>
        ) : mood === 'curious' ? (
          <g fill="#f08a6d">
            <circle cx="-3.3" cy="-0.4" r="2.1" />
            <circle cx="3.3" cy="0.4" r="1.5" />
          </g>
        ) : (
          <g fill="#f08a6d">
            <circle cx="-3.3" cy="0" r="1.9" />
            <circle cx="3.3" cy="0" r="1.9" />
          </g>
        )}
      </g>
    </motion.svg>
  );
}

import { motion } from 'motion/react';
import {
  computeIsoBox,
  isoProject,
  leftFaceTransform,
  Point2D,
  topFaceTransform,
} from './isoMath';

/** Shared SVG patterns for Algo Lab diagonal coral hatch & diamond floor grid */
export function IsoDefs() {
  return (
    <defs>
      <pattern
        id="sc-hatch-wide"
        width="8"
        height="8"
        patternTransform="rotate(34 0 0)"
        patternUnits="userSpaceOnUse"
      >
        <line x1="0" y1="0" x2="0" y2="8" stroke="var(--coral)" strokeWidth="1.45" opacity="0.58" />
      </pattern>
      <pattern
        id="sc-hatch-soft"
        width="8.5"
        height="8.5"
        patternTransform="rotate(34 0 0)"
        patternUnits="userSpaceOnUse"
      >
        <line x1="0" y1="0" x2="0" y2="8.5" stroke="var(--coral)" strokeWidth="1.1" opacity="0.34" />
      </pattern>
    </defs>
  );
}

export type IsoBoxTone = 'paper' | 'active' | 'found' | 'dim' | 'ink' | 'wall';

interface IsoBoxProps {
  x: number;
  y: number;
  z?: number;
  dx: number;
  dy: number;
  dz: number;
  tone?: IsoBoxTone;
  hatched?: boolean;
  showShadow?: boolean;
  topText?: string;
  leftText?: string;
  topTextSize?: number;
  leftTextSize?: number;
  interactive?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}

export function IsoBox({
  x,
  y,
  z = 0,
  dx,
  dy,
  dz,
  tone = 'paper',
  hatched = true,
  showShadow = true,
  topText,
  leftText,
  topTextSize = 18,
  leftTextSize = 14,
  interactive = false,
  onClick,
  ariaLabel,
}: IsoBoxProps) {
  const origin = isoProject(x, y, z);
  const floorOrigin = isoProject(x, y, 0);
  const geo = computeIsoBox(dx, dy, dz);

  let topFill = 'var(--iso-top)';
  let leftFill = 'var(--iso-left)';
  let rightFill = 'var(--iso-blush)';
  let strokeColor = 'var(--obj-ink)';
  let topInk = 'var(--obj-ink)';
  let leftInk = 'var(--obj-ink)';
  let useHatch = hatched;

  if (tone === 'active') {
    topFill = 'var(--coral-300)';
  } else if (tone === 'found') {
    topFill = 'var(--coral)';
    topInk = '#ffffff';
  } else if (tone === 'dim') {
    topFill = 'var(--out-top)';
    leftFill = 'var(--out-side)';
    rightFill = 'var(--out-side)';
    strokeColor = 'var(--out-line)';
    topInk = 'var(--out-text)';
    leftInk = 'var(--out-text)';
    useHatch = false;
  } else if (tone === 'ink') {
    topFill = 'var(--iso-top)';
    leftFill = 'var(--obj-ink)';
    rightFill = 'var(--iso-blush)';
    leftInk = 'var(--obj-paper)';
  } else if (tone === 'wall') {
    topFill = 'var(--iso-blush-deep)';
    leftFill = 'var(--obj-ink)';
    rightFill = 'var(--iso-blush)';
    leftInk = 'var(--obj-paper)';
  }

  return (
    <g
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={ariaLabel}
      onKeyDown={
        interactive && onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={interactive ? { cursor: 'pointer' } : undefined}
    >
      {/* Floor Cast Shadow stays grounded even while box lifts */}
      {showShadow && (
        <motion.g
          initial={false}
          animate={{
            x: floorOrigin.x,
            y: floorOrigin.y,
            opacity: z > 0 ? Math.max(0.35, 1 - z / 160) : 1,
          }}
          transition={{ type: 'spring', stiffness: 210, damping: 24 }}
        >
          <polygon points={geo.shadow} className="shadow-iso" />
        </motion.g>
      )}

      {/* Animated 2.5D Isometric Prism */}
      <motion.g
        initial={{ x: origin.x, y: origin.y - 44, opacity: 0 }}
        animate={{ x: origin.x, y: origin.y, opacity: 1 }}
        exit={{ x: origin.x, y: origin.y - 42, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 23 }}
      >
        {/* Top Face */}
        <polygon
          points={geo.top}
          fill={topFill}
          stroke={strokeColor}
          strokeWidth={1.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Left-Front Face */}
        <polygon
          points={geo.left}
          fill={leftFill}
          stroke={strokeColor}
          strokeWidth={1.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right-Front Face (Warm Blush + Gentle Colored-Pencil Hatching) */}
        <polygon
          points={geo.right}
          fill={rightFill}
          stroke={strokeColor}
          strokeWidth={1.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {useHatch && (
          <polygon
            points={geo.right}
            fill="url(#sc-hatch-wide)"
            stroke={strokeColor}
            strokeWidth={1.25}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Top Face Perspective Label */}
        {topText && (
          <text
            transform={topFaceTransform(geo.topCenter)}
            textAnchor="middle"
            dominantBaseline="central"
            fill={topInk}
            fontSize={topTextSize}
            fontWeight={800}
          >
            {topText}
          </text>
        )}

        {/* Left-Front Face Perspective Label */}
        {leftText && (
          <text
            transform={leftFaceTransform(geo.leftCenter)}
            textAnchor="middle"
            dominantBaseline="central"
            fill={leftInk}
            fontSize={leftTextSize}
            fontWeight={700}
          >
            {leftText}
          </text>
        )}
      </motion.g>
    </g>
  );
}

interface IsoTagProps {
  anchor: Point2D;
  tagPos: Point2D;
  text: string;
  tone?: 'dark' | 'coral';
}

/** Auto-sized floating capsule Tag with leader line & anchor dot matching Algo Lab */
export function IsoTag({ anchor, tagPos, text, tone = 'dark' }: IsoTagProps) {
  // Estimate width cleanly for mixed CJK + ASCII characters
  let visualUnits = 0;
  for (const ch of text) {
    visualUnits += ch.charCodeAt(0) > 255 ? 1.85 : 1.05;
  }
  const boxWidth = Math.max(76, Math.round(visualUnits * 7.8 + 26));
  const boxHeight = 30;
  const isCoral = tone === 'coral';

  const boxFill = isCoral ? 'var(--coral-deep)' : 'var(--tag-fill)';
  const boxStroke = isCoral ? 'none' : 'var(--tag-line)';
  const textFill = isCoral ? '#ffffff' : 'var(--tag-text)';
  const lineColor = isCoral ? 'var(--coral-deep)' : 'var(--floor-ink)';

  return (
    <motion.g
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
      style={{ pointerEvents: 'none' }}
    >
      <line
        x1={anchor.x}
        y1={anchor.y}
        x2={tagPos.x}
        y2={tagPos.y}
        stroke={lineColor}
        strokeWidth={1.3}
        strokeDasharray="3 2.5"
        strokeLinecap="round"
        opacity={0.78}
      />
      <circle
        cx={anchor.x}
        cy={anchor.y}
        r={3.8}
        fill={lineColor}
        stroke="var(--stage)"
        strokeWidth={1.4}
      />
      <g transform={`translate(${tagPos.x}, ${tagPos.y})`}>
        <rect
          x={-boxWidth / 2}
          y={-boxHeight / 2}
          width={boxWidth}
          height={boxHeight}
          rx={13}
          fill={boxFill}
          stroke={boxStroke}
          strokeWidth={1.1}
        />
        <text
          x={0}
          y={0.5}
          textAnchor="middle"
          dominantBaseline="central"
          fill={textFill}
          fontSize={12.5}
          fontWeight={650}
        >
          {text}
        </text>
      </g>
    </motion.g>
  );
}

interface StairsIconProps {
  total: number;
  current: number; // 1-based
}

/** Mini isometric staircase progress glyph in .lesson__head matching Algo Lab screenshots */
export function StairsIcon({ total, current }: StairsIconProps) {
  const steps = Math.min(Math.max(total, 3), 5);
  return (
    <svg className="stairs" viewBox="0 0 74 56" width="74" height="56" aria-hidden="true">
      <defs>
        <pattern
          id="stairs-hatch"
          width="5"
          height="5"
          patternTransform="rotate(34 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="0" x2="0" y2="5" stroke="var(--coral)" strokeWidth="1.3" opacity="0.8" />
        </pattern>
      </defs>
      {Array.from({ length: steps }).map((_, idx) => {
        const stepNum = idx + 1;
        const isCurrent = stepNum === Math.min(current, steps);
        const isDone = stepNum < Math.min(current, steps);
        const x = 10 + idx * 11;
        const y = 36 - idx * 6.5;
        const w = 13;
        const h = 11 + idx * 5.2;

        const topFill = isCurrent
          ? 'var(--coral)'
          : isDone
            ? 'var(--iso-blush-deep)'
            : 'var(--iso-top)';
        const leftFill = isCurrent ? 'var(--coral-200)' : 'var(--iso-left)';

        return (
          <g key={idx}>
            <polygon
              points={`${x},${y} ${x + w},${y - 5.5} ${x + w + 10},${y - 1} ${x + 10},${y + 4.5}`}
              fill={topFill}
              className="s-ink"
            />
            <polygon
              points={`${x},${y} ${x + 10},${y + 4.5} ${x + 10},${y + 4.5 + h} ${x},${y + h}`}
              fill={leftFill}
              className="s-ink"
            />
            <polygon
              points={`${x + 10},${y + 4.5} ${x + w + 10},${y - 1} ${x + w + 10},${y - 1 + h} ${x + 10},${y + 4.5 + h}`}
              fill="var(--iso-blush)"
              className="s-ink"
            />
            <polygon
              points={`${x + 10},${y + 4.5} ${x + w + 10},${y - 1} ${x + w + 10},${y - 1 + h} ${x + 10},${y + 4.5 + h}`}
              fill="url(#stairs-hatch)"
              className="s-ink"
            />
          </g>
        );
      })}
    </svg>
  );
}

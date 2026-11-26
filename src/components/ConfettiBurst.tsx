import { AnimatePresence, motion } from 'motion/react';

interface ConfettiBurstProps {
  burstKey: number;
}

const PIECES = [
  { x: -135, y: -95, r: -45, color: 'var(--coral)', shape: 'diamond' },
  { x: -92, y: -132, r: 35, color: '#e6b85c', shape: 'star' },
  { x: -46, y: -148, r: -25, color: 'var(--coral-deep)', shape: 'rect' },
  { x: 18, y: -152, r: 50, color: '#58b3a6', shape: 'diamond' },
  { x: 76, y: -130, r: -40, color: 'var(--coral)', shape: 'star' },
  { x: 126, y: -96, r: 65, color: '#e6b85c', shape: 'rect' },
  { x: -148, y: -28, r: 28, color: '#58b3a6', shape: 'rect' },
  { x: 146, y: -32, r: -55, color: 'var(--coral-deep)', shape: 'diamond' },
  { x: -108, y: 24, r: 75, color: '#e6b85c', shape: 'diamond' },
  { x: 105, y: 28, r: -30, color: 'var(--coral)', shape: 'rect' },
  { x: -64, y: -74, r: 42, color: 'var(--ink)', shape: 'diamond' },
  { x: 64, y: -76, r: -42, color: '#58b3a6', shape: 'star' },
  { x: -24, y: -98, r: 18, color: '#e6b85c', shape: 'rect' },
  { x: 32, y: -104, r: -22, color: 'var(--coral)', shape: 'diamond' },
];

/**
 * Crisp geometric confetti burst in Warm Paper Lab tones that triggers over the 2.5D stage
 * on challenge victory, quiz answer, or badge unlock.
 */
export function ConfettiBurst({ burstKey }: ConfettiBurstProps) {
  return (
    <AnimatePresence>
      {burstKey > 0 && (
        <div
          key={burstKey}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 12,
            overflow: 'hidden',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <div style={{ position: 'relative', width: 0, height: 0 }}>
            {PIECES.map((p, idx) => (
              <motion.span
                key={idx}
                initial={{ x: 0, y: 0, scale: 0.2, opacity: 1, rotate: 0 }}
                animate={{
                  x: p.x,
                  y: [0, p.y, p.y + 42],
                  scale: [0.3, 1.15, 0.75],
                  opacity: [1, 1, 0],
                  rotate: p.r * 3,
                }}
                transition={{
                  duration: 1.05,
                  ease: [0.16, 0.88, 0.32, 1],
                  delay: (idx % 4) * 0.025,
                }}
                style={{
                  position: 'absolute',
                  width: p.shape === 'rect' ? 11 : 10,
                  height: p.shape === 'rect' ? 6 : 10,
                  borderRadius: p.shape === 'star' ? '50%' : 2,
                  background: p.color,
                  border: '1px solid rgba(42,43,47,0.35)',
                  transformOrigin: 'center',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

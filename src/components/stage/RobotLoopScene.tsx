import { motion } from 'motion/react';
import { RobotLoopSceneState } from '../../types/course';
import { computeIsoBox, isoProject } from './isoMath';
import { IsoBox, IsoDefs, IsoTag } from './IsoPrimitives';

interface RobotLoopSceneProps {
  state: RobotLoopSceneState;
}

export function RobotLoopScene({ state }: RobotLoopSceneProps) {
  const { trackLength, robotAt, goalAt, wallAt, visited, status, tagText } = state;

  const tileSize = 46;
  const tileGap = 4;
  const stride = tileSize + tileGap;
  const trackLen = trackLength * stride + 14;

  const robotX = 10 + robotAt * stride + 6;
  const robotY = 6;
  const robotZ = status === 'victory' ? 16 : 12;
  const robotOrigin = isoProject(robotX, robotY, robotZ);
  const robotGeo = computeIsoBox(34, 34, 34);

  const tagAnchor = isoProject(robotX + 17, robotY + 17, robotZ + 38);
  const tagPos = { x: tagAnchor.x - 10, y: tagAnchor.y - 54 };

  const bonkShake = status === 'bonk' ? [0, 10, -5, 4, 0] : 0;

  return (
    <svg
      className="scene"
      viewBox="-95 -95 470 295"
      role="img"
      aria-label={`2.5D 等距机器人循环走廊，阿派位于第 ${robotAt} 格`}
    >
      <IsoDefs />

      {/* Corridor Foundation Slab */}
      <IsoBox
        x={0}
        y={-8}
        z={-16}
        dx={trackLen}
        dy={tileSize + 16}
        dz={16}
        tone="ink"
        hatched={true}
        showShadow={true}
        leftText="等距机器人走廊"
        leftTextSize={11}
      />

      {/* Stepping Tiles 0 .. trackLength-1 */}
      {Array.from({ length: trackLength }).map((_, idx) => {
        const tx = 10 + idx * stride;
        const isVisited = visited.includes(idx);
        const isGoal = idx === goalAt;
        const isWall = idx === wallAt;

        const tileTone = isWall
          ? 'dim'
          : isGoal && status === 'victory'
            ? 'found'
            : isVisited
              ? 'active'
              : 'paper';

        return (
          <g key={`tile-${idx}`}>
            <IsoBox
              x={tx}
              y={0}
              z={0}
              dx={tileSize}
              dy={tileSize}
              dz={10}
              tone={tileTone}
              hatched={false}
              showShadow={false}
              leftText={String(idx)}
              leftTextSize={11}
            />

            {/* Goal Energy Cube (hovering softly until collected) */}
            {isGoal && status !== 'victory' && (
              <IsoBox
                x={tx + 12}
                y={12}
                z={15}
                dx={22}
                dy={22}
                dz={22}
                tone="found"
                hatched={true}
                showShadow={true}
                topText="★"
                topTextSize={15}
              />
            )}

            {/* Tall Hatched Obstacle Wall */}
            {isWall && (
              <IsoBox
                x={tx + 3}
                y={3}
                z={10}
                dx={40}
                dy={40}
                dz={50}
                tone={status === 'bonk' ? 'found' : 'wall'}
                hatched={true}
                showShadow={true}
                leftText="墙"
                leftTextSize={15}
              />
            )}
          </g>
        );
      })}

      {/* 2.5D Isometric Pi-Bot Cube Robot ("阿派") */}
      <motion.g
        initial={false}
        animate={{
          x: robotOrigin.x,
          y: robotOrigin.y,
        }}
        transition={{ type: 'spring', stiffness: 210, damping: 20 }}
      >
        <motion.g
          animate={{ x: bonkShake }}
          transition={{ duration: 0.36 }}
        >
          {/* Robot Shadow on Tile */}
          <polygon points={robotGeo.shadow} className="shadow-iso" />

          {/* Robot Body Isometric Faces */}
          <polygon
            points={robotGeo.top}
            fill={status === 'bonk' ? 'var(--coral)' : status === 'victory' ? 'var(--coral)' : 'var(--iso-top)'}
            stroke="var(--obj-ink)"
            strokeWidth={1.7}
            strokeLinejoin="round"
          />
          <polygon
            points={robotGeo.left}
            fill="var(--obj-ink)"
            stroke="var(--obj-ink)"
            strokeWidth={1.7}
            strokeLinejoin="round"
          />
          <polygon
            points={robotGeo.right}
            fill="var(--iso-blush)"
            stroke="var(--obj-ink)"
            strokeWidth={1.7}
            strokeLinejoin="round"
          />
          <polygon
            points={robotGeo.right}
            fill="url(#sc-hatch-wide)"
            stroke="var(--obj-ink)"
            strokeWidth={1.7}
            strokeLinejoin="round"
          />

          {/* Cute Visor Eyes on Left-Front Dark Face */}
          <g transform={`translate(${robotGeo.leftCenter.x}, ${robotGeo.leftCenter.y}) skewY(25)`}>
            {status === 'bonk' ? (
              <g stroke="#f08a6d" strokeWidth={2} strokeLinecap="round">
                <line x1="-8" y1="-3" x2="-3" y2="2" />
                <line x1="-3" y1="-3" x2="-8" y2="2" />
                <line x1="3" y1="-3" x2="8" y2="2" />
                <line x1="8" y1="-3" x2="3" y2="2" />
              </g>
            ) : status === 'victory' ? (
              <g stroke="#ffffff" strokeWidth={2.2} fill="none" strokeLinecap="round">
                <path d="M -8 1 Q -5 -4 -2 1" />
                <path d="M 2 1 Q 5 -4 8 1" />
              </g>
            ) : (
              <g fill="#f08a6d">
                <circle cx="-5" cy="0" r="2.6" />
                <circle cx="5" cy="0" r="2.6" />
              </g>
            )}
          </g>

          {/* Little Antenna on Robot Top */}
          <line
            x1={robotGeo.topCenter.x}
            y1={robotGeo.topCenter.y}
            x2={robotGeo.topCenter.x}
            y2={robotGeo.topCenter.y - 13}
            stroke="var(--obj-ink)"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <circle
            cx={robotGeo.topCenter.x}
            cy={robotGeo.topCenter.y - 15}
            r={3.5}
            fill="var(--coral)"
            stroke="var(--obj-ink)"
            strokeWidth={1.3}
          />
        </motion.g>
      </motion.g>

      {/* Floating Loop / Status Pointer Tag */}
      {tagText && (
        <IsoTag
          anchor={tagAnchor}
          tagPos={tagPos}
          text={tagText}
          tone={status === 'bonk' || status === 'victory' ? 'coral' : 'dark'}
        />
      )}
    </svg>
  );
}

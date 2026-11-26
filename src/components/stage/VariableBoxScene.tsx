import { motion } from 'motion/react';
import { VariableBoxSceneState } from '../../types/course';
import { isoProject } from './isoMath';
import { IsoBox, IsoDefs, IsoTag } from './IsoPrimitives';

interface VariableBoxSceneProps {
  state: VariableBoxSceneState;
}

export function VariableBoxScene({ state }: VariableBoxSceneProps) {
  const { boxes, incomingToken, tagText, tagTone = 'coral' } = state;

  const boxW = 86;
  const boxD = 72;
  const boxH = 54;
  const gap = 36;
  const stride = boxW + gap;
  const baseLen = boxes.length * stride + 18;

  const focusIdx = Math.max(
    0,
    boxes.findIndex((b) => b.highlight)
  );
  const anchor = isoProject(
    18 + focusIdx * stride + boxW / 2,
    boxD / 2,
    boxH + (incomingToken ? 42 : 12)
  );
  const tagPos = { x: anchor.x + 12, y: anchor.y - 54 };

  return (
    <svg
      className="scene"
      viewBox="-130 -125 430 305"
      role="img"
      aria-label="2.5D 等距魔法变量盒子"
    >
      <IsoDefs />

      {/* Lab Desk Base */}
      <IsoBox
        x={0}
        y={-10}
        z={-16}
        dx={baseLen}
        dy={boxD + 22}
        dz={16}
        tone="ink"
        hatched={true}
        showShadow={true}
        leftText="记忆桌台 MEMORY"
        leftTextSize={11}
      />

      {boxes.map((box, idx) => {
        const bx = 18 + idx * stride;
        const isHi = Boolean(box.highlight);
        return (
          <g key={box.name}>
            {/* Main Variable Box */}
            <IsoBox
              x={bx}
              y={0}
              z={2}
              dx={boxW}
              dy={boxD}
              dz={boxH}
              tone={isHi ? 'active' : 'paper'}
              hatched={true}
              showShadow={true}
              topText={String(box.value)}
              topTextSize={24}
              leftText={box.name}
              leftTextSize={14}
            />

            {/* Name Label Plaque in Front */}
            <IsoBox
              x={bx + 10}
              y={boxD + 20}
              z={-10}
              dx={boxW - 20}
              dy={20}
              dz={11}
              tone={isHi ? 'found' : 'ink'}
              hatched={false}
              showShadow={false}
              topText={box.deltaText ?? `变量名`}
              topTextSize={11}
            />
          </g>
        );
      })}

      {/* Floating Incoming Value Token Dropping into Highlighted Box */}
      {incomingToken && (
        <motion.g
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <IsoBox
            x={18 + focusIdx * stride + 22}
            y={18}
            z={boxH + 18}
            dx={42}
            dy={36}
            dz={24}
            tone="found"
            hatched={true}
            showShadow={true}
            topText={incomingToken}
            topTextSize={15}
          />
        </motion.g>
      )}

      {tagText && <IsoTag anchor={anchor} tagPos={tagPos} text={tagText} tone={tagTone} />}
    </svg>
  );
}

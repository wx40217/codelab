import { BinaryBitsSceneState } from '../../types/course';
import { isoProject } from './isoMath';
import { IsoBox, IsoDefs, IsoTag } from './IsoPrimitives';

interface BinaryBitsSceneProps {
  state: BinaryBitsSceneState;
  onToggleBit?: (index: number) => void;
}

const WEIGHTS = [8, 4, 2, 1];

export function BinaryBitsScene({ state, onToggleBit }: BinaryBitsSceneProps) {
  const { bits, focusBit, showWeights, tagText, tagTone = 'coral', interactive } = state;

  const slotW = 54;
  const slotD = 54;
  const gap = 14;
  const stepX = slotW + gap;
  const basePlateLen = stepX * 4 + 14;

  // Determine anchor for floating summary Tag
  const anchorIdx = focusBit !== undefined ? focusBit : bits.findIndex((b) => b === 1);
  const safeIdx = anchorIdx >= 0 ? anchorIdx : 1;
  const anchorX = 14 + safeIdx * stepX + slotW / 2;
  const anchorZ = bits[safeIdx] === 1 ? 58 : 26;
  const tagAnchor = isoProject(anchorX, slotD / 2, anchorZ);
  const tagPos = { x: tagAnchor.x - 16, y: tagAnchor.y - 68 };

  const canClick = Boolean(onToggleBit);

  return (
    <svg
      className="scene"
      viewBox="-145 -105 460 310"
      role="img"
      aria-label={`2.5D 等距二进制开关图解：当前编码 ${bits.join('')}`}
    >
      <IsoDefs />

      {/* Continuous Isometric Strip Base Platform */}
      <IsoBox
        x={0}
        y={-8}
        z={-16}
        dx={basePlateLen}
        dy={slotD + 16}
        dz={16}
        tone="ink"
        hatched={true}
        showShadow={true}
        leftText={interactive || canClick ? '点一点开关方块试试！' : '4 位二进制开关底座'}
        leftTextSize={11}
      />

      {/* 4 Isometric Bit Switch Blocks (render back-to-front along +x) */}
      {bits.map((bit, idx) => {
        const bx = 14 + idx * stepX;
        const isOn = bit === 1;
        const isFocused = focusBit === idx;
        const liftZ = isOn ? 18 : 2;
        const height = isOn ? 38 : 18;

        const tone = isOn ? (isFocused ? 'found' : 'active') : 'dim';

        return (
          <g key={`bit-${idx}`}>
            {/* Recessed slot socket */}
            <IsoBox
              x={bx - 2}
              y={-2}
              z={0}
              dx={slotW + 4}
              dy={slotD + 4}
              dz={3}
              tone="dim"
              hatched={false}
              showShadow={false}
            />

            {/* Lifting 2.5D Bit Cube */}
            <IsoBox
              x={bx}
              y={0}
              z={liftZ}
              dx={slotW}
              dy={slotD}
              dz={height}
              tone={tone}
              hatched={isOn}
              showShadow={true}
              topText={String(bit)}
              topTextSize={24}
              leftText={isOn ? '开' : '关'}
              leftTextSize={12}
              interactive={canClick}
              onClick={canClick ? () => onToggleBit?.(idx) : undefined}
              ariaLabel={`权重 ${WEIGHTS[idx]} 开关，当前为 ${bit}，点击切换`}
            />

            {/* Isometric Weight Plaque in front of each switch */}
            {showWeights && (
              <IsoBox
                x={bx + 8}
                y={slotD + 22}
                z={-10}
                dx={38}
                dy={22}
                dz={12}
                tone={isOn ? 'found' : 'paper'}
                hatched={false}
                showShadow={false}
                topText={`×${WEIGHTS[idx]}`}
                topTextSize={13}
              />
            )}
          </g>
        );
      })}

      {/* Floating Pointer Tag */}
      {tagText && <IsoTag anchor={tagAnchor} tagPos={tagPos} text={tagText} tone={tagTone} />}
    </svg>
  );
}

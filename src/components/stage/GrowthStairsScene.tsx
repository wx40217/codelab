import { GrowthStairsSceneState } from '../../types/course';
import { isoProject } from './isoMath';
import { IsoBox, IsoDefs, IsoTag } from './IsoPrimitives';

interface GrowthStairsSceneProps {
  state: GrowthStairsSceneState;
}

/**
 * Iconic Algo Lab 2.5D isometric Big-O stepped platforms comparing:
 * O(1) vs O(log n) vs O(n) vs O(n²) with miniature unit work-cubes stacked on top!
 */
export function GrowthStairsScene({ state }: GrowthStairsSceneProps) {
  const { n, focusTier, tagText } = state;

  const logSteps = Math.max(1, Math.round(Math.log2(Math.max(2, n))));
  const quadSteps = n * n;

  // Compact cube counts rendered on top of each platform
  const cubeSize = n >= 8 ? 11 : 15;
  const cubeGap = n >= 8 ? 3 : 4;
  const cubeStride = cubeSize + cubeGap;

  // 4 Stepped Platforms arranged back-to-front along +y (O(n^2) in back, O(1) in front)
  const quadCols = n;
  const quadRows = n;
  const quadW = quadCols * cubeStride + 14;
  const quadD = quadRows * cubeStride + 14;

  const linW = n * cubeStride + 14;
  const linD = cubeStride + 14;

  const logW = logSteps * cubeStride + 14;
  const logD = cubeStride + 14;

  const constW = cubeStride + 14;
  const constD = cubeStride + 14;

  // Anchor tag for n = X
  const topAnchor = isoProject(quadW / 2, 12, 54);
  const topTagPos = { x: topAnchor.x - 18, y: topAnchor.y - 48 };

  const tierTone = (idx: 0 | 1 | 2 | 3) =>
    focusTier === undefined || focusTier === idx ? 'ink' : 'dim';
  const cubeTone = (idx: 0 | 1 | 2 | 3) =>
    focusTier === idx ? 'found' : focusTier === undefined ? 'paper' : 'dim';

  return (
    <svg
      className="scene"
      viewBox="-220 -115 470 330"
      role="img"
      aria-label={`2.5D 等距大O步数阶梯对比，输入规模 n = ${n}`}
    >
      <IsoDefs />

      {/* Tier 3 (Back): O(n²) */}
      <g>
        <IsoBox
          x={0}
          y={0}
          z={0}
          dx={quadW}
          dy={quadD}
          dz={34}
          tone={tierTone(3)}
          hatched={focusTier === undefined || focusTier === 3}
          showShadow={true}
          leftText="O(n²)"
          leftTextSize={12}
        />
        {Array.from({ length: quadRows }).map((_, r) =>
          Array.from({ length: quadCols }).map((__, c) => (
            <IsoBox
              key={`q-${r}-${c}`}
              x={8 + c * cubeStride}
              y={8 + r * cubeStride}
              z={35}
              dx={cubeSize}
              dy={cubeSize}
              dz={11}
              tone={cubeTone(3)}
              hatched={focusTier === undefined || focusTier === 3}
              showShadow={false}
            />
          ))
        )}
      </g>

      {/* Tier 2: O(n) */}
      <g>
        <IsoBox
          x={-16}
          y={quadD + 12}
          z={0}
          dx={linW}
          dy={linD}
          dz={26}
          tone={tierTone(2)}
          hatched={focusTier === undefined || focusTier === 2}
          showShadow={true}
          leftText="O(n)"
          leftTextSize={11.5}
        />
        {Array.from({ length: n }).map((_, c) => (
          <IsoBox
            key={`lin-${c}`}
            x={-8 + c * cubeStride}
            y={quadD + 20}
            z={27}
            dx={cubeSize}
            dy={cubeSize}
            dz={11}
            tone={cubeTone(2)}
            hatched={focusTier === undefined || focusTier === 2}
            showShadow={false}
          />
        ))}
      </g>

      {/* Tier 1: O(log n) */}
      <g>
        <IsoBox
          x={-28}
          y={quadD + linD + 24}
          z={0}
          dx={logW}
          dy={logD}
          dz={19}
          tone={tierTone(1)}
          hatched={focusTier === undefined || focusTier === 1}
          showShadow={true}
          leftText="O(log n)"
          leftTextSize={10}
        />
        {Array.from({ length: logSteps }).map((_, c) => (
          <IsoBox
            key={`log-${c}`}
            x={-20 + c * cubeStride}
            y={quadD + linD + 32}
            z={20}
            dx={cubeSize}
            dy={cubeSize}
            dz={11}
            tone={cubeTone(1)}
            hatched={focusTier === undefined || focusTier === 1}
            showShadow={false}
          />
        ))}
      </g>

      {/* Tier 0 (Front): O(1) */}
      <g>
        <IsoBox
          x={-36}
          y={quadD + linD + logD + 36}
          z={0}
          dx={constW}
          dy={constD}
          dz={13}
          tone={tierTone(0)}
          hatched={focusTier === undefined || focusTier === 0}
          showShadow={true}
          leftText="O(1)"
          leftTextSize={10.5}
        />
        <IsoBox
          x={-28}
          y={quadD + linD + logD + 44}
          z={14}
          dx={cubeSize}
          dy={cubeSize}
          dz={11}
          tone={cubeTone(0)}
          hatched={focusTier === undefined || focusTier === 0}
          showShadow={false}
        />
      </g>

      {/* Top Tag: n = X */}
      <IsoTag
        anchor={topAnchor}
        tagPos={topTagPos}
        text={tagText ?? `n = ${n}（O(n²) 要 ${quadSteps} 步）`}
        tone="coral"
      />
    </svg>
  );
}

import { IsoStripSceneState } from '../../types/course';
import { isoProject } from './isoMath';
import { IsoBox, IsoDefs, IsoTag } from './IsoPrimitives';

interface IsoStripSceneProps {
  state: IsoStripSceneState;
  onClickItem?: (index: number) => void;
}

/**
 * Versatile 2.5D isometric numbered strip engine powering:
 * - ASCII character-code mapping
 * - 0-based array lockers
 * - Sorted binary search halving
 * - Variable-height block sorting
 */
export function IsoStripScene({ state, onClickItem }: IsoStripSceneProps) {
  const { items, baseLabel, pointerIdx, tagText, tagTone = 'coral', interactive } = state;

  const count = Math.max(1, items.length);
  const slotW = count >= 7 ? 38 : count >= 6 ? 42 : 48;
  const slotD = 46;
  const gap = count >= 7 ? 7 : 10;
  const stride = slotW + gap;
  const baseLen = count * stride + 14;

  const safePtr =
    pointerIdx !== undefined && pointerIdx >= 0 && pointerIdx < count
      ? pointerIdx
      : Math.floor(count / 2);
  const ptrItem = items[safePtr];
  const ptrH = ptrItem?.height ?? 30;
  const ptrLift = ptrItem?.lift ?? 0;

  const anchor = isoProject(
    10 + safePtr * stride + slotW / 2,
    slotD / 2,
    ptrH + ptrLift + 6
  );
  const tagPos = { x: anchor.x - 10, y: anchor.y - 62 };
  const canClick = Boolean(onClickItem);

  return (
    <svg
      className="scene"
      viewBox="-135 -115 470 315"
      role="img"
      aria-label={baseLabel ?? '2.5D 等距数据方格阵列'}
    >
      <IsoDefs />

      {/* Continuous Isometric Foundation Strip */}
      <IsoBox
        x={0}
        y={-8}
        z={-16}
        dx={baseLen}
        dy={slotD + 16}
        dz={16}
        tone="ink"
        hatched={true}
        showShadow={true}
        leftText={baseLabel ?? (interactive || canClick ? '点一点方块试试看！' : '2.5D 数据方格底座')}
        leftTextSize={11}
      />

      {/* Strip Blocks */}
      {items.map((item, idx) => {
        const bx = 10 + idx * stride;
        const h = item.height ?? 30;
        const lift = item.lift ?? (item.tone === 'found' ? 12 : item.tone === 'active' ? 6 : 0);
        const tone = item.tone ?? 'paper';

        return (
          <g key={item.id}>
            <IsoBox
              x={bx}
              y={0}
              z={2 + lift}
              dx={slotW}
              dy={slotD}
              dz={h}
              tone={tone}
              hatched={tone !== 'dim'}
              showShadow={lift > 0}
              topText={item.top}
              topTextSize={item.top.length >= 3 ? 12 : 17}
              interactive={canClick}
              onClick={canClick ? () => onClickItem?.(idx) : undefined}
              ariaLabel={`第 ${idx} 号格：${item.top}${item.sub ? ` (${item.sub})` : ''}`}
            />

            {/* Front index / code plaque */}
            {item.sub !== undefined && (
              <IsoBox
                x={bx + 4}
                y={slotD + 18}
                z={-10}
                dx={slotW - 8}
                dy={20}
                dz={10}
                tone={tone === 'found' || tone === 'active' ? 'found' : 'paper'}
                hatched={false}
                showShadow={false}
                topText={item.sub}
                topTextSize={11.5}
              />
            )}
          </g>
        );
      })}

      {tagText && <IsoTag anchor={anchor} tagPos={tagPos} text={tagText} tone={tagTone} />}
    </svg>
  );
}

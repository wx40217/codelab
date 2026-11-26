import { AnimatePresence } from 'motion/react';
import { StackPlatesSceneState } from '../../types/course';
import { isoProject } from './isoMath';
import { IsoBox, IsoDefs, IsoTag } from './IsoPrimitives';

interface StackPlatesSceneProps {
  state: StackPlatesSceneState;
  onClickInbox?: () => void;
  onClickTop?: () => void;
  onClickBlocked?: (label: string) => void;
}

export function StackPlatesScene({
  state,
  onClickInbox,
  onClickTop,
  onClickBlocked,
}: StackPlatesSceneProps) {
  const { stack, inbox, out, highlightTop, op, tagText, tagAnchor = 'top' } = state;

  const blockW = 84;
  const blockD = 54;
  const blockH = 26;
  const gapZ = 4;

  // Coordinates for 3 trays along the isometric x-axis:
  // Left = INPUT tray, Center = STACK tower, Right = OUTPUT tray
  const inboxX = -126;
  const stackX = 0;
  const outX = 128;

  const topIndex = Math.max(0, stack.length - 1);
  const topBlockZ = stack.length > 0 ? stack.length * (blockH + gapZ) : 10;

  let pointerAnchor = isoProject(stackX + blockW / 2, blockD / 2, topBlockZ + 4);
  let pointerPos = { x: pointerAnchor.x + 12, y: pointerAnchor.y - 54 };

  if (tagAnchor === 'out' && out.length > 0) {
    const outTopZ = out.length * (blockH + gapZ);
    pointerAnchor = isoProject(outX + blockW / 2, blockD / 2, outTopZ + 4);
    pointerPos = { x: pointerAnchor.x + 10, y: pointerAnchor.y - 54 };
  }

  // Curved arc feed arrows from INPUT -> STACK and STACK -> OUTPUT
  const arrowInStart = isoProject(inboxX + blockW - 6, blockD / 2, 42);
  const arrowInEnd = isoProject(stackX + 10, blockD / 2, Math.max(58, topBlockZ + 12));
  const arrowOutStart = isoProject(stackX + blockW - 6, blockD / 2, Math.max(58, topBlockZ + 12));
  const arrowOutEnd = isoProject(outX + 10, blockD / 2, 44);

  return (
    <svg
      className="scene"
      viewBox="-200 -135 480 320"
      role="img"
      aria-label={`2.5D 等距栈演示：当前栈内有 ${stack.length} 块`}
    >
      <IsoDefs />

      {/* 1. INPUT Tray Platform */}
      <IsoBox
        x={inboxX - 10}
        y={-10}
        z={-14}
        dx={blockW + 20}
        dy={blockD + 20}
        dz={14}
        tone="ink"
        hatched={false}
        showShadow={true}
        leftText="待压入 INPUT"
        leftTextSize={10.5}
      />

      {/* 2. Central STACK Base Platform */}
      <IsoBox
        x={stackX - 12}
        y={-12}
        z={-16}
        dx={blockW + 24}
        dy={blockD + 24}
        dz={16}
        tone="ink"
        hatched={true}
        showShadow={true}
        leftText="栈底座 STACK"
        leftTextSize={11}
      />

      {/* 3. OUTPUT Tray Platform */}
      <IsoBox
        x={outX - 10}
        y={-10}
        z={-14}
        dx={blockW + 20}
        dy={blockD + 20}
        dz={14}
        tone="ink"
        hatched={false}
        showShadow={true}
        leftText="已弹出 OUTPUT"
        leftTextSize={10.5}
      />

      {/* Dashed Isometric Flow Arcs */}
      <path
        d={`M ${arrowInStart.x} ${arrowInStart.y} Q ${(arrowInStart.x + arrowInEnd.x) / 2} ${Math.min(arrowInStart.y, arrowInEnd.y) - 36} ${arrowInEnd.x} ${arrowInEnd.y}`}
        fill="none"
        stroke={op === 'push' ? 'var(--coral)' : 'var(--floor-ink)'}
        strokeWidth={op === 'push' ? 2.2 : 1.5}
        strokeDasharray="6 4.5"
        opacity={op === 'push' ? 1 : 0.45}
      />
      <path
        d={`M ${arrowOutStart.x} ${arrowOutStart.y} Q ${(arrowOutStart.x + arrowOutEnd.x) / 2} ${Math.min(arrowOutStart.y, arrowOutEnd.y) - 36} ${arrowOutEnd.x} ${arrowOutEnd.y}`}
        fill="none"
        stroke={op === 'pop' ? 'var(--coral)' : 'var(--floor-ink)'}
        strokeWidth={op === 'pop' ? 2.2 : 1.5}
        strokeDasharray="6 4.5"
        opacity={op === 'pop' ? 1 : 0.45}
      />

      {/* Pending Block in INPUT Tray */}
      <AnimatePresence>
        {inbox && (
          <IsoBox
            key={`inbox-${inbox.id}`}
            x={inboxX}
            y={0}
            z={2}
            dx={blockW}
            dy={blockD}
            dz={blockH}
            tone="active"
            hatched={true}
            showShadow={true}
            leftText={inbox.label}
            leftTextSize={13.5}
            interactive={Boolean(onClickInbox)}
            onClick={onClickInbox}
            ariaLabel={`点击将「${inbox.label}」压入栈顶`}
          />
        )}
      </AnimatePresence>

      {/* Stacked Vertical Isometric Blocks (bottom to top) */}
      <AnimatePresence>
        {stack.map((item, idx) => {
          const isTop = idx === topIndex;
          const extraLift = isTop && highlightTop ? 8 : 0;
          const z = idx * (blockH + gapZ) + 2 + extraLift;
          const tone = isTop && highlightTop ? (op === 'top' ? 'found' : 'active') : 'paper';
          const clickable = isTop ? Boolean(onClickTop) : Boolean(onClickBlocked);

          return (
            <IsoBox
              key={`stack-${item.id}`}
              x={stackX}
              y={0}
              z={z}
              dx={blockW}
              dy={blockD}
              dz={blockH}
              tone={tone}
              hatched={true}
              showShadow={idx === 0}
              leftText={item.label}
              leftTextSize={13.5}
              interactive={clickable}
              onClick={
                isTop
                  ? onClickTop
                  : onClickBlocked
                    ? () => onClickBlocked(item.label)
                    : undefined
              }
              ariaLabel={
                isTop
                  ? `栈顶方块「${item.label}」`
                  : `被压住的方块「${item.label}」`
              }
            />
          );
        })}
      </AnimatePresence>

      {/* Popped Blocks in OUTPUT Tray */}
      <AnimatePresence>
        {out.map((item, idx) => {
          const isNewest = idx === out.length - 1;
          const z = idx * (blockH + gapZ) + 2;
          return (
            <IsoBox
              key={`out-${item.id}`}
              x={outX}
              y={0}
              z={z}
              dx={blockW}
              dy={blockD}
              dz={blockH}
              tone={isNewest && op === 'pop' ? 'active' : 'dim'}
              hatched={isNewest && op === 'pop'}
              showShadow={idx === 0}
              leftText={item.label}
              leftTextSize={13.5}
            />
          );
        })}
      </AnimatePresence>

      {/* Floating Tag */}
      {tagText && (
        <IsoTag
          anchor={pointerAnchor}
          tagPos={pointerPos}
          text={tagText}
          tone={op === 'push' || op === 'pop' || op === 'top' ? 'coral' : 'dark'}
        />
      )}
    </svg>
  );
}

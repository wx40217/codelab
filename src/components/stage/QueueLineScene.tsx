import { AnimatePresence } from 'motion/react';
import { QueueLineSceneState } from '../../types/course';
import { isoProject } from './isoMath';
import { IsoBox, IsoDefs, IsoTag } from './IsoPrimitives';

interface QueueLineSceneProps {
  state: QueueLineSceneState;
  onClickFront?: () => void;
  onClickIncoming?: () => void;
  onClickMiddle?: (label: string) => void;
}

/**
 * 2.5D isometric FIFO queue corridor ("排队买奶茶"):
 * Front of line is on the RIGHT (closest to Milk Tea Counter), new arrivals enqueue at the LEFT back.
 */
export function QueueLineScene({
  state,
  onClickFront,
  onClickIncoming,
  onClickMiddle,
}: QueueLineSceneProps) {
  const { queue, incoming, served, op = 'idle', tagText, tagAnchor = 'front' } = state;

  const blockW = 54;
  const blockD = 50;
  const blockH = 30;
  const gap = 10;
  const stride = blockW + gap;
  const maxSlots = 4;
  const laneLen = maxSlots * stride + 18;

  // Front of queue sits at right-most slot (slot index maxSlots - 1), back grows leftward
  const slotX = (posFromFront: number) => 10 + (maxSlots - 1 - posFromFront) * stride;
  const frontX = slotX(0);
  const backPos = Math.min(maxSlots - 1, Math.max(0, queue.length - 1));
  const backX = slotX(backPos);

  const counterX = laneLen + 20;
  const incomingX = -78;

  let anchor = isoProject(frontX + blockW / 2, blockD / 2, blockH + 10);
  if (tagAnchor === 'back') {
    anchor = isoProject(backX + blockW / 2, blockD / 2, blockH + 10);
  } else if (tagAnchor === 'served') {
    anchor = isoProject(counterX + 34, blockD / 2, 46);
  }
  const tagPos = { x: anchor.x - 10, y: anchor.y - 58 };

  return (
    <svg
      className="scene"
      viewBox="-155 -115 510 310"
      role="img"
      aria-label={`2.5D 等距排队队列：当前有 ${queue.length} 位在排队`}
    >
      <IsoDefs />

      {/* Incoming Waiting Pad (Left / Back) */}
      <IsoBox
        x={incomingX - 8}
        y={-8}
        z={-14}
        dx={blockW + 16}
        dy={blockD + 16}
        dz={14}
        tone="ink"
        hatched={false}
        showShadow={true}
        leftText="新来入队"
        leftTextSize={10.5}
      />

      {/* Main Queue Walkway */}
      <IsoBox
        x={0}
        y={-8}
        z={-16}
        dx={laneLen}
        dy={blockD + 16}
        dz={16}
        tone="ink"
        hatched={true}
        showShadow={true}
        leftText="排队通道 QUEUE（先进先出 FIFO）"
        leftTextSize={11}
      />

      {/* Milk Tea Counter / Served Pad (Right / Front) */}
      <IsoBox
        x={counterX}
        y={-8}
        z={-14}
        dx={72}
        dy={blockD + 16}
        dz={14}
        tone="ink"
        hatched={false}
        showShadow={true}
        leftText="出队取餐"
        leftTextSize={10.5}
      />

      {/* Incoming Customer Block */}
      <AnimatePresence>
        {incoming && (
          <IsoBox
            key={`in-${incoming.id}`}
            x={incomingX}
            y={0}
            z={2}
            dx={blockW}
            dy={blockD}
            dz={blockH}
            tone="active"
            hatched={true}
            showShadow={true}
            topText="新来"
            topTextSize={11}
            leftText={incoming.label}
            leftTextSize={12.5}
            interactive={Boolean(onClickIncoming)}
            onClick={onClickIncoming}
            ariaLabel={`点击让「${incoming.label}」排到队尾`}
          />
        )}
      </AnimatePresence>

      {/* Queued Customers (render back-to-front along +x, i.e., posFromFront from queue.length-1 down to 0) */}
      <AnimatePresence>
        {[...queue].reverse().map((item, revIdx) => {
          const posFromFront = queue.length - 1 - revIdx;
          const isFront = posFromFront === 0;
          const isBack = posFromFront === queue.length - 1;
          const bx = slotX(Math.min(maxSlots - 1, posFromFront));
          const tone =
            isFront
              ? 'found'
              : isBack && op === 'enqueue'
                ? 'active'
                : 'paper';

          return (
            <IsoBox
              key={`q-${item.id}`}
              x={bx}
              y={0}
              z={isFront ? 6 : 2}
              dx={blockW}
              dy={blockD}
              dz={blockH}
              tone={tone}
              hatched={true}
              showShadow={isFront}
              topText={isFront ? '队头' : `#${posFromFront + 1}`}
              topTextSize={12}
              leftText={item.label}
              leftTextSize={12.5}
              interactive={isFront ? Boolean(onClickFront) : Boolean(onClickMiddle)}
              onClick={
                isFront
                  ? onClickFront
                  : onClickMiddle
                    ? () => onClickMiddle(item.label)
                    : undefined
              }
              ariaLabel={`${isFront ? '队头' : '排队中'}：${item.label}`}
            />
          );
        })}
      </AnimatePresence>

      {/* Latest Served Customer on Counter */}
      <AnimatePresence>
        {served.length > 0 && (
          <IsoBox
            key={`served-${served[served.length - 1].id}`}
            x={counterX + 9}
            y={0}
            z={2}
            dx={blockW}
            dy={blockD}
            dz={blockH}
            tone={op === 'dequeue' ? 'active' : 'dim'}
            hatched={op === 'dequeue'}
            showShadow={true}
            topText="🧋"
            topTextSize={14}
            leftText={served[served.length - 1].label}
            leftTextSize={12.5}
          />
        )}
      </AnimatePresence>

      {tagText && (
        <IsoTag
          anchor={anchor}
          tagPos={tagPos}
          text={tagText}
          tone={op === 'enqueue' || op === 'dequeue' ? 'coral' : 'dark'}
        />
      )}
    </svg>
  );
}

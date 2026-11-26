import { PixelGridSceneState } from '../../types/course';
import { isoProject } from './isoMath';
import { IsoBox, IsoDefs, IsoTag } from './IsoPrimitives';

interface PixelGridSceneProps {
  state: PixelGridSceneState;
  onTogglePixel?: (cellIndex: number) => void;
}

export function PixelGridScene({ state, onTogglePixel }: PixelGridSceneProps) {
  const {
    rows,
    cols,
    pixels,
    highlightRow,
    highlightCell,
    baseLabel,
    tagText,
    tagTone = 'coral',
    interactive,
  } = state;

  const cellSize = 32;
  const gap = 4;
  const stride = cellSize + gap;
  const boardW = cols * stride + 14;
  const boardD = rows * stride + 14;

  const anchorRow = highlightRow !== undefined ? highlightRow : 0;
  const anchorCol =
    highlightCell !== undefined ? highlightCell % cols : Math.floor(cols / 2);
  const anchorR =
    highlightCell !== undefined ? Math.floor(highlightCell / cols) : anchorRow;

  const anchor = isoProject(
    9 + anchorCol * stride + cellSize / 2,
    9 + anchorR * stride + cellSize / 2,
    30
  );
  const tagPos = { x: anchor.x + 12, y: anchor.y - 62 };
  const canClick = Boolean(onTogglePixel);

  return (
    <svg
      className="scene"
      viewBox="-195 -105 420 315"
      role="img"
      aria-label={`2.5D 等距 ${rows}×${cols} 像素画网格`}
    >
      <IsoDefs />

      {/* Isometric Pixel Frame Base */}
      <IsoBox
        x={0}
        y={0}
        z={-16}
        dx={boardW}
        dy={boardD}
        dz={16}
        tone="ink"
        hatched={true}
        showShadow={true}
        leftText={baseLabel ?? (interactive || canClick ? '点击格子画画（0 / 1）' : `${rows}×${cols} 像素画板`)}
        leftTextSize={11}
      />

      {/* Render back-to-front (row 0..rows-1, col 0..cols-1) */}
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((__, c) => {
          const idx = r * cols + c;
          const isOn = pixels[idx] === 1;
          const isRowHi = highlightRow === r;
          const isCellHi = highlightCell === idx;
          const x = 9 + c * stride;
          const y = 9 + r * stride;

          const tone = isOn
            ? isCellHi
              ? 'found'
              : 'active'
            : isRowHi || isCellHi
              ? 'paper'
              : 'dim';

          return (
            <IsoBox
              key={`px-${r}-${c}`}
              x={x}
              y={y}
              z={isOn ? 6 : 0}
              dx={cellSize}
              dy={cellSize}
              dz={isOn ? 18 : 6}
              tone={tone}
              hatched={isOn}
              showShadow={false}
              topText={isOn ? '1' : '0'}
              topTextSize={11}
              interactive={canClick}
              onClick={canClick ? () => onTogglePixel?.(idx) : undefined}
              ariaLabel={`第 ${r + 1} 行第 ${c + 1} 列像素，当前 ${isOn ? 1 : 0}`}
            />
          );
        })
      )}

      {tagText && <IsoTag anchor={anchor} tagPos={tagPos} text={tagText} tone={tagTone} />}
    </svg>
  );
}

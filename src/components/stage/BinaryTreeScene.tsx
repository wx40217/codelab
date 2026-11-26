import { BinaryTreeSceneState, TreeNodeItem } from '../../types/course';
import { isoProject } from './isoMath';
import { IsoBox, IsoDefs, IsoTag } from './IsoPrimitives';

interface BinaryTreeSceneProps {
  state: BinaryTreeSceneState;
  onClickNode?: (nodeId: string) => void;
}

// 3D isometric floor coordinates matching Algo Lab's iconic 3-level binary tree layout
function getNodeCoords(level: 0 | 1 | 2, slot: number): { x: number; y: number } {
  if (level === 0) return { x: 0, y: 0 };
  if (level === 1) {
    return slot === 0 ? { x: -45, y: 88 } : { x: 100, y: 45 };
  }
  const coords = [
    { x: -102, y: 162 },
    { x: -8, y: 175 },
    { x: 75, y: 122 },
    { x: 175, y: 98 },
  ];
  return coords[slot] ?? { x: 0, y: 140 };
}

function getParentKey(level: 0 | 1 | 2, slot: number): { level: 0 | 1; slot: number } | null {
  if (level === 0) return null;
  if (level === 1) return { level: 0, slot: 0 };
  return { level: 1, slot: Math.floor(slot / 2) };
}

export function BinaryTreeScene({ state, onClickNode }: BinaryTreeSceneProps) {
  const { nodes, focusNodeId, tagText, tagTone = 'coral' } = state;

  const boxSize = 40;
  const boxH = 28;
  const canClick = Boolean(onClickNode);

  const nodeByPos = new Map<string, TreeNodeItem>();
  for (const n of nodes) {
    nodeByPos.set(`${n.level}-${n.slot}`, n);
  }

  // Sort back-to-front by x + y so isometric cubes overlap naturally
  const sortedNodes = [...nodes].sort((a, b) => {
    const ca = getNodeCoords(a.level, a.slot);
    const cb = getNodeCoords(b.level, b.slot);
    return ca.x + ca.y - (cb.x + cb.y);
  });

  const focusNode =
    nodes.find((n) => n.id === focusNodeId) ?? nodes[0];
  const focusPos = focusNode
    ? getNodeCoords(focusNode.level, focusNode.slot)
    : { x: 0, y: 0 };
  const anchor = isoProject(focusPos.x + boxSize / 2, focusPos.y + boxSize / 2, boxH + 6);
  const tagPos = { x: anchor.x - 16, y: anchor.y - 54 };

  return (
    <svg
      className="scene"
      viewBox="-245 -85 480 300"
      role="img"
      aria-label={`2.5D 等距二叉树图解，共 ${nodes.length} 个节点`}
    >
      <IsoDefs />

      {/* Branch Connector Lines on the Isometric Floor Plane */}
      {nodes.map((node) => {
        const parentKey = getParentKey(node.level, node.slot);
        if (!parentKey) return null;
        const parent = nodeByPos.get(`${parentKey.level}-${parentKey.slot}`);
        if (!parent) return null;

        const pPos = getNodeCoords(parent.level, parent.slot);
        const cPos = getNodeCoords(node.level, node.slot);
        const p2d = isoProject(pPos.x + boxSize / 2, pPos.y + boxSize / 2, 10);
        const c2d = isoProject(cPos.x + boxSize / 2, cPos.y + boxSize / 2, 10);

        return (
          <line
            key={`edge-${parent.id}-${node.id}`}
            x1={p2d.x}
            y1={p2d.y}
            x2={c2d.x}
            y2={c2d.y}
            stroke="var(--floor-ink)"
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.78}
          />
        );
      })}

      {/* Isometric Tree Node Cubes */}
      {sortedNodes.map((node) => {
        const pos = getNodeCoords(node.level, node.slot);
        const isFocus = node.id === focusNodeId;
        const tone = node.tone ?? (isFocus ? 'found' : 'paper');

        return (
          <IsoBox
            key={node.id}
            x={pos.x}
            y={pos.y}
            z={isFocus ? 8 : 0}
            dx={boxSize}
            dy={boxSize}
            dz={boxH}
            tone={tone}
            hatched={tone !== 'dim'}
            showShadow={true}
            topText={node.label}
            topTextSize={node.label.length > 2 ? 12 : 17}
            interactive={canClick}
            onClick={canClick ? () => onClickNode?.(node.id) : undefined}
            ariaLabel={`节点 ${node.label}`}
          />
        );
      })}

      {tagText && <IsoTag anchor={anchor} tagPos={tagPos} text={tagText} tone={tagTone} />}
    </svg>
  );
}

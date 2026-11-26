import { ReactNode } from 'react';
import { SceneState } from '../../types/course';
import { ConfettiBurst } from '../ConfettiBurst';
import { BinaryBitsScene } from './BinaryBitsScene';
import { PixelGridScene } from './PixelGridScene';
import { IsoStripScene } from './IsoStripScene';
import { RobotLoopScene } from './RobotLoopScene';
import { VariableBoxScene } from './VariableBoxScene';
import { StackPlatesScene } from './StackPlatesScene';
import { QueueLineScene } from './QueueLineScene';
import { BinaryTreeScene } from './BinaryTreeScene';
import { GrowthStairsScene } from './GrowthStairsScene';

export interface StageInteractionHandlers {
  onToggleBit?: (index: number) => void;
  onTogglePixel?: (cellIndex: number) => void;
  onClickStripItem?: (index: number) => void;
  onClickStackInbox?: () => void;
  onClickStackTop?: () => void;
  onClickStackBlocked?: (label: string) => void;
  onClickQueueFront?: () => void;
  onClickQueueIncoming?: () => void;
  onClickQueueMiddle?: (label: string) => void;
  onClickTreeNode?: (nodeId: string) => void;
}

interface IsoStageRouterProps extends StageInteractionHandlers {
  state: SceneState;
  confettiKey?: number;
  stageOverlay?: ReactNode;
}

/**
 * Wraps the isometric diamond perspective floor grid (.stage-grid),
 * celebration confetti burst, optional floating stage play button,
 * and routes declaratively to all 9 2.5D SVG scene engines.
 */
export function IsoStageRouter({
  state,
  confettiKey = 0,
  stageOverlay,
  onToggleBit,
  onTogglePixel,
  onClickStripItem,
  onClickStackInbox,
  onClickStackTop,
  onClickStackBlocked,
  onClickQueueFront,
  onClickQueueIncoming,
  onClickQueueMiddle,
  onClickTreeNode,
}: IsoStageRouterProps) {
  return (
    <section className="panel system-view" aria-label="2.5D 等距图解舞台">
      <div className="system-view__stage">
        {/* 25-degree Isometric Diamond Floor Pattern matching Algo Lab */}
        <svg
          className="stage-grid"
          viewBox="0 0 800 480"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="sc-floor"
              width="50.75"
              height="23.67"
              patternUnits="userSpaceOnUse"
            >
              <path d="M0 11.835 L25.375 0 L50.75 11.835 L25.375 23.67 Z" />
            </pattern>
          </defs>
          <rect x="-100" y="-100" width="1000" height="680" fill="url(#sc-floor)" />
        </svg>

        {state.scene === 'binary-bits' && (
          <BinaryBitsScene state={state} onToggleBit={onToggleBit} />
        )}
        {state.scene === 'pixel-grid' && (
          <PixelGridScene state={state} onTogglePixel={onTogglePixel} />
        )}
        {state.scene === 'iso-strip' && (
          <IsoStripScene state={state} onClickItem={onClickStripItem} />
        )}
        {state.scene === 'robot-loop' && <RobotLoopScene state={state} />}
        {state.scene === 'variable-box' && <VariableBoxScene state={state} />}
        {state.scene === 'stack-plates' && (
          <StackPlatesScene
            state={state}
            onClickInbox={onClickStackInbox}
            onClickTop={onClickStackTop}
            onClickBlocked={onClickStackBlocked}
          />
        )}
        {state.scene === 'queue-line' && (
          <QueueLineScene
            state={state}
            onClickFront={onClickQueueFront}
            onClickIncoming={onClickQueueIncoming}
            onClickMiddle={onClickQueueMiddle}
          />
        )}
        {state.scene === 'binary-tree' && (
          <BinaryTreeScene state={state} onClickNode={onClickTreeNode} />
        )}
        {state.scene === 'growth-stairs' && <GrowthStairsScene state={state} />}

        <ConfettiBurst burstKey={confettiKey} />

        {stageOverlay && (
          <div
            style={{
              position: 'absolute',
              left: 12,
              bottom: 12,
              zIndex: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {stageOverlay}
          </div>
        )}
      </div>
    </section>
  );
}

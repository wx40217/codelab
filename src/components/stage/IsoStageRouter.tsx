import { SceneState } from '../../types/course';
import { BinaryBitsScene } from './BinaryBitsScene';
import { RobotLoopScene } from './RobotLoopScene';
import { StackPlatesScene } from './StackPlatesScene';

interface IsoStageRouterProps {
  state: SceneState;
  onToggleBit?: (index: number) => void;
}

/**
 * Wraps the isometric diamond perspective floor grid (.stage-grid)
 * and routes declaratively to the matching 2.5D SVG scene engine.
 */
export function IsoStageRouter({ state, onToggleBit }: IsoStageRouterProps) {
  return (
    <section className="panel system-view" aria-label="2.5D 等距图解舞台">
      <div className="system-view__stage">
        {/* 25-degree Isometric Diamond Floor Pattern matching Algo Lab */}
        <svg className="stage-grid" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
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
        {state.scene === 'robot-loop' && <RobotLoopScene state={state} />}
        {state.scene === 'stack-plates' && <StackPlatesScene state={state} />}
      </div>
    </section>
  );
}

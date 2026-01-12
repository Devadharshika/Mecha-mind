// core/sim/control/ControlSource.ts

import type { MotionCommand } from "../motors/commands";

export interface ControlSource {
  produce(frame: {
    resetId: number;
    step: number;
  }): MotionCommand[] | null;
}

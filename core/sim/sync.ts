// core/sim/sync.ts
import { simService } from "./simService";

/**
 * Apply current sim transforms into the assembly via the store dispatch.
 * The caller should pass the dispatch obtained from useAssembly().
 *
 * Example usage:
 *  const { state, dispatch } = useAssembly();
 *  applySimToAssembly(dispatch);
 */
export function applySimToAssembly(dispatch: React.Dispatch<any>) {
  const sim = simService.state;
  for (const id of Object.keys(sim.entities)) {
    const ent = sim.entities[id];
    // dispatch an action to update node transform
    dispatch({
      type: "APPLY_NODE_TRANSFORM",
      nodeId: id,
      transform: { pos: ent.position, rot: ent.rotation },
    });
  }
}

// core/sim/simService.ts
import { createEmptyState, type SimState } from "./simState";
import { SimRunner } from "./simRunner";
import { PhysicsEngine } from "./physicsEngine";
import { assemblyNodesToSimEntities, assemblyJointsToSimJoints } from "./adapter";
import type { AssemblyState } from "../assemblyTypes";

/**
 * SimService no longer imports the React store.
 * Call createSnapshotFromAssembly(snapshot) with the AssemblyState you get from useAssembly().
 */
export class SimService {
  public state: SimState;
  public phys: PhysicsEngine;
  public runner: SimRunner;
  private subscribers: Array<(s: SimState) => void> = [];

  constructor() {
    this.state = createEmptyState();
    this.phys = new PhysicsEngine({ gravity: this.state.gravity });
    this.runner = new SimRunner(this.state, { timestep: 1 / 60, onStep: (dt, s) => this.onStep(dt, s) });
  }

  createSnapshotFromAssembly(assemblyState: AssemblyState) {
    const nodes = assemblyState.nodes ?? {};
    const entities = assemblyNodesToSimEntities(nodes);
    this.state.entities = Object.fromEntries(entities.map((e) => [e.id, e]));

    // If you have joints in assemblyState (not present in your store now), adapt this
    const jointsRaw = (assemblyState as any).joints ?? [];
    const joints = assemblyJointsToSimJoints(jointsRaw);
    this.state.joints = Object.fromEntries(joints.map((j) => [j.id, j]));

    this.state.time = 0;
    this.phys.initialize(this.state);
    this.emit();
  }

  start() { this.runner.start(); }
  pause() { this.runner.pause(); }
  reset(recreateSnapshot = false) {
    this.runner.reset();
    if (recreateSnapshot) {
      // caller should call createSnapshotFromAssembly again with the latest assemblyState
    }
    this.emit();
  }
  stepOnce() { this.runner.stepOnce(); }

  subscribe(cb: (s: SimState) => void) {
    this.subscribers.push(cb);
    cb(this.state);
    return () => { this.subscribers = this.subscribers.filter(c => c !== cb); };
  }

  private onStep(_dt: number, _state: SimState) {
    this.emit();
  }

  private emit() {
    this.subscribers.forEach(cb => { try { cb(this.state); } catch (e) { /* swallow */ } });
  }
}

export const simService = new SimService();

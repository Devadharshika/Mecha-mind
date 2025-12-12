// core/sim/simRunner.ts
import { SimState } from "./simState";

export type StepCallback = (dt: number, state: SimState) => void;

export class SimRunner {
  state: SimState;
  timestep: number;
  private lastTs?: number;
  private raf?: number;
  private onStep?: StepCallback;

  constructor(state: SimState, opts?: { timestep?: number; onStep?: StepCallback }) {
    this.state = state;
    this.timestep = opts?.timestep ?? 1 / 60;
    this.onStep = opts?.onStep;
  }

  start() {
    if (this.state.running) return;
    this.state.running = true;
    this.lastTs = performance.now();
    this.raf = requestAnimationFrame(this.loop.bind(this));
  }

  pause() {
    this.state.running = false;
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = undefined;
    }
  }

  reset() {
    this.state.time = 0;
  }

  stepOnce() {
    this._step(this.timestep);
  }

  setStepCallback(cb?: StepCallback) {
    this.onStep = cb;
  }

  private loop(ts: number) {
    if (!this.state.running) return;
    const dtReal = (ts - (this.lastTs ?? ts)) / 1000;
    this.lastTs = ts;

    const maxSteps = 5;
    let acc = dtReal;
    let steps = 0;
    while (acc >= this.timestep && steps < maxSteps) {
      this._step(this.timestep);
      acc -= this.timestep;
      steps++;
    }

    if (acc > 1e-6 && steps < maxSteps) {
      this._step(acc);
    }

    this.raf = requestAnimationFrame(this.loop.bind(this));
  }

  private _step(dt: number) {
    this.state.time += dt;
    if (this.onStep) this.onStep(dt, this.state);
  }
}

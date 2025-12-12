// core/sim/simServiceDiagnostic.ts
import { simService } from "./simService";

/**
 * Attach simple diagnostic helpers to `window.testSim` for manual testing.
 * Only used in dev. Does not modify simService behavior.
 */
export function attachSimDiagnostics() {
  if (typeof window === "undefined") return;

  (window as any).testSim = {
    start: () => {
      try { simService.start(); console.log("testSim.start() called"); }
      catch (e) { console.error("testSim.start() error", e); }
    },
    pause: () => {
      try { simService.pause(); console.log("testSim.pause() called"); }
      catch (e) { console.error("testSim.pause() error", e); }
    },
    step: () => {
      try { simService.stepOnce(); console.log("testSim.step() called"); }
      catch (e) { console.error("testSim.step() error", e); }
    },
    reset: () => {
      try { simService.reset(true); console.log("testSim.reset(true) called"); }
      catch (e) { console.error("testSim.reset() error", e); }
    },
    state: () => {
      try { console.log(simService.state); return simService.state; }
      catch (e) { console.error("testSim.state() error", e); return undefined; }
    },
    subscribeOnce: (cb: (s: any) => void) => {
      try {
        const unsub = simService.subscribe((s: any) => {
          try { cb(s); } catch (err) { console.error("subscribeOnce cb error", err); }
          unsub();
        });
      } catch (e) { console.error("subscribeOnce error", e); }
    },
  };

  console.info("%cSim Diagnostics attached → use `testSim` in the browser console", "color:cyan");
}

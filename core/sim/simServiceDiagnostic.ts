import { simService } from "./simService";

/**
 * Dev-only simulation diagnostics.
 * Exposes helpers to the browser console as `window.testSim`.
 * Does NOT modify simService behavior.
 * Safe for research usage.
 */

export function attachSimDiagnostics() {
  if (typeof window === "undefined") return;

  (window as any).testSim = {

    /* -------------------------------------------------
       Continuous Mode Controls
    ------------------------------------------------- */

    start: () => {
      try {
        simService.start();
        console.log("testSim.start()");
      } catch (e) {
        console.error("testSim.start() error", e);
      }
    },

    pause: () => {
      try {
        simService.pause();
        console.log("testSim.pause()");
      } catch (e) {
        console.error("testSim.pause() error", e);
      }
    },

    reset: () => {
      try {
        simService.reset();
        console.log("testSim.reset()");
      } catch (e) {
        console.error("testSim.reset() error", e);
      }
    },

    /* -------------------------------------------------
       Deterministic Research Step
       Executes exactly one fixed integration.
    ------------------------------------------------- */

    step: (dt?: number) => {
      try {
        simService.stepOnce(dt);
        console.log("testSim.stepOnce()", dt ?? "(default dt)");
      } catch (e) {
        console.error("testSim.stepOnce() error", e);
      }
    },

    /* -------------------------------------------------
       Introspection
    ------------------------------------------------- */

    state: () => {
      try {
        console.log(simService.state);
        return simService.state;
      } catch (e) {
        console.error("testSim.state() error", e);
        return undefined;
      }
    },

    /* -------------------------------------------------
       One-shot subscription (safe auto-unsubscribe)
    ------------------------------------------------- */

    subscribeOnce: (cb: (s: any) => void) => {
      try {
        let unsub: (() => void) | null = null;

        unsub = simService.subscribe((s: any) => {
          try {
            cb(s);
          } catch (err) {
            console.error("subscribeOnce callback error", err);
          }

          if (unsub) {
            unsub();
            unsub = null;
          }
        });

      } catch (e) {
        console.error("testSim.subscribeOnce() error", e);
      }
    },
  };

  console.info(
    "%cSim Diagnostics attached → use `testSim` in the browser console",
    "color: cyan"
  );
}
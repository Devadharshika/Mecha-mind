// core/validation/index.ts

import type { AssemblyState } from "../assemblyTypes";
import { diagnoseAssembly } from "./assemblyDiagnostics";

/* =========================================================
   Validation Entry Point
   ========================================================= */

export function validateAssembly(state: AssemblyState) {
  return diagnoseAssembly(state);
}

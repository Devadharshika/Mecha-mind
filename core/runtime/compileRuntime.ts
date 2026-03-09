import type { AssemblyState } from "../assemblyTypes";
import { compileAssembly } from "../compiler/compileAssembly";
import { simService } from "../sim/simService";
import type { CompileResult, CompileError } from "../compiler/types";

export interface CompileRuntimeResult {
  success: boolean;
  errors: CompileError[];
}

export async function compileFromAssembly(
  assemblyState: AssemblyState
): Promise<CompileRuntimeResult> {

  const result: CompileResult = await compileAssembly(assemblyState);

  if (!result.success || !result.spec) {
    return {
      success: false,
      errors: result.errors,
    };
  }

  await simService.initializeFromSpec(result.spec);

  return {
    success: true,
    errors: [],
  };
}
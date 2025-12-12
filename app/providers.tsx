"use client";

import React from "react";
import { AssemblyProvider } from "../store/assemblyStore";

/**
 * Client-side Providers wrapper.
 * Add any other client-only providers (theme, auth, toasts) here later.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <AssemblyProvider>{children}</AssemblyProvider>;
}

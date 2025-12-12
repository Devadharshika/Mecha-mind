// app/providers.tsx (client)
"use client";
import React, { useEffect } from "react";
import { AssemblyProvider } from "../store/assemblyStore";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
      // NOTE: relative path from app/providers.tsx -> core/sim/simServiceDiagnostic.ts
      import("../core/sim/simServiceDiagnostic")
        .then((m) => m.attachSimDiagnostics())
        .catch((e) => console.warn("Failed to attach sim diagnostics", e));
    }
  }, []);

  return <AssemblyProvider>{children}</AssemblyProvider>;
}

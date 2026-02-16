import { createContext, useContext } from "react";
import type { ProjectCompilation } from "../abstractions/scripting/Compilation";

interface IProjectCompilationContext {
  projectCompilation: ProjectCompilation | undefined;
}

export const ProjectCompilationContext = createContext<IProjectCompilationContext | null>(null);

export function useProjectCompilation() {
  const context = useContext(ProjectCompilationContext);
  if (!context) {
    throw new Error("useProjectCompilation must be used within a ProjectCompilationProvider");
  }
  return context;
}

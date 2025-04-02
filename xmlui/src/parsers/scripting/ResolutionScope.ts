import { FunctionDeclaration, Identifier } from "../../abstractions/scripting/ScriptingSourceTree";

// --- and statements are resolved
export type ResolutionScope = {
  // --- Hash of top-level idesntifiers (variables, functions)
  topLevelNames: Record<string, Identifier | FunctionDeclaration | boolean>;

  // --- Dependency strings of top-level identifiers
  topLevelDeps: Record<string, string[]>;

  // --- All dependencies
  allDeps: string[];
}

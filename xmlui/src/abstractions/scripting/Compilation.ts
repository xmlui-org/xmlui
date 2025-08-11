import type { ComponentDef, CompoundComponentDef } from "../ComponentDefs";
import type { ThemeDefinition } from "../ThemingDefs";
import type { Expression, Statement } from "../../components-core/script-runner/ScriptingSourceTree";

/** Contains the compilation result of a project */
export type ProjectCompilation = {
  /** The compiled Main.xmlui file (with its optional code behind) */
  entrypoint: EntrypointCompilation;

  /** The compiled component files (with their optional code behind) */
  components: ComponentCompilation[];

  /** The compiled theme files */
  themes: Record<string, ThemeDefinition>;
};

/** The compilation result of a single file */
export type FileCompilation = EntrypointCompilation | ComponentCompilation;

type CompilationUnit = {
  /** The file name */
  filename: string;
  /** Optional markup source (used in dev mode) */
  markupSource?: string;
  /** Optional code behind source (used in dev mode) */
  codeBehindSource?: string;
  /** Other (non-core) component names this component depends on */
  dependencies: Set<string>;
};

export type ComponentCompilation = CompilationUnit & {
  /** The compiled markup of the component file */
  definition: CompoundComponentDef;
};

export type EntrypointCompilation = CompilationUnit & {
  /** The compiled markup of the main file */
  definition: ComponentDef;
};

export type ParsedEventValue = {
  __PARSED: true;
  parseId: number;
  statements: Statement[];
  source?: string;
}

// --- The parsed property value (if defined by an attribute value)
export type ParsedPropertyValue = {
  // --- We recognize this as a parsed property value
  __PARSED: true;

  // --- ID used for caching the parsed property value
  parseId: number;

  // --- The property segments
  segments?: PropertySegment[];
};

// --- The compliation result of a single property
export type PropertySegment = {
  literal?: string;
  expr?: Expression;
  deps?: string[];
};

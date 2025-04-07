import { ComponentDef, CompoundComponentDef } from "../ComponentDefs";
import { ThemeDefinition } from "../ThemingDefs";
import { Expression, Statement } from "./ScriptingSourceTree";

// --- Contains the compilation result of a project
export type ProjectCompilation = {
  // --- The compiled Main.xmlui file (with its optional code behind)
  entrypoint: FileCompilation;

  // --- The compiled component files (with their optional code behind)
  components: FileCompilation[];

  // --- The compiled theme files
  themes: Record<string, ThemeDefinition>;
};

// --- The compilation result of a single file
export type FileCompilation = {
  // --- The file name
  filename: string;

  // --- The component name (if the component is a compound component)
  componentName?: string;

  // --- The compiled markup of the main file or component file
  definition: ComponentDef | CompoundComponentDef;

  // --- Optional markup source (used in dev mode)
  markupSource?: string;

  // --- Optional code behind source (used in dev mode)
  codeBehindSource?: string;

  // --- Other (non-core) component names this component depends on
  dependencies: string[];
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

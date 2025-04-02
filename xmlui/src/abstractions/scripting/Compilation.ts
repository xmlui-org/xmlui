import { ComponentDef, CompoundComponentDef } from "../ComponentDefs";
import { ThemeDefinition } from "../ThemingDefs";

export type ProjectCompilation = {
  entrypoint: FileCompilation;
  components: FileCompilation[];
  themes: Record<string, ThemeDefinition>;
}

export type FileCompilation = {
  filename: string;
  componentName?: string;
  definition: ComponentDef | CompoundComponentDef;
  markupSource?: string;
  codeBehindSource?: string;
  dependencies: string[];
}
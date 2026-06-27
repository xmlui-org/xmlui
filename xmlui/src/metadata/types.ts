export const XMLUI_METADATA_SCHEMA_VERSION = 1 as const;

export type XmluiMetadataArtifact = {
  schemaVersion: typeof XMLUI_METADATA_SCHEMA_VERSION;
  generatedAt: string;
  components: XmluiComponentMetadata[];
  globals: XmluiGlobalMetadata[];
  diagnostics: XmluiDiagnosticMetadata[];
  examples: XmluiExampleMetadata[];
  source: {
    compilerVersion: string;
    contractHash: string;
  };
};

export type XmluiComponentMetadata = {
  name: string;
  kind: "builtin" | "user" | "extension";
  category: string;
  description: string;
  docsPath?: string;
  allowsChildren: boolean;
  acceptsArbitraryProps: boolean;
  declarations: {
    local: boolean;
    global: boolean;
  };
  props: XmluiMemberMetadata[];
  events: XmluiEventMetadata[];
  templates: XmluiMemberMetadata[];
  contextVariables: XmluiMemberMetadata[];
  apis: XmluiMemberMetadata[];
  parts: XmluiMemberMetadata[];
  themeVars: XmluiMemberMetadata[];
  defaultThemeVars: Record<string, string | number | boolean>;
  toneSpecificThemeVars: Record<string, Record<string, string>>;
  layoutProps: boolean;
  source?: {
    id: string;
    start?: number;
    end?: number;
  };
  examples: string[];
};

export type XmluiMemberMetadata = {
  name: string;
  type: string;
  description: string;
  required: boolean;
  expressionSupported: boolean;
  deprecated?: string;
  enumValues?: string[];
};

export type XmluiEventMetadata = XmluiMemberMetadata & {
  attributeName: string;
  async: boolean;
};

export type XmluiGlobalMetadata = {
  name: string;
  kind: "special" | "function";
  description: string;
};

export type XmluiDiagnosticMetadata = {
  code: string;
  category: "parser" | "compiler" | "contract" | "metadata";
  severity: "error" | "warning";
  description: string;
};

export type XmluiExampleMetadata = {
  name: string;
  path: string;
  demonstratesMutation: boolean;
  components: string[];
};

export type XmluiUnifiedDiagnostic = {
  code: string;
  category: "parser" | "compiler" | "contract" | "metadata";
  message: string;
  severity: "error" | "warning";
  sourceId: string;
  start: number;
  end: number;
  line: number;
  character: number;
  endLine: number;
  endCharacter: number;
};

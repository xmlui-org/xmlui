import type { ParserDiagnostic } from "../../parser";

export type XmluiContractDiagnosticCode =
  | "XC001"
  | "XC002"
  | "XC003"
  | "XC004"
  | "XC005"
  | "XC006"
  | "XC007";

export type XmluiComponentContractKind = "builtin" | "user";

export type XmluiDeclarationPermission = {
  local?: boolean;
  global?: boolean;
};

export type XmluiPropContract = {
  name: string;
};

export type XmluiEventContract = {
  name: string;
  attributeName: string;
};

export type XmluiTemplateContract = {
  name: string;
};

export type XmluiContextVariableContract = {
  name: string;
};

export type XmluiApiContract = {
  name: string;
};

export type XmluiComponentContract = {
  name: string;
  kind: XmluiComponentContractKind;
  acceptsArbitraryProps?: boolean;
  allowsChildren: boolean;
  declarations: XmluiDeclarationPermission;
  props: Record<string, XmluiPropContract>;
  events: Record<string, XmluiEventContract>;
  templates?: Record<string, XmluiTemplateContract>;
  contextVariables?: Record<string, XmluiContextVariableContract>;
  apis?: Record<string, XmluiApiContract>;
};

export type XmluiContractRegistry = {
  components: ReadonlyMap<string, XmluiComponentContract>;
  get(name: string): XmluiComponentContract | undefined;
  has(name: string): boolean;
  list(): XmluiComponentContract[];
};

export type XmluiContractDiagnostic = ParserDiagnostic & {
  code: XmluiContractDiagnosticCode;
};

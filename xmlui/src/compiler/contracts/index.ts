export { builtInComponentContracts, normalizeEventName } from "./builtins";
export { contractFromMetadata, type MetadataContractOptions } from "./fromMetadata";
export { contractRegistryToLspMetadata, type XmluiContractMetadata } from "./lsp";
export {
  createContractRegistry,
  createUserComponentContract,
  isValidUserComponentName,
  type CreateContractRegistryOptions,
} from "./registry";
export { validateManagedReactContracts } from "./validate";
export type {
  XmluiComponentContract,
  XmluiComponentContractKind,
  XmluiContractDiagnostic,
  XmluiContractDiagnosticCode,
  XmluiContractRegistry,
  XmluiDeclarationPermission,
  XmluiEventContract,
  XmluiPropContract,
} from "./types";

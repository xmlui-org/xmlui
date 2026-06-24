export {
  createXmluiModule,
  mountXmluiApp,
  renderXmluiApp,
  startApp,
  XmluiRoot,
  type MountXmluiAppOptions,
  type XmluiDocumentInput,
  type XmluiModule,
} from "./runtime";
export {
  StandaloneExtensionManager,
  extensionComponentNames,
  globalExtensionManager,
  listRegisteredExtensions,
  normalizeExtensions,
  registerExtension,
  type ComponentExtension,
  type Extension,
  type ExtensionRegisteredCallback,
  type ThemeDefinition,
  type XmluiExtensionComponent,
  type XmluiExtensionComponentProps,
} from "./extensions";

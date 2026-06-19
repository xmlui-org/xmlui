import {
  exposeStandaloneGlobal,
  installStandaloneAutoStart,
  loadStandaloneXmluiApp,
  createElement,
  renderStandaloneXmluiApp,
  registerExtension,
  standaloneExtensionManager,
  startApp,
} from "./bootstrap";
import { StandaloneExtensionManager } from "./extensionManager";

exposeStandaloneGlobal();
installStandaloneAutoStart();

export {
  StandaloneExtensionManager,
  createElement,
  loadStandaloneXmluiApp,
  renderStandaloneXmluiApp,
  registerExtension,
  standaloneExtensionManager as standalone,
  startApp,
};

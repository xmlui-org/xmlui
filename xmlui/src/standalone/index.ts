import {
  exposeStandaloneGlobal,
  installStandaloneAutoStart,
  loadStandaloneXmluiApp,
  renderStandaloneXmluiApp,
  standaloneExtensionManager,
  startApp,
} from "./bootstrap";
import { StandaloneExtensionManager } from "./extensionManager";

exposeStandaloneGlobal();
installStandaloneAutoStart();

export {
  StandaloneExtensionManager,
  loadStandaloneXmluiApp,
  renderStandaloneXmluiApp,
  standaloneExtensionManager as standalone,
  startApp,
};


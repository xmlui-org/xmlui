import { StandaloneApp, type StandaloneExtensionManager } from "xmlui";
import { StandaloneExtensionManager as ExtMgr } from "xmlui";
import extensions from "../../extensions";

let extensionManager: StandaloneExtensionManager | undefined;

try {
  extensionManager = new ExtMgr();
  extensionManager.registerExtension(extensions || []);
} catch (e) {
  extensionManager = new ExtMgr();
}

const runtime = import.meta.glob("../../src/**", { eager: true });

export default function Catchall() {
  return (
    <StandaloneApp runtime={runtime} extensionManager={extensionManager} />
  );
}

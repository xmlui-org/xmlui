import type { StandaloneAppDescription } from "xmlui";
import { StandaloneApp } from "xmlui";
import "xmlui/index.scss";
import type StandaloneExtensionManager from "@components-core/StandaloneExtensionManager";

declare global {
  interface Window {
    TEST_ENV: StandaloneAppDescription | undefined;
  }
}

function TestBed({ extensionManager }: { extensionManager: StandaloneExtensionManager }) {
  if (!window.TEST_ENV || !window.TEST_ENV) {
    return <div>Missing test env</div>;
  }
  return <StandaloneApp appDef={window.TEST_ENV} decorateComponentsWithTestId={true}
                        extensionManager={extensionManager} />;
}

export default TestBed;

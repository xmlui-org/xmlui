import { StandaloneApp } from "@nsoftware-com/xmlui";
import type { StandaloneAppDescription } from "@nsoftware-com/xmlui";
import "@nsoftware-com/xmlui/index.scss";

declare global {
  interface Window {
    TEST_ENV: StandaloneAppDescription | undefined;
  }
}

function TestBed() {
  if (!window.TEST_ENV || !window.TEST_ENV) {
    return <div>Missing test env</div>;
  }
  return <StandaloneApp appDef={window.TEST_ENV} decorateComponentsWithTestId={true}/>;
}

export default TestBed;

import { StandaloneApp } from "xmlui";
import type { StandaloneAppDescription } from "xmlui";
import "xmlui/index.scss";

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

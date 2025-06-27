// import { StandaloneApp } from "";
// import type { StandaloneAppDescription } from "xmlui";
import StandaloneApp from "../../../src/components-core/StandaloneApp";
import type { StandaloneAppDescription } from "../../../src/components-core/abstractions/standalone";
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
  return <StandaloneApp appDef={window.TEST_ENV} decorateComponentsWithTestId={true} waitForApiInterceptor={true}/>;
}

export default TestBed;

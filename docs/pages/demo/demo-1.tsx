import { DemoPlayground } from "../../src/components/DemoPlayground";
import app from "../../samples/demo/demo-1/Main.xmlui";
import config from "../../samples/demo/demo-1/config";
import api from "../../samples/demo/demo-1/api";

export default () => (
  <DemoPlayground
    components={[]}
    name={config.name}
    app={app}
    api={api}
    horizontal={true}
    defaultTone={config.defaultTone}
  />
);

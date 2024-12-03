import { DemoPlayground } from "@/src/components/DemoPlayground";
import app from "@/samples/demo/demo-2/Main.xmlui";
import config from "@/samples/demo/demo-2/config";
import api from "@/samples/demo/demo-2/api";
import EntityForm from "@/samples/demo/demo-2/components/EntityForm.xmlui";

export default () => (
  <DemoPlayground
    components={[EntityForm]}
    name={config.name}
    app={app}
    themes={config.themes}
    api={api}
    defaultTone={config.defaultTone}
    horizontal={true}
  />
);

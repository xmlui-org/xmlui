declare module "*.xmlui" {
  import type { XmluiModule } from "./runtime/types";

  const module: XmluiModule;
  export default module;
}

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { NestedAppMd } from "./NestedApp";
import { NestedAppComponent } from "./NestedAppReact";

export const nestedAppRenderer = wrapComponent({
  name: "NestedApp",
  metadata: NestedAppMd as ComponentMetadata,
  renderer: ({ adapter }) => (
    <NestedAppComponent
      {...adapter.rootAttrs()}
      app={adapter.stringProp("app", "")}
      height={adapter.prop("height")}
      testId={adapter.stringProp("testId")}
    />
  ),
});

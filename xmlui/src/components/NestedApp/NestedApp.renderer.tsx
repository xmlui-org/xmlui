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
      activeTheme={adapter.stringProp("activeTheme")}
      activeTone={adapter.stringProp("activeTone")}
      allowReset={adapter.booleanProp("allowReset", false)}
      app={adapter.stringProp("app", "")}
      components={adapter.prop("components", []) as unknown[]}
      config={adapter.prop("config")}
      height={adapter.prop("height")}
      initiallyShowCode={adapter.booleanProp("initiallyShowCode", false)}
      noHeader={adapter.booleanProp("noHeader", false)}
      refreshVersion={adapter.prop("refreshVersion")}
      splitView={adapter.booleanProp("splitView", false)}
      testId={adapter.stringProp("testId")}
      title={adapter.stringProp("title")}
      withFrame={adapter.booleanProp("withFrame", false)}
    />
  ),
});

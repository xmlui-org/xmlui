import { wrapComponent } from "../../runtime/rendering/adapter";
import { LiveRegionMd, defaultProps } from "./LiveRegion";
import { LiveRegion } from "./LiveRegionReact";

export const liveRegionRenderer = wrapComponent({
  name: "LiveRegion",
  metadata: LiveRegionMd,
  renderer: ({ adapter }) => {
    const politeness = adapter.stringProp("politeness", defaultProps.politeness) === "assertive"
      ? "assertive"
      : "polite";
    return (
      <LiveRegion
        {...adapter.rootAttrs()}
        message={adapter.stringProp("message", "") ?? ""}
        politeness={politeness}
      />
    );
  },
});

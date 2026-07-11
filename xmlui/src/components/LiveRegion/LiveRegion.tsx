import { wrapComponent } from "../../components-core/wrapComponent";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import { createMetadata } from "../metadata-helpers";
import { defaultProps } from "./LiveRegion.defaults";
import { LiveRegion } from "./LiveRegionReact";

const COMP = "LiveRegion";

export const LiveRegionMd = createMetadata({
  status: "stable",
  description:
    "`LiveRegion` announces dynamic status messages to assistive technologies " +
    "without changing the visible layout.",
  props: {
    message: {
      description: "The message announced by the live region.",
      valueType: "string",
    },
    politeness: {
      description: "Controls whether updates are announced politely or assertively.",
      valueType: "string",
      availableValues: ["polite", "assertive"],
      isStrictEnum: true,
      defaultValue: defaultProps.politeness,
    },
  },
  a11y: {
    role: "decorative",
    requiresAccessibleName: false,
  },
});

export const liveRegionComponentRenderer = wrapComponent(COMP, LiveRegion, LiveRegionMd, {
  strings: ["message", "politeness"],
});

export const liveRegionRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: LiveRegionMd as ComponentMetadata,
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

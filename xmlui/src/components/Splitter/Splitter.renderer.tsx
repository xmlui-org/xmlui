import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { HSplitterMd, SplitterMd, VSplitterMd } from "./Splitter";
import { defaultProps, type SplitterResizeMode } from "./Splitter.defaults";
import { Splitter } from "./SplitterReact";

function splitterRendererFor(name: "Splitter" | "HSplitter" | "VSplitter", metadata: ComponentMetadata) {
  return wrapComponent({
    name,
    metadata,
    renderer: ({ adapter }) => {
      const rootAttrs = adapter.rootAttrs();
      const orientation = name === "HSplitter"
        ? "horizontal"
        : name === "VSplitter"
          ? "vertical"
          : adapter.stringProp("orientation", defaultProps.orientation);
      return (
        <Splitter
          {...rootAttrs}
          style={rootAttrs.style as CSSProperties}
          orientation={orientation === "horizontal" ? "horizontal" : "vertical"}
          swapped={adapter.booleanProp("swapped", defaultProps.swapped)}
          splitterTemplate={adapter.renderTemplate("splitterTemplate")}
          initialPrimarySize={adapter.stringProp("initialPrimarySize", defaultProps.initialPrimarySize)}
          minPrimarySize={adapter.stringProp("minPrimarySize", defaultProps.minPrimarySize)}
          maxPrimarySize={adapter.stringProp("maxPrimarySize", defaultProps.maxPrimarySize)}
          resizeMode={adapter.stringProp("resizeMode", defaultProps.resizeMode) as SplitterResizeMode}
          floating={adapter.booleanProp("floating", defaultProps.floating)}
          resize={(primarySize) => {
            void adapter.event("resize")(primarySize);
          }}
        >
          {adapter.renderChildren()}
        </Splitter>
      );
    },
  });
}

export const splitterRenderer = splitterRendererFor("Splitter", SplitterMd as ComponentMetadata);
export const hSplitterRenderer = splitterRendererFor("HSplitter", HSplitterMd as ComponentMetadata);
export const vSplitterRenderer = splitterRendererFor("VSplitter", VSplitterMd as ComponentMetadata);

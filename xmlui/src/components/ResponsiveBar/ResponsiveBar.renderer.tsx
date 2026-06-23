import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { ResponsiveBarMd } from "./ResponsiveBar";
import { defaultResponsiveBarProps } from "./ResponsiveBar.defaults";
import { ResponsiveBar } from "./ResponsiveBarReact";

const COMP = "ResponsiveBar";

export const responsiveBarRenderer = wrapComponent({
  name: COMP,
  metadata: ResponsiveBarMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    return (
      <ResponsiveBar
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        orientation={adapter.stringProp("orientation", defaultResponsiveBarProps.orientation) as "horizontal" | "vertical"}
        overflowIcon={adapter.stringProp("overflowIcon", defaultResponsiveBarProps.overflowIcon)}
        dropdownText={adapter.stringProp("dropdownText", defaultResponsiveBarProps.dropdownText)}
        dropdownAlignment={adapter.stringProp("dropdownAlignment")}
        triggerTemplate={adapter.renderTemplate("triggerTemplate")}
        gap={adapter.numberProp("gap", defaultResponsiveBarProps.gap)}
        reverse={adapter.booleanProp("reverse", defaultResponsiveBarProps.reverse)}
        onClick={(event) => void adapter.event("click")(event)}
        onWillOpen={() => adapter.event("willOpen")()}
        registerComponentApi={adapter.registerApi}
      >
        {adapter.renderChildren()}
      </ResponsiveBar>
    );
  },
});

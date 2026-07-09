import styles from "./StickyBox.module.scss";

import type { CSSProperties } from "react";
import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import { StickyBox } from "./StickyBoxReact";
import { defaultProps } from "./StickyBox.defaults";
import { createMetadata } from "../metadata-helpers";

const COMP = "StickyBox";

export const StickyBoxMd = createMetadata({
  status: "stable",
  description:
    "`StickyBox` remains fixed at the top or bottom of the screen as the user scrolls.",
  props: {
    to: {
      description:
        "This property determines whether the StickyBox should be anchored to " +
        "the \`top\` or \`bottom\`.",
      availableValues: ["top", "bottom"],
      isStrictEnum: true,
      valueType: "string",
      defaultValue: defaultProps.to,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$backgroundColor",
  },
});

export const stickyBoxComponentRenderer = wrapComponent(COMP, StickyBox, StickyBoxMd, {
  passUid: true,
});

export const stickyBoxRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: StickyBoxMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const to = adapter.stringProp("to", defaultProps.to);
    return (
      <div {...rootAttrs} style={rootAttrs.style as CSSProperties}>
        <StickyBox to={to === "bottom" ? "bottom" : "top"}>
          {adapter.renderChildren()}
        </StickyBox>
      </div>
    );
  },
});

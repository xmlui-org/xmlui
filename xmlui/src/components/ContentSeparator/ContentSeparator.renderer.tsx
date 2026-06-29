import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { COMPONENT_PART_KEY } from "../../styling";
import { defaultProps } from "./ContentSeparator.defaults";
import { ContentSeparatorMd } from "./ContentSeparator";
import { ContentSeparator } from "./ContentSeparatorReact";

const COMP = "ContentSeparator";

export const contentSeparatorRenderer = wrapComponent({
  name: COMP,
  metadata: ContentSeparatorMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const orientation = adapter.stringProp("orientation", defaultProps.orientation) ?? defaultProps.orientation;
    const length = adapter.stringProp("length");
    const hasExplicitLength = length !== undefined ||
      (orientation === "vertical" && adapter.props.height !== undefined) ||
      (orientation !== "vertical" && adapter.props.width !== undefined);
    const rootAttrs = adapter.rootAttrs();
    const className = typeof rootAttrs.className === "string" ? rootAttrs.className : "";
    const rootStyle = {
      ...(typeof rootAttrs.style === "object" && rootAttrs.style !== null ? rootAttrs.style : {}),
      ...(adapter.props.canShrink === undefined ? { flexShrink: 0 } : {}),
    };

    return (
      <ContentSeparator
        {...rootAttrs}
        style={rootStyle}
        data-testid={adapter.stringProp("testId", "test-id-component")}
        orientation={orientation}
        thickness={validCssSize(adapter.stringProp("thickness"))}
        length={validCssSize(length)}
        hasExplicitLength={hasExplicitLength}
        classes={{ [COMPONENT_PART_KEY]: className }}
      />
    );
  },
});

function validCssSize(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const text = value.trim();
  if (!text) {
    return undefined;
  }
  if (text === "0") {
    return "0";
  }
  return /^-?(?:\d+|\d*\.\d+)(?:px|em|rem|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc)?$/i.test(text)
    ? text
    : undefined;
}

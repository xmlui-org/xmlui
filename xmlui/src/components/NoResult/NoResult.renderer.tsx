import { Children, type CSSProperties, type ReactNode } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { defaultProps } from "./NoResult.defaults";
import { NoResultMd } from "./NoResult";
import { NoResult } from "./NoResultReact";
import { COMPONENT_PART_KEY } from "../../styling";

const COMP = "NoResult";

export const noResultRenderer = wrapComponent({
  name: COMP,
  metadata: NoResultMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const className = typeof rootAttrs.className === "string" ? rootAttrs.className : undefined;
    return (
      <NoResult
        {...rootAttrs}
        style={noResultRootStyle(rootAttrs.style as CSSProperties | undefined)}
        data-testid={adapter.stringProp("testId", "test-id-component")}
        label={labelFor(adapter.prop("label"), adapter.renderChildren()) as any}
        icon={adapter.stringProp("icon", defaultProps.icon)}
        hideIcon={adapter.booleanProp("hideIcon", defaultProps.hideIcon)}
        classes={{ [COMPONENT_PART_KEY]: className ?? "" }}
      />
    );
  },
});

function labelFor(label: unknown, children: ReactNode): ReactNode {
  if (label !== undefined && label !== null) {
    return String(label);
  }
  if (children !== undefined && children !== null && children !== "" && Children.count(children) > 0) {
    return children;
  }
  return "No results found";
}

function noResultRootStyle(style: CSSProperties | undefined): CSSProperties | undefined {
  if (!style) {
    return style;
  }
  const result: Record<string, unknown> = { ...style };
  for (const name of optionalNoResultThemeVariables) {
    delete result[`--xmlui-${name}`];
  }
  return result as CSSProperties;
}

const optionalNoResultThemeVariables = [
  "padding-NoResult",
  "paddingHorizontal-NoResult",
  "paddingLeft-NoResult",
  "paddingRight-NoResult",
  "paddingTop-NoResult",
  "paddingBottom-NoResult",
];

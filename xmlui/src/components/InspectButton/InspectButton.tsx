import type { CSSProperties } from "react";

import { wrapComponent } from "../../runtime/rendering/adapter";
import { createMetadata } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { useInspectMode } from "../Inspector/inspectModeStore";

const COMP = "InspectButton";

export const InspectButtonMd = createMetadata({
  status: "experimental",
  description:
    "This component displays a button that can turn the inspection mode of a running XMLUI app on or off.",
  props: {
    testId: {
      description: "Adds a test identifier to the rendered button.",
      valueType: "string",
    },
  },
  themeVars: {
    [`gap-${COMP}`]: "The gap between the InspectButton icon and label.",
    [`padding-${COMP}`]: "The InspectButton padding.",
    [`borderColor-${COMP}`]: "The InspectButton border color.",
    [`borderRadius-${COMP}`]: "The InspectButton border radius.",
    [`backgroundColor-${COMP}`]: "The InspectButton background color.",
    [`textColor-${COMP}`]: "The InspectButton text color.",
    [`backgroundColor-${COMP}--active`]: "The active InspectButton background color.",
    [`textColor-${COMP}--active`]: "The active InspectButton text color.",
    [`fontSize-${COMP}-icon`]: "The InspectButton icon size.",
  },
  defaultThemeVars: {
    [`gap-${COMP}`]: "$space-1",
    [`padding-${COMP}`]: "$space-2 $space-4",
    [`borderColor-${COMP}`]: "$borderColor",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`backgroundColor-${COMP}`]: "transparent",
    [`textColor-${COMP}`]: "$textColor",
    [`backgroundColor-${COMP}--active`]: "$color-primary-500",
    [`textColor-${COMP}--active`]: "$const-color-surface-50",
    [`fontSize-${COMP}-icon`]: "$fontSize-base",
  },
});

export const inspectButtonRenderer = wrapComponent({
  name: COMP,
  metadata: InspectButtonMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const [inspectMode, setInspectMode] = useInspectMode();
    const rootAttrs = adapter.rootAttrs();
    const children = adapter.node.children.length > 0 ? adapter.renderChildren() : "Inspect";

    return (
      <button
        {...rootAttrs}
        className={["xmluiInspectButton", rootAttrs.className].filter(Boolean).join(" ")}
        style={rootAttrs.style as CSSProperties}
        data-inspect-mode={inspectMode ? "on" : "off"}
        onClick={() => setInspectMode((previous) => !previous)}
        type="button"
      >
        <span aria-hidden="true" className="xmluiInspectButtonIcon">&lt;&gt;</span>
        {children}
      </button>
    );
  },
});

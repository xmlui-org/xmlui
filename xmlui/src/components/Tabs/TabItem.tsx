import { wrapComponent } from "../../components-core/wrapComponent";
import { TabItemComponent } from "./TabItemNative";
import { createMetadata, d, dComponent, dLabel } from "../metadata-helpers";
import { MemoizedItem } from "../container-helpers";
import React from "react";
import { useComponentThemeClass } from "../../components-core/theming/utils";

const COMP = "TabItem";

export const TabItemMd = createMetadata({
  status: "stable",
  description:
    "`TabItem` defines individual tabs within a [Tabs](/components/Tabs) component, " +
    "providing both the tab header label and the content that displays when the tab " +
    "is selected. As a non-visual structural component, it serves as a container that " +
    "organizes content into distinct, switchable sections.",
  docFolder: "Tabs",
  props: {
    label: dLabel(),
    headerTemplate: dComponent("This property allows the customization of the TabItem header."),
  },
  events: {
    activated: {
      description: "This event is triggered when the tab is activated.",
      signature: "activated(): void",
      parameters: {},
    },
  },
  contextVars: {
    $header: d(
      "This context value represents the header context with props: id (optional), index, label, isActive.",
    ),
  },
});

type ThemedTabItemProps = React.ComponentPropsWithoutRef<typeof TabItemComponent>;

export const ThemedTabItem = React.forwardRef<React.ElementRef<typeof TabItemComponent>, ThemedTabItemProps>(
  function ThemedTabItem({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(TabItemMd);
    return (
      <TabItemComponent
        {...props}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
        ref={ref}
      />
    );
  },
);

export const tabItemComponentRenderer = wrapComponent(
  COMP,
  TabItemMd,
  {
    events: { activated: "activated" },
    renderers: {
      headerTemplate: { contextVars: (item: any) => ({ $header: item }) },
    },
    customRender(props, { node, extractValue, renderChild }) {
      return (
        <TabItemComponent
          {...props}
          label={extractValue.asOptionalString(node.props?.label) ?? ""}
          id={extractValue(node.uid)}
        >
          {renderChild(node.children)}
        </TabItemComponent>
      );
    },
  },
);

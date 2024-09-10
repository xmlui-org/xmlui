import type { ComponentDef } from "@abstractions/ComponentDefs";
import React from "react";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { createComponentRenderer } from "@components-core/renderers";
import * as HoverCard from "@radix-ui/react-hover-card";
import { useTheme } from "@components-core/theming/ThemeContext";
import { desc, nestedComp } from "@components-core/descriptorHelper";

type Props = {
  triggerTemplate: React.ReactNode;
  children: React.ReactNode;
};

const HoverCardComponent = ({ triggerTemplate, children }: Props) => {
  const { root } = useTheme();
  return (
    <HoverCard.Root openDelay={100} closeDelay={100}>
      <HoverCard.Trigger>{triggerTemplate}</HoverCard.Trigger>
      <HoverCard.Portal container={root}>
        <HoverCard.Content side="bottom" sideOffset={5}>
          {children}
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};

interface HoverCardComponentDef extends ComponentDef<"HoverCard"> {
  props: {
    triggerTemplate: ComponentDef;
  };
  events: {};
}

export const HoverCardMd: ComponentDescriptor<HoverCardComponentDef> = {
  displayName: "HoverCard",
  description: "This component displays some content when its parent component is hovered.",
  props: {
    triggerTemplate: nestedComp("The component that opens the hover card when hovered.")
  }
};

export const hoverCardComponentRenderer = createComponentRenderer(
  "HoverCard",
  ({ node, extractValue, renderChild }) => {
    return (
      <HoverCardComponent triggerTemplate={renderChild(extractValue(node.props.triggerTemplate))}>
        {renderChild(node.children)}
      </HoverCardComponent>
    );
  },
  HoverCardMd
);

import type React from "react";
import * as HoverCard from "@radix-ui/react-hover-card";

import { useTheme } from "../../components-core/theming/ThemeContext";

type Props = {
  triggerTemplate: React.ReactNode;
  children: React.ReactNode;
};

export const HoverCardComponent = ({ triggerTemplate, children }: Props) => {
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

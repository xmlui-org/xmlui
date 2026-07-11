import { Provider, Root, Portal, Trigger, Content } from "@radix-ui/react-tooltip";
import React, { ReactNode } from "react";
import { useTheme } from "xmlui";
import styles from "./Tooltip.module.scss";

export const Tooltip = React.forwardRef(function (
  {
    children,
    label,
  }: {
    children: ReactNode;
    label: string;
  },
  ref: React.Ref<HTMLButtonElement>,
) {
  const { root } = useTheme();
  return (
    <Provider>
      <Root>
        <Trigger ref={ref} asChild>{children}</Trigger>
        <Portal container={root}>
          <Content className={styles.TooltipContent} sideOffset={5}>
            {label}
          </Content>
        </Portal>
      </Root>
    </Provider>
  );
});

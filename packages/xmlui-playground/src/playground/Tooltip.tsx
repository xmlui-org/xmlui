import { Provider, Root, Portal, Trigger, Content } from "@radix-ui/react-tooltip";
import { type ReactNode } from "react";
import { useTheme } from "xmlui";
import styles from "./Tooltip.module.scss";

export const Tooltip = ({ children, label }: { children: ReactNode; label: string }) => {
  const { root } = useTheme();
  return (
    <Provider>
      <Root>
        <Trigger asChild>
          <div>{children}</div>
        </Trigger>
        <Portal container={root}>
          <Content className={styles.TooltipContent} sideOffset={5}>
            {label}
          </Content>
        </Portal>
      </Root>
    </Provider>
  );
};

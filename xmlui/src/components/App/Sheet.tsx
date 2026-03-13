import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import classnames from "classnames";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import styles from "./Sheet.module.scss";

import { useTheme } from "../../components-core/theming/ThemeContext";
import { ThemedIcon } from "../../components/Icon/Icon";
import { THEME_VAR_PREFIX } from "../../parsers/style-parser/StyleParser";

//based on this: https://ui.shadcn.com/docs/components/sheet

const Sheet = SheetPrimitive.Root;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay className={classnames(styles.overlay, className)} {...props} ref={ref} />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
  side: "top" | "bottom" | "left" | "right";
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "left", className, children, style, ...props }, ref) => {
  const { root, themeVars } = useTheme();
  const sheetCssVars = {
    [`--${THEME_VAR_PREFIX}-maxWidth-drawer-App`]: themeVars?.["maxWidth-drawer-App"],
    [`--${THEME_VAR_PREFIX}-top-closeButton-App`]: themeVars?.["top-closeButton-App"],
    [`--${THEME_VAR_PREFIX}-right-closeButton-App`]: themeVars?.["right-closeButton-App"],
  } as React.CSSProperties;
  return (
    <SheetPortal container={root}>
      <SheetOverlay />
      <SheetPrimitive.Content
        forceMount={true}
        onOpenAutoFocus={(event) => {
          // Prevent Radix from automatically focusing the first focusable element
          // (e.g. the search input in the mobile nav drawer).
          event.preventDefault();
        }}
        ref={ref}
        className={classnames(
          styles.sheetContent,
          {
            [styles.top]: side === "top",
            [styles.bottom]: side === "bottom",
            [styles.left]: side === "left",
            [styles.right]: side === "right",
          },
          className,
        )}
        style={{ ...sheetCssVars, ...style }}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className={styles.close}>
          <ThemedIcon name="close" />
          <VisuallyHidden>Close</VisuallyHidden>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
});
SheetContent.displayName = SheetPrimitive.Content.displayName;

export { Sheet, SheetContent };

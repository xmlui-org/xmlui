import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import classnames from "classnames";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import styles from "./Sheet.module.scss";

import { useTheme } from "../../components-core/theming/ThemeContext";
import { Icon } from "../../components/Icon/IconNative";

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

const SheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, SheetContentProps>(
  ({ side = "left", className, children, ...props }, ref) => {
    const { root } = useTheme();
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
            className
          )}
          {...props}
        >
          {children}
          <SheetPrimitive.Close className={styles.close}>
            <Icon name={"close"} />
            <VisuallyHidden>Close</VisuallyHidden>
          </SheetPrimitive.Close>
        </SheetPrimitive.Content>
      </SheetPortal>
    );
  }
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={classnames("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={classnames("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={classnames("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description ref={ref} className={classnames("text-sm text-muted-foreground", className)} {...props} />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetContent,
};

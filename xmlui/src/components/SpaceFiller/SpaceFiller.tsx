import styles from "./SpaceFiller.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { SpaceFiller } from "./SpaceFillerNative";
import { createMetadata } from "../metadata-helpers";
import React from "react";
import { useComponentThemeClass } from "../../components-core/theming/utils";

const COMP = "SpaceFiller";

export const SpaceFillerMd = createMetadata({
  status: "stable",
  description:
    "`SpaceFiller` works well in layout containers to fill remaining (unused) " +
    "space. Its behavior depends on the layout container in which it is used.",
  themeVars: parseScssVar(styles.themeVars),
});

type ThemedSpaceFillerProps = React.ComponentPropsWithoutRef<typeof SpaceFiller>;

export const ThemedSpaceFiller = React.forwardRef<React.ElementRef<typeof SpaceFiller>, ThemedSpaceFillerProps>(
  function ThemedSpaceFiller({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(SpaceFillerMd);
    return (
      <SpaceFiller
        {...props}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
        ref={ref}
      />
    );
  },
);

export const spaceFillerComponentRenderer = createComponentRenderer(COMP, SpaceFillerMd, () => (
  <SpaceFiller />
));

import styles from "./Spinner.module.scss";

import React from "react";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { defaultProps } from "./Spinner.defaults";
import { Spinner } from "./SpinnerReact";
import { createMetadata } from "../metadata-helpers";
import { useComponentThemeClass, useThemeVariables } from "../../components-core/theming/utils";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { wrapComponent } from "../../components-core/wrapComponent";
import type { CSSProperties } from "react";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import { collectComponentThemeDefaults, mergeThemeVariableLayers, resolveThemeReferences, resolveThemeVariable } from "../../styling/theme";

const COMP = "Spinner";

export const SpinnerMd = createMetadata({
  status: "stable",
  description:
    "`Spinner` is an animated indicator that represents an action in progress " +
    "with no deterministic progress value.",
  parts: {
    ring: {
      description: "The animated ring element of the spinner.",
    },
  },
  props: {
    delay: {
      description: `The delay in milliseconds before the spinner is displayed.`,
      valueType: "number",
      defaultValue: defaultProps.delay,
    },
    fullScreen: {
      description: `If set to \`true\`, the component will be rendered in a full screen container.`,
      valueType: "boolean",
      defaultValue: defaultProps.fullScreen,
    },
  },
  defaultAriaLabel: "Loading",
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`size-${COMP}`]: "2.5em",
    [`thickness-${COMP}`]: "0.125em",
    [`borderColor-${COMP}`]: "$color-surface-400",
  },
});

type ThemedSpinnerProps = Omit<React.ComponentProps<typeof Spinner>, "classes"> & { className?: string };
export const ThemedSpinner = React.forwardRef<HTMLDivElement, ThemedSpinnerProps>(
  function ThemedSpinner({ className, ...props }: ThemedSpinnerProps, ref) {
    const themeClass = useComponentThemeClass(SpinnerMd);
    const combinedClass = [themeClass, className].filter(Boolean).join(" ");
    return <Spinner {...props} classes={{ [COMPONENT_PART_KEY]: combinedClass }} ref={ref} />;
  },
);

export const spinnerComponentRenderer = wrapComponent(
  COMP,
  ThemedSpinner,
  SpinnerMd,
);

export const spinnerRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: SpinnerMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const themeVariables = useThemeVariables();
    const mergedThemeVariables = mergeThemeVariableLayers([
      collectComponentThemeDefaults(SpinnerMd),
      themeVariables,
    ]);
    const variant = adapter.stringProp("variant");
    const rootAttrs = adapter.rootAttrs();

    return (
      <Spinner
        {...rootAttrs}
        delay={adapter.numberProp("delay", defaultProps.delay)}
        fullScreen={adapter.booleanProp("fullScreen", defaultProps.fullScreen)}
        classes={{ [COMPONENT_PART_KEY]: adapter.className }}
        style={{
          ...(rootAttrs.style as CSSProperties | undefined),
          ...currentVariantCssVariables(variant, mergedThemeVariables),
        }}
      />
    );
  },
});

function currentVariantCssVariables(
  variant: string | undefined,
  themeVariables: Record<string, unknown>,
): CSSProperties {
  if (!variant) {
    return {};
  }
  const borderColor = resolveThemeVariable(`borderColor-Spinner-${variant}`, [themeVariables]);
  if (borderColor === undefined || borderColor === null || borderColor === "") {
    return {};
  }
  return {
    borderColor: String(resolveThemeReferences(borderColor)),
    "--xmlui-current-borderColor-Spinner": String(resolveThemeReferences(borderColor)),
  } as CSSProperties;
}

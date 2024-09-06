import styles from "./Spinner.module.scss";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { createComponentRenderer } from "@components-core/renderers";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { parseScssVar } from "@components-core/theming/themeVars";
import { desc } from "@components-core/descriptorHelper";
import { ComponentThemeColor } from "@components/abstractions";

// =====================================================================================================================
// React Spinner component implementation

interface SpinnerProps {
  delay?: number;
  fullScreen?: boolean;
  style?: CSSProperties;
}

// source https://loading.io/css/
export function Spinner({
  delay = 400,
  fullScreen = false,
  style,
}: SpinnerProps) {
  const [pastDelay, setPastDelay] = useState(delay === 0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPastDelay(true);
    }, delay);
    return () => {
      clearTimeout(timeout);
    };
  }, [delay]);

  const spinner = (
    <>
      <div style={style}>
        <div className={styles["lds-ring"]}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </>
  );

  if (!pastDelay) {
    return null;
  } else {
    if (fullScreen) {
      return <div className={styles.fullScreenSpinnerWrapper}>{spinner}</div>;
    }
    return spinner;
  }
}

// =====================================================================================================================
// XMLUI Spinner component definition

/**
 * The `Spinner` component is an animated indicator that represents a particular action in progress
 * without a deterministic progress value.
 * While it is visible, the action is yet to be completed; on completion, the UI logic may opt to remove the component.
 * @descriptionRef
 */
export interface SpinnerComponentDef extends ComponentDef<"Spinner"> {
  props: {
    /**
     * The delay in milliseconds before the spinner is displayed.
     * @descriptionRef
     */
    delay?: number;
    /**
     * If set to \`true\`, the component will be rendered in a full screen container.
     * The default value is \`false\`.
     * @defaultValue \`false\`
     * @descriptionRef
     */
    fullScreen?: boolean;

    /**
     * (**NOT IMPLEMENTED YET**) The theme color of the component.
     * @descriptionRef
     */
    themeColor?: ComponentThemeColor;
  };
}

const metadata: ComponentDescriptor<SpinnerComponentDef> = {
  displayName: "Spinner",
  description: "Component representing progress",
  props: {
    delay: desc("The delay in milliseconds before the spinner is displayed"),
    fullScreen: desc("If set to `true`, the component will be rendered in a full screen container"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "size-Spinner": "$space-10",
    "thickness-Spinner": "$space-0_5",
    light: {
      "color-border-Spinner": "$color-surface-400",
    },
    dark: {
      "color-border-Spinner": "$color-surface-600",
    },
  },
};

export const spinnerComponentRenderer =
  createComponentRenderer<SpinnerComponentDef>(
    "Spinner",
    ({ node, layoutCss, extractValue }) => {
      delete layoutCss.width;
      delete layoutCss.minWidth;
      delete layoutCss.maxWidth;
      delete layoutCss.height;
      delete layoutCss.minHeight;
      delete layoutCss.maxHeight;
      return (
        <Spinner
          style={layoutCss}
          delay={extractValue.asOptionalNumber(node.props.delay)}
          fullScreen={extractValue.asOptionalBoolean(node.props.fullScreen)}
        />
      );
    },
    metadata
  );

import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import styles from "./ProgressBar.module.scss";
import { CSSProperties } from "react";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";

// =====================================================================================================================
// React ProgressBar component implementation

interface Props {
  value: number;
  style: CSSProperties;
}

function ProgressBar({ value = 0, style }: Props) {
  return (
    <div className={styles.wrapper} style={style}>
      <div style={{ width: `${value * 100}%` }} className={styles.bar} />
    </div>
  );
}

// =====================================================================================================================
// XMLUI ProgressBar component definition

/**
 * A \`ProgressBar\` component visually represents the progress of a task or process.
 */
export interface ProgressBarComponentDef extends ComponentDef<"ProgressBar"> {
  props: {
    /** @descriptionRef */
    value: string;
  };
}

const metadata: ComponentDescriptor<ProgressBarComponentDef> = {
  displayName: "ProgressBar",
  description: "Display a progress value",
  props: {
    value: desc("Progress value (from 0 to 1) to display"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "radius-ProgressBar": "$radius",
    "radius-indicator-ProgressBar": "0px",
    "thickness-ProgressBar": "$space-2",
    light: {
      "color-bg-ProgressBar": "$color-surface-200",
      "color-indicator-ProgressBar": "$color-primary-500",
    },
    dark: {
      "color-bg-ProgressBar": "$color-surface-700",
      "color-indicator-ProgressBar": "$color-primary-500",
    },
  },
};

export const progressBarComponentRenderer = createComponentRenderer<ProgressBarComponentDef>(
  "ProgressBar",
  ({ node, extractValue, layoutCss }) => {
    return <ProgressBar value={Math.max(0, Math.min(1, extractValue(node.props.value)))} style={layoutCss} />;
  },
  metadata
);

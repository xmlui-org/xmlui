import { Icon } from "@components/Icon/Icon";
import styles from "./NoResult.module.scss";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";
import { CSSProperties } from "react";

// =====================================================================================================================
// React NoResult component implementation

type Props = {
  label: string;
  icon?: string;
  hideIcon?: boolean;
  style?: CSSProperties;
};

const NoResult = ({ label, icon, hideIcon = false, style }: Props) => {
  return (
    <div className={styles.wrapper} style={style}>
      {!hideIcon && <Icon name={icon ?? "noResult"} className={styles.icon} />}
      {label}
    </div>
  );
};

// =====================================================================================================================
// XMLUI NoResult component definition

/**
 * \`NoResult\` is a component that displays a visual indication that some data query (search) resulted 
 * in no (zero) items.
 */
export interface NoResultComponentDef extends ComponentDef<"NoResult"> {
  props: {
    /** @descriptionRef */
    label?: string;
    /** @descriptionRef */
    icon?: string;
    /** @descriptionRef */
    hideIcon?: boolean;
  };
}

export const NoResultMd: ComponentDescriptor<NoResultComponentDef> = {
  displayName: "NoResult",
  description: "Component representing a date fetch result with an empty result set",
  props: {
    label: desc("Optional label to display"),
    icon: desc("Optional icon ID to display"),
    hideIcon: desc("Indicates if the icon should be hidden"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "padding-vertical-NoResult": "$space-2",
    "gap-icon-NoResult": "$space-2",
    "size-icon-NoResult": "$space-8",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
};

export const noResultComponentRenderer = createComponentRenderer<NoResultComponentDef>(
  "NoResult",
  ({ node, extractValue, layoutCss }) => {
    return (
      <NoResult
        label={extractValue.asDisplayText(node.props.label || node.children || "No results found")}
        icon={node.props.icon}
        hideIcon={extractValue.asOptionalBoolean(node.props.hideIcon)}
        style={layoutCss}
      />
    );
  },
  NoResultMd
);

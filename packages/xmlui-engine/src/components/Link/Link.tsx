import { Link } from "@remix-run/react";
import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import styles from "./Link.module.scss";
import classnames from "@components-core/utils/classnames";
import { Icon } from "@components/Icon/Icon";
import type { To } from "react-router";
import type { LinkTarget } from "@components/abstractions";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { desc } from "@components-core/descriptorHelper";
import { createUrlWithQueryParams } from "@components/component-utils";

// =====================================================================================================================
// React Link component implementation

type Props = {
  to: string | { pathname: string; queryParams?: Record<string, any> };
  children: ReactNode;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  target?: LinkTarget;
  style?: CSSProperties;
};

export const LocalLink = ({ to, children, icon, active, onClick, target, disabled, style }: Props) => {
  const iconLink = !!icon && !children;
  const smartTo = useMemo(() => {
    return createUrlWithQueryParams(to);
  }, [to]) as To;

  const Node = !to ? "div" : Link;

  return (
    <Node
      to={smartTo as To} //TODO illesg
      style={style}
      target={target}
      onClick={onClick}
      className={classnames(styles.container, {
        [styles.iconLink]: iconLink,
        [styles.active]: active,
        [styles.disabled]: disabled,
      })}
    >
      {icon && (
        <div className={styles.iconWrapper}>
          <Icon name={icon} />
        </div>
      )}
      <span className={classnames(styles.inner, styles.actions)}>{children}</span>
    </Node>
  );
};

// =====================================================================================================================
// XMLUI Link component definition

/**
 * A \`Link\` component represents a navigation target within the app or a reference to an external web URL.
 */
export interface LinkComponentDef extends ComponentDef<"Link"> {
  props: {
    /**
     * This property sets the text to display with the \`Link\` component.
     */
    label?: string;
    /** @descriptionRef */
    icon?: string;
    /**
     * This property defines the URL of the link.
     */
    to: string;
    /** @descriptionRef */
    enabled?: boolean;
    /** @descriptionRef */
    active?: boolean;
    /** @descriptionRef */
    target?: LinkTarget;
  };
  events: {
    /** @descriptionRef */
    click?: string;
  };
}

const metadata: ComponentDescriptor<LinkComponentDef> = {
  displayName: "Link",
  description: "Represents a local link the user can use to navigate within the application",
  props: {
    to: desc("The target URL"),
    enabled: desc("Is the link enabled?"),
    active: desc("Indicates if the link is active"),
    target: desc("the target type of the link: '_self', '_blank', '_parent', '_top'"),
    label: desc("Optional text label for the component, indicates hover and active states"),
    icon: desc("Optional icon for the component, indicates hover and active states"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-text-Link--hover--active": "$color-text-Link--active",
    "color-text-decoration-Link--hover": "$color-surface-400A80",
    "color-text-decoration-Link--active": "$color-surface200",
    "font-weight-Link--active": "$font-weight-bold",
    "color-decoration-Link": "$color-surface-400",
    "offset-decoration-Link": "$space-1",
    "line-decoration-Link": "underline",
    "style-decoration-Link": "dashed",
    "thickness-decoration-Link": "$space-0_5",

    "color-outline-Link--focus": "$color-outline--focus",
    "thickness-outline-Link--focus": "$thickness-outline--focus",
    "style-outline-Link--focus": "$style-outline--focus",
    "offset-outline-Link--focus": "$offset-outline--focus",

    light: {
      "color-text-Link": "$color-surface-950",
      "color-text-Link--active": "$color-primary-700",
    },
    dark: {
      "color-text-Link": "$color-surface-50",
      "color-text-Link--active": "$color-primary-300",
    },
  },
};

/**
 * This function define the renderer for the Limk component.
 */
export const localLinkComponentRenderer = createComponentRenderer<LinkComponentDef>(
  "Link",
  ({ node, extractValue, lookupEventHandler, renderChild, layoutCss }) => {
    return (
      <LocalLink
        to={extractValue(node.props.to)}
        icon={extractValue(node.props.icon)}
        active={extractValue.asOptionalBoolean(node.props.active, false)}
        target={extractValue(node.props?.target)}
        style={layoutCss}
        disabled={!extractValue.asOptionalBoolean(node.props.enabled ?? true)}
      >
        {node.props.label ? extractValue.asDisplayText(node.props.label) : renderChild(node.children)}
      </LocalLink>
    );
  },
  metadata
);

import type { CSSProperties, MouseEventHandler, ReactNode, Ref} from "react";
import type React from "react";
import { forwardRef, useContext, useMemo } from "react";
import styles from "./NavLink.module.scss";
import { NavLink as RrdNavLink } from "@remix-run/react";
import classnames from "@components-core/utils/classnames";
import type { CommonLinkProps, LinkAria, LinkTarget } from "@components/abstractions";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { Icon } from "@components/Icon/Icon";
import type { To } from "react-router";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";
import { getAppLayoutOrientation } from "@components/App/App";
import { useAppLayoutContext } from "@components/App/AppLayoutContext";
import { NavPanelContext } from "@components/NavPanel/NavPanel";
import { createUrlWithQueryParams } from "@components/component-utils";

// =====================================================================================================================
// React NavLink component implementation

type Props = {
  uid?: string;
  to?: string;
  target?: LinkTarget;
  disabled?: boolean;
  children?: ReactNode;
  sx?: CSSProperties;
  displayActive?: boolean;
  forceActive?: boolean;
  vertical?: boolean;
  style?: CSSProperties;
  onClick?: MouseEventHandler;
  icon?: React.ReactNode;
  accessibilityProps?: any;
} & Pick<React.HTMLAttributes<HTMLAnchorElement>, LinkAria>;

export const NavLink = forwardRef(
  function NavLink(
    {
      /* eslint-disable react/prop-types */
      uid,
      children,
      disabled,
      to,
      sx = {},
      displayActive = true,
      vertical,
      style,
      onClick,
      icon,
      forceActive,
      ...rest
    }: Props,
    ref: Ref<any>
  ) {
    const appLayoutContext = useAppLayoutContext();
    const navPanelContext = useContext(NavPanelContext);
    let safeVertical = vertical;
    if (appLayoutContext && safeVertical === undefined) {
      safeVertical = getAppLayoutOrientation(appLayoutContext.layout) === "vertical" || navPanelContext?.inDrawer;
    }
    const smartTo = useMemo(() => {
      if (to) {
        return createUrlWithQueryParams(to) as To;
      }
    }, [to]) as To;

    const styleObj = { ...sx, ...style };

    const baseClasses = classnames(styles.base, {
      [styles.disabled]: disabled,
      [styles.vertical]: safeVertical,
      [styles.includeHoverIndicator]: displayActive,
      [styles.navItemActive]: displayActive && forceActive,
    });

    let content;

    if (disabled || !smartTo) {
      content = (
        <button {...rest} ref={ref} onClick={onClick} className={baseClasses} style={styleObj} disabled={disabled}>
          {icon}
          {children}
        </button>
      );
    } else {
      content = (
        <RrdNavLink
          id={uid}
          {...rest}
          ref={ref}
          to={smartTo as To}
          style={styleObj}
          onClick={onClick}
          className={({ isActive }) =>
            classnames(baseClasses, {
              [styles.displayActive]: displayActive,
              [styles.navItemActive]: displayActive && (isActive || forceActive),
            })
          }
        >
          {icon}
          {children}
        </RrdNavLink>
      );
    }

    return content;
  }
);

// =====================================================================================================================
// XMLUI NavLink component definition

/**
 * The \`NavLink\` component defines a navigation target (app navigation menu item) within the app;
 * it is associated with a particular in-app navigation target (or an external link).
 * @descriptionRef
 */
export interface NavLinkComponentDef extends ComponentDef<"NavLink"> {
  props: {
    /**
     * This property sets the text to display with the \`NavLink\` component.
     * @descriptionRef
     */
    label?: string;
    /**
     * This property sets how the active status is displayed on the \`NavLink\` component.
     * If set to true, the indicator is displayed on the side which lends itself to a vertically aligned navigation menu.
     * @descriptionRef
     */
    vertical?: boolean;
    /**
     * This property allows you to add an icon (specify the icon's name) to the navigation link.
     * @descriptionRef
     */
    icon?: string;
    /**
     * This Boolean property indicates if the active state of a link should have a visual indication.
     * Setting it to \`false\` removes the visual indication of an active link.
     *
     * The default value is \`true\`.
     * @descriptionRef
     */
    displayActive?: string;
    /**
     * This property defines the URL of the link.
     *
     * For examples, see the other property sections.
     */
    to: string;
    /**
     * This property indicates whether the link is enabled (\`true\`) or not (\`false\`).
     * Disabled links are greyed out.
     * The default value is (\`true\`).
     * @descriptionRef
     */
    enabled?: boolean;
    /**
     * This property indicates if the particular navigation is an active link.
     * An active link has a particular visual appearance,
     * provided its [\`displayActive\`](#displayactive) property is set to \`true\`.
     * @descriptionRef
     */
    active?: boolean;
    /**
     * This property specifies how to open the clicked link.
     * @descriptionRef
     */
    target?: LinkTarget;
  };
  events: {
    /**
     * This event is fired when the user clicks the link.
     * With an event handler, you can define how to respond to the user's clicks.
     * @descriptionRef
     */
    click: string;
  };
}

const metadata: ComponentDescriptor<NavLinkComponentDef> = {
  displayName: "NavLink",
  description: "Represents a navigation link",
  props: {
    to: desc("The target URL"),
    enabled: desc("Is the link enabled?"),
    active: desc("Indicates if the link is active"),
    target: desc("the target type of the link: '_self', '_blank', '_parent', '_top'"),
    label: desc(
      "Specifies the optional text to display in the navigation group. " +
        "If omitted, children can be used to set the group's content."
    ),
    vertical: desc("Use vertical orientation instead of the default horizontal?"),
    displayActive: desc("Allow displaying the active state of this navigation link?"),
    icon: desc("Optional icon ID to display the particular icon in the navigation group"),
  },
  events: {
    click: desc("Triggers when the button is clicked"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "radius-NavLink": "$radius",
    "color-bg-NavLink": "transparent",
    "padding-horizontal-NavLink": "$space-4",
    "padding-vertical-NavLink": "$space-2",
    "font-size-NavLink": "$font-size-small",
    "font-weight-NavLink": "$font-weight-normal",
    "font-family-NavLink": "$font-family",
    "color-text-NavLink": "$color-text-primary",
    "font-weight-NavLink--pressed": "$font-weight-normal",
    "thickness-indicator-NavLink": "$space-0_5",

    "color-outline-NavLink--focus": "$color-outline--focus",
    "thickness-outline-NavLink--focus": "$thickness-outline--focus",
    "style-outline-NavLink--focus": "$style-outline--focus",
    "offset-outline-NavLink--focus": "-1px",
    "radius-indicator-NavLink": "$radius",

    light: {
      "color-icon-NavLink": "$color-surface-500",
      "color-indicator-NavLink--active": "$color-primary-500",
      "color-indicator-NavLink--pressed": "$color-primary-500",
      "color-indicator-NavLink--hover": "$color-primary-600",
    },
    dark: {
      "color-indicator-NavLink--active": "$color-primary-500",
      "color-indicator-NavLink--pressed": "$color-primary-500",
      "color-indicator-NavLink--hover": "$color-primary-400",
    }
  },
};

export const navLinkComponentRenderer = createComponentRenderer<NavLinkComponentDef>(
  "NavLink",
  ({ node, extractValue, renderChild, layoutCss }) => {
    const iconName = extractValue.asString(node.props.icon);
    return (
      <NavLink
        uid={node.uid}
        to={extractValue(node.props.to)}
        disabled={!extractValue.asOptionalBoolean(node.props.enabled ?? true)}
        vertical={extractValue.asOptionalBoolean(node.props.vertical)}
        displayActive={extractValue.asOptionalBoolean(node.props.displayActive)}
        forceActive={extractValue.asOptionalBoolean(node.props.active)}
        style={layoutCss}
        target={extractValue(node.props?.target)}
        icon={<Icon name={iconName} className={styles.icon} />}
      >
        {extractValue.asDisplayText(node.props.label) || renderChild(node.children)}
      </NavLink>
    );
  },
  metadata
);

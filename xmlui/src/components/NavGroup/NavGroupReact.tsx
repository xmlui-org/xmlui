import {
  cloneElement,
  type CSSProperties,
  forwardRef,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

import styles from "./NavGroup.module.scss";

import type { RenderChildFn } from "../../abstractions/RendererDefs";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import { EMPTY_OBJECT } from "../../components-core/constants";
import { mergeProps } from "../../components-core/utils/mergeProps";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { ThemedIcon } from "../Icon/Icon";
import { ThemedNavLink as NavLink } from "../NavLink/NavLink";
import { useAppLayoutContext } from "../App/AppLayoutContext";
import { NavPanelContext } from "../NavPanel/NavPanelReact";
import type { NavGroupMd } from "./NavGroup";
import { useLocation } from "react-router-dom";
import classnames from "classnames";
import { NavGroupContext } from "./NavGroupContext";
import { pushXsLog } from "../../components-core/inspector/inspectorUtils";
import { getAppLayoutOrientation } from "../App/AppReact";
import { useAppContext } from "../../components-core/AppContext";

type NavGroupComponentDef = ComponentDef<typeof NavGroupMd>;

type Props = {
  style?: CSSProperties;
  className?: string;
  classes?: Record<string, string>;
  label: string;
  icon?: React.ReactNode;
  to?: string;
  disabled?: boolean;
  node: NavGroupComponentDef;
  renderChild: RenderChildFn;
  initiallyExpanded: boolean;
  noIndicator?: boolean;
  iconHorizontalExpanded?: string;
  iconHorizontalCollapsed?: string;
  iconVerticalExpanded?: string;
  iconVerticalCollapsed?: string;
  iconAlignment?: "baseline" | "start" | "center" | "end";
  expandIconAlignment?: "start" | "end";
};

export const defaultProps: Pick<
  Props,
  | "iconHorizontalExpanded"
  | "iconHorizontalCollapsed"
  | "iconVerticalExpanded"
  | "iconVerticalCollapsed"
  | "noIndicator"
  | "iconAlignment"
  | "expandIconAlignment"
> = {
  iconHorizontalExpanded: "chevronright",
  iconHorizontalCollapsed: "chevronright",
  iconVerticalExpanded: "chevrondown",
  iconVerticalCollapsed: "chevronright",
  noIndicator: false,
  iconAlignment: "center",
  expandIconAlignment: "start",
};

export const NavGroup = memo(forwardRef(function NavGroup(
  {
    node,
    style,
    className,
    classes,
    label,
    icon,
    renderChild,
    to,
    disabled = false,
    initiallyExpanded = false,
    noIndicator = defaultProps.noIndicator,
    iconHorizontalCollapsed,
    iconHorizontalExpanded,
    iconVerticalCollapsed,
    iconVerticalExpanded,
    iconAlignment = "center",
    expandIconAlignment,
    ...rest
  }: Props,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { getThemeVar } = useTheme();
  const effectiveExpandIconAlignment =
    expandIconAlignment ||
    (getThemeVar("expandIconAlignment-NavGroup") as "start" | "end" | undefined) ||
    defaultProps.expandIconAlignment;
  const { level } = useContext(NavGroupContext);
  const appLayoutContext = useAppLayoutContext();
  const navPanelContext = useContext(NavPanelContext);
  const layoutIsVertical =
    !!appLayoutContext && getAppLayoutOrientation(appLayoutContext.layout).includes("vertical");

  let inline =
    appLayoutContext?.layout === "vertical" ||
    appLayoutContext?.layout === "vertical-sticky" ||
    appLayoutContext?.layout === "vertical-full-header";

  if (navPanelContext !== null) {
    inline = navPanelContext.inDrawer;
  }

  const navGroupContextValue = useMemo(() => {
    return {
      level: level + 1,
      layoutIsVertical,
      iconHorizontalCollapsed: iconHorizontalCollapsed ?? defaultProps.iconHorizontalCollapsed,
      iconHorizontalExpanded: iconHorizontalExpanded ?? defaultProps.iconHorizontalExpanded,
      iconVerticalCollapsed:
        iconVerticalCollapsed ??
        (level < 0 && !inline
          ? defaultProps.iconVerticalExpanded
          : defaultProps.iconVerticalCollapsed),
      iconVerticalExpanded: iconVerticalExpanded ?? defaultProps.iconVerticalExpanded,
    };
  }, [
    iconHorizontalCollapsed,
    iconHorizontalExpanded,
    iconVerticalCollapsed,
    iconVerticalExpanded,
    level,
    layoutIsVertical,
    inline,
  ]);

  return (
    <NavGroupContext.Provider value={navGroupContextValue}>
      {inline ? (
        <ExpandableNavGroup
          {...rest}
          to={to}
          style={style}
          className={className}
          classes={classes}
          label={label}
          icon={icon}
          node={node}
          renderChild={renderChild}
          ref={ref}
          initiallyExpanded={initiallyExpanded}
          disabled={disabled}
          noIndicator={noIndicator}
          iconAlignment={iconAlignment}
          expandIconAlignment={effectiveExpandIconAlignment}
        />
      ) : (
        <DropDownNavGroup
          {...rest}
          label={label}
          icon={icon}
          node={node}
          renderChild={renderChild}
          ref={ref}
          to={to}
          initiallyExpanded={initiallyExpanded}
          disabled={disabled}
          noIndicator={noIndicator}
          expandIconAlignment={effectiveExpandIconAlignment}
          iconAlignment={iconAlignment}
        />
      )}
    </NavGroupContext.Provider>
  );
}));

type ExpandableNavGroupProps = {
  style?: CSSProperties;
  className?: string;
  classes?: Record<string, string>;
  label: string;
  icon: ReactNode;
  node: NavGroupComponentDef;
  renderChild: RenderChildFn;
  to?: string;
  initiallyExpanded?: boolean;
  disabled?: boolean;
  noIndicator?: boolean;
  iconAlignment?: "baseline" | "start" | "center" | "end";
  expandIconAlignment?: "start" | "end";
};

const ExpandableNavGroup = forwardRef(function ExpandableNavGroup(
  {
    style = EMPTY_OBJECT,
    className,
    classes,
    label,
    icon,
    renderChild,
    node,
    to,
    initiallyExpanded = false,
    disabled = false,
    noIndicator = false,
    iconAlignment = "center",
    expandIconAlignment = "start",
    ...rest
  }: ExpandableNavGroupProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { level, iconVerticalCollapsed, iconVerticalExpanded, layoutIsVertical } =
    useContext(NavGroupContext);
  const { mediaSize } = useAppContext();
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const groupContentInnerRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    if (!groupContentInnerRef.current) return;
    const hasActiveNavLink =
      groupContentInnerRef.current.querySelector(".xmlui-navlink-active") !== null;
    if (hasActiveNavLink) {
      setExpanded(true);
    }
  }, [pathname]);

  const toggleStyle = useMemo(() => ({
    ...style,
    "--nav-link-level": layoutIsVertical ? level : 0,
    ...(expandIconAlignment === "end" && { width: "100%" }),
  }), [style, layoutIsVertical, level, expandIconAlignment]);

  const handleClick = (e: React.MouseEvent) => {
    const isMobile = mediaSize.sizeIndex <= 2;

    // On mobile, NavGroup headers should not act as navigation links at all,
    // only toggle expand/collapse. On larger screens, we only prevent navigation
    // when there is no `to` target.
    if (isMobile || !to) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpanded((prev) => {
      const newExpanded = !prev;
      pushXsLog({
        ts: Date.now(),
        perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
        traceId: typeof window !== "undefined" ? (window as any)._xsCurrentTrace : undefined,
        kind: "focus:change",
        component: "NavGroup",
        ariaName: label,
        componentLabel: label,
        displayLabel: label,
        label,
        expanded: newExpanded,
      });
      return newExpanded;
    });
  };

  return (
    <div
      className={classnames(styles.groupWrapper, classes?.[COMPONENT_PART_KEY], className)}
      style={expandIconAlignment === "end" ? { width: "100%" } : undefined}
    >
      <NavLink
        {...rest}
        className={classnames(styles.navLinkPadding, {
          [styles.navLinkPaddingLevel1]: level === 0,
          [styles.navLinkPaddingLevel2]: level === 1,
          [styles.navLinkPaddingLevel3]: level === 2,
          [styles.navLinkPaddingLevel4]: level === 3,
        })}
        style={toggleStyle}
        onClick={handleClick}
        icon={icon}
        to={to}
        disabled={disabled}
        noIndicator={noIndicator}
        iconAlignment={iconAlignment}
        aria-expanded={expanded}
      >
        {label}
        {expandIconAlignment === "end" && <div style={{ flex: 1 }} />}
        <ThemedIcon name={expanded ? iconVerticalExpanded : iconVerticalCollapsed} />
      </NavLink>
      <div
        aria-hidden={!expanded}
        className={classnames(styles.groupContent, {
          [styles.expanded]: expanded,
        })}
      >
        <div className={styles.groupContentInner} ref={groupContentInnerRef}>
          {renderChild(node.children)}
        </div>
      </div>
    </div>
  );
});

const DropDownNavGroup = forwardRef(function DropDownNavGroup(
  {
    label,
    icon,
    renderChild,
    node,
    to,
    disabled = false,
    initiallyExpanded = false,
    noIndicator = false,
    iconAlignment = "center",
    expandIconAlignment = "start",
    ...rest
  }: {
    style?: CSSProperties;
    label: string;
    icon: ReactNode;
    node: NavGroupComponentDef;
    renderChild: RenderChildFn;
    to?: string;
    disabled?: boolean;
    initiallyExpanded?: boolean;
    noIndicator?: boolean;
    iconAlignment?: "baseline" | "start" | "center" | "end";
    expandIconAlignment?: "start" | "end";
  },
  ref: ForwardedRef<HTMLDivElement>,
) {
  const {
    level,
    iconHorizontalCollapsed,
    iconHorizontalExpanded,
    iconVerticalCollapsed,
    iconVerticalExpanded,
  } = useContext(NavGroupContext);
  const { root } = useTheme();

  let Wrapper = DropdownMenu;
  let Trigger = DropdownMenuTrigger;
  let Content = DropdownMenuContent;
  if (level >= 1) {
    Wrapper = DropdownMenuSub;
    Trigger = DropdownMenuSubTrigger as any;
    Content = DropdownMenuSubContent;
  }
  const [expanded, setExpanded] = useState(false);
  const [renderCount, setRenderCount] = useState(false);

  useEffect(() => {
    setRenderCount(true);
    // Defer the initial expansion to allow proper positioning
    if (initiallyExpanded) {
      requestAnimationFrame(() => {
        setExpanded(true);
      });
    }
  }, [initiallyExpanded]);

  return (
    <Wrapper
      {...rest}
      open={expanded}
      onOpenChange={(open) => {
        if (renderCount) {
          setExpanded(open);
          pushXsLog({
            ts: Date.now(),
            perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
            traceId: typeof window !== "undefined" ? (window as any)._xsCurrentTrace : undefined,
            kind: "focus:change",
            component: "NavGroup",
            ariaName: label,
            displayLabel: label,
            label,
            expanded: open,
          });
        }
      }}
    >
      <Trigger asChild disabled={disabled}>
        <NavLink
          className={classnames(styles.navLinkPadding, {
            [styles.navLinkPaddingLevel1]: level === 0,
            [styles.navLinkPaddingLevel2]: level === 1,
            [styles.navLinkPaddingLevel3]: level === 2,
            [styles.navLinkPaddingLevel4]: level === 3,
          })}
          icon={icon}
          style={{ flexShrink: 0 }}
          vertical={level >= 1}
          to={to}
          disabled={disabled}
          noIndicator={noIndicator}
          iconAlignment={iconAlignment}
        >
          {label}
          {expandIconAlignment === "end" && <div style={{ flex: 1 }} />}
          {level === 0 && <ThemedIcon name={expanded ? iconVerticalExpanded : iconVerticalCollapsed} />}
          {level >= 1 && (
            <ThemedIcon name={expanded ? iconHorizontalExpanded : iconHorizontalCollapsed} />
          )}
        </NavLink>
      </Trigger>
      <DropdownMenuPortal container={root}>
        <Content
          className={styles.dropdownList}
          style={{ display: "flex", flexDirection: "column" }}
          side={"bottom"}
          align={"start"}
        >
          {renderChild(node.children, {
            wrapChild: ({ node }, renderedChild, hints) => {
              if (hints?.opaque) {
                return renderedChild;
              }
              if (node.type === "List") {
                return renderedChild;
              }
              if (node.type === "NavGroup") {
                return renderedChild;
              }
              let child = renderedChild;
              if (node.type === "NavLink") {
                child = cloneElement(renderedChild as ReactElement, {
                  ...mergeProps((renderedChild as ReactElement).props, {
                    vertical: true,
                  }),
                });
              }
              return <DropdownMenuItem asChild={true}>{child}</DropdownMenuItem>;
            },
          })}
        </Content>
      </DropdownMenuPortal>
    </Wrapper>
  );
});

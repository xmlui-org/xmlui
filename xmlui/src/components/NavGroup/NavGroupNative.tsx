import {
  cloneElement,
  type CSSProperties,
  forwardRef,
  type ReactElement,
  type ReactNode,
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
import { Icon } from "../Icon/IconNative";
import { NavLink } from "../NavLink/NavLinkNative";
import { useAppLayoutContext } from "../App/AppLayoutContext";
import { NavPanelContext } from "../NavPanel/NavPanelNative";
import type { NavGroupMd } from "./NavGroup";
import { useLocation } from "@remix-run/react";
import classnames from "classnames";
import { NavGroupContext } from "./NavGroupContext";
import { getAppLayoutOrientation } from "../App/AppNative";

type NavGroupComponentDef = ComponentDef<typeof NavGroupMd>;

type Props = {
  style?: CSSProperties;
  label: string;
  icon?: React.ReactNode;
  to?: string;
  disabled?: boolean;
  node: NavGroupComponentDef;
  renderChild: RenderChildFn;
  initiallyExpanded: boolean;
  iconHorizontalExpanded?: string;
  iconHorizontalCollapsed?: string;
  iconVerticalExpanded?: string;
  iconVerticalCollapsed?: string;
};

export const defaultProps: Pick<
  Props,
  | "iconHorizontalExpanded"
  | "iconHorizontalCollapsed"
  | "iconVerticalExpanded"
  | "iconVerticalCollapsed"
> = {
  iconHorizontalExpanded: "chevronright",
  iconHorizontalCollapsed: "chevronright",
  iconVerticalExpanded: "chevrondown",
  iconVerticalCollapsed: "chevronright",
};

export const NavGroup = forwardRef(function NavGroup(
  {
    node,
    style,
    label,
    icon,
    renderChild,
    to,
    disabled = false,
    initiallyExpanded = false,
    iconHorizontalCollapsed,
    iconHorizontalExpanded,
    iconVerticalCollapsed,
    iconVerticalExpanded,
    ...rest
  }: Props,
  ref,
) {
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
      iconVerticalCollapsed: iconVerticalCollapsed ?? defaultProps.iconVerticalCollapsed,
      iconVerticalExpanded: iconVerticalExpanded ?? defaultProps.iconVerticalExpanded,
    };
  }, [
    iconHorizontalCollapsed,
    iconHorizontalExpanded,
    iconVerticalCollapsed,
    iconVerticalExpanded,
    level,
    layoutIsVertical,
  ]);

  return (
    <NavGroupContext.Provider value={navGroupContextValue}>
      {inline ? (
        <ExpandableNavGroup
          {...rest}
          to={to}
          style={style}
          label={label}
          icon={icon}
          node={node}
          renderChild={renderChild}
          ref={ref}
          initiallyExpanded={initiallyExpanded}
          disabled={disabled}
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
        />
      )}
    </NavGroupContext.Provider>
  );
});

type ExpandableNavGroupProps = {
  style?: CSSProperties;
  label: string;
  icon: ReactNode;
  node: NavGroupComponentDef;
  renderChild: RenderChildFn;
  to?: string;
  initiallyExpanded?: boolean;
  disabled?: boolean;
};

const ExpandableNavGroup = forwardRef(function ExpandableNavGroup(
  {
    style = EMPTY_OBJECT,
    label,
    icon,
    renderChild,
    node,
    to,
    initiallyExpanded = false,
    disabled = false,
    ...rest
  }: ExpandableNavGroupProps,
  ref,
) {
  const { level, iconVerticalCollapsed, iconVerticalExpanded, layoutIsVertical } =
    useContext(NavGroupContext);
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const groupContentInnerRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const hasActiveNavLink =
      groupContentInnerRef.current.querySelector(".xmlui-navlink-active") !== null;
    if (hasActiveNavLink) {
      setExpanded(true);
    }
  }, [pathname]);

  const toggleStyle = {
    ...style,
    "--nav-link-level": layoutIsVertical ? level : 0,
  };

  return (
    <>
      <NavLink
        {...rest}
        style={toggleStyle}
        onClick={() => setExpanded((prev) => !prev)}
        icon={icon}
        to={to}
        disabled={disabled}
        aria-expanded={expanded}
      >
        {label}
        <div style={{ flex: 1 }} />
        <Icon name={expanded ? iconVerticalExpanded : iconVerticalCollapsed} />
      </NavLink>
      <div
        data-testid="nav-group-content"
        aria-hidden={!expanded}
        className={classnames(styles.groupContent, {
          [styles.expanded]: expanded,
        })}
      >
        <div className={styles.groupContentInner} ref={groupContentInnerRef}>
          {renderChild(node.children)}
        </div>
      </div>
    </>
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
  },
  ref,
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
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [renderCount, setRenderCount] = useState(false);

  useEffect(() => setRenderCount(true), []);

  return (
    <Wrapper
      {...rest}
      open={expanded}
      onOpenChange={(open) => {
        if (renderCount) setExpanded(open);
      }}
    >
      <Trigger asChild disabled={disabled}>
        <NavLink
          icon={icon}
          style={{ flexShrink: 0 }}
          vertical={level >= 1}
          to={to}
          disabled={disabled}
        >
          {label}
          <div style={{ flex: 1 }} />
          {level === 0 && <Icon name={expanded ? iconVerticalExpanded : iconVerticalCollapsed} />}
          {level >= 1 && (
            <Icon name={expanded ? iconHorizontalExpanded : iconHorizontalCollapsed} />
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

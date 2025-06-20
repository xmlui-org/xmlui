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
    initiallyExpanded,
    iconHorizontalCollapsed,
    iconHorizontalExpanded,
    iconVerticalCollapsed,
    iconVerticalExpanded,
  }: Props,
  ref,
) {
  const { level } = useContext(NavGroupContext);
  const appLayoutContext = useAppLayoutContext();
  const navPanelContext = useContext(NavPanelContext);

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
  ]);

  return (
    <NavGroupContext.Provider value={navGroupContextValue}>
      {inline ? (
        <ExpandableNavGroup
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
          label={label}
          icon={icon}
          node={node}
          renderChild={renderChild}
          ref={ref}
          to={to}
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
  }: ExpandableNavGroupProps,
  ref,
) {
  const { level, iconVerticalCollapsed, iconVerticalExpanded } = useContext(NavGroupContext);
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
    "--nav-link-level": level,
  };

  return (
    <>
      <NavLink
        style={toggleStyle}
        onClick={() => setExpanded((prev) => !prev)}
        icon={icon}
        to={to}
        disabled={disabled}
      >
        {label}
        <div style={{ flex: 1 }} />
        <Icon name={expanded ? iconVerticalExpanded : iconVerticalCollapsed} />
      </NavLink>
      <div
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
  }: {
    style?: CSSProperties;
    label: string;
    icon: ReactNode;
    node: NavGroupComponentDef;
    renderChild: RenderChildFn;
    to?: string;
    disabled?: boolean;
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
  const [expanded, setExpanded] = useState(false);
  return (
    <Wrapper onOpenChange={(open) => setExpanded(open)}>
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
          {level === 0 && <Icon name={iconVerticalExpanded} />}
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

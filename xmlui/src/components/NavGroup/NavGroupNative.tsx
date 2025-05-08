import {
  cloneElement,
  createContext,
  type CSSProperties,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useContext,
  useMemo,
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

type NavGroupComponentDef = ComponentDef<typeof NavGroupMd>;

type Props = {
  style?: CSSProperties;
  label: string;
  icon?: React.ReactNode;
  to?: string;
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
  iconHorizontalExpanded: "chevronleft",
  iconHorizontalCollapsed: "chevronright",
  iconVerticalExpanded: "chevrondown",
  iconVerticalCollapsed: "chevronright",
};

const NavGroupContext = createContext({
  level: -1,
  iconHorizontalCollapsed: defaultProps.iconHorizontalCollapsed,
  iconHorizontalExpanded: defaultProps.iconHorizontalExpanded,
  iconVerticalCollapsed: defaultProps.iconVerticalCollapsed,
  iconVerticalExpanded: defaultProps.iconVerticalExpanded,
});

export const NavGroup = forwardRef(function NavGroup(
  {
    node,
    style,
    label,
    icon,
    renderChild,
    to,
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
  }, [iconHorizontalCollapsed, iconHorizontalExpanded, iconVerticalCollapsed, iconVerticalExpanded, level]);

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
        />
      ) : (
        <DropDownNavGroup
          label={label}
          icon={icon}
          node={node}
          renderChild={renderChild}
          ref={ref}
          to={to}
        />
      )}
    </NavGroupContext.Provider>
  );
});

const ExpandableNavGroup = forwardRef(function ExpandableNavGroup(
  {
    style = EMPTY_OBJECT,
    label,
    icon,
    renderChild,
    node,
    to,
    initiallyExpanded = false,
  }: {
    style?: CSSProperties;
    label: string;
    icon: ReactNode;
    node: NavGroupComponentDef;
    renderChild: RenderChildFn;
    to?: string;
    initiallyExpanded?: boolean;
  },
  ref,
) {
  const { level, iconVerticalCollapsed, iconVerticalExpanded } = useContext(NavGroupContext);
  const [expanded, setExpanded] = useState(initiallyExpanded);

  const toggleStyle = {
    ...style,
    paddingLeft: level >= 1 ? level * 2 + "em" : undefined,
  };

  return (
    <>
      <NavLink style={toggleStyle} onClick={() => setExpanded((prev) => !prev)} icon={icon} to={to}>
        {label}
        <div style={{ flex: 1 }} />
        <Icon name={expanded ? iconVerticalExpanded : iconVerticalCollapsed} />
      </NavLink>
      {expanded &&
        renderChild(node.children, {
          wrapChild: ({ node }, renderedChild) => {
            if (node.type === "NavLink") {
              const element = renderedChild as ReactElement;
              return cloneElement(element, {
                ...mergeProps((renderedChild as ReactElement).props, {
                  style: {
                    paddingLeft: (level + 1) * 2 + "em",
                  },
                }),
              });
            }
            return renderedChild;
          },
        })}
    </>
  );
});

const DropDownNavGroup = forwardRef(function DropDownNavGroup(
  {
    style,
    label,
    icon,
    renderChild,
    node,
    to,
  }: {
    style?: CSSProperties;
    label: string;
    icon: ReactNode;
    node: NavGroupComponentDef;
    renderChild: RenderChildFn;
    to?: string;
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
      <Trigger asChild>
        <NavLink icon={icon} style={{ flexShrink: 0 }} vertical={level >= 1} to={to}>
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

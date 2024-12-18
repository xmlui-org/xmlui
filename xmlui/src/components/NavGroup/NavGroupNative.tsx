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
import { Icon } from "@components/Icon/IconNative";
import type { RenderChildFn } from "@abstractions/RendererDefs";
import { NavLink } from "@components/NavLink/NavLinkNative";
import { useAppLayoutContext } from "@components/App/AppLayoutContext";
import { NavPanelContext } from "@components/NavPanel/NavPanelNative";
import { EMPTY_OBJECT } from "@components-core/constants";
import classnames from "@components-core/utils/classnames";
import { mergeProps } from "@components-core/utils/mergeProps";
import { useTheme } from "@components-core/theming/ThemeContext";
import { ComponentDef } from "@abstractions/ComponentDefs";
import { NavGroupMd } from "./NavGroup";

type NavGroupComponentDef = ComponentDef<typeof NavGroupMd>;

type Props = {
  style?: CSSProperties;
  label: string;
  icon?: React.ReactNode;
  to?: string;
  node: NavGroupComponentDef;
  renderChild: RenderChildFn;
};

const NavGroupContext = createContext({
  level: -1,
});

export const NavGroup = forwardRef(function NavGroup(
  { node, style, label, icon, renderChild, to }: Props,
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
    };
  }, [level]);

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
  const { level } = useContext(NavGroupContext);
  const [expanded, setExpanded] = useState(false);

  const toggleStyle = {
    ...style,
    paddingLeft: level >= 1 ? level * 2 + "em" : undefined,
  };

  return (
    <>
      <NavLink style={toggleStyle} onClick={() => setExpanded((prev) => !prev)} icon={icon} to={to}>
        {label}
        <div style={{ flex: 1 }} />
        <Icon name={expanded ? "chevronup" : "chevrondown"} />
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
  const { level } = useContext(NavGroupContext);
  const { root } = useTheme();

  let Wrapper = DropdownMenu;
  let Trigger = DropdownMenuTrigger;
  let Content = DropdownMenuContent;
  if (level >= 1) {
    Wrapper = DropdownMenuSub;
    Trigger = DropdownMenuSubTrigger as any;
    Content = DropdownMenuSubContent;
  }
  return (
    <Wrapper>
      <Trigger asChild>
        <NavLink icon={icon} style={{ flexShrink: 0 }} vertical={level >= 1} to={to}>
          <span
            className={classnames(styles.withNavGroupChevron, {
              [styles.pointRight]: level >= 1,
            })}
          >
            {label}
          </span>
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

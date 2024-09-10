import {
  cloneElement,
  createContext,
  type CSSProperties,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useContext,
  useMemo,
  useState
} from "react";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger
} from "@radix-ui/react-dropdown-menu";
import styles from "./NavGroup.module.scss";
import { Icon } from "@components/Icon/Icon";
import type { RenderChildFn } from "@abstractions/RendererDefs";
import { NavLink } from "@components/NavLink/NavLink";
import navLinkStyles from "@components/NavLink/NavLink.module.scss";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";
import { useAppLayoutContext } from "@components/App/AppLayoutContext";
import { NavPanelContext } from "@components/NavPanel/NavPanel";
import {EMPTY_OBJECT} from "@components-core/constants";
import classnames from "@components-core/utils/classnames";
import {mergeProps} from "@components-core/utils/mergeProps";
import {useTheme} from "@components-core/theming/ThemeContext";


//TODO illesg multiple style files review

// =====================================================================================================================
// React NavGroup component implementation

type Props = {
  style?: CSSProperties;
  label: string;
  icon?: React.ReactNode;
  node: NavGroupComponentDef;
  renderChild: RenderChildFn;
};

const NavGroupContext = createContext({
  level: -1,
});

const NavGroup = forwardRef(function NavGroup({ node, style, label, icon, renderChild }: Props, ref) {
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
        <ExpandableNavGroup style={style} label={label} icon={icon} node={node} renderChild={renderChild} ref={ref}/>
      ) : (
        <DropDownNavGroup label={label} icon={icon} node={node} renderChild={renderChild} ref={ref}/>
      )}
    </NavGroupContext.Provider>
  );
});

const ExpandableNavGroup = forwardRef(function ExpandableNavGroup({
  style = EMPTY_OBJECT,
  label,
  icon,
  renderChild,
  node,
}: {
  style?: CSSProperties;
  label: string;
  icon: ReactNode;
  node: NavGroupComponentDef;
  renderChild: RenderChildFn;
}, ref) {
  const { level } = useContext(NavGroupContext);
  const [expanded, setExpanded] = useState(false);

  const toggleStyle = {
    ...style,
    paddingLeft: level >= 1 ? (level * 2) + "em" : undefined
  }

  return (
    <>
      <NavLink style={toggleStyle} onClick={() => setExpanded((prev) => !prev)} icon={icon}>
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
                ...mergeProps((renderedChild  as ReactElement).props, {
                  style: {
                    paddingLeft: ((level + 1) * 2) + "em",
                  },
                })
              });
            }
            return renderedChild;
          },
        })}
    </>
  );
});

const DropDownNavGroup = forwardRef(function DropDownNavGroup({
  style,
  label,
  icon,
  renderChild,
  node,
}: {
  style?: CSSProperties;
  label: string;
  icon: ReactNode;
  node: NavGroupComponentDef;
  renderChild: RenderChildFn;
}, ref) {
  const { level } = useContext(NavGroupContext);
  const {root} = useTheme();

  let Wrapper = DropdownMenu;
  let Trigger = DropdownMenuTrigger;
  let Content = DropdownMenuContent;
  if(level >= 1){
     Wrapper = DropdownMenuSub;
     Trigger = DropdownMenuSubTrigger as any;
     Content = DropdownMenuSubContent;
  }
  return (
    <Wrapper>
      <Trigger asChild >
        <NavLink icon={icon} style={{ flexShrink: 0 }} vertical={level >=1}>
          <span className={ classnames(styles.withNavGroupChevron, {
            [styles.pointRight]: level >= 1
          })}>
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
              if(node.type === "NavGroup"){
                return renderedChild;
              }
              let child = renderedChild;
              if(node.type === "NavLink"){
                child =  cloneElement(renderedChild as ReactElement, {
                  ...mergeProps((renderedChild  as ReactElement).props, {
                    vertical: true
                  })
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

// =====================================================================================================================
// XMLUI NavGroup component definition

/** 
 * The \`NavGroup\` component is a container for grouping related navigation targets (\`NavLink\` components).
 * It can be displayed as a submenu in the App's UI.
 * @descriptionRef
 */
export interface NavGroupComponentDef extends ComponentDef<"NavGroup"> {
  props: {
    /** @descriptionRef */
    label?: string;
    /** @descriptionRef */
    icon?: string;
  };
}

export const NavGroupMd: ComponentDescriptor<NavGroupComponentDef> = {
  displayName: "NavGroup",
  description: "Groups related navigation components",
  props: {
    label: desc(
      "Specifies the optional text to display in the navigation group. " +
        "If omitted, children can be used to set the group's content."
    ),
    icon: desc("Optional icon ID to display the particular icon in the navigation group"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-bg-dropdown-NavGroup": "$color-bg-primary",
    "radius-dropdown-NavGroup": "$radius",
    "shadow-dropdown-NavGroup": "$shadow-spread"
  }
};

export const navGroupComponentRenderer = createComponentRenderer<NavGroupComponentDef>(
  "NavGroup",
  ({ node, extractValue, renderChild }) => {
    return (
      <NavGroup
        label={extractValue.asDisplayText(node.props.label)}
        icon={<Icon name={extractValue.asString(node.props.icon)} className={navLinkStyles.icon} />}
        node={node}
        renderChild={renderChild}
      />
    );
  },
  NavGroupMd
);

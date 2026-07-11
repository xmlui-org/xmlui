import styles from "./AppHeader.module.scss";

import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { paddingSubject } from "../../components-core/theming/themes/base-utils";
import { createMetadata, dComponent } from "../metadata-helpers";
import { SlotItem } from "../SlotItem";
import { defaultProps } from "./AppHeader.defaults";
import { AppContextAwareAppHeader } from "./AppHeaderReact";
import classnames from "classnames";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

const COMP = "AppHeader";

export const AppHeaderMd = createMetadata({
  status: "stable",
  description:
    "`AppHeader` defines the top navigation bar of your application within the " +
    "[`App`](/docs/reference/components/App) component. It automatically handles logo placement, " +
    "application title, and user profile areas with built-in responsive behavior.",
  props: {
    profileMenuTemplate: dComponent(
      `This property makes the profile menu slot of the \`${COMP}\` component customizable.`,
    ),
    logoTemplate: dComponent(
      "This property defines the template to use for the logo. With this property, you can " +
        "construct your custom logo instead of using a single image.",
    ),
    titleTemplate: dComponent(
      "This property defines the template to use for the title. With this property, you can " +
        "construct your custom title instead of using a single image.",
    ),
    title: {
      description: "Title for the application logo",
      valueType: "string",
    },
    showLogo: {
      description: "Show the logo in the header",
      valueType: "boolean",
      defaultValue: defaultProps.showLogo,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  themeVarDescriptions: {
    [`padding‑logo‑${COMP}`]:
      "This theme variable sets the padding of the logo in the app header (including all " +
      "`padding` variants, such as `paddingLeft-logo-AppHeader` and others).",
    [`width‑logo‑${COMP}`]: "Sets the width of the displayed logo",
  },
  defaultThemeVars: {
    [`padding-drawerToggle-${COMP}`]: "$space-0_5",
    [`size-drawerToggle-${COMP}`]: "$space-12",
    [`height-${COMP}`]: "$space-14",
    [`maxWidth-content-${COMP}`]: "$maxWidth-content-App",
    [`maxWidth-${COMP}`]: "$maxWidth-App",
    [`borderBottom-${COMP}`]: "1px solid $borderColor",
    ...paddingSubject(`logo-${COMP}`, { horizontal: "$space-0", vertical: "$space-0" }),
    ...paddingSubject(COMP, { horizontal: "$space-4", vertical: "$space-0" }),
    [`borderRadius-${COMP}`]: "0px",
    [`backgroundColor-${COMP}`]: "$color-surface-raised",
  },
});

export const appHeaderComponentRenderer = wrapComponent(
  COMP,
  AppContextAwareAppHeader,
  AppHeaderMd,
  {
    customRender: (_props, { node, renderChild, classes, layoutContext, extractValue }) => {
      // --- Convert the plain (text) logo template into component definition
      const logoTemplate = node.props.logoTemplate || node.slots?.logoSlot;
      const titleTemplate = node.props.titleTemplate || node.slots?.titleSlot;
      return (
        <AppContextAwareAppHeader
          profileMenu={renderChild(extractValue(node.props.profileMenuTemplate, true))}
          title={extractValue(node.props.title)}
          showLogo={extractValue.asOptionalBoolean(node.props.showLogo)}
          titleContent={
            titleTemplate && (
              <SlotItem
                node={titleTemplate}
                renderChild={renderChild}
                slotProps={{ title: extractValue(node.props.title) }}
              />
            )
          }
          logoContent={renderChild(logoTemplate, {
            type: "Stack",
            orientation: "horizontal",
          })}
          classes={classes}
          className={layoutContext?.themeClassName}
          renderChild={renderChild}
        >
          {renderChild(node.children, {
            // Since the AppHeader is a flex container, its children should behave the same as in a stack.
            type: "Stack",
          })}
        </AppContextAwareAppHeader>
      );
    },
  },
);

import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiNode } from "../../compiler/ir";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import { useEffect, useRef, type ReactNode } from "react";
import { useAppContext } from "../../components-core/AppContext";
import { ProfileMenu } from "../ProfileMenu/ProfileMenu";

const runtimeTemplateNames = new Set(["logoTemplate", "titleTemplate", "profileMenuTemplate"]);

export const appHeaderRuntimeRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: AppHeaderMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const { loggedInUser } = useAppContext();
    const children = adapter.node.children.filter((child) => !isRuntimeTemplateProperty(child));
    const titleTemplate = hasRuntimeTemplate(adapter.node.children, "titleTemplate");
    const logoTemplate = hasRuntimeTemplate(adapter.node.children, "logoTemplate");
    const profileTemplate = hasRuntimeTemplate(adapter.node.children, "profileMenuTemplate");
    return (
      <RuntimeAppHeaderRoot
        rootAttrs={adapter.rootAttrs()}
        title={adapter.stringProp("title")}
        showLogo={adapter.booleanProp("showLogo", defaultProps.showLogo)}
        titleContent={titleTemplate ? adapter.renderTemplate("titleTemplate") : undefined}
        logoContent={logoTemplate ? adapter.renderTemplate("logoTemplate") : undefined}
        profileMenu={
          profileTemplate
            ? adapter.renderTemplate("profileMenuTemplate")
            : <ProfileMenu loggedInUser={loggedInUser as any} />
        }
        classes={{ [COMPONENT_PART_KEY]: adapter.className }}
        renderChild={(child: any) => child ? adapter.context.renderElement(child, adapter.scope) : undefined}
      >
        {adapter.context.renderChildren(children, adapter.scope)}
      </RuntimeAppHeaderRoot>
    );
  },
});

function RuntimeAppHeaderRoot({
  rootAttrs,
  children,
  ...props
}: React.ComponentProps<typeof AppContextAwareAppHeader> & {
  rootAttrs: Record<string, unknown>;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    for (const [key, value] of Object.entries(rootAttrs)) {
      if (key === "className" || key === "style" || value === undefined || value === null) {
        continue;
      }
      if (key.startsWith("data-") || key.startsWith("aria-") || key === "role") {
        node.setAttribute(key, String(value));
      }
    }
  }, [rootAttrs]);
  return (
    <AppContextAwareAppHeader
      {...props}
      ref={ref}
    >
      {children}
    </AppContextAwareAppHeader>
  );
}

function isRuntimeTemplateProperty(node: XmluiNode): boolean {
  return node.kind === "element" &&
    node.type === "property" &&
    typeof node.props.name === "string" &&
    runtimeTemplateNames.has(node.props.name);
}

function hasRuntimeTemplate(children: XmluiNode[], name: string): boolean {
  return children.some((child) =>
    child.kind === "element" &&
    child.type === "property" &&
    child.props.name === name
  );
}

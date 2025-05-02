import styles from "./App.module.scss";

import { type ComponentDef, createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";

import { dComponent } from "../../components/metadata-helpers";
import { appLayoutMd } from "./AppLayoutContext";
import { App } from "./AppNative";
import { useMemo } from "react";

const COMP = "App";

export const AppMd = createMetadata({
  status: "stable",
  description:
    `The \`${COMP}\` component provides a UI frame for XMLUI apps. According to predefined (and ` +
    `run-time configurable) structure templates, \`${COMP}\` allows you to display your ` +
    `preferred layout.`,
  props: {
    layout: {
      description:
        `This property sets the layout template of the app. This setting determines the position ` +
        `and size of the app parts (such as header, navigation bar, footer, etc.) and the app's ` +
        `scroll behavior.`,
      availableValues: appLayoutMd,
    },
    loggedInUser: {
      description: `Stores information about the currently logged in user.`,
      valueType: "string",
    },
    logoTemplate: dComponent("Optional template of the app logo"),
    logo: {
      description: "Optional logo path",
      valueType: "string",
    },
    "logo-dark": {
      description: "Optional logo path in dark tone",
      valueType: "string",
    },
    "logo-light": {
      description: "Optional logo path in light tone",
      valueType: "string",
    },
    name: {
      description: "Optional application name (visible in the browser tab)",
      valueType: "string",
    },
    scrollWholePage: {
      description:
        `This boolean property specifies whether the whole page should scroll (\`true\`) or just ` +
        `the content area (\`false\`). The default value is \`true\`.`,
      valueType: "boolean",
      defaultValue: true,
    },
    noScrollbarGutters: {
      description:
        "This boolean property specifies whether the scrollbar gutters should be hidden.",
      valueType: "boolean",
      defaultValue: false,
    },
    defaultTone: {
      description: 'This property sets the app\'s default tone ("light" or "dark").',
      valueType: "string",
      defaultValue: "light",
      availableValues: ["light", "dark"],
    },
    defaultTheme: {
      description: "This property sets the app's default theme.",
      valueType: "string",
      defaultValue: "xmlui",
    },
  },
  events: {
    ready: d(`This event fires when the \`${COMP}\` component finishes rendering on the page.`),
  },
  themeVars: parseScssVar(styles.themeVars),
  themeVarDescriptions: {
    "maxWidth‑content‑App":
      "This theme variable defines the maximum width of the main content. If the main " +
      "content is broader, the engine adds margins to keep the expected maximum size.",
    "boxShadow‑header‑App": "This theme variable sets the shadow of the app's header section.",
    "boxShadow‑navPanel‑App":
      "This theme variable sets the shadow of the app's navigation panel section " +
      "(visible only in vertical layouts).",
    "width‑navPanel‑App":
      "This theme variable sets the width of the navigation panel when the app is displayed " +
      "with one of the vertical layouts.",
  },
  defaultThemeVars: {
    [`width-navPanel-${COMP}`]: "$space-64",
    [`maxWidth-content-${COMP}`]: "$maxWidth-content",
    [`boxShadow-header-${COMP}`]: "$boxShadow-spread",
    [`boxShadow-navPanel-${COMP}`]: "$boxShadow-spread",
    [`scroll-padding-block-Pages`]: "$space-4",
    [`backgroundColor-content-App`]: "$backgroundColor",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

function AppNode({ node, extractValue, renderChild, style, lookupEventHandler }) {
  const {AppHeader, Footer, NavPanel, restChildren} = useMemo(()=>{
    let AppHeader: ComponentDef;
    let Footer: ComponentDef;
    let NavPanel: ComponentDef;
    const restChildren: any[] = [];
    node.children?.forEach((rootChild) => {
      let transformedChild = { ...rootChild };
      if(rootChild.type === "Theme"){
        transformedChild.children = rootChild.children?.filter((child) => {
          if (child.type === "AppHeader") {
            AppHeader = {
              ...rootChild,
              children: [
                child
              ]
            };
            return false;
          } else if (child.type === "Footer") {
            Footer = {
              ...rootChild,
              children: [
                child
              ]
            };
            return false;
          } else if (child.type === "NavPanel") {
            NavPanel = {
              ...rootChild,
              children: [
                child
              ]
            };
            return false;
          }
          return true;
        })
        if(!transformedChild.children.length){
          transformedChild = null;
        }
      }
      if (rootChild.type === "AppHeader") {
        AppHeader = rootChild;
      } else if (rootChild.type === "Footer") {
        Footer = rootChild;
      } else if (rootChild.type === "NavPanel") {
        NavPanel = rootChild;
      } else if(transformedChild !== null){
        restChildren.push(transformedChild);
      }
    });
    return {
      AppHeader,
      Footer,
      NavPanel,
      restChildren
    }
  }, [node.children]);

  const layoutType = extractValue(node.props.layout);

  return (
    <App
      scrollWholePage={extractValue.asOptionalBoolean(node.props.scrollWholePage, true)}
      noScrollbarGutters={extractValue.asOptionalBoolean(node.props.noScrollbarGutters, false)}
      style={style}
      layout={layoutType}
      loggedInUser={extractValue(node.props.loggedInUser)}
      onReady={lookupEventHandler("ready")}
      header={renderChild(AppHeader)}
      footer={renderChild(Footer)}
      navPanel={renderChild(NavPanel)}
      navPanelDef={NavPanel}
      logoContentDef={node.props.logoTemplate}
      renderChild={renderChild}
      name={extractValue(node.props.name)}
      logo={extractValue(node.props.logo)}
      logoDark={extractValue(node.props["logo-dark"])}
      logoLight={extractValue(node.props["logo-light"])}
      defaultTone={extractValue(node.props.defaultTone)}
      defaultTheme={extractValue(node.props.defaultTheme)}
    >
      {renderChild(restChildren)}
    </App>
  );
}

export const appRenderer = createComponentRenderer(
  COMP,
  AppMd,
  ({ node, extractValue, renderChild, layoutCss, lookupEventHandler }) => {
    return (
      <AppNode
        node={node}
        renderChild={renderChild}
        extractValue={extractValue}
        style={layoutCss}
        lookupEventHandler={lookupEventHandler}
      />
    );
  },
);
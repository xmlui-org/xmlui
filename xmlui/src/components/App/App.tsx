import styles from "./App.module.scss";

import { type ComponentDef, createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";

import { dComponent } from "../../components/metadata-helpers";
import { appLayoutMd } from "./AppLayoutContext";
import { App } from "./AppNative";

const COMP = "App";

export const AppMd = createMetadata({
  status: "stable",
  description:
    `The \`${COMP}\` component provides a UI frame for XMLUI apps. According to predefined (and ` +
    `run-time configurable) structure templates, \`${COMP}\` allows you to display your ` +
    `preferred layout.`,
  props: {
    layout: {
      description: `This property sets the layout template of the app. This setting determines the position ` +
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
      description: `This boolean property specifies whether the whole page should scroll (\`true\`) or just ` +
        `the content area (\`false\`). The default value is \`true\`.`,
      valueType: "boolean",
      defaultValue: true,
    },
    noScrollbarGutters: {
      description: "This boolean property specifies whether the scrollbar gutters should be hidden.",
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
  defaultThemeVars: {
    [`width-navPanel-${COMP}`]: "$space-64",
    [`max-content-width-${COMP}`]: "$max-content-width",
    [`boxShadow-header-${COMP}`]: "$shadow-spread",
    [`boxShadow-pages-${COMP}`]: "$shadow-spread",
    [`scroll-padding-block-Pages`]: "$space-4",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

export const appRenderer = createComponentRenderer(
  COMP,
  AppMd,
  ({ node, extractValue, renderChild, layoutCss, lookupEventHandler }) => {
    let AppHeader: ComponentDef;
    let Footer: ComponentDef;
    let NavPanel: ComponentDef;
    const restChildren: any[] = [];
    node.children?.forEach((child) => {
      if (child.type === "AppHeader") {
        AppHeader = child;
      } else if (child.type === "Footer") {
        Footer = child;
      } else if (child.type === "NavPanel") {
        NavPanel = child;
      } else {
        restChildren.push(child);
      }
    });

    const layoutType = extractValue(node.props.layout);

    return (
      <App
        scrollWholePage={extractValue.asOptionalBoolean(node.props.scrollWholePage, true)}
        noScrollbarGutters={extractValue.asOptionalBoolean(node.props.noScrollbarGutters, false)}
        style={layoutCss}
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
  },
);

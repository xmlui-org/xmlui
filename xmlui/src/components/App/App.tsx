import { ComponentDefNew, createMetadata, d } from "@abstractions/ComponentDefs";
import { appLayouts } from "./AppLayoutContext";

import styles from "./App.module.scss";
import { createComponentRendererNew } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { dComponent } from "@components/metadata-helpers";
import { App } from "./AppNative";

const COMP = "App";

export const AppMd = createMetadata({
  description:
    `The \`${COMP}\` component provides a UI frame for XMLUI apps. According to predefined (and ` +
    `run-time configurable) structure templates, \`${COMP}\` allows you to display your ` +
    `preferred layout.`,
  props: {
    layout: d(
      `This property sets the layout template of the app. This setting determines the position ` +
        `and size of the app parts (such as header, navigation bar, footer, etc.) and the app's ` +
        `scroll behavior.`,
      appLayouts,
    ),
    loggedInUser: d(`Stores information about the currently logged in user.`),
    logoTemplate: dComponent("Optional template of the app logo"),
    scrollWholePage: d(
      `This boolean property specifies whether the whole page should scroll (\`true\`) or just ` +
        `the content area (\`false\`). The default value is \`true\`.`,
      null,
      "boolean",
      true,
    ),
  },
  events: {
    ready: d(`This event fires when the \`${COMP}\` component finishes rendering on the page.`),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`width-navPanel-${COMP}`]: "$space-72",
    [`max-content-width-${COMP}`]: "$max-content-width",
    [`shadow-header-${COMP}`]: "$shadow-spread",
    [`shadow-pages-${COMP}`]: "$shadow-spread",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

export const appRenderer = createComponentRendererNew(
  COMP,
  AppMd,
  ({ node, extractValue, renderChild, layoutCss, lookupEventHandler }) => {
    let AppHeader: ComponentDefNew;
    let Footer: ComponentDefNew;
    let NavPanel: ComponentDefNew;
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
        style={layoutCss}
        layout={layoutType}
        loggedInUser={extractValue(node.props.loggedInUser)}
        logoContent={renderChild(node.props.logoTemplate)}
        onReady={lookupEventHandler("ready")}
        header={renderChild(AppHeader)}
        footer={renderChild(Footer)}
        navPanel={renderChild(NavPanel)}
        navPanelInDrawer={renderChild(NavPanel, { inDrawer: true })}
        navPanelDef={NavPanel}
      >
        {renderChild(restChildren)}
      </App>
    );
  },
);

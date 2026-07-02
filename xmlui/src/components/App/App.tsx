import { wrapComponent } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import {
  createMetadata,
  dComponent,
} from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { App } from "./AppReact";
import appStylesSource from "./App.module.scss?xmlui-theme-vars";

export { defaultProps } from "./App.defaults";

export const AppMd = createMetadata({
  status: "stable",
  description:
    "The `App` component is the root container that defines your application's overall structure and layout.",
  excludeBehaviors: ["tooltip", "animation", "label"],
  optimization: {
    unstableChildInjectedVars: ["$pathname", "$routeParams", "$queryParams", "$linkInfo"],
  },
  props: {
    layout: {
      description: "This property sets the layout template of the app.",
      valueType: "string",
      availableValues: ["horizontal", "vertical", "vertical-sticky"],
    },
    loggedInUser: {
      description: "Stores information about the currently logged-in user.",
      valueType: "string",
    },
    logoTemplate: dComponent("Optional template of the app logo"),
    logo: {
      description: "Optional logo path",
      valueType: "string",
    },
    name: {
      description: "Optional application name.",
      valueType: "string",
    },
    scrollWholePage: {
      description: "This boolean property specifies whether the whole page should scroll.",
      valueType: "boolean",
      defaultValue: true,
    },
    noScrollbarGutters: {
      description: "Controls whether the app reserves scrollbar gutter space.",
      valueType: "boolean",
      defaultValue: false,
    },
    "width-navPanel-App": {
      description: "Overrides the App navigation panel width theme variable.",
      valueType: "string",
    },
    "borderRight-navPanelWrapper-App": {
      description: "Overrides the App navigation panel wrapper right border theme variable.",
      valueType: "string",
    },
    defaultTone: {
      description: "This property sets the app's default tone.",
      valueType: "string",
      availableValues: ["light", "dark"],
      isStrictEnum: true,
      defaultValue: "light",
    },
    defaultTheme: {
      description: "This property sets the app's default theme.",
      valueType: "string",
      defaultValue: "xmlui",
    },
    useHashBasedRouting: {
      description: "Use hash-based routing instead of browser history routing.",
      valueType: "boolean",
      defaultValue: false,
    },
    locale: {
      description: "Sets the active locale used by App.translate and I18n.",
      valueType: "string",
    },
    localeBundles: {
      description: "Locale message bundles used by App.translate and I18n.",
      valueType: "any",
    },
    testId: {
      description: "Adds a test identifier to the app root element.",
      valueType: "string",
    },
  },
  events: {
    ready: {
      description: "This event fires when the `App` component finishes rendering on the page.",
      signature: "ready(): void",
      parameters: {},
    },
    messageReceived: {
      description: "This event fires when the `App` component receives a window message.",
      signature: "messageReceived(data: any): void",
      parameters: {
        data: "The data sent from the other window via postMessage.",
      },
    },
    willNavigate: {
      description:
        "This event fires before programmatic navigation. Return false to cancel navigation.",
      signature: "willNavigate(to: string, queryParams?: any): boolean | void",
      parameters: {
        to: "The target path or history delta to navigate to.",
        queryParams: "Optional query parameters passed to the navigation request.",
      },
    },
    didNavigate: {
      description: "This event fires after the current route changes.",
      signature: "didNavigate(to: string, queryParams?: any): void",
      parameters: {
        to: "The path navigated to.",
        queryParams: "The query parameters for the current route.",
      },
    },
    keyDown: {
      description: "This event fires when a key is pressed at the app level.",
      signature: "keyDown(event: KeyboardEvent): void",
      parameters: {
        event: "The keyboard event object.",
      },
    },
    keyUp: {
      description: "This event fires when a key is released at the app level.",
      signature: "keyUp(event: KeyboardEvent): void",
      parameters: {
        event: "The keyboard event object.",
      },
    },
  },
  contextVars: {
    $pathname: {
      description: "The current app route pathname.",
      valueType: "string",
    },
    $routeParams: {
      description: "The current route parameters.",
      valueType: "any",
    },
    $queryParams: {
      description: "The current query parameters.",
      valueType: "any",
    },
    $queryString: {
      description: "The current query string.",
      valueType: "string",
    },
  },
  themeVars: extractScssThemeVars(appStylesSource),
  limitThemeVarsToComponent: true,
  themeVarContributorComponents: ["AppHeader", "Footer", "NavPanel", "Pages"],
  themeVarDescriptions: {
    "maxWidth-content-App":
      "This theme variable defines the maximum width of the main content. If the main " +
      "content is broader, the engine adds margins to keep the expected maximum size.",
    "boxShadow-header-App": "This theme variable sets the shadow of the app's header section.",
    "boxShadow-navPanel-App":
      "This theme variable sets the shadow of the app's navigation panel section " +
      "(visible only in vertical layouts).",
    "width-navPanel-App":
      "This theme variable sets the width of the navigation panel when the app is displayed " +
      "with one of the vertical layouts.",
  },
  defaultThemeVars: {
    "maxWidth-drawer-App": "100%",
    "top-closeButton-App": "$space-2",
    "right-closeButton-App": "$space-2",
    "width-navPanel-App": "$space-64",
    "width-navPanel-collapsed-App": "48px",
    "borderRight-navPanelWrapper-App": "1px solid $borderColor",
    "backgroundColor-navPanel-App": "$backgroundColor",
    "maxWidth-content-App": "$maxWidth-content",
    "maxWidth-App": "$maxWidth-content",
    "boxShadow-header-App": "none",
    "boxShadow-navPanel-App": "none",
    "scroll-padding-block-Pages": "$space-4",
    "backgroundColor-content-App": "$backgroundColor",
    "paddingHorizontal-content-App": "$space-4",
    "paddingVertical-content-App": "$space-5",
    "gap-content-App": "$space-5",
  },
});

export const appRenderer = wrapComponent({
  name: "App",
  metadata: AppMd as ComponentMetadata,
  renderer: App,
});

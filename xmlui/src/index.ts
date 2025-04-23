import type {
  StandaloneAppDescription,
  StandaloneJsonConfig,
} from "./components-core/abstractions/standalone";
import type { ApiInterceptorDefinition } from "./components-core/interception/abstractions";
import StandaloneApp, { startApp } from "./components-core/StandaloneApp";
import type {
  ComponentDef,
  ComponentLike,
  CompoundComponentDef,
} from "./abstractions/ComponentDefs";
import { createMetadata, d } from "./abstractions/ComponentDefs";
import { AppRoot } from "./components-core/rendering/AppRoot";
import { createComponentRenderer } from "./components-core/renderers";
import type { TreeNode } from "./components-core/abstractions/treeAbstractions";
import { Icon } from "./components/Icon/IconNative";
import { ErrorBoundary } from "./components-core/rendering/ErrorBoundary";
import { Stack } from "./components/Stack/StackNative";
import { Button } from "./components/Button/ButtonNative";
import { Splitter } from "./components/Splitter/SplitterNative";
import { useTheme } from "./components-core/theming/ThemeContext";
import { toCssVar } from "./parsers/style-parser/StyleParser";
import { getColor } from "./components-core/utils/css-utils";
import { useColors } from "./components-core/utils/hooks";
import type { ComponentRendererDef, RendererContext } from "./abstractions/RendererDefs";
import { parseScssVar } from "./components-core/theming/themeVars";
import type { RegisterComponentApiFn } from "./abstractions/RendererDefs";
import type { ComponentMetadata } from "./abstractions/ComponentDefs";
import StandaloneExtensionManager from "./components-core/StandaloneExtensionManager";
import { ThemeDefinition } from "./abstractions/ThemingDefs";
import { useDevTools } from "./components-core/InspectorContext";
import { useLogger } from "./logging/LoggerContext";
import { TabItemComponent } from "./components/Tabs/TabItemNative";
import { Tabs } from "./components/Tabs/TabsNative";

export type {
  ThemeDefinition,
  ComponentDef,
  ComponentRendererDef,
  CompoundComponentDef,
  ComponentLike,
  StandaloneAppDescription,
  StandaloneJsonConfig,
  ApiInterceptorDefinition,
  RegisterComponentApiFn,
  //TODO review from here (added for playground)
  TreeNode, //TODO REMOVE
  RendererContext,
  ComponentMetadata,
};
export {
  StandaloneApp,
  StandaloneExtensionManager,
  createComponentRenderer,
  createMetadata,
  d,
  parseScssVar,
  startApp,
  useTheme,
  AppRoot,
  ErrorBoundary,
  Icon,
  Stack,
  Button,
  Splitter,
  getColor,
  TabItemComponent as TabItem,
  Tabs,
  useColors,
  toCssVar,
  useDevTools,
  useLogger
};

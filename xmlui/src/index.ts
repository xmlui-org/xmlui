import type {
  StandaloneAppDescription,
  StandaloneJsonConfig,
} from "./components-core/abstractions/standalone";
import type { ApiInterceptorDefinition } from "./components-core/interception/abstractions";
import StandaloneApp, { startApp } from "./components-core/StandaloneApp";
import type {
  ComponentDef,
  ComponentLike,
  ComponentMetadata,
  CompoundComponentDef,
} from "./abstractions/ComponentDefs";
import { AppRoot } from "./components-core/rendering/AppRoot";
import { createComponentRenderer } from "./components-core/renderers";
import type { TreeNode } from "./components-core/abstractions/treeAbstractions";
import { Icon } from "./components/Icon/IconNative";
import { ErrorBoundary } from "./components-core/rendering/ErrorBoundary";
import { Stack } from "./components/Stack/StackNative";
import { Button } from "./components/Button/ButtonNative";
import { Splitter } from "./components/Splitter/SplitterNative";
import { useTheme, useThemes } from "./components-core/theming/ThemeContext";
import { toCssVar } from "./parsers/style-parser/StyleParser";
import { getColor } from "./components-core/utils/css-utils";
import { useColors } from "./components-core/utils/hooks";
import type {
  ComponentRendererDef,
  RegisterComponentApiFn,
  RendererContext,
} from "./abstractions/RendererDefs";
import { parseScssVar } from "./components-core/theming/themeVars";
import StandaloneExtensionManager from "./components-core/StandaloneExtensionManager";
import type { ThemeDefinition, ThemeTone } from "./abstractions/ThemingDefs";
import { useDevTools } from "./components-core/InspectorContext";
import { useLogger } from "./logging/LoggerContext";
import { TabItemComponent } from "./components/Tabs/TabItemNative";
import { Tabs } from "./components/Tabs/TabsNative";
import { errReportComponent, xmlUiMarkupToComponent } from "./components-core/xmlui-parser";
import { ApiInterceptorProvider } from "./components-core/interception/ApiInterceptorProvider";
import { Spinner } from "./components/Spinner/SpinnerNative";
import type { XmlUiNode } from "./parsers/xmlui-parser";
import { XmlUiHelper } from "./parsers/xmlui-parser";
import { Text } from "./components/Text/TextNative";
import { TextBox } from "./components/TextBox/TextBoxNative";
import { NestedApp } from "./components/NestedApp/NestedAppNative";
import { builtInThemes } from "./components-core/theming/ThemeProvider";
import { VisuallyHidden } from "./components/VisuallyHidden";
import { LinkNative } from "./components/Link/LinkNative";
import { ToneChangerButton } from "./components/ToneChangerButton/ToneChangerButton";
import { Logo } from "./components/Logo/LogoNative";
import { useSearchContextContent } from "./components/App/SearchContext";
import { useAppLayoutContext } from "./components/App/AppLayoutContext";
import { useEvent } from "./components-core/utils/misc";
import { createMetadata, d } from "./components/metadata-helpers";
import StandaloneComponent from "./components-core/rendering/StandaloneComponent";
import { SimpleTooltip } from "./components/SimpleTooltip/SimpleTooltipNative";

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
  ThemeTone,
  XmlUiNode,
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
  useLogger,
  errReportComponent,
  xmlUiMarkupToComponent,
  ApiInterceptorProvider,
  Spinner,
  useThemes,
  builtInThemes,
  XmlUiHelper,
  Text,
  TextBox,
  NestedApp,
  VisuallyHidden,
  LinkNative,
  ToneChangerButton,
  Logo,
  useSearchContextContent,
  useAppLayoutContext,
  useEvent,
  StandaloneComponent,
  SimpleTooltip
};

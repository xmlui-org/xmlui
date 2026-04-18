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
  PropertyValueDescription,
} from "./abstractions/ComponentDefs";
import { AppRoot } from "./components-core/rendering/AppRoot";
import {
  createComponentRenderer,
  createUserDefinedComponentRenderer,
} from "./components-core/renderers";
import { wrapComponent, wrapCompound } from "./components-core/wrapComponent";
import type { TreeNode } from "./components-core/abstractions/treeAbstractions";
import { ThemedIcon as Icon } from "./components/Icon/Icon";
import { ErrorBoundary } from "./components-core/rendering/ErrorBoundary";
import { ThemedStack as Stack } from "./components/Stack/Stack";
import { ThemedButton as Button } from "./components/Button/Button";
import { Splitter } from "./components/Splitter/SplitterReact";
import { useTheme, useThemes } from "./components-core/theming/ThemeContext";
import { toCssVar } from "./parsers/style-parser/StyleParser";
import { getColor } from "./components-core/utils/css-utils";
import { useColors } from "./components-core/utils/hooks";
import type {
  ComponentRendererDef,
  CompoundComponentRendererInfo,
  RegisterComponentApiFn,
  RendererContext,
} from "./abstractions/RendererDefs";
import { parseScssVar } from "./components-core/theming/themeVars";
import StandaloneExtensionManager from "./components-core/StandaloneExtensionManager";
import type { ThemeDefinition, ThemeTone } from "./abstractions/ThemingDefs";
import { useDevTools } from "./components-core/InspectorContext";
import { useLogger } from "./logging/LoggerContext";
import { ThemedTabItem as TabItemComponent } from "./components/Tabs/TabItem";
import { ThemedTabs as Tabs } from "./components/Tabs/Tabs";
import { errReportComponent, xmlUiMarkupToComponent } from "./components-core/xmlui-parser";
import { ApiInterceptorProvider } from "./components-core/interception/ApiInterceptorProvider";
import { ThemedSpinner as Spinner } from "./components/Spinner/Spinner";
import type { XmlUiNode } from "./parsers/xmlui-parser";
import { XmlUiHelper } from "./parsers/xmlui-parser";
import { ThemedText as Text } from "./components/Text/Text";
import { ThemedTextBox as TextBox } from "./components/TextBox/TextBox";
import { NestedApp } from "./components/NestedApp/NestedAppReact";
import { builtInThemes } from "./components-core/theming/ThemeProvider";
import { VisuallyHidden } from "./components/VisuallyHidden";
import { ThemedLinkNative as LinkNative } from "./components/Link/Link";
import { ThemedHeading as Heading } from "./components/Heading/Heading";
import { ThemedImage as Image } from "./components/Image/Image";
import { ThemedMarkdown as Markdown } from "./components/Markdown/Markdown";
import { ThemedTableOfContents as TableOfContents } from "./components/TableOfContents/TableOfContents";
import { ThemedFlowLayout as FlowLayout, FlowItemWrapper } from "./components/FlowLayout/FlowLayout";
import { COMPONENT_PART_KEY } from "./components-core/theming/responsive-layout";
import { useAppContext } from "./components-core/AppContext";
import { ToneChangerButton } from "./components/ToneChangerButton/ToneChangerButton";
import { NavPanelCollapseButton } from "./components/NavPanelCollapseButton/NavPanelCollapseButton";
import { Logo } from "./components/Logo/LogoNative";
import { Theme } from "./components/Theme/ThemeReact";
import { OptionContext, useOption } from "./components/Select/OptionContext";

import {
  type SearchItemData,
  useSearchContextContent,
  SEARCH_DEFAULT_CATEGORY,
  SEARCH_CATEGORIES,
} from "./components/App/SearchContext";
import { useAppLayoutContext } from "./components/App/AppLayoutContext";
import { useComponentThemeClass } from "./components-core/theming/utils";
import { StyleProvider } from "./components-core/theming/StyleContext";
import { StyleRegistry } from "./components-core/theming/StyleRegistry";
import { useEvent } from "./components-core/utils/misc";
import {
  createMetadata,
  d,
  dComponent,
  dAutoFocus,
  dClick,
  dCollapse,
  dDidChange,
  dDidClose,
  dDidOpen,
  dEnabled,
  dFocus,
  dEndIcon,
  dEndText,
  dExpanded,
  dExpand,
  dGotFocus,
  dIndeterminate,
  dInit,
  dInitialValue,
  dInternal,
  dLabel,
  dLabelBreak,
  dLabelPosition,
  dLabelWidth,
  dLostFocus,
  dMaxLength,
  dMulti,
  dOrientation,
  dPlaceholder,
  dReadonly,
  dRequired,
  dStartIcon,
  dStartText,
  dSetValueApi,
  dTriggerTemplate,
  dValidationStatus,
  dValue,
  dValueApi,
} from "./components/metadata-helpers";
import StandaloneComponent from "./components-core/rendering/StandaloneComponent";
import { ToneSwitch } from "./components/ToneSwitch/ToneSwitchNative";
import { Tooltip } from "./components/Tooltip/TooltipNative";
import {
  ThemedDropdownMenu as DropdownMenu,
  ThemedMenuItem as MenuItem,
} from "./components/DropdownMenu/DropdownMenu";
import { ContentSeparator } from "./components/ContentSeparator/ContentSeparatorReact";
import { MemoizedItem } from "./components/container-helpers";
import { HiddenOption } from "./components/Select/HiddenOption";
import OptionTypeProvider from "./components/Option/OptionTypeProvider";
import type { Option } from "./components/abstractions";

export type {
  ThemeDefinition,
  ComponentDef,
  ComponentRendererDef,
  CompoundComponentDef,
  CompoundComponentRendererInfo,
  PropertyValueDescription,
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
  SearchItemData,
};
export {
  StandaloneApp,
  StandaloneExtensionManager,
  createComponentRenderer,
  createUserDefinedComponentRenderer,
  createMetadata,
  d,
  dComponent,
  dAutoFocus,
  dClick,
  dCollapse,
  dDidChange,
  dDidClose,
  dDidOpen,
  dEnabled,
  dFocus,
  dEndIcon,
  dEndText,
  dExpanded,
  dExpand,
  dGotFocus,
  dIndeterminate,
  dInit,
  dInitialValue,
  dInternal,
  dLabel,
  dLabelBreak,
  dLabelPosition,
  dLabelWidth,
  dLostFocus,
  dMaxLength,
  dMulti,
  dOrientation,
  dPlaceholder,
  dReadonly,
  dRequired,
  dStartIcon,
  dStartText,
  dSetValueApi,
  dTriggerTemplate,
  dValidationStatus,
  dValue,
  dValueApi,
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
  Heading,
  Image,
  Markdown,
  TableOfContents,
  FlowLayout,
  FlowItemWrapper,
  COMPONENT_PART_KEY,
  useAppContext,
  ToneChangerButton,
  NavPanelCollapseButton,
  Logo,
  useSearchContextContent,
  useAppLayoutContext,
  useComponentThemeClass,
  StyleProvider,
  StyleRegistry,
  useEvent,
  StandaloneComponent,
  Theme,
  ToneSwitch,
  Tooltip,
  DropdownMenu,
  MenuItem,
  ContentSeparator,
  MemoizedItem,
  SEARCH_DEFAULT_CATEGORY,
  SEARCH_CATEGORIES,
  wrapComponent,
  wrapCompound,
  HiddenOption,
  OptionTypeProvider,
  Option,
  OptionContext,
  useOption,
};

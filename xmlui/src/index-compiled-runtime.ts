/**
 * xmlui/compiled-runtime
 *
 * Entry point for compiled XMLUI apps. Exports:
 *  - All UI components (as Themed* variants under their public names)
 *  - Providers needed for the app shell
 *  - Hooks for app context, theming
 *  - Thin helpers for the compiler-generated output
 *
 * The compiler imports from this entry point instead of the full xmlui package,
 * which avoids pulling in the parser, expression interpreter, and renderer pipeline.
 *
 * This file must NOT import anything from:
 *   - components-core/rendering/  (renderer pipeline)
 *   - components-core/script-runner/  (expression evaluator)
 *   - parsers/  (XML/scripting parsers)
 *   - components-core/StandaloneApp  (standalone bootstrap)
 */

// ---------------------------------------------------------------------------
// Components — Themed* variants re-exported under their public names
// ---------------------------------------------------------------------------

export { ThemedAutoComplete as AutoComplete } from "./components/AutoComplete/AutoComplete";
export { ThemedAvatar as Avatar } from "./components/Avatar/Avatar";
export { ThemedButton as Button } from "./components/Button/Button";
export { ThemedCard as Card } from "./components/Card/Card";
export { ThemedCodeBlock as CodeBlock } from "./components/CodeBlock/CodeBlock";
export { ThemedColorPicker as ColorPicker } from "./components/ColorPicker/ColorPicker";
export { ThemedDatePicker as DatePicker } from "./components/DatePicker/DatePicker";
export { ThemedDropdownMenu as DropdownMenu, ThemedMenuItem as MenuItem } from "./components/DropdownMenu/DropdownMenu";
export { ThemedExpandableItem as ExpandableItem } from "./components/ExpandableItem/ExpandableItem";
export { ThemedFileInput as FileInput } from "./components/FileInput/FileInput";
export { ThemedFlowLayout as FlowLayout, FlowItemWrapper } from "./components/FlowLayout/FlowLayout";
export { ThemedHeading as Heading } from "./components/Heading/Heading";
export { ThemedIcon as Icon } from "./components/Icon/Icon";
export { ThemedImage as Image } from "./components/Image/Image";
export { ThemedLinkNative as Link } from "./components/Link/Link";
export { ThemedLogo as Logo } from "./components/Logo/Logo";
export { ThemedMarkdown as Markdown } from "./components/Markdown/Markdown";
export { ThemedModalDialog as ModalDialog } from "./components/ModalDialog/ModalDialog";
export { ThemedNavLink as NavLink } from "./components/NavLink/NavLink";
export { ThemedNumberBox as NumberBox } from "./components/NumberBox/NumberBox";
export { ThemedPagination as Pagination } from "./components/Pagination/Pagination";
export { ThemedRadioGroup as RadioGroup } from "./components/RadioGroup/RadioGroup";
export { ThemedScroller as ScrollViewer } from "./components/ScrollViewer/ScrollViewer";
export { ThemedSelect as Select } from "./components/Select/Select";
export { ThemedSlider as Slider } from "./components/Slider/Slider";
export { ThemedSpaceFiller as SpaceFiller } from "./components/SpaceFiller/SpaceFiller";
export { ThemedSpinner as Spinner } from "./components/Spinner/Spinner";
export { ThemedStack as Stack } from "./components/Stack/Stack";
export { ThemedTabItem as TabItem } from "./components/Tabs/TabItem";
export { ThemedTableOfContents as TableOfContents } from "./components/TableOfContents/TableOfContents";
export { ThemedTabs as Tabs } from "./components/Tabs/Tabs";
export { ThemedText as Text } from "./components/Text/Text";
export { ThemedTextArea as TextArea } from "./components/TextArea/TextArea";
export { ThemedTextBox as TextBox } from "./components/TextBox/TextBox";
export { ThemedToggle as Checkbox } from "./components/Checkbox/Checkbox";
export { ThemedTooltip as Tooltip } from "./components/Tooltip/Tooltip";
export { ThemedTreeDisplay as TreeDisplay } from "./components/TreeDisplay/TreeDisplay";

// Non-Themed components (plain named exports)
export { ContentSeparator } from "./components/ContentSeparator/ContentSeparatorNative";
export { MemoizedItem } from "./components/container-helpers";
export { NavPanelCollapseButton } from "./components/NavPanelCollapseButton/NavPanelCollapseButton";
export { NestedApp } from "./components/NestedApp/NestedAppNative";
export { Splitter } from "./components/Splitter/SplitterNative";
export { Theme } from "./components/Theme/ThemeNative";
export { ToneChangerButton } from "./components/ToneChangerButton/ToneChangerButton";
export { ToneSwitch } from "./components/ToneSwitch/ToneSwitchNative";
export { VisuallyHidden } from "./components/VisuallyHidden";

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

export { default as ThemeProvider } from "./components-core/theming/ThemeProvider";
export { IconProvider } from "./components/IconProvider";
export { ConfirmationModalContextProvider } from "./components/ModalDialog/ConfirmationModalContextProvider";

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export { useAppContext } from "./components-core/AppContext";
export { useTheme, useThemes } from "./components-core/theming/ThemeContext";
export { builtInThemes } from "./components-core/theming/ThemeProvider";

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

export { ErrorBoundary } from "./components-core/rendering/ErrorBoundary";

// ---------------------------------------------------------------------------
// Compiler-specific helpers (new, thin)
// ---------------------------------------------------------------------------

export { createActionRegistry } from "./compiled-runtime/action-registry";
export type { ActionRegistry, ActionContext, ActionFn } from "./compiled-runtime/action-registry";

export { createGlobalStateProvider } from "./compiled-runtime/global-state";
export type { GlobalAction, GlobalStateProviderResult } from "./compiled-runtime/global-state";

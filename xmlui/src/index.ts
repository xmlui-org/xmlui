import type { StandaloneAppDescription, StandaloneJsonConfig } from "@components-core/abstractions/standalone";
import type { ApiInterceptorDefinition } from "@components-core/interception/abstractions";
import StandaloneApp, { startApp } from "@components-core/StandaloneApp";
import type { ComponentDef, CompoundComponentDef, ComponentLike } from "@abstractions/ComponentDefs";
import RootComponent from "@components-core/RootComponent";
import { createComponentRenderer } from "@components-core/renderers";
import type { TreeNode } from "@components-core/abstractions/treeAbstractions";
import { Icon } from "@components/Icon/Icon";
import { ErrorBoundary } from "@components-core/ErrorBoundary";
import { Stack } from "@components/Stack/Stack";
import { Button } from "@components/Button/Button";
import { Splitter } from "@components/Splitter/Splitter";
import { useTheme } from "@components-core/theming/ThemeContext";
import { toCssVar } from "./parsers/style-parser/StyleParser";
import { ThemeDefinition } from "@components-core/theming/abstractions";
import { parseXmlUiMarkup } from "@components-core/xmlui-parser";
import { getColor } from "@components-core/utils/css-utils";
import { useColors } from "@components-core/utils/hooks";
import { collectedComponentMetadata } from "@components/collectedComponentMetadata"

export type {
  ThemeDefinition,
  ComponentDef,
  CompoundComponentDef,
  ComponentLike,
  StandaloneAppDescription,
  StandaloneJsonConfig,
  ApiInterceptorDefinition,
  //TODO review from here (added for playground)
  TreeNode, //TODO REMOVE
};
export {
  StandaloneApp,
  createComponentRenderer,
  startApp,
  useTheme, //TODO REMOVE
  RootComponent, //TODO remove, playground uses it
  ErrorBoundary, //TODO remove, playground uses it
  Icon, // TODO REMOVE from export
  Stack, // TODO REMOVE from export
  Button, // TODO REMOVE from export
  Splitter, // TODO REMOVE from export
  getColor,
  useColors,
  toCssVar,
  parseXmlUiMarkup,
  collectedComponentMetadata
};

import type {
  StandaloneAppDescription,
  StandaloneJsonConfig,
} from "@components-core/abstractions/standalone";
import type { ApiInterceptorDefinition } from "@components-core/interception/abstractions";
import StandaloneApp, { startApp } from "@components-core/StandaloneApp";
import type {
  ComponentDef,
  ComponentLike,
  CompoundComponentDef,
} from "@abstractions/ComponentDefs";
import { createMetadata, d } from "@abstractions/ComponentDefs";
import { AppRoot } from "@components-core/rendering/AppRoot";
import { createComponentRenderer } from "@components-core/renderers";
import type { TreeNode } from "@components-core/abstractions/treeAbstractions";
import { Icon } from "@components/Icon/IconNative";
import { ErrorBoundary } from "@components-core/rendering/ErrorBoundary";
import { Stack } from "@components/Stack/StackNative";
import { Button } from "@components/Button/ButtonNative";
import { Splitter } from "@components/Splitter/SplitterNative";
import { useTheme } from "@components-core/theming/ThemeContext";
import { toCssVar } from "./parsers/style-parser/StyleParser";
import type { ThemeDefinition } from "@components-core/theming/abstractions";
import { getColor } from "@components-core/utils/css-utils";
import { useColors } from "@components-core/utils/hooks";
import type { ComponentRendererDef, RendererContext } from "@abstractions/RendererDefs";
import { parseScssVar } from "@components-core/theming/themeVars";
import {RegisterComponentApiFn} from "@abstractions/RendererDefs";



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

};
export {
  StandaloneApp,
  createComponentRenderer,
  createMetadata,
  d,
  parseScssVar,
  startApp,
  useTheme, //TODO REMOVE
  AppRoot, //TODO remove, playground uses it
  ErrorBoundary, //TODO remove, playground uses it
  Icon, // TODO REMOVE from export
  Stack, // TODO REMOVE from export
  Button, // TODO REMOVE from export
  Splitter, // TODO REMOVE from export
  getColor,
  useColors,
  toCssVar,
};

import type { ReactNode } from "react";

import type { XmluiElement } from "../compiler/ir";
import type { XmluiComponentContract } from "../compiler/contracts";
import type { RuntimeScope } from "../runtime/state";
import type { RenderContext } from "../runtime/rendering/types";

export type XmluiExtensionComponentProps = {
  props: Record<string, unknown>;
  events: Record<string, (...args: unknown[]) => Promise<unknown>>;
  children: ReactNode;
  node: XmluiElement;
  scope: RuntimeScope;
  context: RenderContext;
};

export type XmluiExtensionComponent = (props: XmluiExtensionComponentProps) => ReactNode;

export type ComponentExtension = {
  name: string;
  component: XmluiExtensionComponent;
  props?: readonly string[];
  events?: readonly string[];
  apis?: readonly string[];
  templates?: readonly string[];
  contextVariables?: readonly string[];
  acceptsArbitraryProps?: boolean;
  allowsChildren?: boolean;
  description?: string;
};

export type ThemeDefinition = {
  id?: string;
  name?: string;
  variables?: Record<string, string>;
};

export type Extension = {
  namespace?: string;
  components?: readonly ComponentExtension[];
  themes?: readonly ThemeDefinition[];
  functions?: Record<string, (...args: unknown[]) => unknown>;
  themeNamespacePrefix?: string;
};

export type NormalizedExtensionComponent = {
  extension: Extension;
  namespace?: string;
  qualifiedName: string;
  localName: string;
  component: XmluiExtensionComponent;
  contract: XmluiComponentContract;
  description?: string;
};

export type NormalizedExtensions = {
  extensions: Extension[];
  components: NormalizedExtensionComponent[];
  contracts: XmluiComponentContract[];
  renderers: Record<string, XmluiExtensionComponent>;
  functions: Record<string, (...args: unknown[]) => unknown>;
  themes: ThemeDefinition[];
  functionNames: string[];
};


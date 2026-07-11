import React, { type ComponentType, type CSSProperties, type ReactNode } from "react";

import { createMetadata, type ComponentMetadata } from "./component-core/metadata";
import type { ComponentExtension, XmluiExtensionComponentProps } from "./extensions";
import type { XmluiElement, XmluiNode } from "./compiler/ir";
import { Button } from "./components/Button/ButtonReact";
import { Icon } from "./components/Icon/IconReact";
import { LinkNative } from "./components/Link/LinkReact";
import { Text } from "./components/Text/TextReact";
import { TextBox } from "./components/TextBox/TextBoxReact";
import { Heading } from "./components/Heading/HeadingReact";
import { Image } from "./components/Image/ImageReact";
import { TableOfContents } from "./components/TableOfContents/TableOfContentsReact";
import { Tabs as TabsComponent } from "./components/Tabs/TabsReact";
import { TabItemComponent } from "./components/Tabs/TabItemReact";
import { FlowLayout, FlowItemWrapper } from "./components/FlowLayout/FlowLayoutReact";
import { useXmluiAppContext } from "./runtime/appContext";
import { useComponentThemeClass as useRuntimeComponentThemeClass, useThemeRuntime } from "./runtime/rendering/theme";
import { COMPONENT_PART_KEY } from "./styling/layout";
import { dClick, dComponent, dGotFocus, dLostFocus } from "./component-core/metadata/helpers";

export type { ComponentMetadata };
export type { PropertyValueDescription } from "./component-core/metadata/types";
export type CompoundComponentRendererInfo = ComponentExtension;
export type RegisterComponentApiFn = (api: Record<string, unknown>) => void;
export {
  createMetadata,
  Button,
  COMPONENT_PART_KEY,
  dClick,
  dComponent,
  dGotFocus,
  dLostFocus,
  FlowItemWrapper,
  FlowLayout,
  Heading,
  Icon,
  Image,
  LinkNative,
  Text,
  TextBox,
};
export { TableOfContents, TabsComponent as Tabs, TabItemComponent as TabItem };

export type NavHierarchyNode = {
  label?: string;
  to?: string;
  pathSegments?: NavHierarchyNode[];
};

export type SearchItemData = {
  path: string;
  title: string;
  content?: string;
  category?: string;
  [key: string]: unknown;
};

type OldWrapOptions = {
  booleans?: readonly string[];
  numbers?: readonly string[];
  rename?: Record<string, string>;
  exposeRegisterApi?: boolean;
};

type OldWrapCompoundOptions = OldWrapOptions & {
  parseInitialValue?: (raw: unknown, props: Record<string, unknown>) => unknown;
  formatExternalValue?: (value: unknown, props: Record<string, unknown>) => unknown;
};

type OldComponentRenderArgs = {
  className?: string;
  classes: Record<string, string>;
  node: unknown;
  extractValue: ExtractValueCompat;
  lookupEventHandler: (name: string) => ((...args: unknown[]) => unknown) | undefined;
  registerComponentApi: (api: Record<string, unknown>) => void;
  renderChild: (child: unknown) => ReactNode;
};

type ExtractValueCompat = {
  (value: unknown): unknown;
  asOptionalBoolean(value: unknown, fallback?: boolean): boolean | undefined;
  asOptionalNumber(value: unknown, fallback?: number): number | undefined;
  asOptionalString(value: unknown, fallback?: string): string | undefined;
};

export function parseScssVar(scssExports: unknown): Record<string, string> {
  if (typeof scssExports === "string") {
    return Object.fromEntries(
      scssExports
        .split(";")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
          const [key, ...rest] = entry.split(":");
          return [key.trim(), rest.join(":").trim()];
        })
        .filter(([key, value]) => key && value),
    );
  }
  if (scssExports && typeof scssExports === "object") {
    return Object.fromEntries(
      Object.entries(scssExports as Record<string, unknown>)
        .filter(([, value]) => typeof value === "string")
        .map(([key, value]) => [key, value as string]),
    );
  }
  return {};
}

export function wrapComponent(
  name: string,
  Component: ComponentType<any>,
  metadata: ComponentMetadata,
  options: OldWrapOptions = {},
): ComponentExtension {
  return {
    name,
    description: metadata.description,
    props: Object.keys(metadata.props ?? {}),
    events: Object.keys(metadata.events ?? {}),
    apis: Object.keys(metadata.apis ?? {}),
    allowsChildren: true,
    component: (runtimeProps) => {
      const normalizedProps = normalizeProps(runtimeProps.props, options, metadata);
      Object.assign(normalizedProps, templateProps(runtimeProps, metadata));
      const themeClass = useRuntimeComponentThemeClass(name, metadata);
      const registerApiProp = options.exposeRegisterApi
        ? (() => {
            const register = (api: Record<string, unknown>) => {
              const id = typeof runtimeProps.props.id === "string" ? runtimeProps.props.id : undefined;
              if (id) {
                runtimeProps.scope.references[id] = api;
                runtimeProps.scope.store.invalidateReference(id);
              }
            };
            return {
              registerApi: register,
              registerComponentApi: register,
            };
          })()
        : {};
      return (
        <Component
          {...normalizedProps}
          {...registerApiProp}
          className={themeClass.className}
          style={themeClass.style}
        >
          {renderNonPropertyChildren(runtimeProps)}
        </Component>
      );
    },
  };
}

export function wrapCompound(
  name: string,
  Component: ComponentType<any>,
  metadata: ComponentMetadata,
  options: OldWrapCompoundOptions = {},
): ComponentExtension {
  return {
    name,
    description: metadata.description,
    props: Object.keys(metadata.props ?? {}),
    events: Object.keys(metadata.events ?? {}),
    apis: Object.keys(metadata.apis ?? {}),
    allowsChildren: true,
    component: (runtimeProps) => (
      <CompoundComponentCompat
        name={name}
        Component={Component}
        metadata={metadata}
        options={options}
        runtimeProps={runtimeProps}
      />
    ),
  };
}

export function createComponentRenderer(
  name: string,
  metadata: ComponentMetadata,
  render: (args: OldComponentRenderArgs) => ReactNode,
): ComponentExtension {
  return {
    name,
    description: metadata.description,
    props: Object.keys(metadata.props ?? {}),
    events: Object.keys(metadata.events ?? {}),
    allowsChildren: true,
    component: (runtimeProps) => {
      const themeClass = useRuntimeComponentThemeClass(name, metadata);
      return render({
        className: themeClass.className,
        classes: { [COMPONENT_PART_KEY]: themeClass.className },
        node: { ...runtimeProps.node, props: runtimeProps.props },
        extractValue: createExtractValueCompat(),
        lookupEventHandler: (eventName) => runtimeProps.events[eventName],
        registerComponentApi: (api) => {
          const id = typeof runtimeProps.props.id === "string" ? runtimeProps.props.id : undefined;
          if (id) {
            runtimeProps.scope.references[id] = api;
            runtimeProps.scope.store.invalidateReference(id);
          }
        },
        renderChild: () => runtimeProps.children,
      });
    },
  };
}

export function createUserDefinedComponentRenderer(
  metadata: ComponentMetadata,
  componentSource: string,
): ComponentExtension {
  return {
    name: extractUserComponentName(componentSource) ?? "UserDefinedComponent",
    description: metadata.description,
    props: Object.keys(metadata.props ?? {}),
    events: Object.keys(metadata.events ?? {}),
    allowsChildren: true,
    component: (runtimeProps) => (
      <UserDefinedComponentFallback
        metadata={metadata}
        source={componentSource}
        runtimeProps={runtimeProps}
      />
    ),
  };
}

export function Markdown({
  children,
  content,
  className,
  style,
}: {
  children?: ReactNode;
  content?: unknown;
  className?: string;
  style?: CSSProperties;
  showHeadingAnchors?: boolean;
}) {
  const source = content !== undefined && content !== null ? String(content) : children;
  return (
    <div className={className} style={style} data-xmlui-component="Markdown">
      {source}
    </div>
  );
}

export function Part({ children }: { partId?: string; children?: ReactNode }) {
  return <>{children}</>;
}

export function Theme({ children }: { tone?: string; children?: ReactNode }) {
  return <>{children}</>;
}

export function useAppContext() {
  return useXmluiAppContext();
}

export function useTheme() {
  const theme = useThemeRuntime();
  return {
    ...theme,
    getThemeVar(name: string, fallback?: unknown) {
      return theme.variables[name] ?? theme.variables[`--xmlui-${name}`] ?? fallback;
    },
  };
}

export function useComponentThemeClass(metadata: ComponentMetadata): string {
  return useRuntimeComponentThemeClass("ExtensionComponent", metadata).className;
}

export function useLinkInfo(): NavHierarchyNode | undefined {
  return undefined;
}

export const SEARCH_DEFAULT_CATEGORY = "General";
export const SEARCH_CATEGORIES = ["docs", "blog", "news", "get-started"] as const;

export function useSearchContextContent(): Record<string, unknown> {
  return {};
}

export function VisuallyHidden({ children }: { children?: ReactNode }) {
  return (
    <span
      style={{
        border: 0,
        clip: "rect(0 0 0 0)",
        height: 1,
        margin: -1,
        overflow: "hidden",
        padding: 0,
        position: "absolute",
        whiteSpace: "nowrap",
        width: 1,
      }}
    >
      {children}
    </span>
  );
}

function UserDefinedComponentFallback({
  metadata,
  source,
  runtimeProps,
}: {
  metadata: ComponentMetadata;
  source: string;
  runtimeProps: XmluiExtensionComponentProps;
}) {
  const name = metadata.description ? "XMLUI extension user component" : "XMLUI extension component";
  return (
    <div
      data-xmlui-component="UserDefinedComponent"
      data-xmlui-extension-source={source.slice(0, 80)}
      style={runtimeProps.props.style as CSSProperties | undefined}
    >
      {runtimeProps.children ?? name}
    </div>
  );
}

function CompoundComponentCompat({
  name,
  Component,
  metadata,
  options,
  runtimeProps,
}: {
  name: string;
  Component: ComponentType<any>;
  metadata: ComponentMetadata;
  options: OldWrapCompoundOptions;
  runtimeProps: XmluiExtensionComponentProps;
}) {
  const normalizedProps = normalizeProps(runtimeProps.props, options, metadata);
  const themeClass = useRuntimeComponentThemeClass(name, metadata);
  const [value, setValue] = React.useState(() => {
    const rawInitialValue = normalizedProps.initialValue;
    return options.parseInitialValue
      ? options.parseInitialValue(rawInitialValue, normalizedProps)
      : rawInitialValue;
  });
  const valueRef = React.useRef(value);
  valueRef.current = value;

  const onChange = React.useCallback(
    (newValue: unknown) => {
      const formattedValue = options.formatExternalValue
        ? options.formatExternalValue(newValue, normalizedProps)
        : newValue;
      setValue(formattedValue);
      runtimeProps.events.didChange?.(formattedValue);
      const id = typeof runtimeProps.props.id === "string" ? runtimeProps.props.id : undefined;
      if (id) {
        runtimeProps.scope.store.invalidateReference(id);
      }
    },
    [normalizedProps, options, runtimeProps],
  );

  const registerApi = React.useCallback(
    (api: Record<string, unknown>) => {
      const id = typeof runtimeProps.props.id === "string" ? runtimeProps.props.id : undefined;
      if (id) {
        runtimeProps.scope.references[id] = {
          ...api,
          get value() {
            return valueRef.current;
          },
        };
        runtimeProps.scope.store.invalidateReference(id);
      }
    },
    [runtimeProps],
  );

  return (
    <Component
      {...withoutKeys(normalizedProps, ["initialValue"])}
      className={themeClass.className}
      style={themeClass.style}
      value={value}
      onChange={onChange}
      registerApi={registerApi}
    >
      {runtimeProps.children}
    </Component>
  );
}

function normalizeProps(
  props: Record<string, unknown>,
  options: OldWrapOptions,
  metadata?: ComponentMetadata,
): Record<string, unknown> {
  const normalized = { ...props };
  if (normalized.testId !== undefined && normalized.testId !== null) {
    normalized["data-testid"] = String(normalized.testId);
    delete normalized.testId;
  }
  for (const [sourceName, targetName] of Object.entries(options.rename ?? {})) {
    if (sourceName in normalized) {
      normalized[targetName] = normalized[sourceName];
      delete normalized[sourceName];
    }
  }
  const booleanProps = new Set(options.booleans ?? []);
  const numberProps = new Set(options.numbers ?? []);
  for (const [name, propMetadata] of Object.entries(metadata?.props ?? {})) {
    const targetName = options.rename?.[name] ?? name;
    const valueType = (propMetadata as { valueType?: unknown }).valueType;
    if (valueType === "boolean") {
      booleanProps.add(targetName);
    }
    if (valueType === "number") {
      numberProps.add(targetName);
    }
  }
  for (const name of booleanProps) {
    if (name in normalized) {
      normalized[name] = booleanValue(normalized[name]);
    }
  }
  for (const name of numberProps) {
    if (name in normalized) {
      normalized[name] = numberValue(normalized[name]);
    }
  }
  return normalized;
}

function templateProps(
  runtimeProps: XmluiExtensionComponentProps,
  metadata?: ComponentMetadata,
): Record<string, ReactNode> {
  const result: Record<string, ReactNode> = {};
  for (const [propName, propMetadata] of Object.entries(metadata?.props ?? {})) {
    if ((propMetadata as { valueType?: unknown }).valueType !== "ComponentDef") {
      continue;
    }
    const property = findPropertyChild(runtimeProps.node, propName);
    if (property) {
      result[propName] = runtimeProps.context.renderChildren(property.children, runtimeProps.scope);
    }
  }
  return result;
}

function renderNonPropertyChildren(runtimeProps: XmluiExtensionComponentProps): ReactNode {
  const children = runtimeProps.node.children.filter(
    (child) => !(child.kind === "element" && child.type === "property"),
  );
  return runtimeProps.context.renderChildren(children, runtimeProps.scope);
}

function findPropertyChild(node: XmluiElement, propName: string): XmluiElement | undefined {
  return node.children.find(
    (child: XmluiNode): child is XmluiElement =>
      child.kind === "element" &&
      child.type === "property" &&
      child.props.name === propName,
  );
}

function withoutKeys<T extends Record<string, unknown>>(props: T, keys: string[]): Record<string, unknown> {
  const result = { ...props };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

function booleanValue(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value === "true";
  }
  return Boolean(value);
}

function numberValue(value: unknown): number | undefined {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function dInitialValue(defaultValue?: unknown, valueType = "any") {
  return {
    description: "This property sets the component's initial value.",
    valueType,
    defaultValue,
  };
}

export function dEnabled(defaultValue = true) {
  return {
    description:
      "This boolean property value indicates whether the component responds to user events.",
    valueType: "boolean",
    defaultValue,
  };
}

export function dDidChange(comp: string) {
  return {
    description: `This event is triggered when value of ${comp} has changed.`,
    signature: "didChange(newValue: any): void",
    parameters: {
      newValue: "The new value of the component.",
    },
  };
}

function createExtractValueCompat(): ExtractValueCompat {
  const extractValue = ((value: unknown) => value) as ExtractValueCompat;
  extractValue.asOptionalBoolean = (value, fallback) => {
    if (value === undefined || value === null || value === "") {
      return fallback;
    }
    return booleanValue(value);
  };
  extractValue.asOptionalNumber = (value, fallback) => numberValue(value) ?? fallback;
  extractValue.asOptionalString = (value, fallback) => {
    if (value === undefined || value === null) {
      return fallback;
    }
    return String(value);
  };
  return extractValue;
}

function extractUserComponentName(source: string): string | undefined {
  return source.match(/<Component\s+name=["']([A-Za-z][\w.-]*)["']/)?.[1];
}

import React, { type ComponentType, type CSSProperties, type ReactNode } from "react";

import { createMetadata, type ComponentMetadata } from "./component-core/metadata";
import type { ComponentExtension, XmluiExtensionComponentProps } from "./extensions";
import type { XmluiElement, XmluiNode } from "./compiler/ir";
import { ThemedButton as Button } from "./components/Button/Button";
import { ThemedIcon as Icon } from "./components/Icon/Icon";
import { ThemedLinkNative as LinkNative } from "./components/Link/Link";
import { ThemedText as Text } from "./components/Text/Text";
import { ThemedTextBox as TextBox } from "./components/TextBox/TextBox";
import { ThemedHeading as Heading } from "./components/Heading/Heading";
import { ThemedImage as Image } from "./components/Image/Image";
import { TableOfContents } from "./components/TableOfContents/TableOfContentsReact";
import { ThemedTabs as TabsComponent } from "./components/Tabs/Tabs";
import { ThemedTabItem as TabItemComponent } from "./components/Tabs/TabItem";
import { ThemedFlowLayout as FlowLayout, FlowItemWrapper } from "./components/FlowLayout/FlowLayout";
import { useLinkInfo as useRuntimeLinkInfo, useLinkInfoContext } from "./components/App/LinkInfoContext";
import { useFormContext } from "./components/Form/FormContext";
import { useXmluiAppContext } from "./runtime/appContext";
import { useTheme as useLegacyTheme } from "./components-core/theming/ThemeContext";
import { useComponentThemeClass as useOldComponentThemeClass } from "./components-core/theming/utils";
import { useLayoutStyle } from "./runtime/rendering/props";
import { createRuntimeScope } from "./runtime/state";
import { COMPONENT_PART_KEY } from "./styling/layout";
import { isLayoutPropName } from "./styling/contracts";
import { dClick, dComponent, dGotFocus, dLostFocus } from "./component-core/metadata/helpers";
import { useInspectMode } from "./components-core/InspectorContext";
import { compileXmluiSource, throwFirstCompilerDiagnostic } from "./compiler/compileXmluiSource";
import { createXmluiModule } from "./runtime";
import { ComponentInstance } from "./runtime/rendering/components";
import type { XmluiComponentModule } from "./runtime/types";

export type { ComponentMetadata };
export type { PropertyValueDescription } from "./component-core/metadata/types";
export type CompoundComponentRendererInfo = ComponentExtension;
export type RegisterComponentApiFn = (api: Record<string, unknown>) => void;

const UNINITIALIZED_API_VALUE = Symbol("uninitialized-api-value");
const ExtensionRuntimeScopeContext = React.createContext<XmluiExtensionComponentProps["scope"] | undefined>(undefined);

function useExtensionComponentThemeClass(
  _name: string,
  metadata: ComponentMetadata,
): { className: string; style: CSSProperties } {
  return {
    className: useOldComponentThemeClass(metadata) ?? "",
    style: {},
  };
}

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
  strings?: readonly string[];
  rename?: Record<string, string>;
  exclude?: readonly string[];
  callbacks?: readonly string[];
  renderers?: Record<string, OldRendererConfig>;
  exposeRegisterApi?: boolean;
  captureNativeEvents?: boolean;
  deriveAriaLabel?: (props: Record<string, any>) => string | undefined;
  customRender?: (
    props: Record<string, unknown>,
    args: OldComponentRenderArgs,
  ) => ReactNode;
};

type OldRendererConfig = {
  reactProp?: string;
  contextVars: readonly (string | null)[] | ((...args: any[]) => Record<string, unknown>);
};

type OldWrapCompoundOptions = OldWrapOptions & {
  parseInitialValue?: (raw: unknown, props: Record<string, unknown>) => unknown;
  formatExternalValue?: (value: unknown, props: Record<string, unknown>) => unknown;
};

type OldComponentRenderArgs = {
  className?: string;
  classes: Record<string, string>;
  node: unknown;
  state?: Record<string, unknown>;
  extractValue: ExtractValueCompat;
  lookupEventHandler: (name: string) => ((...args: unknown[]) => unknown) | undefined;
  registerComponentApi: (api: Record<string, unknown>) => void;
  updateState: (state: Record<string, unknown>, options?: { initial?: boolean }) => void;
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
    metadata,
    themeVars: metadata.themeVars,
    defaultThemeVars: metadata.defaultThemeVars,
    toneSpecificThemeVars: metadata.toneSpecificThemeVars,
    themeVarContributorComponents: metadata.themeVarContributorComponents,
    component: (runtimeProps) => {
      const normalizedProps = normalizeProps(runtimeProps.props, options, metadata);
      Object.assign(normalizedProps, templateProps(runtimeProps, metadata));
      Object.assign(normalizedProps, rendererProps(runtimeProps, options));
      const themeClass = useExtensionComponentThemeClass(name, metadata);
      for (const propName of options.exclude ?? []) {
        delete normalizedProps[propName];
      }
      const registerComponentApi = React.useCallback((api: Record<string, unknown>) => {
        const id = typeof runtimeProps.props.id === "string" ? runtimeProps.props.id : undefined;
        if (id) {
          runtimeProps.scope.references[id] = api;
          runtimeProps.scope.store.invalidateReference(id);
        }
      }, [runtimeProps.props.id, runtimeProps.scope]);
      if (options.customRender) {
        const ariaLabel = deriveAriaLabel(normalizedProps, options, metadata);
        const rootAttrs = extensionRootAttrs(name, normalizedProps, ariaLabel);
        const componentStyle = mergeStyles(rootAttrs.style, normalizedProps.style);
        return (
          <ExtensionRuntimeScopeContext.Provider value={runtimeProps.scope}>
            <div {...rootAttrs}>
              {options.customRender({ ...normalizedProps, style: componentStyle }, {
                className: themeClass.className,
                classes: { [COMPONENT_PART_KEY]: themeClass.className },
                node: { ...runtimeProps.node, props: runtimeProps.props },
                extractValue: createExtractValueCompat(),
                lookupEventHandler: (eventName) => runtimeProps.events[eventName],
                registerComponentApi,
                updateState: () => undefined,
                renderChild: (child) => renderChildCompat(child, runtimeProps),
              })}
            </div>
          </ExtensionRuntimeScopeContext.Provider>
        );
      }
      const registerApiProp = options.exposeRegisterApi
        ? {
            registerComponentApi,
          }
        : {};
      const nativeEventProp = options.captureNativeEvents
        ? {
            onNativeEvent: (event: Record<string, unknown>) => {
              const eventType = typeof event?.type === "string" ? event.type : "unknown";
              void runtimeProps.events[eventType]?.(event);
            },
          }
        : {};
      const ariaLabel = deriveAriaLabel(normalizedProps, options, metadata);
      const rootAttrs = extensionRootAttrs(name, normalizedProps, ariaLabel);
      const componentIsExtensionRoot = usesComponentAsExtensionRoot(name);
      const layoutStyle = componentIsExtensionRoot
        ? useLayoutStyle(runtimeProps.node, runtimeProps.scope)
        : undefined;
      const componentStyle = mergeStyles(
        rootAttrs.style,
        compatibilityRootStyle(name, normalizedProps),
        layoutStyle,
        normalizedProps.style,
        themeClass.style,
      );
      const componentProps = {
        ...withoutLayoutProps(withoutKeys(normalizedProps, ["data-testid", "aria-label"])),
        ...registerApiProp,
        ...nativeEventProp,
        classes: { [COMPONENT_PART_KEY]: themeClass.className },
        className: themeClass.className,
        style: componentStyle,
      };
      if (componentIsExtensionRoot) {
        return (
          <ExtensionRuntimeScopeContext.Provider value={runtimeProps.scope}>
            <Component {...rootAttrs} {...componentProps}>
              {renderNonPropertyChildren(runtimeProps, metadata)}
            </Component>
          </ExtensionRuntimeScopeContext.Provider>
        );
      }
      return (
        <ExtensionRuntimeScopeContext.Provider value={runtimeProps.scope}>
          <div {...rootAttrs}>
            <Component {...componentProps}>
              {renderNonPropertyChildren(runtimeProps, metadata)}
            </Component>
          </div>
        </ExtensionRuntimeScopeContext.Provider>
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
    metadata,
    themeVars: metadata.themeVars,
    defaultThemeVars: metadata.defaultThemeVars,
    toneSpecificThemeVars: metadata.toneSpecificThemeVars,
    themeVarContributorComponents: metadata.themeVarContributorComponents,
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
    props: [...new Set([...Object.keys(metadata.props ?? {}), "bindTo", "value"])],
    events: Object.keys(metadata.events ?? {}),
    apis: Object.keys(metadata.apis ?? {}),
    allowsChildren: true,
    metadata,
    themeVars: metadata.themeVars,
    defaultThemeVars: metadata.defaultThemeVars,
    toneSpecificThemeVars: metadata.toneSpecificThemeVars,
    themeVarContributorComponents: metadata.themeVarContributorComponents,
    component: (runtimeProps) => (
      <OldComponentRendererCompat
        name={name}
        metadata={metadata}
        render={render}
        runtimeProps={runtimeProps}
      />
    ),
  };
}

function OldComponentRendererCompat({
  name,
  metadata,
  render,
  runtimeProps,
}: {
  name: string;
  metadata: ComponentMetadata;
  render: (args: OldComponentRenderArgs) => ReactNode;
  runtimeProps: XmluiExtensionComponentProps;
}) {
  const form = useFormContext();
  const themeClass = useExtensionComponentThemeClass(name, metadata);
  const id = typeof runtimeProps.props.id === "string" ? runtimeProps.props.id : undefined;
  const bindTo = typeof runtimeProps.props.bindTo === "string" ? runtimeProps.props.bindTo : undefined;
  const formValue = bindTo ? form?.getValue(bindTo) : undefined;
  const [state, setState] = React.useState<Record<string, unknown>>(() => {
    if (formValue !== undefined) {
      return { value: formValue };
    }
    if (runtimeProps.props.value !== undefined) {
      return { value: runtimeProps.props.value };
    }
    if (runtimeProps.props.initialValue !== undefined) {
      return { value: runtimeProps.props.initialValue };
    }
    return {};
  });
  const apiRef = React.useRef<Record<string, unknown>>({});
  const registeredApiRef = React.useRef<Record<string, unknown> | undefined>(undefined);
  const lastInvalidatedApiValueRef = React.useRef<unknown>(UNINITIALIZED_API_VALUE);
  const formRef = React.useRef(form);
  formRef.current = form;

  React.useEffect(() => {
    if (!bindTo) {
      return;
    }
    return formRef.current?.registerItem({ name: bindTo });
  }, [bindTo]);

  React.useEffect(() => {
    if (formValue !== undefined) {
      setState((current) => current.value === formValue ? current : { ...current, value: formValue });
    }
  }, [formValue]);

  const registerComponentApi = React.useCallback((api: Record<string, unknown>) => {
    apiRef.current = api;
    if (id) {
      if (registeredApiRef.current && shallowEqualRecords(registeredApiRef.current, api)) {
        return;
      }
      registeredApiRef.current = api;
      runtimeProps.scope.references[id] = api;
      if (
        Object.prototype.hasOwnProperty.call(api, "value") &&
        !Object.is(lastInvalidatedApiValueRef.current, api.value)
      ) {
        lastInvalidatedApiValueRef.current = api.value;
        runtimeProps.scope.store.invalidateReference(id);
      }
    }
  }, [id, runtimeProps.scope]);

  const updateState = React.useCallback((nextState: Record<string, unknown>, options?: { initial?: boolean }) => {
    setState((current) => ({ ...current, ...nextState }));
    if (
      bindTo &&
      Object.prototype.hasOwnProperty.call(nextState, "value") &&
      !options?.initial
    ) {
      formRef.current?.setValue(bindTo, nextState.value);
      void formRef.current?.validateField(bindTo, nextState.value);
    }
    if (id && Object.prototype.hasOwnProperty.call(nextState, "value")) {
      const nextApi = {
        ...apiRef.current,
        value: nextState.value,
      };
      if (!registeredApiRef.current || !shallowEqualRecords(registeredApiRef.current, nextApi)) {
        registeredApiRef.current = nextApi;
        runtimeProps.scope.references[id] = nextApi;
        runtimeProps.scope.store.invalidateReference(id);
      }
    }
  }, [bindTo, id, runtimeProps.scope]);

  return render({
    className: themeClass.className,
    classes: { [COMPONENT_PART_KEY]: themeClass.className },
    node: { ...runtimeProps.node, props: runtimeProps.props },
    state,
    extractValue: createExtractValueCompat(),
    lookupEventHandler: (eventName) => runtimeProps.events[eventName],
    registerComponentApi,
    updateState,
    renderChild: () => runtimeProps.children,
  });
}

function shallowEqualRecords(
  left: Record<string, unknown> | undefined,
  right: Record<string, unknown> | undefined,
): boolean {
  if (left === right) {
    return true;
  }
  if (!left || !right) {
    return false;
  }
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  return leftKeys.every((key) => left[key] === right[key]);
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
      <UserDefinedExtensionComponent
        metadata={metadata}
        source={componentSource}
        runtimeProps={runtimeProps}
      />
    ),
  };
}

function UserDefinedExtensionComponent({
  metadata,
  source,
  runtimeProps,
}: {
  metadata: ComponentMetadata;
  source: string;
  runtimeProps: XmluiExtensionComponentProps;
}) {
  const extensionFunctionKey = Object.keys(runtimeProps.scope.extensionFunctions).sort().join("\n");
  const compiledComponent = React.useMemo(
    () => compileUserDefinedComponent(source, Object.keys(runtimeProps.scope.extensionFunctions)),
    [extensionFunctionKey, source, runtimeProps.scope.extensionFunctions],
  );

  return compiledComponent ? (
    <ComponentInstance
      component={compiledComponent}
      context={runtimeProps.context}
      node={runtimeProps.node}
      scope={runtimeProps.scope}
      layoutContext={runtimeProps.layoutContext}
    />
  ) : (
    <UserDefinedComponentFallback
      metadata={metadata}
      source={source}
      runtimeProps={runtimeProps}
    />
  );
}

function compileUserDefinedComponent(
  componentSource: string,
  extensionFunctions: Iterable<string> = [],
): XmluiComponentModule | undefined {
  try {
    const normalizedSource = normalizeUserDefinedComponentSource(componentSource);
    const compiled = compileXmluiSource({
      id: `extension-component:${extractUserComponentName(componentSource) ?? "UserDefinedComponent"}.xmlui`,
      source: normalizedSource,
      extensionFunctions,
      validateComponentReferences: false,
    });
    throwFirstCompilerDiagnostic(compiled);
    const module = createXmluiModule(compiled.runtimeDocument);
    return module.kind === "component" ? module : undefined;
  } catch (error) {
    console.error("[xmlui] Failed to compile extension user-defined component.", error);
    return undefined;
  }
}

function normalizeUserDefinedComponentSource(source: string): string {
  return source.replace(/<\/([A-Za-z][\w.-]*)\s+>/g, "</$1>");
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
  const theme = useLegacyTheme();
  return {
    ...theme,
    getThemeVar(name: string, fallback?: unknown) {
      return theme.getThemeVar(name) ?? theme.themeVars[name] ?? theme.themeStyles[`--xmlui-${name}`] ?? fallback;
    },
  };
}

export function useDevTools() {
  const { inspectMode, setInspectMode } = useInspectMode();
  return {
    projectCompilation: undefined,
    inspectedNode: undefined,
    sources: undefined,
    isOpen: false,
    setIsOpen: () => {},
    devToolsEnabled: inspectMode,
    mockApi: undefined,
    clickPosition: { x: 0, y: 0 },
    inspectMode,
    setInspectMode,
  };
}

export function useComponentThemeClass(metadata: ComponentMetadata): string {
  return useOldComponentThemeClass(metadata) ?? "";
}

export function useLinkInfo(): NavHierarchyNode | undefined {
  const scope = React.useContext(ExtensionRuntimeScopeContext);
  const runtimeSnapshot = React.useSyncExternalStore(
    (listener) => scope?.routing?.subscribe(listener) ?? (() => undefined),
    () => scope?.routing?.getSnapshot(),
    () => scope?.routing?.getSnapshot(),
  );
  const routerLinkInfo = useRuntimeLinkInfo();
  const linkInfoContext = useLinkInfoContext();
  const runtimePath = runtimeSnapshot?.pathname;
  const mappedLinkInfo = React.useMemo(() => {
    const linkMap = linkInfoContext?.linkMap;
    if (!linkMap || !runtimePath) {
      return routerLinkInfo;
    }
    return (
      linkMap.get(runtimePath) ??
      linkMap.get(`#${runtimePath}`) ??
      [...linkMap.values()].find((node) => normalizeLinkInfoPath(node.to) === runtimePath) ??
      routerLinkInfo
    );
  }, [linkInfoContext?.linkMap, routerLinkInfo, runtimePath]);
  const [domLinkInfo, setDomLinkInfo] = React.useState<NavHierarchyNode | undefined>();
  React.useEffect(() => {
    if ((mappedLinkInfo?.pathSegments?.length ?? 0) > 0 || typeof document === "undefined") {
      setDomLinkInfo(undefined);
      return;
    }
    const update = () => setDomLinkInfo(deriveLinkInfoFromNavDom(runtimePath));
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    return () => observer.disconnect();
  }, [mappedLinkInfo, runtimePath]);
  return (mappedLinkInfo?.pathSegments?.length ?? 0) > 0 ? mappedLinkInfo : domLinkInfo ?? mappedLinkInfo;
}

function normalizeLinkInfoPath(path: string | undefined): string | undefined {
  if (!path) {
    return undefined;
  }
  return path.startsWith("#/") ? path.slice(1) : path;
}

function deriveLinkInfoFromNavDom(runtimePath: string | undefined): NavHierarchyNode | undefined {
  const links = [...document.querySelectorAll("nav a")];
  const link = links.find((candidate) => {
    const href = candidate.getAttribute("href") ?? "";
    return runtimePath
      ? href === runtimePath || href === `#${runtimePath}` || href.endsWith(`#${runtimePath}`)
      : href.startsWith("#/");
  }) ?? links.find((candidate) => (candidate.getAttribute("href") ?? "").startsWith("#/"));
  const label = link?.textContent?.trim();
  if (!link || !label) {
    return undefined;
  }
  const to = runtimePath ?? normalizeLinkInfoPath(link.getAttribute("href") ?? "") ?? "/";
  const nav = link.closest("nav");
  const groups = nav ? [...nav.querySelectorAll("button")].filter((button) => precedes(button, link)) : [];
  const group = groups.at(-1);
  const groupLabel = group?.textContent?.trim();
  return {
    label,
    to,
    pathSegments: groupLabel ? [{ label: groupLabel }] : [],
  };
}

function precedes(left: Element, right: Element): boolean {
  return !!(left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING);
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
  const normalizedProps = React.useMemo(
    () => normalizeProps(runtimeProps.props, options, metadata),
    [metadata, options, runtimeProps.props],
  );
  const normalizedPropsRef = React.useRef(normalizedProps);
  normalizedPropsRef.current = normalizedProps;
  const themeClass = useExtensionComponentThemeClass(name, metadata);
  const id = typeof runtimeProps.props.id === "string" ? runtimeProps.props.id : undefined;
  const scope = runtimeProps.scope;
  const didChange = runtimeProps.events.didChange;
  const [value, setValue] = React.useState(() => {
    const rawInitialValue = normalizedProps.initialValue;
    return options.parseInitialValue
      ? options.parseInitialValue(rawInitialValue, normalizedProps)
      : rawInitialValue;
  });
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const registeredApiRef = React.useRef<Record<string, unknown> | undefined>(undefined);

  const onChange = React.useCallback(
    (newValue: unknown) => {
      const formattedValue = options.formatExternalValue
        ? options.formatExternalValue(newValue, normalizedPropsRef.current)
        : newValue;
      setValue(formattedValue);
      didChange?.(formattedValue);
      if (id) {
        scope.store.invalidateReference(id);
      }
    },
    [didChange, id, options, scope.store],
  );

  const registerApi = React.useCallback(
    (api: Record<string, unknown>) => {
      if (id) {
        const nextApi = {
          ...api,
          get value() {
            return valueRef.current;
          },
        };
        if (registeredApiRef.current && shallowEqualRecords(registeredApiRef.current, nextApi)) {
          return;
        }
        registeredApiRef.current = nextApi;
        scope.references[id] = nextApi;
        scope.store.invalidateReference(id);
      }
    },
    [id, scope.references, scope.store],
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
  const stringProps = new Set(options.strings ?? []);
  for (const [name, propMetadata] of Object.entries(metadata?.props ?? {})) {
    const targetName = options.rename?.[name] ?? name;
    const valueType = (propMetadata as { valueType?: unknown }).valueType;
    if (valueType === "boolean") {
      booleanProps.add(targetName);
    }
    if (valueType === "number") {
      numberProps.add(targetName);
    }
    if (valueType === "string") {
      stringProps.add(targetName);
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
  for (const name of stringProps) {
    if (name in normalized) {
      normalized[name] = stringValue(normalized[name]);
    }
  }
  return normalized;
}

function deriveAriaLabel(
  props: Record<string, unknown>,
  options: OldWrapOptions,
  metadata?: ComponentMetadata,
): string | undefined {
  const explicit = props["aria-label"];
  if (explicit !== undefined && explicit !== null) {
    return String(explicit);
  }
  return options.deriveAriaLabel?.(props as Record<string, any>) ??
    metadata?.defaultAriaLabel ??
    (props.label === undefined || props.label === null ? undefined : String(props.label));
}

function extensionRootAttrs(
  name: string,
  props: Record<string, unknown>,
  ariaLabel: string | undefined,
): Record<string, unknown> {
  return {
    "data-xmlui-component": name,
    "data-xmlui-id": props.id,
    "data-testid": props["data-testid"] ?? props.id,
    "aria-label": ariaLabel,
    style: rootStyleFromProps(props),
  };
}

function rootStyleFromProps(props: Record<string, unknown>): CSSProperties | undefined {
  const style: CSSProperties = {};
  if (typeof props.width === "string" && props.width.length > 0) {
    style.width = props.width;
  }
  if (typeof props.height === "string" && props.height.length > 0) {
    style.height = props.height;
  }
  return Object.keys(style).length > 0 ? style : undefined;
}

function compatibilityRootStyle(
  name: string,
  props: Record<string, unknown>,
): CSSProperties | undefined {
  if (name === "Carousel" && props.height === undefined) {
    return { minHeight: "1px" };
  }
  return undefined;
}

function usesComponentAsExtensionRoot(name: string): boolean {
  return (
    name === "Backdrop" ||
    name === "Breakout" ||
    name === "Carousel" ||
    name === "CarouselItem" ||
    name === "ScrollToTop"
  );
}

function mergeStyles(
  ...styles: Array<unknown>
): CSSProperties | undefined {
  const merged = Object.assign(
    {},
    ...styles.filter((style): style is CSSProperties =>
      Boolean(style) && typeof style === "object" && !Array.isArray(style),
    ),
  );
  return Object.keys(merged).length > 0 ? merged : undefined;
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

function rendererProps(
  runtimeProps: XmluiExtensionComponentProps,
  options: OldWrapOptions,
): Record<string, (...args: unknown[]) => ReactNode> {
  const result: Record<string, (...args: unknown[]) => ReactNode> = {};
  for (const [propName, rendererConfig] of Object.entries(options.renderers ?? {})) {
    const property = findPropertyChild(runtimeProps.node, propName);
    if (!property) {
      continue;
    }
    const reactProp = rendererConfig.reactProp ?? templateToRendererName(propName);
    result[reactProp] = (...args: unknown[]) => {
      const contextValues =
        typeof rendererConfig.contextVars === "function"
          ? rendererConfig.contextVars(...args)
          : Object.fromEntries(
              rendererConfig.contextVars
                .map((name, index) => (name === null ? undefined : [name, args[index]] as const))
                .filter((entry): entry is readonly [string, unknown] => Boolean(entry)),
            );
      const templateScope = createRuntimeScope({
        store: runtimeProps.scope.store,
        parent: runtimeProps.scope,
        props: runtimeProps.scope.props,
        contextValues,
        references: runtimeProps.scope.references,
        slots: runtimeProps.scope.slots,
        routing: runtimeProps.scope.routing,
        toast: runtimeProps.scope.toast,
        i18n: runtimeProps.scope.i18n,
        emitEvent: runtimeProps.scope.emitEvent,
        extensionFunctions: runtimeProps.scope.extensionFunctions,
      });
      return runtimeProps.context.renderChildren(property.children, templateScope, runtimeProps.node.range.end);
    };
  }
  return result;
}

function templateToRendererName(propName: string): string {
  return propName.endsWith("Template")
    ? `${propName.slice(0, -"Template".length)}Renderer`
    : `${propName}Renderer`;
}

function renderNonPropertyChildren(
  runtimeProps: XmluiExtensionComponentProps,
  metadata?: ComponentMetadata,
): ReactNode {
  const childrenTemplateName = metadata?.childrenAsTemplate;
  const data = runtimeProps.props.data;
  if (childrenTemplateName && Array.isArray(data)) {
    const propertyTemplate = findPropertyChild(runtimeProps.node, childrenTemplateName);
    const templateChildren = propertyTemplate
      ? propertyTemplate.children
      : runtimeProps.node.children.filter(
        (child) => !(child.kind === "element" && child.type === "property"),
      );
    return data.map((item, index) => {
      const itemScope = createRuntimeScope({
        store: runtimeProps.scope.store,
        parent: runtimeProps.scope,
        props: runtimeProps.scope.props,
        contextValues: {
          $item: item,
          $itemIndex: index,
          $isFirst: index === 0,
          $isLast: index === data.length - 1,
        },
        references: runtimeProps.scope.references,
        slots: runtimeProps.scope.slots,
        routing: runtimeProps.scope.routing,
        toast: runtimeProps.scope.toast,
        i18n: runtimeProps.scope.i18n,
        emitEvent: runtimeProps.scope.emitEvent,
        extensionFunctions: runtimeProps.scope.extensionFunctions,
      });
      return (
        <React.Fragment key={index}>
          {runtimeProps.context.renderChildren(templateChildren, itemScope, runtimeProps.node.range.end)}
        </React.Fragment>
      );
    });
  }
  const children = runtimeProps.node.children.filter(
    (child) => !(child.kind === "element" && child.type === "property"),
  );
  return runtimeProps.context.renderChildren(children, runtimeProps.scope);
}

function renderChildCompat(child: unknown, runtimeProps: XmluiExtensionComponentProps): ReactNode {
  if (child === undefined || child === null) {
    return runtimeProps.children;
  }
  if (Array.isArray(child)) {
    return runtimeProps.context.renderChildren(child, runtimeProps.scope);
  }
  if (typeof child === "object" && "kind" in child) {
    const node = child as XmluiNode;
    return node.kind === "element"
      ? runtimeProps.context.renderElement(node, runtimeProps.scope)
      : runtimeProps.context.renderChildren([node], runtimeProps.scope);
  }
  return child as ReactNode;
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

function withoutLayoutProps<T extends Record<string, unknown>>(props: T): Record<string, unknown> {
  const result = { ...props };
  for (const key of Object.keys(result)) {
    if (isLayoutPropName(key)) {
      delete result[key];
    }
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

function stringValue(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  return String(value);
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

import { type ComponentType, type ReactNode, useState } from "react";

import type { ComponentMetadata } from "../component-core/metadata";
import { useComponentThemeClass } from "./theming/utils";
import { useTheme } from "./theming/ThemeContext";
import { useAppContext } from "./AppContext";
import type { ComponentExtension, XmluiExtensionComponentProps } from "../extensions";
import { COMPONENT_PART_KEY } from "../styling/layout";
import {
  filterPropsForDisabledInlineStyle,
  isInlineStyleDisabled,
  isInlineStylePropName,
} from "../styling";

type ExtractValueCompat = ((value: unknown) => any) & {
  asString(value: unknown, fallback?: string): string;
  asDisplayText(value: unknown): string;
  asOptionalBoolean(value: unknown, fallback?: boolean): boolean;
  asOptionalNumber(value: unknown, fallback?: number): number | undefined;
  asOptionalString(value: unknown, fallback?: string): any;
  asSize(value: unknown, fallback?: string): any;
};

type WrapComponentOptions = {
  stateful?: boolean;
  booleans?: readonly string[];
  numbers?: readonly string[];
  strings?: readonly string[];
  resourceUrls?: readonly string[];
  rename?: Record<string, string>;
  exclude?: readonly string[];
  passUid?: boolean;
  exposeRegisterApi?: boolean;
  contentClassName?: boolean;
  childrenLayoutContext?: unknown;
  renderers?: Record<string, unknown>;
  events?: readonly string[] | Record<string, string>;
  deriveAriaLabel?: (props: Record<string, unknown>) => unknown;
  customRender?: (
    props: Record<string, unknown>,
    args: {
      className?: string;
      classes: Record<string, string>;
      node: any;
      extractValue: ExtractValueCompat;
      extractResourceUrl: (url?: string) => string | undefined;
      state?: Record<string, any>;
      updateState: (state: Record<string, any>, options?: { initial?: boolean }) => void;
      uid: symbol;
      lookupEventHandler: (
        name: string,
        options?: Record<string, unknown>,
      ) => ((...args: any[]) => any) | undefined;
      lookupAction: (expression: string, options?: Record<string, unknown>) => ((...args: unknown[]) => unknown) | undefined;
      lookupSyncCallback: (expression: unknown) => ((...args: unknown[]) => unknown) | undefined;
      registerComponentApi: (api: Record<string, unknown>) => void;
      appContext?: {
        appGlobals?: Record<string, any>;
        xmluiConfig?: Record<string, any>;
      };
      renderChild: (
        child: unknown,
        wrapper?: {
          wrapChild?: (
            context: { node: any; extractValue: ExtractValueCompat },
            renderedChild: ReactNode,
            hints?: { opaque?: boolean; nonVisual?: boolean },
          ) => ReactNode;
          [key: string]: unknown;
        },
      ) => ReactNode;
      layoutContext?: any;
    },
  ) => ReactNode;
};

export function wrapComponent(
  name: string,
  Component: ComponentType<any>,
  metadata: ComponentMetadata,
  options: WrapComponentOptions = {},
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
    component: (runtimeProps: XmluiExtensionComponentProps) => {
      const { disableInlineStyle, disableInlineStyleIsExplicit } = useTheme();
      const appContext = useAppContext();
      const inlineStylesDisabled = isInlineStyleDisabled(
        disableInlineStyle,
        appContext.appGlobals,
        disableInlineStyleIsExplicit,
      );
      const themeClassName = useComponentThemeClass(metadata);
      const themeClass = ["xmlui-" + name, themeClassName].filter(Boolean).join(" ");
      const props = { ...runtimeProps.props };
      const [state, setState] = useState<Record<string, any>>({});
      for (const name of options.exclude ?? []) {
        delete props[name];
      }
      for (const name of options.resourceUrls ?? []) {
        const value = props[name];
        if (typeof value === "string" && value.length > 0 && !/^(?:[a-z][a-z\d+.-]*:|\/)/i.test(value)) {
          props[name] = `/${value}`;
        }
      }
      if (options.customRender) {
        const renderedProps = inlineStylesDisabled ? removeInlineStyleProps(props) : props;
        const extractValue = ((value: unknown) => value) as ExtractValueCompat;
        extractValue.asString = (value, fallback = "") =>
          value === undefined || value === null ? fallback : String(value);
        extractValue.asDisplayText = (value) =>
          value === undefined || value === null ? "" : String(value);
        extractValue.asOptionalBoolean = (value, fallback = false) => {
          if (typeof value === "boolean") {
            return value;
          }
          if (typeof value === "string") {
            return value === "true" ? true : value === "false" ? false : fallback;
          }
          return value === undefined || value === null ? fallback : Boolean(value);
        };
        extractValue.asOptionalNumber = (value, fallback) => {
          if (value === undefined || value === null || value === "") {
            return fallback;
          }
          const numericValue = typeof value === "number" ? value : Number(value);
          return Number.isFinite(numericValue) ? numericValue : fallback;
        };
        extractValue.asOptionalString = (value, fallback) =>
          value === undefined || value === null ? fallback : String(value);
        extractValue.asSize = (value, fallback) =>
          value === undefined || value === null || value === "" ? fallback : String(value);
        return options.customRender(renderedProps, {
          className: themeClass,
          classes: { [COMPONENT_PART_KEY]: themeClass },
          node: { ...runtimeProps.node, props: renderedProps },
          extractValue,
          extractResourceUrl: (url) =>
            url === undefined || url === null || /^https?:\/\//.test(url) ? url : `/${url}`,
          state,
          updateState: (nextState) => setState((prevState) => ({ ...prevState, ...nextState })),
          lookupEventHandler: (eventName) => runtimeProps.events[eventName],
          uid: Symbol(String(runtimeProps.props.id ?? name)),
          lookupAction: () => undefined,
          lookupSyncCallback: (expression) => typeof expression === "function" ? expression as (...args: unknown[]) => unknown : undefined,
          registerComponentApi: (api) => {
            const id = typeof runtimeProps.props.id === "string" ? runtimeProps.props.id : undefined;
            if (id) {
              runtimeProps.scope.references[id] = api;
              runtimeProps.scope.store.invalidateReference(id);
            }
          },
          renderChild: (child, layoutContext) => {
            if (child === undefined || child === null) {
              return runtimeProps.children;
            }
            if (Array.isArray(child)) {
              return runtimeProps.context.renderChildren(child, runtimeProps.scope, undefined, layoutContext as any);
            }
            if (typeof child === "object" && "kind" in child) {
              const node = child as any;
              return node.kind === "element"
                ? runtimeProps.context.renderElement(node, runtimeProps.scope, layoutContext as any)
                : runtimeProps.context.renderChildren([node], runtimeProps.scope, undefined, layoutContext as any);
            }
            return child as ReactNode;
          },
          layoutContext: undefined,
        });
      }
      return (
        <Component
          {...props}
          uid={options.passUid ? runtimeProps.props.id : undefined}
          className={themeClass}
        >
          {runtimeProps.children}
        </Component>
      );
    },
  };
}

function removeInlineStyleProps(props: Record<string, unknown>): Record<string, unknown> {
  const allowedProps = filterPropsForDisabledInlineStyle(props);
  return Object.fromEntries(
    Object.entries(props).filter(([name]) =>
      !isInlineStylePropName(name) || Object.prototype.hasOwnProperty.call(allowedProps, name)
    ),
  );
}

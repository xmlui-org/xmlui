import { type ComponentType, type ReactNode } from "react";

import type { ComponentMetadata } from "../component-core/metadata";
import type { ComponentExtension, XmluiExtensionComponentProps } from "../extensions";
import { COMPONENT_PART_KEY } from "../styling/layout";
import { useComponentThemeClass } from "../runtime/rendering/theme";

type ExtractValueCompat = ((value: unknown) => any) & {
  asString(value: unknown, fallback?: string): string | undefined;
  asDisplayText(value: unknown): string | undefined;
  asOptionalBoolean(value: unknown, fallback?: boolean): boolean;
  asOptionalNumber(value: unknown, fallback?: number): number | undefined;
  asOptionalString(value: unknown, fallback?: string): string | undefined;
};

type WrapComponentOptions = {
  booleans?: readonly string[];
  numbers?: readonly string[];
  strings?: readonly string[];
  rename?: Record<string, string>;
  exclude?: readonly string[];
  exposeRegisterApi?: boolean;
  events?: readonly string[] | Record<string, string>;
  customRender?: (
    props: Record<string, unknown>,
    args: {
      className?: string;
      classes: Record<string, string>;
      node: any;
      extractValue: ExtractValueCompat;
      lookupEventHandler: (name: string) => ((...args: unknown[]) => unknown) | undefined;
      registerComponentApi: (api: Record<string, unknown>) => void;
      renderChild: (child: unknown, wrapper?: unknown) => ReactNode;
      layoutContext?: unknown;
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
    component: (runtimeProps: XmluiExtensionComponentProps) => {
      const themeClass = useComponentThemeClass(name, metadata);
      const props = { ...runtimeProps.props };
      for (const name of options.exclude ?? []) {
        delete props[name];
      }
      if (options.customRender) {
        const extractValue = ((value: unknown) => value) as ExtractValueCompat;
        extractValue.asString = (value, fallback) =>
          value === undefined || value === null ? fallback : String(value);
        extractValue.asDisplayText = (value) =>
          value === undefined ? undefined : String(value);
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
        return options.customRender(props, {
          className: themeClass.className,
          classes: { [COMPONENT_PART_KEY]: themeClass.className },
          node: { ...runtimeProps.node, props: runtimeProps.props },
          extractValue,
          lookupEventHandler: (eventName) => runtimeProps.events[eventName],
          registerComponentApi: (api) => {
            const id = typeof runtimeProps.props.id === "string" ? runtimeProps.props.id : undefined;
            if (id) {
              runtimeProps.scope.references[id] = api;
              runtimeProps.scope.store.invalidateReference(id);
            }
          },
          renderChild: () => runtimeProps.children,
          layoutContext: undefined,
        });
      }
      return (
        <Component
          {...props}
          className={themeClass.className}
          style={themeClass.style}
        >
          {runtimeProps.children}
        </Component>
      );
    },
  };
}

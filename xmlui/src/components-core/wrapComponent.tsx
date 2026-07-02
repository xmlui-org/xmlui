import { type ComponentType, type ReactNode } from "react";

import type { ComponentMetadata } from "../component-core/metadata";
import type { ComponentExtension, XmluiExtensionComponentProps } from "../extensions";
import { COMPONENT_PART_KEY } from "../styling/layout";
import { useComponentThemeClass } from "../runtime/rendering/theme";

type WrapComponentOptions = {
  exclude?: readonly string[];
  customRender?: (
    props: Record<string, unknown>,
    args: {
      className?: string;
      classes: Record<string, string>;
      node: any;
      extractValue: (value: unknown) => any;
      renderChild: (child: unknown) => ReactNode;
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
        return options.customRender(props, {
          className: themeClass.className,
          classes: { [COMPONENT_PART_KEY]: themeClass.className },
          node: { ...runtimeProps.node, props: runtimeProps.props },
          extractValue: (value) => value,
          renderChild: () => runtimeProps.children,
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

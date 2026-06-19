declare module "xmlui" {
  import type { ReactNode } from "react";

  export type XmluiExtensionComponentProps = {
    props: Record<string, unknown>;
    events: Record<string, (...args: unknown[]) => Promise<unknown>>;
    children: ReactNode;
  };

  export type XmluiExtensionComponent = (props: XmluiExtensionComponentProps) => ReactNode;

  export type ComponentExtension = {
    name: string;
    component: XmluiExtensionComponent;
    props?: readonly string[];
    events?: readonly string[];
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
}


export type PropertyValueType =
  | "boolean"
  | "string"
  | "string[]"
  | "number"
  | "any"
  | "hash"
  | "ComponentDef"
  | "integer"
  | "color"
  | "length"
  | "url"
  | "icon"
  | "id-ref";

export type ThemeValueType =
  | "color"
  | "length"
  | "integer"
  | "number"
  | "duration"
  | "easing"
  | "shadow"
  | "border"
  | "fontFamily"
  | "fontWeight"
  | "lineHeight"
  | "string";

export type PropertyValueDescription<T = string | number> =
  | T
  | {
      value: T;
      description: string;
    };

export type IsValidFunction<T> = (
  propKey: string,
  propValue: T,
) => string | string[] | undefined | null;

export type ThemeVarMetadata = {
  name: string;
  description?: string;
  valueType?: ThemeValueType;
  availableValues?: readonly string[];
};

export type ComponentPropertyMetadata = {
  readonly description: string;
  readonly valueType?: PropertyValueType;
  readonly isResourceUrl?: boolean;
  readonly availableValues?: readonly PropertyValueDescription[];
  readonly isStrictEnum?: boolean;
  defaultValue?: unknown;
  isValid?: IsValidFunction<unknown>;
  isInternal?: boolean;
  isRequired?: boolean;
  deprecationMessage?: string;
  deprecatedSince?: string;
  removedIn?: string;
  replacement?: string;
  valueAliases?: ReadonlyArray<{
    from: string;
    to: string;
    deprecatedSince: string;
    removedIn?: string;
  }>;
  defaultValueChangedIn?: ReadonlyArray<{
    version: string;
    previousDefault: unknown;
    note?: string;
  }>;
  audit?: {
    classification: "public" | "sensitive" | "secret";
    defaultRedaction?: "mask" | "drop" | "hash";
    fieldPolicies?: Record<
      string,
      {
        classification: "public" | "sensitive" | "secret";
        defaultRedaction?: "mask" | "drop" | "hash";
      }
    >;
  };
};

export type ComponentEventMetadata = {
  readonly description: string;
  readonly signature?: string;
  readonly parameters?: Record<string, string>;
  readonly injectedVars?: readonly string[];
  deprecationMessage?: string;
  deprecatedSince?: string;
  removedIn?: string;
  replacement?: string;
};

export type ComponentApiMetadata = {
  readonly description: string;
  readonly signature?: string;
  readonly parameters?: Record<string, string>;
  deprecationMessage?: string;
  deprecatedSince?: string;
  removedIn?: string;
  replacement?: string;
};

export type ComponentPartMetadata = {
  description: string;
};

export type DefaultThemeVarValue =
  | string
  | number
  | boolean
  | Record<string, string | number | boolean>;

export type DefaultThemeVars = Record<string, DefaultThemeVarValue>;

export type ComponentMetadata<
  TProps extends Record<string, ComponentPropertyMetadata> = Record<string, ComponentPropertyMetadata>,
  TEvents extends Record<string, ComponentEventMetadata> = Record<string, ComponentEventMetadata>,
  TContextValues extends Record<string, ComponentPropertyMetadata> = Record<string, ComponentPropertyMetadata>,
  TApis extends Record<string, ComponentApiMetadata> = Record<string, ComponentApiMetadata>,
> = {
  status?: "stable" | "experimental" | "deprecated" | "in progress" | "internal";
  description?: string;
  shortDescription?: string;
  props?: TProps;
  events?: TEvents;
  contextVars?: TContextValues;
  apis?: TApis;
  nonVisual?: boolean;
  childrenAsTemplate?: string;
  opaque?: boolean;
  themeVars?: Record<string, string | ThemeVarMetadata>;
  themeVarDescriptions?: Record<string, string>;
  defaultThemeVars?: DefaultThemeVars;
  toneSpecificThemeVars?: Record<string, Record<string, string>>;
  limitThemeVarsToComponent?: boolean;
  themeVarContributorComponents?: string[];
  allowArbitraryProps?: boolean;
  specializedFrom?: string;
  docFolder?: string;
  isHtmlTag?: boolean;
  parts?: Record<string, ComponentPartMetadata>;
  unstableChildInjectedVars?: readonly string[];
  defaultPart?: string;
  excludeBehaviors?: string[];
  compactInlineLabel?: boolean;
  deprecationMessage?: string;
  isImplicitContainerByDefault?: boolean;
  deprecatedSince?: string;
  removedIn?: string;
  replacement?: string;
  renamedProps?: ReadonlyArray<{
    from: string;
    to: string;
    deprecatedSince: string;
    removedIn?: string;
  }>;
  defaultAriaLabel?: string;
  a11y?: {
    readonly role?:
      | "button"
      | "link"
      | "switch"
      | "checkbox"
      | "menuitem"
      | "tab"
      | "option"
      | "dialog"
      | "form-input"
      | "landmark"
      | "heading"
      | "list"
      | "image"
      | "decorative";
    readonly accessibleNameProps?: readonly string[];
    readonly requiresAccessibleName?: boolean;
    readonly landmark?:
      | "main"
      | "navigation"
      | "banner"
      | "contentinfo"
      | "complementary"
      | "search";
  };
};

export type ComponentMetadataOptimization = Pick<
  ComponentMetadata,
  "isImplicitContainerByDefault" | "unstableChildInjectedVars"
>;

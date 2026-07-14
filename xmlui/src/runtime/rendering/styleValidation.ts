import type { ThemeValueType } from "../../abstractions/ComponentDefs";
import type { ThemeDiagnostic } from "../../components-core/theming/validator/diagnostics";
import {
  validateInlineStyle,
  validateStyleString,
  type InlineStyleOptions,
} from "../../components-core/theming/validator/style-prop-validator";
import {
  looksLikeComponentThemeVariableName,
  parseStyleSelectorKey,
  supportedLayoutPropNames,
} from "../../styling";

export function inlineStyleValidationOptions(
  xmluiConfig: Record<string, unknown> | undefined,
): InlineStyleOptions {
  return {
    strict: xmluiConfig?.strictTheming !== false,
    allowRawCss: xmluiConfig?.allowInlineRawCss !== false,
    maxZIndex: (xmluiConfig?.maxZIndex ?? 9999) as number,
  };
}

export function validateRuntimeStyleProps(
  props: Record<string, unknown>,
  componentName: string,
  options: InlineStyleOptions,
): { props: Record<string, unknown>; diagnostics: ThemeDiagnostic[] } {
  let nextProps = props;
  const diagnostics: ThemeDiagnostic[] = [];

  const setProp = (name: string, value: unknown) => {
    if (value === props[name]) {
      return;
    }
    if (nextProps === props) {
      nextProps = { ...props };
    }
    if (value === undefined) {
      delete nextProps[name];
    } else {
      nextProps[name] = value;
    }
  };

  for (const [propName, rawValue] of Object.entries(props)) {
    if (propName === "style") {
      if (rawValue === undefined || rawValue === null || rawValue === "") {
        continue;
      }
      const { value, diagnostics: styleDiagnostics } = validateStyleString(
        typeof rawValue === "string" ? rawValue : String(rawValue),
        { componentName },
        options,
      );
      diagnostics.push(...styleDiagnostics);
      setProp(propName, value || undefined);
      continue;
    }

    if (looksLikeComponentThemeVariableName(propName)) {
      continue;
    }

    const selector = parseStyleSelectorKey(propName);
    if (!supportedLayoutPropNames.includes(selector.property as never)) {
      continue;
    }
    if (isStarSizeLayoutValue(selector.property, rawValue)) {
      continue;
    }

    const { value, diagnostics: inlineDiagnostics } = validateInlineStyle(
      {
        componentName,
        propName,
        valueType: layoutPropValueType(selector.property),
        rawValue: rawValue as string | number | undefined,
      },
      options,
    );
    diagnostics.push(...inlineDiagnostics);
    setProp(propName, value);
  }

  return { props: nextProps, diagnostics };
}

function isStarSizeLayoutValue(propName: string, value: unknown): boolean {
  if (propName !== "width" && propName !== "height") {
    return false;
  }
  return typeof value === "string" && /^\d*\*$/.test(value.trim());
}

function layoutPropValueType(propName: string): ThemeValueType | undefined {
  if (lengthLayoutProps.has(propName)) {
    return "length";
  }
  if (borderLayoutProps.has(propName)) {
    return "border";
  }
  if (colorLayoutProps.has(propName)) {
    return "color";
  }
  if (numberLayoutProps.has(propName)) {
    return "number";
  }
  if (propName === "zIndex") {
    return "integer";
  }
  if (propName === "fontFamily") {
    return "fontFamily";
  }
  if (propName === "fontWeight") {
    return "fontWeight";
  }
  if (propName === "lineHeight") {
    return "lineHeight";
  }
  if (propName === "boxShadow" || propName === "textShadow") {
    return "shadow";
  }
  return undefined;
}

const lengthLayoutProps = new Set<string>([
  "width",
  "minWidth",
  "maxWidth",
  "height",
  "minHeight",
  "maxHeight",
  "gap",
  "padding",
  "paddingHorizontal",
  "paddingVertical",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "margin",
  "marginHorizontal",
  "marginVertical",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "top",
  "right",
  "bottom",
  "left",
  "borderWidth",
  "borderRadius",
  "radiusTopLeft",
  "radiusTopRight",
  "radiusBottomLeft",
  "radiusBottomRight",
  "scrollPadding",
  "scrollPaddingTop",
  "scrollPaddingRight",
  "scrollPaddingBottom",
  "scrollPaddingLeft",
  "scrollMargin",
  "scrollMarginTop",
  "scrollMarginRight",
  "scrollMarginBottom",
  "scrollMarginLeft",
  "fontSize",
  "letterSpacing",
  "textDecorationThickness",
  "textUnderlineOffset",
  "outlineWidth",
  "outlineOffset",
  "textIndent",
  "wordSpacing",
]);

const borderLayoutProps = new Set<string>([
  "border",
  "borderTop",
  "borderRight",
  "borderBottom",
  "borderLeft",
  "borderHorizontal",
  "borderVertical",
  "outline",
]);

const colorLayoutProps = new Set<string>([
  "backgroundColor",
  "borderColor",
  "color",
  "textDecorationColor",
  "outlineColor",
]);

const numberLayoutProps = new Set<string>([
  "opacity",
  "zoom",
]);

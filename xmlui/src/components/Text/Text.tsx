import type { CSSProperties } from "react";

import { wrapComponent } from "../../runtime/rendering/adapter";
import {
  collectComponentThemeDefaults,
  extractScssThemeVars,
  mergeThemeVariableLayers,
  resolveThemeReferences,
  resolveThemeVariable,
} from "../../styling/theme";
import { useThemeVariables } from "../../runtime/rendering/theme";
import {
  createMetadata,
  dContextMenu,
} from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { Text, textVariantElement } from "./TextReact";
import textStylesSource from "./Text.module.scss?xmlui-theme-vars";
import { defaultProps } from "./Text.defaults";

const COMP = "Text";

export const TextMd = createMetadata({
  status: "stable",
  description: "`Text` displays textual information in optional styles and variants.",
  props: {
    id: {
      description: "Defines a component instance identifier used for references and APIs.",
      valueType: "string",
    },
    value: {
      description: "The text to display. Child text is used when `value` is omitted.",
      valueType: "string",
    },
    variant: {
      description: "Named text variant.",
      valueType: "string",
      availableValues: Object.keys(textVariantElement),
      isStrictEnum: true,
    },
    maxLines: {
      description: "Maximum displayed line count before truncation.",
      valueType: "number",
      defaultValue: defaultProps.maxLines,
    },
    preserveLinebreaks: {
      description: "Preserves line breaks when displaying text.",
      valueType: "boolean",
      defaultValue: defaultProps.preserveLinebreaks,
    },
    ellipses: {
      description: "Displays ellipses when truncated.",
      valueType: "boolean",
      defaultValue: defaultProps.ellipses,
    },
    breakMode: {
      description: "Controls text breaking.",
      valueType: "string",
      availableValues: ["normal", "word", "anywhere", "keep", "hyphenate"],
      defaultValue: "normal",
      isStrictEnum: true,
    },
    overflowMode: {
      description: "Controls text overflow.",
      valueType: "string",
      availableValues: ["none", "ellipsis", "scroll", "flow"],
      defaultValue: "not specified",
      isStrictEnum: true,
    },
    testId: {
      description: "Adds a test identifier to the rendered text element.",
      valueType: "string",
    },
  },
  events: {
    click: {
      description: "Fired when the text is clicked.",
      signature: "click(): void",
    },
    contextMenu: dContextMenu(COMP),
  },
  apis: {
    hasOverflow: {
      description: "Returns true when the displayed text overflows its container.",
      signature: "hasOverflow(): boolean",
    },
  },
  themeVars: extractScssThemeVars(textStylesSource),
  defaultThemeVars: {
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`borderStyle-${COMP}`]: "solid",
    [`borderWidth-${COMP}`]: "$space-0",
    [`textColor-${COMP}`]: "$textColor",
    [`fontFamily-${COMP}`]: "$fontFamily",
    [`fontSize-${COMP}`]: "$fontSize",
    [`fontWeight-${COMP}`]: "$fontWeight-normal",
    [`fontSize-${COMP}-secondary`]: "$fontSize-sm",
    [`textColor-${COMP}-secondary`]: "$textColor-secondary",
    [`fontWeight-${COMP}-strong`]: "$fontWeight-bold",
    [`fontStyle-${COMP}-em`]: "italic",
    [`fontStyle-${COMP}-cite`]: "italic",
    [`fontFamily-${COMP}-mono`]: "$fontFamily-monospace",
    [`fontFamily-${COMP}-code`]: "$fontFamily-monospace",
    [`fontSize-${COMP}-code`]: "$fontSize-sm",
    [`borderWidth-${COMP}-code`]: "1px",
    [`borderStyle-${COMP}-code`]: "solid",
    [`borderRadius-${COMP}-code`]: "4px",
    [`paddingHorizontal-${COMP}-code`]: "$space-0_5",
    [`paddingBottom-${COMP}-code`]: "2px",
    [`backgroundColor-${COMP}-code`]: "rgb(from $color-surface-100 r g b / 0.4)",
    [`borderColor-${COMP}-code`]: "$color-surface-100",
    [`fontWeight-${COMP}-abbr`]: "$fontWeight-bold",
    [`textTransform-${COMP}-abbr`]: "uppercase",
    [`textDecorationLine-${COMP}-deleted`]: "line-through",
    [`textDecorationLine-${COMP}-inserted`]: "underline",
    [`fontFamily-${COMP}-keyboard`]: "$fontFamily-monospace",
    [`fontSize-${COMP}-keyboard`]: "$fontSize-sm",
    [`fontWeight-${COMP}-keyboard`]: "$fontWeight-bold",
    [`borderWidth-${COMP}-keyboard`]: "1px",
    [`paddingHorizontal-${COMP}-keyboard`]: "$space-1",
    [`backgroundColor-${COMP}-keyboard`]: "rgb(from $color-surface-100 r g b / 0.4)",
    [`borderColor-${COMP}-keyboard`]: "$color-surface-300",
    [`fontSize-${COMP}-title`]: "$fontSize-2xl",
    [`fontSize-${COMP}-subtitle`]: "$fontSize-xl",
    [`fontSize-${COMP}-small`]: "$fontSize-sm",
    [`letterSpacing-${COMP}-caption`]: "0.05rem",
    [`fontSize-${COMP}-placeholder`]: "$fontSize-xs",
    [`textColor-${COMP}-placeholder`]: "$color-surface-500",
    [`paddingVertical-${COMP}-paragraph`]: "$space-1",
    [`fontSize-${COMP}-subheading`]: "$fontSize-H6",
    [`fontWeight-${COMP}-subheading`]: "$fontWeight-bold",
    [`letterSpacing-${COMP}-subheading`]: "0.04em",
    [`textTransform-${COMP}-subheading`]: "uppercase",
    [`textColor-${COMP}-subheading`]: "$textColor-secondary",
    [`textColor-${COMP}-marked`]: "$color-secondary-800",
    [`backgroundColor-${COMP}-marked`]: "rgb(from $color-primary-300 r g b / 0.4)",
  },
});

export const textRenderer = wrapComponent({
  name: "Text",
  metadata: TextMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const themeVariables = useThemeVariables();
    const mergedThemeVariables = mergeThemeVariableLayers([
      collectComponentThemeDefaults(TextMd),
      themeVariables,
    ]);
    const variant = adapter.stringProp("variant");
    const rootAttrs = adapter.rootAttrs();
    const hasValue = Object.prototype.hasOwnProperty.call(adapter.node.props, "value");
    const value = adapter.prop("value");
    const children = hasValue ? displayText(value) : adapter.renderChildren();

    return (
      <Text
        {...rootAttrs}
        id={adapter.stringProp("id")}
        variant={variant}
        maxLines={adapter.numberProp("maxLines", defaultProps.maxLines)}
        preserveLinebreaks={adapter.booleanProp("preserveLinebreaks", defaultProps.preserveLinebreaks)}
        ellipses={adapter.booleanProp("ellipses", defaultProps.ellipses)}
        overflowMode={adapter.stringProp("overflowMode")}
        breakMode={adapter.stringProp("breakMode")}
        style={{
          ...(rootAttrs.style as CSSProperties | undefined),
          ...currentVariantCssVariables(variant, mergedThemeVariables),
        }}
        onClick={() => void adapter.event("click")()}
        onContextMenu={() => void adapter.event("contextMenu")()}
        registerApi={adapter.registerApi}
      >
        {children}
      </Text>
    );
  },
});

function displayText(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

const currentVariantThemeProps = [
  "textColor",
  "backgroundColor",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "fontStretch",
  "lineHeight",
  "letterSpacing",
  "wordSpacing",
  "textShadow",
  "textIndent",
  "textAlign",
  "textAlignLast",
  "direction",
  "writingMode",
  "lineBreak",
  "textTransform",
  "textDecorationLine",
  "textDecorationColor",
  "textDecorationStyle",
  "textDecorationThickness",
  "textUnderlineOffset",
  "wordBreak",
  "wordWrap",
  "borderWidth",
  "borderStyle",
  "borderColor",
  "borderRadius",
  "marginTop",
  "marginBottom",
  "marginLeft",
  "marginRight",
  "paddingHorizontal",
  "paddingVertical",
  "paddingBottom",
  "verticalAlignment",
] as const;

function currentVariantCssVariables(
  variant: string | undefined,
  themeVariables: Record<string, unknown>,
): CSSProperties {
  if (!variant) {
    return {};
  }
  const style: Record<string, string> = {};
  for (const prop of currentVariantThemeProps) {
    const value = resolveThemeVariable(`${prop}-${COMP}-${variant}`, [themeVariables]);
    if (value !== undefined && value !== null && value !== "") {
      style[`--xmlui-current-${prop}-${COMP}`] = String(resolveThemeReferences(value));
    }
  }
  return style as CSSProperties;
}

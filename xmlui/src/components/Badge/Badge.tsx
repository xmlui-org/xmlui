import { createMetadata, dContextMenu } from "../../component-core/metadata/helpers";
import { defaultProps } from "./Badge.defaults";

const COMP = "Badge";
const badgeVariantValues = ["badge", "pill"] as const;
const badgeThemeVars = {
  ...composedThemeVars(COMP),
  ...composedThemeVars(`${COMP}-pill`),
};

export const BadgeMd = createMetadata({
  status: "stable",
  description:
    "`Badge` displays small text labels with colored backgrounds, commonly used for " +
    "status indicators, categories, tags, and counts. It supports dynamic color " +
    "mapping based on content values, useful for status systems and data categorization.",
  props: {
    value: {
      description:
        "The text that the component displays. If this is not defined, the component renders " +
        "its children as the content of the badge. If neither text nor any child is defined, " +
        "the component renders a single frame for the badge with a non-breakable space.",
      valueType: "string",
      isRequired: true,
    },
    variant: {
      description:
        "Modifies the shape of the component. Comes in the regular `badge` variant or the `pill` variant " +
        "with fully rounded corners.",
      valueType: "string",
      availableValues: badgeVariantValues,
      defaultValue: defaultProps.variant,
    },
    colorMap: {
      description:
        `The \`${COMP}\` component supports the mapping of a list of colors using the \`value\` prop as the ` +
        "key. If this property is not set, no color mapping is used.",
      valueType: "hash",
    },
    testId: {
      description: "Adds a test identifier to the component root.",
      valueType: "string",
    },
  },
  events: {
    contextMenu: dContextMenu(COMP),
  },
  themeVars: badgeThemeVars,
  defaultThemeVars: {
    [`padding-${COMP}`]: "$space-0_5 $space-2",
    [`border-${COMP}`]: "0px solid $borderColor",
    [`padding-${COMP}-pill`]: "$space-0_5 $space-2",
    [`borderRadius-${COMP}`]: "4px",
    [`fontSize-${COMP}`]: "0.8em",
    [`fontSize-${COMP}-pill`]: "0.8em",
    [`backgroundColor-${COMP}`]: "rgb(from $color-secondary-500 r g b / 0.6)",
    [`textColor-${COMP}`]: "$const-color-surface-0",
    [`textAlign-${COMP}`]: "center",
  },
});

function composedThemeVars(subject: string): Record<string, string> {
  const names = [
    ...borderThemeVarNames(subject),
    ...paddingThemeVarNames(subject),
    ...textThemeVarNames(subject),
  ];
  return Object.fromEntries(names.map((name) => [
    name,
    `Theme variable declared by ${name}.`,
  ]));
}

function borderThemeVarNames(subject: string): string[] {
  const names = [
    "border",
    "borderHorizontal",
    "borderVertical",
    "borderLeft",
    "borderRight",
    "borderTop",
    "borderBottom",
    "borderWidth",
    "borderHorizontalWidth",
    "borderLeftWidth",
    "borderRightWidth",
    "borderVerticalWidth",
    "borderTopWidth",
    "borderBottomWidth",
    "borderStyle",
    "borderHorizontalStyle",
    "borderLeftStyle",
    "borderRightStyle",
    "borderVerticalStyle",
    "borderTopStyle",
    "borderBottomStyle",
    "borderColor",
    "borderHorizontalColor",
    "borderLeftColor",
    "borderRightColor",
    "borderVerticalColor",
    "borderTopColor",
    "borderBottomColor",
    "borderRadius",
    "borderStartStartRadius",
    "borderStartEndRadius",
    "borderEndStartRadius",
    "borderEndEndRadius",
  ];
  return names.map((name) => `${name}-${subject}`);
}

function paddingThemeVarNames(subject: string): string[] {
  return [
    "padding",
    "paddingHorizontal",
    "paddingVertical",
    "paddingLeft",
    "paddingRight",
    "paddingTop",
    "paddingBottom",
  ].map((name) => `${name}-${subject}`);
}

function textThemeVarNames(subject: string): string[] {
  return [
    "textColor",
    "fontFamily",
    "fontSize",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "fontStretch",
    "textDecorationLine",
    "textDecorationColor",
    "textDecorationStyle",
    "textDecorationThickness",
    "textUnderlineOffset",
    "lineHeight",
    "backgroundColor",
    "textTransform",
    "letterSpacing",
    "wordSpacing",
    "textShadow",
    "textIndent",
    "textAlign",
    "textAlignLast",
    "wordBreak",
    "wordWrap",
    "direction",
    "writingMode",
    "lineBreak",
  ].map((name) => `${name}-${subject}`);
}

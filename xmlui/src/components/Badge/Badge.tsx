import { createMetadata, dContextMenu } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./Badge.defaults";

const COMP = "Badge";
const badgeVariantValues = ["badge", "pill"] as const;

const badgeStylesSource = `
$backgroundColor-Badge: createThemeVar("backgroundColor-Badge");
$textColor-Badge: createThemeVar("textColor-Badge");
$textAlign-Badge: createThemeVar("textAlign-Badge");
$fontSize-Badge: createThemeVar("fontSize-Badge");
$fontWeight-Badge: createThemeVar("fontWeight-Badge");
$borderRadius-Badge: createThemeVar("borderRadius-Badge");
$padding-Badge: createThemeVar("padding-Badge");
$paddingHorizontal-Badge: createThemeVar("paddingHorizontal-Badge");
$paddingVertical-Badge: createThemeVar("paddingVertical-Badge");
$paddingTop-Badge: createThemeVar("paddingTop-Badge");
$paddingRight-Badge: createThemeVar("paddingRight-Badge");
$paddingBottom-Badge: createThemeVar("paddingBottom-Badge");
$paddingLeft-Badge: createThemeVar("paddingLeft-Badge");
$border-Badge: createThemeVar("border-Badge");
$borderHorizontal-Badge: createThemeVar("borderHorizontal-Badge");
$borderVertical-Badge: createThemeVar("borderVertical-Badge");
$borderTop-Badge: createThemeVar("borderTop-Badge");
$borderRight-Badge: createThemeVar("borderRight-Badge");
$borderBottom-Badge: createThemeVar("borderBottom-Badge");
$borderLeft-Badge: createThemeVar("borderLeft-Badge");
$borderColor-Badge: createThemeVar("borderColor-Badge");
$borderHorizontalColor-Badge: createThemeVar("borderHorizontalColor-Badge");
$borderVerticalColor-Badge: createThemeVar("borderVerticalColor-Badge");
$borderTopColor-Badge: createThemeVar("borderTopColor-Badge");
$borderRightColor-Badge: createThemeVar("borderRightColor-Badge");
$borderBottomColor-Badge: createThemeVar("borderBottomColor-Badge");
$borderLeftColor-Badge: createThemeVar("borderLeftColor-Badge");
$borderStyle-Badge: createThemeVar("borderStyle-Badge");
$borderHorizontalStyle-Badge: createThemeVar("borderHorizontalStyle-Badge");
$borderVerticalStyle-Badge: createThemeVar("borderVerticalStyle-Badge");
$borderTopStyle-Badge: createThemeVar("borderTopStyle-Badge");
$borderRightStyle-Badge: createThemeVar("borderRightStyle-Badge");
$borderBottomStyle-Badge: createThemeVar("borderBottomStyle-Badge");
$borderLeftStyle-Badge: createThemeVar("borderLeftStyle-Badge");
$borderWidth-Badge: createThemeVar("borderWidth-Badge");
$borderHorizontalWidth-Badge: createThemeVar("borderHorizontalWidth-Badge");
$borderVerticalWidth-Badge: createThemeVar("borderVerticalWidth-Badge");
$borderTopWidth-Badge: createThemeVar("borderTopWidth-Badge");
$borderRightWidth-Badge: createThemeVar("borderRightWidth-Badge");
$borderBottomWidth-Badge: createThemeVar("borderBottomWidth-Badge");
$borderLeftWidth-Badge: createThemeVar("borderLeftWidth-Badge");
$fontSize-Badge-pill: createThemeVar("fontSize-Badge-pill");
$fontWeight-Badge-pill: createThemeVar("fontWeight-Badge-pill");
$textColor-Badge-pill: createThemeVar("textColor-Badge-pill");
$textAlign-Badge-pill: createThemeVar("textAlign-Badge-pill");
$padding-Badge-pill: createThemeVar("padding-Badge-pill");
$paddingHorizontal-Badge-pill: createThemeVar("paddingHorizontal-Badge-pill");
$paddingVertical-Badge-pill: createThemeVar("paddingVertical-Badge-pill");
$paddingTop-Badge-pill: createThemeVar("paddingTop-Badge-pill");
$paddingRight-Badge-pill: createThemeVar("paddingRight-Badge-pill");
$paddingBottom-Badge-pill: createThemeVar("paddingBottom-Badge-pill");
$paddingLeft-Badge-pill: createThemeVar("paddingLeft-Badge-pill");
$border-Badge-pill: createThemeVar("border-Badge-pill");
$borderHorizontal-Badge-pill: createThemeVar("borderHorizontal-Badge-pill");
$borderVertical-Badge-pill: createThemeVar("borderVertical-Badge-pill");
$borderTop-Badge-pill: createThemeVar("borderTop-Badge-pill");
$borderRight-Badge-pill: createThemeVar("borderRight-Badge-pill");
$borderBottom-Badge-pill: createThemeVar("borderBottom-Badge-pill");
$borderLeft-Badge-pill: createThemeVar("borderLeft-Badge-pill");
$borderColor-Badge-pill: createThemeVar("borderColor-Badge-pill");
$borderHorizontalColor-Badge-pill: createThemeVar("borderHorizontalColor-Badge-pill");
$borderVerticalColor-Badge-pill: createThemeVar("borderVerticalColor-Badge-pill");
$borderTopColor-Badge-pill: createThemeVar("borderTopColor-Badge-pill");
$borderRightColor-Badge-pill: createThemeVar("borderRightColor-Badge-pill");
$borderBottomColor-Badge-pill: createThemeVar("borderBottomColor-Badge-pill");
$borderLeftColor-Badge-pill: createThemeVar("borderLeftColor-Badge-pill");
$borderStyle-Badge-pill: createThemeVar("borderStyle-Badge-pill");
$borderHorizontalStyle-Badge-pill: createThemeVar("borderHorizontalStyle-Badge-pill");
$borderVerticalStyle-Badge-pill: createThemeVar("borderVerticalStyle-Badge-pill");
$borderTopStyle-Badge-pill: createThemeVar("borderTopStyle-Badge-pill");
$borderRightStyle-Badge-pill: createThemeVar("borderRightStyle-Badge-pill");
$borderBottomStyle-Badge-pill: createThemeVar("borderBottomStyle-Badge-pill");
$borderLeftStyle-Badge-pill: createThemeVar("borderLeftStyle-Badge-pill");
$borderWidth-Badge-pill: createThemeVar("borderWidth-Badge-pill");
$borderHorizontalWidth-Badge-pill: createThemeVar("borderHorizontalWidth-Badge-pill");
$borderVerticalWidth-Badge-pill: createThemeVar("borderVerticalWidth-Badge-pill");
$borderTopWidth-Badge-pill: createThemeVar("borderTopWidth-Badge-pill");
$borderRightWidth-Badge-pill: createThemeVar("borderRightWidth-Badge-pill");
$borderBottomWidth-Badge-pill: createThemeVar("borderBottomWidth-Badge-pill");
$borderLeftWidth-Badge-pill: createThemeVar("borderLeftWidth-Badge-pill");
`;

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
      availableValues: [...badgeVariantValues],
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
  themeVars: extractScssThemeVars(badgeStylesSource),
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

import { createMetadata, dClick, dContextMenu } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { sizeValues } from "../abstractions";
import { defaultProps } from "./Avatar.defaults";

const COMP = "Avatar";
const avatarStylesSource = `
$backgroundColor-Avatar: createThemeVar("backgroundColor-Avatar");
$boxShadow-Avatar: createThemeVar("boxShadow-Avatar");
$textColor-Avatar: createThemeVar("textColor-Avatar");
$fontWeight-Avatar: createThemeVar("fontWeight-Avatar");
`;
const borderThemeParts = [
  "border",
  "borderWidth",
  "borderStyle",
  "borderColor",
] as const;
const borderThemeAxes = ["Horizontal", "Vertical"] as const;
const borderThemeSides = ["Left", "Right", "Top", "Bottom"] as const;
const borderRadiusThemeVars = [
  "borderRadius",
  "borderStartStartRadius",
  "borderStartEndRadius",
  "borderEndStartRadius",
  "borderEndEndRadius",
] as const;

const avatarThemeVars = {
  ...extractScssThemeVars(avatarStylesSource),
  ...Object.fromEntries(borderThemeParts.flatMap((part) => [
    [`${part}-${COMP}`, `Theme variable declared by ${part}-${COMP}.`],
    ...borderThemeAxes.map((axis) => [
      `border${axis}${part.replace("border", "")}-${COMP}`,
      `Theme variable declared by border${axis}${part.replace("border", "")}-${COMP}.`,
    ]),
    ...borderThemeSides.map((side) => [
      `border${side}${part.replace("border", "")}-${COMP}`,
      `Theme variable declared by border${side}${part.replace("border", "")}-${COMP}.`,
    ]),
  ])),
  ...Object.fromEntries(borderRadiusThemeVars.map((name) => [
    `${name}-${COMP}`,
    `Theme variable declared by ${name}-${COMP}.`,
  ])),
};

export const AvatarMd = createMetadata({
  status: "stable",
  description:
    "`Avatar` displays a user or entity's profile picture as a circular image " +
    "with fallback initials when no image URL is provided.",
  props: {
    size: {
      description: "Defines the display size of the Avatar.",
      availableValues: [...sizeValues],
      valueType: "string",
      defaultValue: defaultProps.size,
    },
    name: {
      description: "The name used to derive initials and accessible labels.",
      valueType: "string",
    },
    url: {
      description: "The image URL to display.",
      valueType: "string",
      isResourceUrl: true,
    },
    testId: {
      description: "Adds a test identifier to the component root.",
      valueType: "string",
    },
  },
  events: {
    click: dClick(COMP),
    contextMenu: dContextMenu(COMP),
  },
  themeVars: avatarThemeVars,
  defaultThemeVars: {
    [`borderRadius-${COMP}`]: "4px",
    [`boxShadow-${COMP}`]: "inset 0 0 0 1px rgba(4,32,69,0.1)",
    [`textColor-${COMP}`]: "$textColor-secondary",
    [`fontWeight-${COMP}`]: "$fontWeight-bold",
    [`border-${COMP}`]: "0px solid $color-surface-400A80",
    [`backgroundColor-${COMP}`]: "$color-surface-100",
  },
});

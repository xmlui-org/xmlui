export const buttonThemeValues = ["attention", "primary", "secondary"] as const;
export const buttonVariantValues = ["solid", "outlined", "ghost"] as const;
export const buttonTypeValues = ["button", "submit", "reset"] as const;
export const alignmentOptionValues = ["start", "center", "end"] as const;
export const sizeValues = ["xs", "sm", "md", "lg"] as const;
export const iconPositionValues = ["start", "end"] as const;
export type IconPosition = (typeof iconPositionValues)[number];
export type ButtonThemeColor = (typeof buttonThemeValues)[number];
export type ButtonVariant = (typeof buttonVariantValues)[number];
export type ButtonType = (typeof buttonTypeValues)[number];
export type AlignmentOptions = (typeof alignmentOptionValues)[number];
export type SizeType = (typeof sizeValues)[number];
export type OrientationOptions = "horizontal" | "vertical";
export type ValidationStatus = "none" | "valid" | "warning" | "error";

export const buttonThemeMd = buttonThemeValues.map((value) => ({ value, description: value }));
export const buttonVariantMd = buttonVariantValues.map((value) => ({ value, description: value }));
export const buttonTypesMd = buttonTypeValues.map((value) => ({ value, description: value }));
export const alignmentOptionMd = alignmentOptionValues.map((value) => ({ value, description: value }));
export const sizeMd = sizeValues.map((value) => ({ value, description: value }));
export const iconPositionMd = iconPositionValues.map((value) => ({ value, description: value }));

export function isSizeType(value: unknown): value is SizeType {
  return typeof value === "string" && sizeValues.includes(value as SizeType);
}

export const TextVariantElement = {
  abbr: "abbr",
  cite: "cite",
  code: "code",
  codefence: "pre",
  deleted: "del",
  inherit: "span",
  inserted: "ins",
  keyboard: "kbd",
  marked: "mark",
  sample: "samp",
  sub: "sub",
  sup: "sup",
  var: "var",
  mono: "pre",
  strong: "strong",
  em: "em",
  title: "span",
  subtitle: "span",
  small: "span",
  caption: "span",
  placeholder: "span",
  paragraph: "p",
  subheading: "h6",
  tableheading: "h6",
  secondary: "span",
} as const;
export type TextVariant = keyof typeof TextVariantElement;
export type OverflowMode = "none" | "ellipsis" | "scroll" | "flow";
export type BreakMode = "normal" | "word" | "anywhere" | "keep" | "hyphenate";

export const variantOptionsMd = Object.keys(TextVariantElement).map((value) => ({
  value,
  description: value,
}));

const AbbreviationKeys = ["title"] as const;
type Abbreviation = {
  title?: string;
};

const InsertedKeys = ["cite", "dateTime"] as const;
type Inserted = {
  cite?: string;
  dateTime?: string;
};

export const VariantPropsKeys = [...AbbreviationKeys, ...InsertedKeys] as const;
export type VariantProps = Abbreviation | Inserted;

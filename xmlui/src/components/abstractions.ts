export type PropertyValueDescription<T extends string = string> = {
  value: T;
  description: string;
};

export type ValidationStatus = "none" | "error" | "warning" | "valid" | string;

export const buttonThemeValues = ["attention", "primary", "secondary"] as const;
export const buttonThemeNames = [...buttonThemeValues];
export type ButtonThemeColor = (typeof buttonThemeValues)[number];
export const buttonThemeMd: PropertyValueDescription<ButtonThemeColor>[] = [
  { value: "attention", description: "Attention state theme color" },
  { value: "primary", description: "Primary theme color" },
  { value: "secondary", description: "Secondary theme color" },
];

export const buttonVariantValues = ["solid", "outlined", "ghost"] as const;
export const buttonVariantNames = [...buttonVariantValues];
export type ButtonVariant = (typeof buttonVariantValues)[number];
export const buttonVariantMd: PropertyValueDescription<ButtonVariant>[] = [
  { value: "solid", description: "A button with a border and a filled background." },
  {
    value: "outlined",
    description: "The button is displayed with a border and a transparent background.",
  },
  {
    value: "ghost",
    description:
      "A button with no border and fill. Only the label is visible; the background is colored when hovered or clicked.",
  },
];

export const buttonTypeValues = ["button", "submit", "reset"] as const;
export const buttonTypeNames = [...buttonTypeValues];
export type ButtonType = (typeof buttonTypeValues)[number];
export const buttonTypesMd: PropertyValueDescription<ButtonType>[] = [
  {
    value: "button",
    description: "Regular behavior that only executes logic if explicitly determined.",
  },
  {
    value: "submit",
    description:
      "The button submits the form data to the server. This is the default for buttons in a Form or NativeForm component.",
  },
  {
    value: "reset",
    description:
      "Resets all the controls to their initial values. Using it is ill advised for UX reasons.",
  },
];

export const alignmentOptionValues = ["start", "center", "end"] as const;
export const alignmentOptionNames = [...alignmentOptionValues];
export type AlignmentOptions = (typeof alignmentOptionValues)[number];
export const alignmentOptionMd: PropertyValueDescription<AlignmentOptions>[] = [
  { value: "center", description: "Place the content in the middle" },
  {
    value: "start",
    description: "Justify the content to the left (to the right if in right-to-left)",
  },
  {
    value: "end",
    description: "Justify the content to the right (to the left if in right-to-left)",
  },
];

export const sizeValues = ["xs", "sm", "md", "lg"] as const;
export type SizeType = (typeof sizeValues)[number];
export const sizeMd: PropertyValueDescription<SizeType>[] = [
  { value: "xs", description: "Extra small" },
  { value: "sm", description: "Small" },
  { value: "md", description: "Medium" },
  { value: "lg", description: "Large" },
];
export function isSizeType(value: unknown): value is SizeType {
  return sizeValues.includes(value as SizeType);
}

export const iconPositionValues = ["start", "end"] as const;
export const iconPositionNames = [...iconPositionValues];
export type IconPosition = (typeof iconPositionValues)[number];
export const iconPositionMd: PropertyValueDescription<IconPosition>[] = [
  {
    value: "start",
    description:
      "The icon will appear at the start (left side when the left-to-right direction is set)",
  },
  {
    value: "end",
    description:
      "The icon will appear at the end (right side when the left-to-right direction is set)",
  },
];

export const orientationOptionValues = ["horizontal", "vertical"] as const;
export type OrientationOptions = (typeof orientationOptionValues)[number];
export const orientationOptionMd: PropertyValueDescription<OrientationOptions>[] = [
  { value: "horizontal", description: "The component will fill the available space horizontally" },
  { value: "vertical", description: "The component will fill the available space vertically" },
];

export const TextVariantElement = {
  abbr: "abbr",
  cite: "cite",
  code: "code",
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

type TextPropertyValueDescription = PropertyValueDescription<TextVariant> & {
  description: string;
};

export const variantOptionsMd: TextPropertyValueDescription[] = [
  { value: "abbr", description: "Abbreviation text rendered with an `abbr` element." },
  { value: "cite", description: "Citation text rendered with a `cite` element." },
  { value: "code", description: "Inline code text rendered with a `code` element." },
  { value: "deleted", description: "Deleted text rendered with a `del` element." },
  { value: "inherit", description: "Text that inherits its surrounding text styles." },
  { value: "inserted", description: "Inserted text rendered with an `ins` element." },
  { value: "keyboard", description: "Keyboard input text rendered with a `kbd` element." },
  { value: "marked", description: "Highlighted text rendered with a `mark` element." },
  { value: "sample", description: "Sample output text rendered with a `samp` element." },
  { value: "sub", description: "Subscript text rendered with a `sub` element." },
  { value: "sup", description: "Superscript text rendered with a `sup` element." },
  { value: "var", description: "Variable text rendered with a `var` element." },
  { value: "strong", description: "Important text rendered with a `strong` element." },
  { value: "em", description: "Emphasized text rendered with an `em` element." },
  { value: "mono", description: "Monospace text rendered with a `pre` element." },
  { value: "title", description: "Title text in the current context." },
  { value: "subtitle", description: "Subtitle text in the current context." },
  { value: "small", description: "Small text in the current context." },
  { value: "caption", description: "Caption text in the current context." },
  { value: "placeholder", description: "Placeholder-style text." },
  { value: "paragraph", description: "Paragraph text rendered with a `p` element." },
  { value: "subheading", description: "Subheading text rendered with an `h6` element." },
  { value: "tableheading", description: "Table heading text rendered with an `h6` element." },
  { value: "secondary", description: "Secondary text style." },
];

type Abbreviation = {
  title?: string;
};

const AbbreviationKeys = ["title"] as const;

type Inserted = {
  cite?: string;
  datetime?: string;
};

const InsertedKeys = ["cite", "datetime"] as const;

export const VariantPropsKeys = [...AbbreviationKeys, ...InsertedKeys] as const;
export type VariantProps = Abbreviation | Inserted;

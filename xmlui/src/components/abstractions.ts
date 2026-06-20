export const buttonThemeValues = ["attention", "primary", "secondary"] as const;
export const buttonVariantValues = ["solid", "outlined", "ghost"] as const;
export const buttonTypeValues = ["button", "submit", "reset"] as const;
export const alignmentOptionValues = ["start", "center", "end"] as const;
export const sizeValues = ["xs", "sm", "md", "lg"] as const;
export const iconPositionValues = ["start", "end"] as const;
export type IconPosition = (typeof iconPositionValues)[number];

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

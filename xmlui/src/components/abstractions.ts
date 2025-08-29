import type { CSSProperties, ReactNode } from "react";
import type { PropertyValueDescription } from "../abstractions/ComponentDefs";

/**
 * Several components offer a list of options to select from. This type describes such an option.
 */
export type Option = {
  label: string;
  value: string;
  enabled?: boolean;
  style?: CSSProperties;
  className?: string;
  readOnly?: boolean;
  keywords?: string[];
  children?: ReactNode;
  optionRenderer?: (contextVars: any) => ReactNode;
};

export type Accordion = {
  header: string;
  content: ReactNode;
};

export type Tab = {
  id?: string;
  label: string;
  headerRenderer?: (contextVars: any) => ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
  activated?: () => void;
};

export const LinkTargetNames = ["_self", "_blank", "_parent", "_top", "_unfencedTop"] as const;
export type LinkTarget = (typeof LinkTargetNames)[number];
export const LinkTargetMd: PropertyValueDescription[] = [
  {
    value: "_self",
    description: "The link will open in the same frame as it was clicked.",
  },
  {
    value: "_blank",
    description: "The link will open in a new window or tab.",
  },
  {
    value: "_parent",
    description: "The link will open in the parent frame. If no parent, behaves as _self.",
  },
  {
    value: "_top",
    description:
      "The topmost browsing context. The link will open in the full body of the window. If no ancestors, behaves as _self.",
  },
  {
    value: "_unfencedTop",
    description:
      "Allows embedded fenced frames to navigate the top-level frame, i.e. traversing beyond the root of the fenced frame.",
  },
];

/**
 * Describes the common properties of a link component types.
 */
export type CommonLinkProps = {
  /**
   * The target URL of the link.
   */
  to: string;

  /**
   * Indicates if the link is enabled.
   */
  enabled?: boolean;

  /**
   * Indicates if the link is active.
   */
  active?: boolean;

  /** */
  target?: LinkTarget;
};

export type LinkAria = "aria-disabled" | "aria-label";

/**
 * Represents the theme color a particular component can have.
 */
export type ComponentThemeColor =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "light"
  | "dark";

// --- Available view sizes
export const viewportSizeMd: PropertyValueDescription[] = [
  {
    value: "xs",
    description: "Extra small devices (e.g., a small smartphone with low screen resolution)",
  },
  { value: "sm", description: "Small devices (e.g., a smartphone in landscape view)" },
  { value: "md", description: "Medium devices (e.g., a tablet)" },
  { value: "lg", description: "Large devices (e.g., a laptop)" },
  { value: "xl", description: 'Extra large devices (e.g., a standard 20" monitor)' },
  { value: "xxl", description: 'Extra extra large devices (e.g., a large 29" monitor)' },
];
export const viewportSizeNames = Object.keys(viewportSizeMd);

// --- Available button sizes
export const sizeNames = ["xs", "sm", "md", "lg"] as const;
export const sizeMd: PropertyValueDescription[] = [
  { value: "xs", description: "Extra small" },
  { value: "sm", description: "Small" },
  { value: "md", description: "Medium" },
  { value: "lg", description: "Large" },
];
const sizeValues = Object.keys(sizeMd);
export type ComponentSize = (typeof sizeValues)[number];

// --- Available button themes
export const buttonThemeValues = ["attention", "primary", "secondary"] as const;
export const buttonThemeNames = [...buttonThemeValues];
export type ButtonThemeColor = (typeof buttonThemeValues)[number];
export const buttonThemeMd: PropertyValueDescription[] = [
  { value: "attention", description: "Attention state theme color" },
  { value: "primary", description: "Primary theme color" },
  { value: "secondary", description: "Secondary theme color" },
];

// --- Available button types
export const buttonTypeValues = ["button", "submit", "reset"] as const;
export const buttonTypeNames = [...buttonTypeValues];
export type ButtonType = (typeof buttonTypeValues)[number];
export const buttonTypesMd: PropertyValueDescription[] = [
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

// --- Available button variants
export const buttonVariantValues = ["solid", "outlined", "ghost"] as const;
export const buttonVariantNames = [...buttonVariantValues];
export type ButtonVariant = (typeof buttonVariantValues)[number];
export const buttonVariantMd: PropertyValueDescription[] = [
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

// --- Available button aria attributes
const buttonAriaValues = ["aria-controls", "aria-expanded", "aria-disabled", "aria-label"] as const;
export const buttonAriaNames = [...buttonAriaValues];
export type ButtonAria = (typeof buttonAriaValues)[number];

// --- Available alignment options
export const alignmentOptionValues = ["start", "center", "end"] as const;
export const alignmentOptionNames = [...alignmentOptionValues];
export type AlignmentOptions = (typeof alignmentOptionValues)[number];
export const alignmentOptionMd: PropertyValueDescription[] = [
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

// --- Available orientation options
export const orientationOptionValues = ["horizontal", "vertical"] as const;
export type OrientationOptions = (typeof orientationOptionValues)[number];
export const orientationOptionMd: PropertyValueDescription[] = [
  { value: "horizontal", description: "The component will fill the available space horizontally" },
  { value: "vertical", description: "The component will fill the available space vertically" },
];

// --- Available icon positions
export const iconPositionValues = ["start", "end"] as const;
export const iconPositionNames = [...iconPositionValues];
export type IconPosition = (typeof iconPositionValues)[number];
export const iconPositionMd: PropertyValueDescription[] = [
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

// --- Available status colors
const statusColorValues = [
  "primary",
  "secondary",
  "success",
  "danger",
  "warning",
  "info",
  "light",
  "dark",
] as const;
export const statusColorNames = [...statusColorValues];
export type StatusColor = (typeof statusColorValues)[number];
export const statusColorMd: PropertyValueDescription[] = [
  { value: "primary", description: "Primary theme color, no default icon" },
  { value: "secondary", description: "Secondary theme color, no default icon" },
  { value: "success", description: 'Success theme color, "success" icon' },
  { value: "danger", description: 'Warning theme color, "warning" icon' },
  { value: "warning", description: 'Danger theme color, "danger" icon' },
  { value: "info", description: 'Info theme color, "info" icon' },
  { value: "light", description: "Light theme color, no default icon" },
  { value: "dark", description: "Dark theme color, no default icon" },
];

// --- Available placements
const placementValues = ["start", "end", "top", "bottom"] as const;
export const placementNames = [...placementValues];
export type Placement = (typeof placementValues)[number];
export const placementMd: PropertyValueDescription[] = [
  {
    value: "start",
    description:
      "The left side of the window (left-to-right) or the right side of the window (right-to-left)",
  },
  {
    value: "end",
    description:
      "The right side of the window (left-to-right) or the left side of the window (right-to-left)",
  },
  { value: "top", description: "The top of the window" },
  { value: "bottom", description: "The bottom of the window" },
];

// --- Available label positions
export const labelPositionValues = ["top", "start", "end", "bottom"] as const;
export const labelPositionNames = [...labelPositionValues];
export type LabelPosition = (typeof labelPositionValues)[number];
export const labelPositionMd: PropertyValueDescription[] = [
  {
    value: "start",
    description:
      "The left side of the input (left-to-right) or the right side of the input (right-to-left)",
  },
  {
    value: "end",
    description:
      "The right side of the input (left-to-right) or the left side of the input (right-to-left)",
  },
  { value: "top", description: "The top of the input" },
  { value: "bottom", description: "The bottom of the input" },
];

// --- Available trigger positions
const triggerPositionValues = ["start", "end"] as const;
export const triggerPositionNames = [...triggerPositionValues];
export type TriggerPosition = (typeof triggerPositionValues)[number];

// --- The state of a validated UI element
export const validationStatusValues = ["none", "error", "warning", "valid"] as const;
export const validationStatusNames = [...validationStatusValues];
export type ValidationStatus = (typeof validationStatusValues)[number];
export const validationStatusMd: PropertyValueDescription[] = [
  // { value: "none", description: "No indicator" },
  { value: "valid", description: "Visual indicator for an input that is accepted" },
  { value: "warning", description: "Visual indicator for an input that produced a warning" },
  { value: "error", description: "Visual indicator for an input that produced an error" },
];

// --- The validation result of a particular component
export type ValidationResult = {
  status: ValidationStatus;
  message?: string;
};

// --- scroll anchoring
export const scrollAnchoringValues = ["top", "bottom"] as const;
export const scrollAnchoringNames = [...scrollAnchoringValues];
export type ScrollAnchoring = (typeof scrollAnchoringValues)[number];

// --- ordering
export const orderingValues = ["asc", "desc"] as const;
type OrderingDirection = (typeof orderingValues)[number];
export type FieldOrderBy = { field: string; direction: OrderingDirection };

// --- text variants
const TextVariantKeys = [
  "abbr", // use <abbr>
  "cite", // use <cite>
  "code", // use <code>
  "deleted", // use <del>
  "inherit",
  "inserted", // use <ins>
  "keyboard", // use <kbd>,
  "marked", // use <mark>
  "sample", // use <samp>
  "sub", // use <sub>
  "sup", // use <sup>
  "var", // use <variable>
  "strong", // use <strong> element for content that is of greater importance (used in Markdown)
  "em", // use <em> element changes the meaning of a sentence - as spoken emphasis does (used in Markdown)
  "mono", // use monospace font with <![CDATA[
  "title", // Title text in the particular context
  "subtitle", // Subtitle text in the particular context
  "small", // Small text in the particular context
  "caption", // Caption text in the particular context
  "placeholder", // Placeholder text in the particular context
  "paragraph", // use <p>
  "subheading", // use a H6 with some specific defaults
  "tableheading", // use a H3 with some specific defaults
  "secondary", // use a secondary text style
] as const;
export type TextVariant = (typeof TextVariantKeys)[number];

// --- overflow mode for text components
const OverflowModeKeys = [
  "none", // Clips text cleanly without ellipsis when maxLines is reached
  "ellipsis", // Truncates with an ellipsis (text-overflow: ellipsis)
  "scroll", // Enables horizontal scrolling (overflow: auto), ignores maxLines
  "fade", // Uses a fading effect at the end of the text instead of an ellipsis
] as const;
export type OverflowMode = (typeof OverflowModeKeys)[number];

// --- break mode for text components
const BreakModeKeys = [
  "normal", // Uses standard word boundaries for breaking
  "word", // Breaks long words when necessary to prevent overflow
  "anywhere", // Breaks at any character if needed to fit content
  "keep", // Prevents breaking within words entirely
  "hyphenate", // Uses automatic hyphenation when breaking words
] as const;
export type BreakMode = (typeof BreakModeKeys)[number];

type TextPropertyValueDescription = PropertyValueDescription & {
  value: TextVariant;
  description: string;
};

const TextVariantMapping = [
  "abbr",
  "cite",
  "code",
  "del",
  "em",
  "ins",
  "kbd",
  "mark",
  "p",
  "pre",
  "samp",
  "strong",
  "sub",
  "sup",
  "var",
  "h6",
  "span",
] as const;
type TextVariantMappingType = typeof TextVariantMapping[number];

export const TextVariantElement: Record<TextVariant, TextVariantMappingType> = {
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
};

export const variantOptionsMd: TextPropertyValueDescription[] = [
  { value: "abbr", description: "Represents an abbreviation or acronym" },
  { value: "caption", description: "Represents the caption (or title) of a table" },
  { value: "cite", description: "Is used to mark up the title of a cited work" },
  { value: "code", description: "Represents a line of code" },
  { value: "deleted", description: "Represents text that has been deleted" },
  { value: "em", description: "Marks text to stress emphasis" },
  {
    value: "inherit",
    description: "Represents text that inherits the style from its parent element",
  },
  {
    value: "inserted",
    description: "Represents a range of text that has been added to a document",
  },
  {
    value: "keyboard",
    description:
      "Represents a span of text denoting textual user input from a keyboard or voice input",
  },
  {
    value: "marked",
    description: "Represents text which is marked or highlighted for reference or notation",
  },
  { value: "mono", description: "Text using a mono style font family" },
  { value: "paragraph", description: "Represents a paragraph" },
  {
    value: "placeholder",
    description: "Text that is mostly used as the placeholder style in input controls",
  },
  { value: "sample", description: "Represents sample (or quoted) output from a computer program" },
  { value: "secondary", description: "Represents a bit dimmed secondary text" },
  { value: "small", description: "Represents side-comments and small print" },
  { value: "sub", description: "Specifies inline text as subscript" },
  { value: "strong", description: "Contents have strong importance" },
  { value: "subheading", description: "Indicates that the text is the subtitle in a heading" },
  {
    value: "subtitle",
    description: "Indicates that the text is the subtitle of some other content",
  },
  { value: "sup", description: "Specifies inline text as superscript" },
  { value: "tableheading", description: "Indicates that the text is a table heading" },
  { value: "title", description: "Indicates that the text is the title of some other content" },
  { value: "var", description: "Represents the name of a variable in a mathematical expression" },
];

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

export const httpMethodNames = [
  "get",
  "post",
  "put",
  "delete",
  "patch",
  "head",
  "options",
  "trace",
  "connect",
];

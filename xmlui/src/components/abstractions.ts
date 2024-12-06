import type { PropertyValueDescription } from "@abstractions/ComponentDefs";
import type { CSSProperties, ReactNode } from "react";

/**
 * Several components offer a list of options to select from. This type describes such an option.
 */
export type Option = {
  label: string;
  value: string;
  enabled?: boolean;
  style?: CSSProperties;
  renderer?: (item: any) => ReactNode;
};

export type Accordion = {
  header: string;
  content: ReactNode;
};

export type Tab = {
  label: string;
  content: ReactNode;
};

export const LinkTargetNames = ["_self", "_blank", "_parent", "_top"] as const;
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
    description: "The topmost browsing context. The link will open in the full body of the window. If no ancestors, behaves as _self.",
  }
] as const;

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
] as const;
export const viewportSizeNames = Object.keys(viewportSizeMd);

// --- Available button sizes
export const sizeMd: PropertyValueDescription[] = [
  { value: "xs", description: "Extra small button" },
  { value: "sm", description: "Small button" },
  { value: "md", description: "Medium button" },
  { value: "lg", description: "Large button" },
] as const;
const sizeValues = Object.keys(sizeMd);
export const sizeNames = [...sizeValues];
export type ComponentSize = (typeof sizeValues)[number];

// --- Available button themes
const buttonThemeValues = ["attention", "primary", "secondary"] as const;
export const buttonThemeNames = [...buttonThemeValues];
export type ButtonThemeColor = (typeof buttonThemeValues)[number];
export const buttonThemeMd: PropertyValueDescription[] = [
  { value: "attention", description: "Attention state theme color" },
  { value: "primary", description: "Primary theme color" },
  { value: "secondary", description: "Secondary theme color" },
] as const;

// --- Available button types
const buttonTypeValues = ["button", "submit", "reset"] as const;
export const buttonTypeNames = [...buttonTypeValues];
export type ButtonType = (typeof buttonTypeValues)[number];
export const buttonTypesMd: PropertyValueDescription[] = [
  { value: "button", description: "Regular behavior that only executes logic if explicitly determined." },
  { value: "submit", description: "The button submits the form data to the server. This is the default for buttons in a Form or NativeForm component." },
  { value: "reset", description: "Resets all the controls to their initial values. Using it is ill advised for UX reasons." },
] as const;
export const defaultButtonType = "button";

// --- Available button variants
const buttonVariantValues = ["solid", "outlined", "ghost"] as const;
export const buttonVariantNames = [...buttonVariantValues];
export type ButtonVariant = (typeof buttonVariantValues)[number];
export const buttonVariantMd: PropertyValueDescription[] = [
  { value: "solid", description: "A button with a border and a filled background." },
  { value: "outlined", description: "The button is displayed with a border and a transparent background." },
  { value: "ghost", description: "A button with no border and fill. Only the label is visible; the background is colored when hovered or clicked." },
] as const;

// --- Available button aria attributes
const buttonAriaValues = ["aria-controls", "aria-expanded", "aria-disabled", "aria-label"] as const;
export const buttonAriaNames = [...buttonAriaValues];
export type ButtonAria = (typeof buttonAriaValues)[number];

// --- Available alignment options
const alignmentOptionValues = ["start", "center", "end"] as const;
export const alignmentOptionNames = [...alignmentOptionValues];
export type AlignmentOptions = (typeof alignmentOptionValues)[number];
export const alignmentOptionMd: PropertyValueDescription[] = [
  { value: "center", description: "Place the content in the middle" },
  { value: "start", description: "Justify the content to the left (to the right if in right-to-left)" },
  { value: "end", description: "Justify the content to the right (to the left if in right-to-left)" },
] as const;

// --- Available orientation options
const orientationOptionValues = ["horizontal", "vertical"] as const;
export const orientationOptionNames = [...orientationOptionValues];
export type OrientationOptions = (typeof orientationOptionValues)[number];
export const orientationOptionMd: PropertyValueDescription[] = [
  { value: "horizontal", description: "The component will fill the available space horizontally" },
  { value: "vertical", description: "The component will fill the available space vertically" },
] as const;

// --- Available icon positions
const iconPositionValues = ["left", "right", "start", "end"] as const;
export const iconPositionNames = [...iconPositionValues];
export type IconPosition = (typeof iconPositionValues)[number];
export const iconPositionMd: PropertyValueDescription[] = [
  { value: "left", description: "The icon will appear on the left side" },
  { value: "right", description: "The icon will appear on the right side" },
  { value: "start", description: "The icon will appear at the start (left side when the left-to-right direction is set)" },
  { value: "end", description: "The icon will appear at the end (right side when the left-to-right direction is set)" },
]

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
  { value: "success", description: "Success theme color, \"success\" icon" },
  { value: "danger", description: "Warning theme color, \"warning\" icon" },
  { value: "warning", description: "Danger theme color, \"danger\" icon" },
  { value: "info", description: "Info theme color, \"info\" icon" },
  { value: "light", description: "Light theme color, no default icon" },
  { value: "dark", description: "Dark theme color, no default icon" },
] as const;

// --- Available placements
const placementValues = ["start", "end", "top", "bottom"] as const;
export const placementNames = [...placementValues];
export type Placement = (typeof placementValues)[number];
export const placementMd: PropertyValueDescription[] = [
  { value: "start", description: "The left side of the window (left-to-right) or the right side of the window (right-to-left)" },
  { value: "end", description: "The right side of the window (left-to-right) or the left side of the window (right-to-left)" },
  { value: "top", description: "The top of the window" },
  { value: "bottom", description: "The bottom of the window" },
] as const;

// --- Available label positions
const labelPositionValues = ["top", "right", "left", "bottom"] as const;
export const labelPositionNames = [...labelPositionValues];
export type LabelPosition = (typeof labelPositionValues)[number];
// TODO: need to add RTL to replace left and right with start and end
export const labelPositionMd: PropertyValueDescription[] = [
  { value: "left", description: "The left side of the input (left-to-right) or the right side of the input (right-to-left)" },
  { value: "right", description: "The right side of the input (left-to-right) or the left side of the input (right-to-left)" },
  { value: "top", description: "The top of the input" },
  { value: "bottom", description: "The bottom of the input" },
] as const;

// --- Available trigger positions
const triggerPositionValues = ["start", "end"] as const;
export const triggerPositionNames = [...triggerPositionValues];
export type TriggerPosition = (typeof triggerPositionValues)[number];

// --- The state of a validated UI element
const validationStatusValues = ["none", "error", "warning", "valid"] as const;
export const validationStatusNames = [...validationStatusValues];
export type ValidationStatus = (typeof validationStatusValues)[number];
export const validationStatusMd: PropertyValueDescription[] = [
  // { value: "none", description: "No indicator" },
  { value: "valid", description: "Visual indicator for an input that is accepted" },
  { value: "warning", description: "Visual indicator for an input that produced a warning" },
  { value: "error", description: "Visual indicator for an input that produced an error" },
] as const;

// --- The validation result of a particular component
export type ValidationResult = {
  status: ValidationStatus;
  message?: string;
};

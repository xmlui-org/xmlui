import type { ReactNode } from "react";

/**
 * Several components offer a list of options to select from. This type describes such an option.
 */
export type Option = {
  /**
   * The item's display value shown to the user. The user can search for these labels.
   */
  label: string;

  /**
   * The `value` contains the actual stored value of the option and acts as a unique `key` for it.
   */
  value: string;

  /**
   * Indicates that the option is disabled. Users can't click on disabled options.
   */
  disabled?: boolean;

  /**
   * Optional renderer function to display the option. If not provided, the default renderer is used.
   * @param item Item to display
   */
  renderer?: (item: any) => ReactNode;
};

export type LinkTarget = "_self" | "_blank" | "_parent" | "_top";

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
export const viewportSizeNames = ["xs", "sm", "md", "lg", "xl", "xxl"];

// --- Available button sizes
const sizeValues = ["xs", "sm", "md", "lg"] as const;
export const sizeNames: string[] = [...sizeValues];
export type ComponentSize = (typeof sizeValues)[number];

// --- Available button themes
const buttonThemeValues = ["attention", "primary", "secondary"] as const;
export const buttonThemeNames: string[] = [...buttonThemeValues];
export type ButtonThemeColor = (typeof buttonThemeValues)[number];

// --- Available button types
const buttonTypeValues = ["button", "submit", "reset"] as const;
export const buttonTypeNames: string[] = [...buttonTypeValues];
export type ButtonType = (typeof buttonTypeValues)[number];

// --- Available button variants
const buttonVariantValues = ["solid", "outlined", "ghost"] as const;
export const buttonVariantNames: string[] = [...buttonVariantValues];
export type ButtonVariant = (typeof buttonVariantValues)[number];

// --- Available button aria attributes
const buttonAriaValues = ["aria-controls", "aria-expanded", "aria-disabled", "aria-label"] as const;
export const buttonAriaNames: string[] = [...buttonAriaValues];
export type ButtonAria = (typeof buttonAriaValues)[number];

// --- Available alignment options
const alignmentOptionValues = ["start", "center", "end"] as const;
export const alignmentOptionNames: string[] = [...alignmentOptionValues];
export type AlignmentOptions = (typeof alignmentOptionValues)[number];

// --- Available orientation options
const orientationOptionValues = ["horizontal", "vertical"] as const;
export const orientationOptionNames: string[] = [...orientationOptionValues];
export type OrientationOptions = (typeof orientationOptionValues)[number];

// --- Available icon positions
const iconPositionValues = ["left", "right", "start", "end"] as const;
export const iconPositionNames: string[] = [...iconPositionValues];
export type IconPosition = (typeof iconPositionValues)[number];

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
export const statusColorNames: string[] = [...statusColorValues];
export type StatusColor = (typeof statusColorValues)[number];

// --- Available placements
const placementValues = ["start", "end", "top", "bottom"] as const;
export const placementNames: string[] = [...placementValues];
export type Placement = (typeof placementValues)[number];

// --- Available trigger positions
const triggerPositionValues = ["start", "end"] as const;
export const triggerPositionNames: string[] = [...triggerPositionValues];
export type TriggerPosition = (typeof triggerPositionValues)[number];
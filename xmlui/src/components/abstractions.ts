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

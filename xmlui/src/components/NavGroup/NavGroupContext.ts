import { createContext } from "react";
import { defaultProps } from "./NavGroupNative";

export const NavGroupContext = createContext({
  level: -1,
  layoutIsVertical: false,
  iconHorizontalCollapsed: defaultProps.iconHorizontalCollapsed,
  iconHorizontalExpanded: defaultProps.iconHorizontalExpanded,
  iconVerticalCollapsed: defaultProps.iconVerticalCollapsed,
  iconVerticalExpanded: defaultProps.iconVerticalExpanded,
});
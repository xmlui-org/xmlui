import { createContext } from "react";
import { defaultProps } from "./NavGroupReact";

export const NavGroupContext = createContext({
  level: -1,
  layoutIsVertical: false,
  iconHorizontalCollapsed: defaultProps.iconHorizontalCollapsed,
  iconHorizontalExpanded: defaultProps.iconHorizontalExpanded,
  iconVerticalCollapsed: defaultProps.iconVerticalCollapsed,
  iconVerticalExpanded: defaultProps.iconVerticalExpanded,
});
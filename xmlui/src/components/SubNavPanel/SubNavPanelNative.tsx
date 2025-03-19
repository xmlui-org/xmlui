import { createPortal } from "react-dom";
import { useAppLayoutContext } from "../App/AppLayoutContext";

export function SubNavPanel(props) {
  const { subNavPanelSlot } = useAppLayoutContext();
  return subNavPanelSlot ? createPortal(props.children, subNavPanelSlot) : null;
}

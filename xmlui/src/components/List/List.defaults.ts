import { EMPTY_ARRAY } from "../../components-core/constants";
import type { ScrollAnchoring } from "../abstractions";

export const selectionCheckboxPositionValues = ["before", "overlay"] as const;
export type SelectionCheckboxPosition = (typeof selectionCheckboxPositionValues)[number];

export const selectionCheckboxAnchorValues = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "center-left",
  "center-right",
] as const;
export type SelectionCheckboxAnchor = (typeof selectionCheckboxAnchorValues)[number];

export const defaultProps = {
  idKey: "id",
  scrollAnchor: "top" as ScrollAnchoring,
  hideEmptyGroups: true,
  borderCollapse: true,
  groupsInitiallyExpanded: true,
  rowsSelectable: false,
  enableMultiRowSelection: true,
  initiallySelected: EMPTY_ARRAY as string[],
  hideSelectionCheckboxes: false,
  selectionCheckboxPosition: "before" as SelectionCheckboxPosition,
  selectionCheckboxAnchor: "left-center" as SelectionCheckboxAnchor,
  selectionCheckboxOffsetX: "$space-2",
  selectionCheckboxOffsetY: "$space-2",
  keyBindings: {
    selectAll: "CmdOrCtrl+A",
    cut: "CmdOrCtrl+X",
    copy: "CmdOrCtrl+C",
    paste: "CmdOrCtrl+V",
    delete: "Delete",
  },
};

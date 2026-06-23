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
  scrollAnchor: "top",
  hideEmptyGroups: true,
  borderCollapse: true,
  groupsInitiallyExpanded: true,
  rowsSelectable: false,
  enableMultiRowSelection: true,
  initiallySelected: [] as string[],
  hideSelectionCheckboxes: false,
  selectionCheckboxPosition: "before" as SelectionCheckboxPosition,
  selectionCheckboxAnchor: "top-left" as SelectionCheckboxAnchor,
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

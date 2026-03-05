import { wrapContainer, createMetadata, d, parseScssVar } from "xmlui";
import { SortableItemNative } from "./SortableItemNative";
import styles from "./SortableItem.module.scss";

const COMP = "SortableItem";

export const SortableItemMd = createMetadata({
  status: "experimental",
  description:
    "`SortableItem` is a draggable list item for use inside `SortableList`. " +
    "Wrap any XMLUI content inside it; the item becomes draggable to reorder the list. " +
    "Children can read `{$isDragging}` to adapt their appearance while being dragged.",
  props: {
    itemId: d(
      "Unique identifier for this item within the `SortableList`. " +
        "The `didReorder` event on `SortableList` yields an array of these values in their new order.",
      undefined,
      "string",
    ),
    dragHandle: d(
      "When `true`, a grip icon appears on the left edge and only that icon initiates dragging. " +
        "When `false` (default), the entire item surface is the drag target.",
      undefined,
      "boolean",
      false,
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`padding-${COMP}`]: "12px 16px",
    [`draggingShadow-${COMP}`]: "0 4px 16px rgba(0,0,0,0.18)",
    [`dragOpacity-${COMP}`]: "0.85",
    light: {
      [`backgroundColor-${COMP}`]: "$color-surface-50",
      [`borderColor-${COMP}`]: "$color-surface-200",
      [`handleColor-${COMP}`]: "$color-surface-400",
    },
    dark: {
      [`backgroundColor-${COMP}`]: "$color-surface-100",
      [`borderColor-${COMP}`]: "$color-surface-400",
      [`handleColor-${COMP}`]: "$color-surface-500",
    },
  },
});

export const sortableItemComponentRenderer = wrapContainer(
  COMP,
  SortableItemNative,
  SortableItemMd,
  {
    booleans: ["dragHandle"],
    strings: ["itemId"],
    contextVarNames: ["$isDragging"],
  },
);

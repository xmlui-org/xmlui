import { wrapContainer, createMetadata, parseScssVar } from "xmlui";
import { SortableListNative } from "./SortableListNative";
import styles from "./SortableList.module.scss";

const COMP = "SortableList";

export const SortableListMd = createMetadata({
  status: "experimental",
  description:
    "`SortableList` is a vertical list whose `SortableItem` children can be reordered by " +
    "dragging. Wrap `SortableItem` components inside it to enable drag-to-sort interactions. " +
    "Visual ordering is managed via CSS `order` so the DOM layout is never mutated.",
  props: {},
  events: {
    didReorder: {
      description:
        "Fires after an item is dropped in a new position. " +
        "Receives an array of `itemId` values reflecting the new order.",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`gap-${COMP}`]: "$space-3",
  },
});

export const sortableListComponentRenderer = wrapContainer(
  COMP,
  SortableListNative,
  SortableListMd,
  {
    events: { didReorder: "onDidReorder" },
  },
);

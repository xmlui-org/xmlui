import { createMetadata, dComponent } from "../../component-core/metadata/helpers";
import { defaultProps } from "./TileGrid.defaults";

const COMP = "TileGrid";

export const TileGridMd = createMetadata({
  status: "experimental",
  description:
    "`TileGrid` renders a data array as a responsive tile grid. The full XMLUI component also supports selection and virtualization.",
  props: {
    data: {
      description: "The array of items to render as tiles.",
      valueType: "any",
    },
    itemWidth: {
      description: "Fixed width of each tile.",
      valueType: "string",
      defaultValue: defaultProps.itemWidth,
    },
    itemHeight: {
      description: "Fixed height of each tile.",
      valueType: "string",
      defaultValue: defaultProps.itemHeight,
    },
    gap: {
      description: "Gap between tiles.",
      valueType: "string",
      defaultValue: defaultProps.gap,
    },
    stretchItems: {
      description: "When true, tiles in each row grow to fill the full container width.",
      valueType: "boolean",
      defaultValue: defaultProps.stretchItems,
    },
    loading: {
      description: "When true, the grid shows a placeholder loading state instead of tile content.",
      valueType: "boolean",
      defaultValue: defaultProps.loading,
    },
    itemsSelectable: {
      description: "Enables selection mode.",
      valueType: "boolean",
      defaultValue: defaultProps.itemsSelectable,
    },
    enableMultiSelection: {
      description: "When true, multiple tiles can be selected.",
      valueType: "boolean",
      defaultValue: defaultProps.enableMultiSelection,
    },
    toggleSelectionOnClick: {
      description: "When true, a plain click toggles the tile's selection state.",
      valueType: "boolean",
      defaultValue: defaultProps.toggleSelectionOnClick,
    },
    syncWithVar: {
      description: "The name of a global variable to synchronize the grid's selection state with.",
      valueType: "string",
    },
    refreshOn: {
      description: "An optional value that forces visible tiles to re-render when it changes.",
    },
    hideSelectionCheckboxes: {
      description: "If true, hides selection checkboxes.",
      valueType: "boolean",
      defaultValue: defaultProps.hideSelectionCheckboxes,
    },
    checkboxPosition: {
      description: "Controls the position of the per-tile selection checkbox.",
      valueType: "string",
      availableValues: ["topStart", "topEnd", "bottomStart", "bottomEnd"],
      defaultValue: defaultProps.checkboxPosition,
    },
    idKey: {
      description: "The property name used as the unique identifier for each item.",
      valueType: "string",
      defaultValue: defaultProps.idKey,
    },
    itemUserSelect: {
      description: "Controls whether users can select text within tiles.",
      valueType: "string",
      availableValues: ["auto", "text", "none", "contain", "all"],
      defaultValue: defaultProps.itemUserSelect,
    },
    itemTemplate: dComponent("The template used to render each tile."),
    testId: {
      description: "This optional property adds a test identifier to the TileGrid root element.",
      valueType: "string",
    },
  },
  events: {
    selectionDidChange: {
      description: "Fired when the selection changes.",
      signature: "selectionDidChange(selectedItems: any[], selectedIds: string[]): void",
      parameters: {},
    },
    itemDoubleClick: {
      description: "Fired when a tile is double-clicked.",
      signature: "itemDoubleClick(item: any, itemIndex: number): void",
      parameters: {},
    },
    contextMenu: {
      description: "Fired when a tile is right-clicked.",
      signature: "contextMenu(item: any, itemIndex: number, event: MouseEvent): void",
      parameters: {},
    },
  },
  contextVars: {
    $item: { description: "The current data item." },
    $itemIndex: { description: "The zero-based index of the current item." },
    $isFirst: { description: "`true` when this is the first item." },
    $isLast: { description: "`true` when this is the last item." },
    $selected: { description: "`true` when this tile is currently selected." },
  },
  childrenAsTemplate: "itemTemplate",
  themeVars: {
    [`backgroundColor-item-${COMP}`]: "Tile background color.",
    [`backgroundColor-item-${COMP}--hover`]: "Tile background color on hover.",
    [`backgroundColor-item-${COMP}--selected`]: "Tile background color when selected.",
    [`backgroundColor-item-${COMP}--selected--hover`]: "Tile background color when selected and hovered.",
    [`borderRadius-item-${COMP}`]: "Tile border radius.",
    [`userSelect-item-${COMP}`]: "Tile text selection behavior.",
    [`outlineColor-item-${COMP}--focus`]: "Focused tile outline color.",
    [`outlineWidth-item-${COMP}--focus`]: "Focused tile outline width.",
    [`outlineStyle-item-${COMP}--focus`]: "Focused tile outline style.",
    [`outlineOffset-item-${COMP}--focus`]: "Focused tile outline offset.",
  },
  defaultThemeVars: {
    [`backgroundColor-item-${COMP}`]: "transparent",
    [`backgroundColor-item-${COMP}--hover`]: "$color-surface-100",
    [`backgroundColor-item-${COMP}--selected`]: "$color-surface-100",
    [`backgroundColor-item-${COMP}--selected--hover`]: "$color-primary-100",
    [`borderRadius-item-${COMP}`]: "$borderRadius",
    [`userSelect-item-${COMP}`]: "none",
    [`outlineColor-item-${COMP}--focus`]: "$color-primary-500",
    [`outlineWidth-item-${COMP}--focus`]: "2px",
    [`outlineStyle-item-${COMP}--focus`]: "solid",
    [`outlineOffset-item-${COMP}--focus`]: "-2px",
  },
});


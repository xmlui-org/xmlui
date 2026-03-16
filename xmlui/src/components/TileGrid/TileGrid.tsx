import styles from "./TileGrid.module.scss";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { MemoizedItem } from "../container-helpers";
import { createMetadata, d, dComponent } from "../metadata-helpers";
import { TileGridNative, defaultProps } from "./TileGridNative";
import { StandaloneSelectionStore } from "../SelectionStore/SelectionStoreNative";

const COMP = "TileGrid";

export const TileGridMd = createMetadata({
  status: "experimental",
  description:
    "`TileGrid` renders a data array as a responsive, virtualized tile grid. " +
    "It auto-calculates the number of columns based on the container width, tile width, and gap, " +
    "and only renders visible rows — making it suitable for large datasets.",

  props: {
    data: d(
      `The array of items to render as tiles. Each item is exposed as [\`$item\`](#item) ` +
        `inside the tile template.`,
    ),
    itemWidth: {
      description: "Fixed width of each tile, e.g. `\"120px\"`.",
      valueType: "string",
      defaultValue: defaultProps.itemWidth,
    },
    itemHeight: {
      description: "Fixed height of each tile, e.g. `\"140px\"`.",
      valueType: "string",
      defaultValue: defaultProps.itemHeight,
    },
    gap: {
      description: "Gap between tiles, e.g. `\"8px\"`.",
      valueType: "string",
      defaultValue: defaultProps.gap,
    },
    loading: {
      description:
        "When `true`, the grid shows a placeholder loading state instead of tile content.",
      valueType: "boolean",
      defaultValue: defaultProps.loading,
    },
    itemsSelectable: {
      description:
        "Enables selection mode. When `true`, tiles can be selected by clicking on them.",
      valueType: "boolean",
      defaultValue: defaultProps.itemsSelectable,
    },
    enableMultiSelection: {
      description:
        "When `true` (default), multiple tiles can be selected using Ctrl/Cmd+Click or " +
        "Shift+Click. When `false`, only a single tile can be selected at a time.",
      valueType: "boolean",
      defaultValue: defaultProps.enableMultiSelection,
    },
    syncWithAppState: d(
      `An AppState instance to synchronize the grid's selection state with. The grid will ` +
        `read from and write to the \`selectedIds\` property of the AppState object.`,
    ),
    checkboxPosition: {
      description:
        "Controls the position of the per-tile selection checkbox relative to the tile, " +
        "respecting the current writing direction.",
      valueType: "string",
      availableValues: [
        { value: "topStart", description: "Top of the tile, writing-direction start edge." },
        { value: "topEnd", description: "Top of the tile, writing-direction end edge." },
        { value: "bottomStart", description: "Bottom of the tile, writing-direction start edge." },
        { value: "bottomEnd", description: "Bottom of the tile, writing-direction end edge." },
      ],
      defaultValue: defaultProps.checkboxPosition,
    },
    idKey: {
      description:
        "The property name used as the unique identifier for each item. " +
        "Used to track selection state.",
      valueType: "string",
      defaultValue: defaultProps.idKey,
    },
    itemTemplate: dComponent(
      `The template used to render each tile. Use the [\`$item\`](#item) context variable to ` +
        `access the current data item, [\`$itemIndex\`](#itemIndex) for the zero-based index, ` +
        `and [\`$selected\`](#selected) to respond to the tile's selection state.`,
    ),
  },

  events: {
    selectionDidChange: d(
      "Fired when the selection changes. Receives the array of currently selected items.",
    ),
    itemDoubleClick: d("Fired when a tile is double-clicked. Receives the data item."),
    cutAction: d(
      "Fired when the user presses Ctrl/Cmd+X. " +
        "Receives `(focusedItem, selectedItems, selectedIds)`.",
    ),
    copyAction: d(
      "Fired when the user presses Ctrl/Cmd+C. " +
        "Receives `(focusedItem, selectedItems, selectedIds)`.",
    ),
    pasteAction: d(
      "Fired when the user presses Ctrl/Cmd+V. " +
        "Receives `(focusedItem, selectedItems, selectedIds)`.",
    ),
    deleteAction: d(
      "Fired when the user presses the Delete or Backspace key. " +
        "Receives `(focusedItem, selectedItems, selectedIds)`.",
    ),
    selectAllAction: d(
      "Fired when the user presses Ctrl/Cmd+A. Receives `(selectedItems, selectedIds)`.",
    ),
  },

  contextVars: {
    $item: d("The current data item."),
    $itemIndex: d("The zero-based index of the current item in the full `data` array."),
    $isFirst: d("`true` when this is the first item in the `data` array."),
    $isLast: d("`true` when this is the last item in the `data` array."),
    $selected: d("`true` when this tile is currently selected."),
  },

  childrenAsTemplate: "itemTemplate",

  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}-item`]: "transparent",
    [`backgroundColor-${COMP}-item--hover`]: "$color-surface-200",
    [`backgroundColor-${COMP}-item--selected`]: "$color-primary-100",
    [`backgroundColor-${COMP}-item--selected-hover`]: "$color-primary-200",
    [`borderRadius-${COMP}-item`]: "$borderRadius",
  },
});

export const tileGridComponentRenderer = createComponentRenderer(
  COMP,
  TileGridMd,
  ({
    node,
    extractValue,
    renderChild,
    classes,
    layoutContext,
    lookupEventHandler,
    registerComponentApi,
  }) => {
    const itemTemplate = node.props.itemTemplate;
    const idKey = extractValue.asOptionalString(node.props.idKey) ?? defaultProps.idKey;

    const content = (
      <TileGridNative
        registerComponentApi={registerComponentApi}
        classes={classes}
        data={extractValue(node.props.data)}
        itemWidth={extractValue.asOptionalString(node.props.itemWidth)}
        itemHeight={extractValue.asOptionalString(node.props.itemHeight)}
        gap={extractValue.asOptionalString(node.props.gap)}
        loading={extractValue.asOptionalBoolean(node.props.loading)}
        itemsSelectable={extractValue.asOptionalBoolean(node.props.itemsSelectable)}
        enableMultiSelection={extractValue.asOptionalBoolean(node.props.enableMultiSelection)}
        syncWithAppState={extractValue(node.props.syncWithAppState)}
        checkboxPosition={extractValue.asOptionalString(node.props.checkboxPosition) as any}
        idKey={idKey}
        onSelectionDidChange={lookupEventHandler("selectionDidChange")}
        onItemDoubleClick={lookupEventHandler("itemDoubleClick")}
        onCutAction={lookupEventHandler("cutAction")}
        onCopyAction={lookupEventHandler("copyAction")}
        onPasteAction={lookupEventHandler("pasteAction")}
        onDeleteAction={lookupEventHandler("deleteAction")}
        onSelectAllAction={lookupEventHandler("selectAllAction")}
        itemRenderer={
          itemTemplate
            ? (item, index, count, selected) => (
                <MemoizedItem
                  node={itemTemplate as any}
                  key={`${item?.id ?? index}`}
                  renderChild={renderChild}
                  layoutContext={layoutContext}
                  contextVars={{
                    $item: item,
                    $itemIndex: index,
                    $isFirst: index === 0,
                    $isLast: index === count - 1,
                    $selected: selected,
                  }}
                />
              )
            : undefined
        }
      />
    );

    return <StandaloneSelectionStore idKey={idKey}>{content}</StandaloneSelectionStore>;
  },
);

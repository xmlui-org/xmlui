import { useRef } from "react";
import styles from "./TileGrid.module.scss";
import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { MemoizedItem } from "../container-helpers";
import { createMetadata, d, dComponent } from "../metadata-helpers";
import type { PropertyValueDescription } from "../../abstractions/ComponentDefs";
import { TileGridNative, defaultProps } from "./TileGridNative";
import { StandaloneSelectionStore } from "../SelectionStore/SelectionStoreNative";

const COMP = "TileGrid";

const userSelectValues: PropertyValueDescription[] = [
  { value: "auto", description: "Default text selection behavior" },
  { value: "text", description: "Text can be selected by the user" },
  { value: "none", description: "Text cannot be selected" },
  { value: "contain", description: "Selection is contained within this element" },
  { value: "all", description: "The entire element content is selected as one unit" },
];

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
      description: "Gap between tiles, e.g. `\"8px\"` or a theme variable like `\"$gap-normal\"`.",
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
    syncWithVar: d(
      `The name of a global variable to synchronize the grid's selection state with. ` +
        `The named variable must reference an object; the grid will read from and write to its ` +
        `\`selectedIds\` property. A runtime error is signalled if the value is not a valid JavaScript variable name.`,
    ),
    hideSelectionCheckboxes: {
      description:
        "If `true`, hides selection checkboxes. Selection logic still works via click, API, and keyboard.",
      valueType: "boolean",
      defaultValue: defaultProps.hideSelectionCheckboxes,
    },
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
    itemUserSelect: {
      description: `This property controls whether users can select text within tiles.`,
      valueType: "string",
      availableValues: userSelectValues,
      defaultValue: defaultProps.itemUserSelect,
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
    [`backgroundColor-item-${COMP}`]: "transparent",
    [`backgroundColor-item-${COMP}--hover`]: "$color-surface-100",
    [`backgroundColor-item-${COMP}--selected`]: "$color-surface-100",
    [`backgroundColor-item-${COMP}--selected--hover`]: "$color-primary-100",
    [`borderRadius-item-${COMP}`]: "$borderRadius",
    [`offsetVertical-checkbox-${COMP}`]: "4px",
    [`offsetHorizontal-checkbox-${COMP}`]: "4px",
    [`userSelect-item-${COMP}`]: "none",
    [`outlineColor-item-${COMP}--focus`]: "$color-primary-500",
    [`outlineWidth-item-${COMP}--focus`]: "2px",
    [`outlineStyle-item-${COMP}--focus`]: "solid",
    [`outlineOffset-item-${COMP}--focus`]: "-2px",
  },
});

const VALID_IDENTIFIER_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

export const tileGridComponentRenderer = wrapComponent(
  COMP,
  TileGridNative,
  TileGridMd,
  {
    exposeRegisterApi: true,
    exclude: [
      "data", "itemWidth", "itemHeight", "gap", "loading", "itemsSelectable",
      "enableMultiSelection", "syncWithVar", "checkboxPosition", "hideSelectionCheckboxes",
      "idKey", "itemUserSelect", "itemTemplate",
    ],
    events: [],
    customRender(_props, {
      node,
      extractValue,
      renderChild,
      classes,
      layoutContext,
      lookupEventHandler,
      lookupAction,
      registerComponentApi,
    }) {
      const itemTemplate = node.props.itemTemplate;
      const idKey = extractValue.asOptionalString(node.props.idKey) ?? defaultProps.idKey;
      const syncVarName = extractValue.asOptionalString(node.props.syncWithVar);

      // Keep lookupAction current without breaking the stable adapter reference (same pattern as Table).
      const lookupActionRef = useRef(lookupAction);
      lookupActionRef.current = lookupAction;
      const syncAdapterHolderRef = useRef<{ value: any; update: any } | null>(null);

      let syncAdapter: any;
      if (syncVarName !== undefined) {
        if (!VALID_IDENTIFIER_RE.test(syncVarName)) {
          console.error(`[TileGrid syncWithVar] Invalid variable name: "${syncVarName}"`);
          syncAdapterHolderRef.current = null;
        } else {
          const currentValue = extractValue(`{${syncVarName}}`);
          if (currentValue != null) {
            if (!syncAdapterHolderRef.current) {
              syncAdapterHolderRef.current = {
                value: currentValue,
                update: ({ selectedIds }: { selectedIds: string[] }) => {
                  const valueJson = JSON.stringify(selectedIds);
                  const expr = `{${syncVarName} = {selectedIds: ${valueJson}}}`;
                  const handler = lookupActionRef.current?.(expr, { ephemeral: true });
                  handler?.();
                },
              };
            } else {
              syncAdapterHolderRef.current.value = currentValue;
            }
          } else {
            syncAdapterHolderRef.current = null;
          }
        }
      } else {
        syncAdapterHolderRef.current = null;
      }
      syncAdapter = syncAdapterHolderRef.current;

      const content = (
        <TileGridNative
          registerComponentApi={registerComponentApi}
          classes={classes}
          data={extractValue(node.props.data)}
          itemWidth={extractValue.asOptionalString(node.props.itemWidth)}
          itemHeight={extractValue.asOptionalString(node.props.itemHeight)}
          gap={extractValue.asSize(node.props.gap) ?? defaultProps.gap}
          loading={extractValue.asOptionalBoolean(node.props.loading)}
          itemsSelectable={extractValue.asOptionalBoolean(node.props.itemsSelectable)}
          enableMultiSelection={extractValue.asOptionalBoolean(node.props.enableMultiSelection)}
          syncWithAppState={syncAdapter}
          checkboxPosition={extractValue.asOptionalString(node.props.checkboxPosition) as any}
          hideSelectionCheckboxes={extractValue.asOptionalBoolean(node.props.hideSelectionCheckboxes)}
          idKey={idKey}
          itemUserSelect={extractValue.asOptionalString(node.props.itemUserSelect)}
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
  },
);

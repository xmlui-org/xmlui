import { memo, useRef } from "react";

import styles from "./List.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { MemoizedItem } from "../container-helpers";
import { createMetadata, d, dComponent, dContextMenu, dInternal } from "../metadata-helpers";
import { scrollAnchoringValues } from "../abstractions";
import {
  StandaloneSelectionStore,
  useSelectionContext,
} from "../SelectionStore/SelectionStoreNative";
import { ListNative, MemoizedSection, defaultProps, selectionCheckboxPositionValues, selectionCheckboxAnchorValues } from "./ListNative";
import type { RendererContext, LayoutContext } from "../../abstractions/RendererDefs";

const COMP = "List";

export const ListMd = createMetadata({
  status: "stable",
  description:
    "`List` is a high-performance, virtualized container for rendering large " +
    "datasets with built-in grouping, sorting, and visual formatting. It only " +
    "renders visible items in the viewport, making it ideal for displaying " +
    "thousands of records while maintaining smooth scrolling performance.",
  props: {
    data: d(
      `The component receives data via this property. The \`data\` property is a list of items ` +
        `that the \`List\` can display.`,
    ),
    items: dInternal(
      `You can use \`items\` as an alias for the \`data\` property. ` +
        `When you bind the list to a data source (e.g. an API endpoint), ` +
        `the \`data\` acts as the property that accepts a URL to fetch information from an API.` +
        `When both \`items\` and \`data\` are used, \`items\` has priority.`,
    ),
    loading: d(
      `This property delays the rendering of children until it is set to \`false\`, or the ` +
        `component receives usable list items via the [\`data\`](#data) property.`,
    ),
    limit: d(
      `This property limits the number of items displayed in the \`${COMP}\`. If not set, all items are displayed.`,
    ),
    scrollAnchor: {
      description: `This property pins the scroll position to a specified location of the list. Available values are shown below.`,
      availableValues: scrollAnchoringValues,
      type: "string",
      defaultValue: defaultProps.scrollAnchor,
    },
    fixedItemSize: {
      description:
        `When set to \`true\`, the list will measure the height of the first item and use that ` +
        `as a fixed size hint for all items. This improves scroll performance when all items have ` +
        `the same height. If items have varying heights, leave this as \`false\`.`,
      type: "boolean",
      defaultValue: false,
    },
    groupBy: d(
      "This property sets which data item property is used to group the list items. If not set, " +
        "no grouping is done.",
    ),
    orderBy: d(
      `This optioanl property enables the ordering of list items by specifying an attribute in the data.`,
    ),
    availableGroups: d(
      `This property is an array of group names that the \`${COMP}\` will display. ` +
        "If not set, all groups in the data are displayed.",
    ),
    groupHeaderTemplate: dComponent(
      `Enables the customization of how the groups are displayed, similarly to the ` +
        `[\`itemTemplate\`](#itemtemplate). You can use the \`$item\` context variable to access ` +
        `an item group and map its individual attributes.`,
    ),
    groupFooterTemplate: dComponent(
      `Enables the customization of how the the footer of each group is displayed. ` +
        `Combine with [\`groupHeaderTemplate\`](#groupHeaderTemplate) to customize sections. You can use ` +
        `the \`$item\` context variable to access an item group and map its individual attributes.`,
    ),
    itemTemplate: dComponent(
      `This property allows the customization of mapping data items to components. You can use ` +
        `the \`$item\` context variable to access an item and map its individual attributes.`,
    ),
    emptyListTemplate: dComponent(
      `This property defines the template to display when the list is empty.`,
    ),
    pageInfo: d(
      `This property contains the current page information. Setting this property also enures the ` +
        `\`${COMP}\` uses pagination.`,
    ),
    idKey: {
      description: "Denotes which attribute of an item acts as the ID or key of the item",
      type: "string",
      defaultValue: defaultProps.idKey,
    },
    groupsInitiallyExpanded: d(
      `This Boolean property defines whether the list groups are initially expanded.`,
      undefined,
      "boolean",
      defaultProps.groupsInitiallyExpanded,
    ),
    defaultGroups: d(
      `This property adds an optional list of default groups for the \`${COMP}\` and displays the group ` +
        `headers in the specified order. If the data contains group headers not in this list, ` +
        `those headers are also displayed (after the ones in this list); however, their order ` +
        `is not deterministic.`,
    ),
    hideEmptyGroups: {
      description:
        "This boolean property indicates if empty groups should be hidden (no header and footer are displayed).",
      valueType: "boolean",
      defaultValue: defaultProps.hideEmptyGroups,
    },
    borderCollapse: {
      description: "Collapse items borders",
      valueType: "boolean",
      defaultValue: defaultProps.borderCollapse,
    },
    rowsSelectable: d(`Indicates whether the rows are selectable (\`true\`) or not (\`false\`).`),
    enableMultiRowSelection: {
      description:
        `This boolean property indicates whether you can select multiple rows in the list. ` +
        `This property only has an effect when the rowsSelectable property is set. Setting it ` +
        `to \`false\` limits selection to a single row.`,
      valueType: "boolean",
      defaultValue: defaultProps.enableMultiRowSelection,
    },
    initiallySelected: d(
      `An array of IDs that should be initially selected when the list is rendered. ` +
        `This property only has an effect when the rowsSelectable property is set to \`true\`.`,
    ),
    syncWithVar: d(
      `The name of a global variable to synchronize the list's selection state with. ` +
        `The named variable must reference an object; the list will read from and write to its ` +
        `'selectedIds' property. When provided, this takes precedence over ` +
        `\`initiallySelected\`.`,
    ),
    rowUnselectablePredicate: {
      description:
        `This property defines a predicate function with a return value that determines if the ` +
        `row should be unselectable. The function retrieves the item to display and should return ` +
        `a Boolean-like value. This property only has an effect when the \`rowsSelectable\` property is set to \`true\`.`,
    },
    hideSelectionCheckboxes: {
      description:
        "If true, hides selection checkboxes. Selection logic still works via API and keyboard.",
      valueType: "boolean",
      defaultValue: defaultProps.hideSelectionCheckboxes,
    },
    selectionCheckboxPosition: {
      description:
        `Controls the placement mode of selection checkboxes. \`"before"\` (default) renders ` +
        `the checkbox inline before the item content. \`"overlay"\` renders the checkbox ` +
        `absolutely positioned inside the item's bounding box, overlapping the content. ` +
        `Use \`selectionCheckboxAnchor\`, \`selectionCheckboxOffsetX\`, and ` +
        `\`selectionCheckboxOffsetY\` to control the overlay position.`,
      valueType: "string",
      availableValues: selectionCheckboxPositionValues,
      defaultValue: defaultProps.selectionCheckboxPosition,
    },
    selectionCheckboxAnchor: {
      description:
        `The corner of the item that the overlay checkbox is anchored to. Only applies when ` +
        `\`selectionCheckboxPosition\` is \`"overlay"\`. Offsets are measured inward from the chosen corner.`,
      valueType: "string",
      availableValues: selectionCheckboxAnchorValues,
      defaultValue: defaultProps.selectionCheckboxAnchor,
    },
    selectionCheckboxOffsetX: {
      description:
        `Horizontal distance of the overlay checkbox from its anchor corner. Accepts any CSS length ` +
        `value (e.g. \`"8px"\`, \`"1rem"\`). Only applies when \`selectionCheckboxPosition\` is \`"overlay"\`.`,
      valueType: "string",
      defaultValue: defaultProps.selectionCheckboxOffsetX,
    },
    selectionCheckboxOffsetY: {
      description:
        `Vertical distance of the overlay checkbox from its anchor corner. Accepts any CSS length ` +
        `value (e.g. \`"8px"\`, \`"1rem"\`). Only applies when \`selectionCheckboxPosition\` is \`"overlay"\`.`,
      valueType: "string",
      defaultValue: defaultProps.selectionCheckboxOffsetY,
    },
    selectionCheckboxSize: {
      description:
        `CSS size of the checkbox (e.g. \`"16px"\`, \`"20px"\`). When not set the browser default ` +
        `size is used. Applies in both \`"before"\` and \`"overlay"\` modes.`,
      valueType: "string",
    },
    keyBindings: {
      description:
        "This property defines keyboard shortcuts for list actions. Provide an object with " +
        "action names as keys and keyboard shortcut strings as values. Available actions: " +
        "\`selectAll\`, \`cut\`, \`copy\`, \`paste\`, \`delete\`. If not provided, default shortcuts are used.",
      valueType: "any",
    },
  },
  childrenAsTemplate: "itemTemplate",
  events: {
    contextMenu: dContextMenu(COMP),
    rowDoubleClick: {
      description: `This event is fired when the user double-clicks a list row. The handler receives the clicked row item as its only argument.`,
      signature: "rowDoubleClick(item: any): void",
      parameters: {
        item: "The clicked list row item.",
      },
    },
    selectionDidChange: {
      description:
        `This event is triggered when the list's current selection changes. ` +
        `Its parameter is an array of the selected list row items.`,
      signature: "selectionDidChange(selectedItems: any[]): void",
      parameters: {
        selectedItems: "An array of the selected list row items.",
      },
    },
    selectAllAction: {
      description:
        `This event is triggered when the user presses the select all keyboard shortcut ` +
        `(default: Ctrl+A/Cmd+A) and \`rowsSelectable\` is set to \`true\`. The component ` +
        `automatically selects all rows before invoking this handler.`,
      signature:
        "selectAll(row: ListRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>",
      parameters: {
        row: "The currently focused row context, or null if no row is focused.",
        selectedItems: "Array of all selected row items.",
        selectedIds: "Array of all selected row IDs (as strings).",
      },
    },
    cutAction: {
      description:
        `This event is triggered when the user presses the cut keyboard shortcut ` +
        `(default: Ctrl+X/Cmd+X) and \`rowsSelectable\` is set to \`true\`.`,
      signature:
        "cut(row: ListRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>",
      parameters: {
        row: "The currently focused row context, or null if no row is focused.",
        selectedItems: "Array of selected row items.",
        selectedIds: "Array of selected row IDs (as strings).",
      },
    },
    copyAction: {
      description:
        `This event is triggered when the user presses the copy keyboard shortcut ` +
        `(default: Ctrl+C/Cmd+C) and \`rowsSelectable\` is set to \`true\`.`,
      signature:
        "copy(row: ListRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>",
      parameters: {
        row: "The currently focused row context, or null if no row is focused.",
        selectedItems: "Array of selected row items.",
        selectedIds: "Array of selected row IDs (as strings).",
      },
    },
    pasteAction: {
      description:
        `This event is triggered when the user presses the paste keyboard shortcut ` +
        `(default: Ctrl+V/Cmd+V) and \`rowsSelectable\` is set to \`true\`.`,
      signature:
        "paste(row: ListRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>",
      parameters: {
        row: "The currently focused row context, or null if no row is focused.",
        selectedItems: "Array of selected row items.",
        selectedIds: "Array of selected row IDs (as strings).",
      },
    },
    deleteAction: {
      description:
        `This event is triggered when the user presses the delete keyboard shortcut ` +
        `(default: Delete key) and \`rowsSelectable\` is set to \`true\`.`,
      signature:
        "delete(row: ListRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>",
      parameters: {
        row: "The currently focused row context, or null if no row is focused.",
        selectedItems: "Array of selected row items.",
        selectedIds: "Array of selected row IDs (as strings).",
      },
    },
  },
  apis: {
    scrollToTop: {
      description: "This method scrolls the list to the top.",
      signature: "scrollToTop(): void",
    },
    scrollToBottom: {
      description: "This method scrolls the list to the bottom.",
      signature: "scrollToBottom(): void",
    },
    scrollToIndex: {
      description: "This method scrolls the list to a specific index. The method accepts an index as a parameter.",
      signature: "scrollToIndex(index: number): void",
      parameters: {
        index: "The index to scroll to.",
      },
    },
    scrollToId: {
      description: "This method scrolls the list to a specific item. The method accepts an item ID as a parameter.",
      signature: "scrollToId(id: string): void",
      parameters: {
        id: "The ID of the item to scroll to.",
      },
    },
    clearSelection: {
      description: `This method clears the list of currently selected list rows.`,
      signature: "clearSelection(): void",
    },
    getSelectedItems: {
      description: `This method returns the list of currently selected list row items.`,
      signature: "getSelectedItems(): Array<any>",
    },
    getSelectedIds: {
      description: `This method returns the list of currently selected list row IDs.`,
      signature: "getSelectedIds(): Array<string>",
    },
    selectAll: {
      description:
        `This method selects all the rows in the list. This method has no effect if the ` +
        `rowsSelectable property is set to \`false\`.`,
      signature: "selectAll(): void",
    },
    selectId: {
      description:
        `This method selects the row with the specified ID. This method has no effect if the ` +
        `\`rowsSelectable\` property is set to \`false\`. The method argument can be a ` +
        `single id or an array of them.`,
      signature: "selectId(id: string | Array<string>): void",
      parameters: {
        id: `The ID of the row to select, or an array of IDs to select multiple rows.`,
      },
    },
  },
  contextVars: {
    $item: d("Current data item being rendered"),
    $itemIndex: dComponent("Zero-based index of current item"),
    $isFirst: dComponent("Boolean indicating if this is the first item"),
    $isLast: dComponent("Boolean indicating if this is the last item"),
    $isSelected: dComponent("Boolean indicating if this item is currently selected"),
    $group: dComponent("Group information when using `groupBy` (available in group templates)"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$backgroundColor",
    [`backgroundColor-selected-${COMP}`]: "$color-primary-100",
    [`backgroundColor-selected-${COMP}--hover`]: "$color-primary-100",
    [`backgroundColor-row-${COMP}--hover`]: "$color-primary-50",
  },
});

const VALID_IDENTIFIER_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

const ListWithSelection = memo(function ListWithSelection({
  extractValue,
  node,
  renderChild,
  lookupEventHandler,
  lookupAction,
  lookupSyncCallback,
  classes,
  registerComponentApi,
  layoutContext,
}: Pick<
  RendererContext,
  | "extractValue"
  | "node"
  | "renderChild"
  | "lookupEventHandler"
  | "lookupAction"
  | "lookupSyncCallback"
  | "classes"
  | "registerComponentApi"
> & { layoutContext?: LayoutContext }) {
  const idKey = extractValue.asOptionalString(node.props.idKey, defaultProps.idKey);
  const itemTemplate = node.props.itemTemplate;
  const hideEmptyGroups = extractValue.asOptionalBoolean(node.props.hideEmptyGroups, true);

  const selectionContext = useSelectionContext();

  // Build a syncWithVar-compatible adapter for global-variable sync.
  const syncVarName = extractValue.asOptionalString(node.props.syncWithVar);
  const lookupActionRef = useRef(lookupAction);
  lookupActionRef.current = lookupAction;
  const syncAdapterHolderRef = useRef<{ value: any; update: any } | null>(null);

  let syncAdapter: any;
  if (syncVarName !== undefined) {
    if (!VALID_IDENTIFIER_RE.test(syncVarName)) {
      console.error(`[List syncWithVar] Invalid variable name: "${syncVarName}"`);
      syncAdapterHolderRef.current = null;
    } else {
      const currentSyncVarValue = extractValue(`{${syncVarName}}`);
      if (currentSyncVarValue != null) {
        if (!syncAdapterHolderRef.current) {
          syncAdapterHolderRef.current = {
            value: currentSyncVarValue,
            update: ({ selectedIds }: { selectedIds: string[] }) => {
              const valueJson = JSON.stringify(selectedIds);
              const expr = `{${syncVarName} = {selectedIds: ${valueJson}}}`;
              const handler = lookupActionRef.current?.(expr, { ephemeral: true });
              handler?.();
            },
          };
        } else {
          syncAdapterHolderRef.current.value = currentSyncVarValue;
        }
      } else {
        syncAdapterHolderRef.current = null;
      }
    }
  } else {
    syncAdapterHolderRef.current = null;
  }
  syncAdapter = syncAdapterHolderRef.current;

  const listContent = (
    <ListNative
      registerComponentApi={registerComponentApi}
      classes={classes}
      loading={extractValue.asOptionalBoolean(node.props.loading)}
      items={extractValue(node.props.items) || extractValue(node.props.data)}
      limit={extractValue(node.props.limit)}
      groupBy={extractValue(node.props.groupBy)}
      orderBy={extractValue(node.props.orderBy)}
      availableGroups={extractValue(node.props.availableGroups)}
      scrollAnchor={node.props.scrollAnchor as any}
      pageInfo={extractValue(node.props.pageInfo)}
      idKey={extractValue(node.props.idKey)}
      onContextMenu={lookupEventHandler("contextMenu")}
      requestFetchPrevPage={lookupEventHandler("requestFetchPrevPage")}
      requestFetchNextPage={lookupEventHandler("requestFetchNextPage")}
      emptyListPlaceholder={renderChild(node.props.emptyListTemplate)}
      groupsInitiallyExpanded={extractValue.asOptionalBoolean(node.props.groupsInitiallyExpanded)}
      defaultGroups={extractValue(node.props.defaultGroups)}
      borderCollapse={extractValue.asOptionalBoolean(node.props.borderCollapse, true)}
      fixedItemSize={extractValue.asOptionalBoolean(node.props.fixedItemSize)}
      rowsSelectable={extractValue.asOptionalBoolean(node.props.rowsSelectable)}
      enableMultiRowSelection={extractValue.asOptionalBoolean(node.props.enableMultiRowSelection)}
      initiallySelected={extractValue(node.props.initiallySelected)}
      syncWithAppState={syncAdapter}
      rowUnselectablePredicate={lookupSyncCallback(node.props.rowUnselectablePredicate)}
      hideSelectionCheckboxes={extractValue.asOptionalBoolean(node.props.hideSelectionCheckboxes)}
      selectionCheckboxPosition={extractValue.asOptionalString(node.props.selectionCheckboxPosition) as any}
      selectionCheckboxAnchor={extractValue.asOptionalString(node.props.selectionCheckboxAnchor) as any}
      selectionCheckboxOffsetX={extractValue.asSize(node.props.selectionCheckboxOffsetX || defaultProps.selectionCheckboxOffsetX) }
      selectionCheckboxOffsetY={extractValue.asSize(node.props.selectionCheckboxOffsetY || defaultProps.selectionCheckboxOffsetY)}
      selectionCheckboxSize={extractValue.asSize(node.props.selectionCheckboxSize)}
      onSelectionDidChange={lookupEventHandler("selectionDidChange")}
      onSelectAllAction={lookupEventHandler("selectAllAction")}
      onCutAction={lookupEventHandler("cutAction")}
      onCopyAction={lookupEventHandler("copyAction")}
      onPasteAction={lookupEventHandler("pasteAction")}
      onDeleteAction={lookupEventHandler("deleteAction")}
      rowDoubleClick={lookupEventHandler("rowDoubleClick")}
      keyBindings={extractValue(node.props.keyBindings)}
      itemRenderer={
        itemTemplate &&
        ((item, key, rowIndex, count, isSelected) => {
          return (
            <MemoizedItem
              node={itemTemplate as any}
              key={key}
              renderChild={renderChild}
              layoutContext={layoutContext}
              contextVars={{
                $item: item,
                $itemIndex: rowIndex,
                $isFirst: rowIndex === 0,
                $isLast: rowIndex === count - 1,
                $isSelected: isSelected,
              }}
            />
          );
        })
      }
      sectionRenderer={
        node.props.groupBy
          ? (item, key) =>
              (item.items?.length ?? 0) > 0 || !hideEmptyGroups ? (
                <MemoizedSection
                  node={node.props.groupHeaderTemplate ?? ({ type: "Fragment" } as any)}
                  renderChild={renderChild}
                  key={key}
                  item={item}
                />
              ) : null
          : undefined
      }
      sectionFooterRenderer={
        node.props.groupFooterTemplate
          ? (item, key) =>
              (item.items?.length ?? 0) > 0 || !hideEmptyGroups ? (
                <MemoizedItem
                  node={node.props.groupFooterTemplate ?? ({ type: "Fragment" } as any)}
                  renderChild={renderChild}
                  key={key}
                  contextVars={{
                    $group: item,
                  }}
                />
              ) : null
          : undefined
      }
    />
  );

  if (selectionContext === null) {
    return <StandaloneSelectionStore idKey={idKey}>{listContent}</StandaloneSelectionStore>;
  }
  return listContent;
});

export const dynamicHeightListComponentRenderer = createComponentRenderer(
  COMP,
  ListMd,
  ({
    node,
    extractValue,
    renderChild,
    classes,
    layoutContext,
    lookupEventHandler,
    lookupAction,
    lookupSyncCallback,
    registerComponentApi,
  }) => {
    return (
      <ListWithSelection
        node={node}
        extractValue={extractValue}
        lookupEventHandler={lookupEventHandler as any}
        lookupAction={lookupAction}
        lookupSyncCallback={lookupSyncCallback}
        classes={classes}
        renderChild={renderChild}
        registerComponentApi={registerComponentApi}
        layoutContext={layoutContext}
      />
    );
  },
);

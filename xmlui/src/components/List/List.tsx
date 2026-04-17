import { memo, useMemo, useRef, startTransition } from "react";

import styles from "./List.module.scss";

import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { MemoizedItem } from "../container-helpers";
import { EMPTY_OBJECT } from "../../components-core/constants";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import { isArrowExpressionObject } from "../../abstractions/InternalMarkers";
import type { RendererContext, LayoutContext, RenderChildFn } from "../../abstractions/RendererDefs";
import { createMetadata, d, dComponent, dContextMenu, dInternal } from "../metadata-helpers";
import { scrollAnchoringValues } from "../abstractions";
import {
  StandaloneSelectionStore,
  useSelectionContext,
} from "../SelectionStore/SelectionStoreNative";
import { ListNative, MemoizedSection, defaultProps, selectionCheckboxPositionValues, selectionCheckboxAnchorValues } from "./ListReact";

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
      "This property sets which data item property is used to group the list items. " +
        "Accepts a field name string or a function that receives an item and returns the group key. " +
        "If not set, no grouping is done.",
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
    refreshOn: d(
      `Bind this property to a global variable (or expression) whose change should force all ` +
        `visible list items to re-render and pick up the latest reactive state. When not set, ` +
        `items re-render on every XMLUI reactive cycle (safe but less optimal). When set, items ` +
        `only re-render when the bound value changes, which eliminates spurious re-renders from ` +
        `unrelated global-variable updates (e.g. focus events).`,
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

// List-specific memoized item. Uses a custom comparator so that:
//   - renderVersion change   → always re-render (external XMLUI reactive cycle / refreshOn fired)
//   - node change            → re-render (item template changed)
//   - contextVars value change → re-render (e.g. $isSelected toggled for this row)
//   - renderChild / layoutContext stable refs → skip comparison
// Kept separate from the shared MemoizedItem to avoid affecting other consumers.
type ListMemoizedItemProps = {
  node: ComponentDef | Array<ComponentDef>;
  renderChild: RenderChildFn;
  layoutContext?: LayoutContext;
  contextVars?: Record<string, any>;
  renderVersion: number;
};

const ListMemoizedItem = memo(
  ({ node, renderChild, layoutContext, contextVars }: ListMemoizedItemProps) => (
    <MemoizedItem
      node={node}
      renderChild={renderChild}
      layoutContext={layoutContext}
      contextVars={contextVars}
    />
  ),
  (prev, next) => {
    if (prev.renderVersion !== next.renderVersion) return false;
    if (prev.node !== next.node) return false;
    // renderChild and layoutContext are stable refs — no need to compare
    const prevVars = prev.contextVars ?? EMPTY_OBJECT;
    const nextVars = next.contextVars ?? EMPTY_OBJECT;
    const keys = Object.keys(nextVars);
    if (keys.length !== Object.keys(prevVars).length) return false;
    for (const k of keys) {
      if (prevVars[k] !== nextVars[k]) return false;
    }
    return true;
  },
);

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

  // --- Stable renderChild / layoutContext refs (L6) ---
  // renderChild is recreated by the XMLUI runtime on every reactive cycle.
  // Storing it in a ref and passing a stable wrapper to MemoizedItem prevents all
  // visible items from re-rendering on every click/focus event.
  const renderChildRef = useRef(renderChild);
  renderChildRef.current = renderChild;
  const layoutContextRef = useRef(layoutContext);
  layoutContextRef.current = layoutContext;
  const stableRenderChildFnRef = useRef<RenderChildFn>(
    (node: any, ctx: any) => renderChildRef.current(node, ctx),
  );

  // --- renderVersion counter (L7) ---
  // Increments only when refreshOn changes (or on every cycle if refreshOn is not set).
  // Passed to ListMemoizedItem so items re-render exactly when needed.
  const refreshOn = extractValue(node.props.refreshOn);
  const prevRefreshOnRef = useRef<unknown>(refreshOn);
  const renderVersionRef = useRef(0);
  const shouldForceRefresh = node.props.refreshOn === undefined || prevRefreshOnRef.current !== refreshOn;
  if (shouldForceRefresh) {
    prevRefreshOnRef.current = refreshOn;
    renderVersionRef.current++;
  }

  // Build a syncWithAppState-compatible adapter for the syncWithVar global-variable sync.
  //
  // KEY POINTS (ported from Table.tsx):
  // 1. Data is passed through a window variable; expression string stays constant O(1).
  // 2. startTransition defers the XMLUI tree re-render so it does not block the main thread.
  // 3. pendingOwnWriteRef + __v version tracking reliably suppress own-write re-renders.
  // 4. External changes (e.g. select-all from outside) create a new adapter object so
  //    ListNative detects the prop change and useRowSelection picks up the new selection.
  const syncVarName = extractValue.asOptionalString(node.props.syncWithVar);
  const lookupActionRef = useRef(lookupAction);
  lookupActionRef.current = lookupAction;
  const syncAdapterHolderRef = useRef<{ value: any; update: any } | null>(null);

  const pendingOwnWriteRef = useRef(false);
  // Each write embeds a monotonically-increasing __v number in the stored object.
  // We compare this primitive on read-back — reliable even when XMLUI does not
  // preserve inner array references across state evaluations.
  const pendingOwnWriteVersionRef = useRef<number>(0);
  const ownWriteCountRef = useRef<number>(0);
  const pendingOwnWrite = pendingOwnWriteRef.current;
  pendingOwnWriteRef.current = false; // consume immediately

  let syncAdapter: any;
  if (syncVarName !== undefined) {
    if (!VALID_IDENTIFIER_RE.test(syncVarName)) {
      console.error(`[List syncWithVar] Invalid variable name: "${syncVarName}"`);
      syncAdapterHolderRef.current = null;
    } else {
      const currentSyncVarValue = extractValue(`{${syncVarName}}`);
      if (currentSyncVarValue != null) {
        if (!syncAdapterHolderRef.current) {
          // Create the stable adapter object once.
          syncAdapterHolderRef.current = {
            value: currentSyncVarValue,
            update: ({ selectedIds }: { selectedIds: string[] }) => {
              pendingOwnWriteRef.current = true;
              const thisVersion = ++ownWriteCountRef.current;
              pendingOwnWriteVersionRef.current = thisVersion;
              const windowKey = `__listSync_${syncVarName}`;
              (window as any)[windowKey] = { selectedIds, __v: thisVersion };
              const handler = lookupActionRef.current?.(
                `{${syncVarName} = window.${windowKey}}`,
                { ephemeral: true },
              );
              startTransition(() => {
                handler?.();
              });
            },
          };
        } else if (currentSyncVarValue !== syncAdapterHolderRef.current.value) {
          // Detect whether this value change is from our own write or external.
          const isOwnWrite = pendingOwnWrite ||
            (pendingOwnWriteVersionRef.current > 0 &&
              currentSyncVarValue?.__v === pendingOwnWriteVersionRef.current);

          if (isOwnWrite) {
            // Own-write: update value in-place so ListNative.memo() is not triggered.
            syncAdapterHolderRef.current.value = currentSyncVarValue;
          } else {
            // External change: reset version sentinel and create new object so
            // ListNative detects the prop change and useRowSelection picks it up.
            pendingOwnWriteVersionRef.current = 0;
            syncAdapterHolderRef.current = {
              value: currentSyncVarValue,
              update: syncAdapterHolderRef.current.update,
            };
          }
        }
      } else {
        syncAdapterHolderRef.current = null;
      }
    }
  } else {
    syncAdapterHolderRef.current = null;
  }
  syncAdapter = syncAdapterHolderRef.current;

  // --- Stable memoized renderers (L5) ---
  // Declared before JSX so useMemo is called unconditionally at the top level of the component.
  // Each renderer uses stableRenderChildFnRef.current and layoutContextRef.current (stable refs),
  // so the renderer function reference only changes when the template / key changes — not on
  // every XMLUI reactive cycle.

  // itemRenderer: receives renderVersion so ListMemoizedItem can decide per-row whether to
  // re-render based on the refreshOn logic.
  const stableItemRenderer = useMemo(
    () =>
      itemTemplate
        ? (item: any, key: any, rowIndex: number, count: number, isSelected: boolean) => (
            <ListMemoizedItem
              node={itemTemplate as any}
              key={key}
              renderChild={stableRenderChildFnRef.current}
              layoutContext={layoutContextRef.current}
              renderVersion={renderVersionRef.current}
              contextVars={{
                $item: item,
                $itemIndex: rowIndex,
                $isFirst: rowIndex === 0,
                $isLast: rowIndex === count - 1,
                $isSelected: isSelected,
              }}
            />
          )
        : undefined,
    // idKey is included because it is captured by itemTemplate renders via $item[idKey].
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemTemplate, idKey],
  );

  const stableSectionRenderer = useMemo(
    () =>
      node.props.groupBy
        ? (item: any, key: any) =>
            (item.items?.length ?? 0) > 0 || !hideEmptyGroups ? (
              <MemoizedSection
                node={node.props.groupHeaderTemplate ?? ({ type: "Fragment" } as any)}
                renderChild={stableRenderChildFnRef.current}
                key={key}
                item={item}
              />
            ) : null
        : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [node.props.groupBy, node.props.groupHeaderTemplate, hideEmptyGroups],
  );

  const stableSectionFooterRenderer = useMemo(
    () =>
      node.props.groupFooterTemplate
        ? (item: any, key: any) =>
            (item.items?.length ?? 0) > 0 || !hideEmptyGroups ? (
              <MemoizedItem
                node={node.props.groupFooterTemplate ?? ({ type: "Fragment" } as any)}
                renderChild={stableRenderChildFnRef.current}
                key={key}
                contextVars={{
                  $group: item,
                }}
              />
            ) : null
        : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [node.props.groupFooterTemplate, hideEmptyGroups],
  );

  const groupByExtracted = extractValue(node.props.groupBy);
  const groupByResolved = isArrowExpressionObject(groupByExtracted)
    ? lookupSyncCallback(node.props.groupBy)
    : groupByExtracted;

  const listContent = (
    <ListNative
      registerComponentApi={registerComponentApi}
      classes={classes}
      loading={extractValue.asOptionalBoolean(node.props.loading)}
      items={extractValue(node.props.items) || extractValue(node.props.data)}
      limit={extractValue(node.props.limit)}
      groupBy={groupByResolved as any}
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
      itemRenderer={stableItemRenderer}
      sectionRenderer={stableSectionRenderer}
      sectionFooterRenderer={stableSectionFooterRenderer}
    />
  );

  if (selectionContext === null) {
    return <StandaloneSelectionStore idKey={idKey}>{listContent}</StandaloneSelectionStore>;
  }
  return listContent;
});

export const dynamicHeightListComponentRenderer = wrapComponent(COMP, ListNative, ListMd, {
  customRender: (_props, context) => (
    <ListWithSelection
      node={context.node as any}
      extractValue={context.extractValue}
      lookupEventHandler={context.lookupEventHandler as any}
      lookupAction={context.lookupAction}
      lookupSyncCallback={context.lookupSyncCallback}
      classes={context.classes}
      renderChild={context.renderChild}
      registerComponentApi={context.registerComponentApi}
      layoutContext={context.layoutContext}
    />
  ),
});

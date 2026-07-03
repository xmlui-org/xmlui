import { useEffect, useMemo, useState } from "react";

import { createMetadata, dComponent, dContextMenu, dInternal } from "../../component-core/metadata/helpers";
import { createRuntimeScope } from "../../runtime/state";
import { nonPropertyChildren, templateChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { managedFetchService } from "../../runtime/data/managedFetch";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./List.defaults";
import { ListNative, type ListApi } from "./ListReact";

const COMP = "List";

const listStylesSource = `
$backgroundColor-List: createThemeVar("backgroundColor-List");
$backgroundColor-selected-List: createThemeVar("backgroundColor-selected-List");
$backgroundColor-selected-List--hover: createThemeVar("backgroundColor-selected-List--hover");
$backgroundColor-row-List--hover: createThemeVar("backgroundColor-row-List--hover");
`;

export const ListMd = createMetadata({
  status: "experimental",
  description:
    "`List` renders datasets with item templates, grouping, and selection-oriented APIs.",
  optimization: {
    isImplicitContainerByDefault: true,
  },
  props: {
    id: { description: "The component id.", valueType: "string" },
    invalidProp: dInternal("Compatibility-only prop ignored by List."),
    testId: { description: "The test id.", valueType: "string" },
    data: { description: "The list data to display.", valueType: "any" },
    items: dInternal("Alias for the `data` property. When both are provided, `items` has priority."),
    loading: { description: "Shows loading state when true and no items are available.", valueType: "boolean" },
    limit: { description: "Limits the number of displayed items.", valueType: "number" },
    scrollAnchor: {
      description: "Pins the initial scroll position to the top or bottom of the list.",
      valueType: "string",
      defaultValue: defaultProps.scrollAnchor,
    },
    fixedItemSize: { description: "Compatibility hint for virtualized lists.", valueType: "boolean" },
    groupBy: { description: "Field name or function used to group list items.", valueType: "any" },
    orderBy: { description: "Field name or descriptor used to sort list items.", valueType: "any" },
    availableGroups: { description: "Optional list of group names to display.", valueType: "string[]" },
    itemTemplate: dComponent("Template used to render each item."),
    emptyListTemplate: dComponent("Template displayed when the list is empty."),
    groupHeaderTemplate: dComponent("Template used to render a group header."),
    groupFooterTemplate: dComponent("Template used to render a group footer."),
    pageInfo: { description: "Pagination state used by fetch-page events.", valueType: "any" },
    idKey: { description: "Item field used as row ID.", valueType: "string", defaultValue: defaultProps.idKey },
    groupsInitiallyExpanded: {
      description: "Whether grouped sections are initially expanded.",
      valueType: "boolean",
      defaultValue: defaultProps.groupsInitiallyExpanded,
    },
    defaultGroups: { description: "Default group names and order.", valueType: "string[]" },
    hideEmptyGroups: {
      description: "Hides default groups that have no items.",
      valueType: "boolean",
      defaultValue: defaultProps.hideEmptyGroups,
    },
    borderCollapse: {
      description: "Collapses adjacent row borders.",
      valueType: "boolean",
      defaultValue: defaultProps.borderCollapse,
    },
    rowsSelectable: { description: "Whether rows can be selected.", valueType: "boolean", defaultValue: defaultProps.rowsSelectable },
    enableMultiRowSelection: {
      description: "Whether multiple rows can be selected.",
      valueType: "boolean",
      defaultValue: defaultProps.enableMultiRowSelection,
    },
    initiallySelected: { description: "Initially selected row IDs.", valueType: "any" },
    hideSelectionCheckboxes: {
      description: "Hides selection checkboxes while preserving selection behavior.",
      valueType: "boolean",
      defaultValue: defaultProps.hideSelectionCheckboxes,
    },
    rowUnselectablePredicate: { description: "Predicate that disables selection for matching rows.", valueType: "any" },
    selectionCheckboxPosition: {
      description: "Places row selection checkboxes before content or as an overlay.",
      valueType: "string",
      availableValues: ["before", "overlay"],
      defaultValue: defaultProps.selectionCheckboxPosition,
    },
    selectionCheckboxAnchor: {
      description: "Anchor used for overlay selection checkboxes.",
      valueType: "string",
      availableValues: ["top-left", "top-right", "bottom-left", "bottom-right", "center-left", "center-right"],
      defaultValue: defaultProps.selectionCheckboxAnchor,
    },
    selectionCheckboxOffsetX: {
      description: "Horizontal overlay checkbox offset.",
      valueType: "string",
      defaultValue: defaultProps.selectionCheckboxOffsetX,
    },
    selectionCheckboxOffsetY: {
      description: "Vertical overlay checkbox offset.",
      valueType: "string",
      defaultValue: defaultProps.selectionCheckboxOffsetY,
    },
    selectionCheckboxSize: { description: "CSS size for selection checkboxes.", valueType: "string" },
    keyBindings: { description: "Keyboard shortcuts for list actions.", valueType: "any" },
  },
  childrenAsTemplate: "itemTemplate",
  events: {
    contextMenu: dContextMenu(COMP),
    rowDoubleClick: {
      description: "Fired when a row is double-clicked.",
      signature: "rowDoubleClick(item: any): void",
    },
    selectionDidChange: {
      description: "Fired when selection changes.",
      signature: "selectionDidChange(selectedItems: any[]): void",
    },
    requestFetchPrevPage: {
      description: "Fired when the list requests the previous page.",
      signature: "requestFetchPrevPage(): void",
    },
    requestFetchNextPage: {
      description: "Fired when the list requests the next page.",
      signature: "requestFetchNextPage(): void",
    },
    selectAllAction: { description: "Fired for the select-all keyboard action." },
    cutAction: { description: "Fired for the cut keyboard action." },
    copyAction: { description: "Fired for the copy keyboard action." },
    pasteAction: { description: "Fired for the paste keyboard action." },
    deleteAction: { description: "Fired for the delete keyboard action." },
  },
  apis: {
    scrollToTop: { description: "Scrolls to the top.", signature: "scrollToTop(): void" },
    scrollToBottom: { description: "Scrolls to the bottom.", signature: "scrollToBottom(): void" },
    scrollToIndex: { description: "Scrolls to an item index.", signature: "scrollToIndex(index: number): void" },
    scrollToId: { description: "Scrolls to a row id.", signature: "scrollToId(id: any): void" },
    selectAll: { description: "Selects all rows.", signature: "selectAll(): void" },
    clearSelection: { description: "Clears selection.", signature: "clearSelection(): void" },
    getSelectedIds: { description: "Returns selected row IDs.", signature: "getSelectedIds(): string[]" },
    getSelectedItems: { description: "Returns selected row items.", signature: "getSelectedItems(): any[]" },
    selectId: { description: "Selects a row by ID.", signature: "selectId(id: any): void" },
  },
  contextVars: {
    $item: dComponent("Current item."),
    $itemIndex: dComponent("Zero-based item index."),
    $isFirst: dComponent("Whether this is the first item."),
    $isLast: dComponent("Whether this is the last item."),
    $isSelected: dComponent("Whether this item is selected."),
  },
  themeVars: extractScssThemeVars(listStylesSource),
  defaultThemeVars: {
    "backgroundColor-List": "transparent",
    "backgroundColor-selected-List": "$color-primary-100",
    "backgroundColor-selected-List--hover": "$color-primary-200",
    "backgroundColor-row-List--hover": "$color-surface-100",
  },
});

export const listRenderer = wrapComponent({
  name: COMP,
  metadata: ListMd,
  renderer: ({ adapter }) => {
    const explicitItems = adapter.prop("items");
    const data = adapter.prop("data");
    const dataUrl = explicitItems === undefined ? listDataUrl(data) : undefined;
    const remoteData = useRemoteListData(dataUrl);
    const items = explicitItems ?? (dataUrl ? remoteData.items : data);
    const itemTemplate = templateChildren(adapter.node, "itemTemplate") ?? nonPropertyChildren(adapter.node.children);
    const hasItemTemplate = Array.isArray(itemTemplate) ? itemTemplate.length > 0 : !!itemTemplate;
    const emptyTemplate = templateChildren(adapter.node, "emptyListTemplate");
    const groupHeaderTemplate = templateChildren(adapter.node, "groupHeaderTemplate");
    const groupFooterTemplate = templateChildren(adapter.node, "groupFooterTemplate");
    const apiRef = { current: null as ListApi | null };
    const renderWithContext = (contextVars: Record<string, unknown>, template = itemTemplate) => {
      const itemScope = createRuntimeScope({
        store: adapter.scope.store,
        parent: adapter.scope,
        props: adapter.scope.props,
        contextValues: contextVars,
        references: adapter.scope.references,
        slots: adapter.scope.slots,
        emitEvent: adapter.scope.emitEvent,
      });
      return adapter.context.renderChildren(template, itemScope);
    };
    return (
      <ListNative
        {...adapter.rootAttrs()}
        ref={(api) => {
          apiRef.current = api;
          if (api) {
            adapter.registerApi(api as unknown as Record<string, unknown>);
          }
        }}
        id={adapter.stringProp("id")}
        items={Array.isArray(items) ? items : []}
        loading={adapter.booleanProp("loading", false) || remoteData.loading}
        limit={adapter.numberProp("limit", 0)}
        scrollAnchor={adapter.stringProp("scrollAnchor", defaultProps.scrollAnchor)}
        fixedItemSize={adapter.booleanProp("fixedItemSize", false)}
        groupBy={adapter.prop("groupBy")}
        orderBy={adapter.prop("orderBy")}
        availableGroups={arrayValue(adapter.prop("availableGroups")).map(String)}
        pageInfo={adapter.prop("pageInfo")}
        idKey={adapter.stringProp("idKey", defaultProps.idKey)}
        groupsInitiallyExpanded={adapter.booleanProp("groupsInitiallyExpanded", defaultProps.groupsInitiallyExpanded)}
        defaultGroups={arrayValue(adapter.prop("defaultGroups")).map(String)}
        hideEmptyGroups={adapter.booleanProp("hideEmptyGroups", defaultProps.hideEmptyGroups)}
        borderCollapse={adapter.booleanProp("borderCollapse", defaultProps.borderCollapse)}
        rowsSelectable={adapter.booleanProp("rowsSelectable", defaultProps.rowsSelectable)}
        enableMultiRowSelection={adapter.booleanProp("enableMultiRowSelection", defaultProps.enableMultiRowSelection)}
        initiallySelected={arrayValue(adapter.prop("initiallySelected"))}
        hideSelectionCheckboxes={adapter.booleanProp("hideSelectionCheckboxes", defaultProps.hideSelectionCheckboxes)}
        rowUnselectablePredicate={functionValue(adapter.prop("rowUnselectablePredicate"))}
        selectionCheckboxPosition={adapter.stringProp("selectionCheckboxPosition", defaultProps.selectionCheckboxPosition)}
        selectionCheckboxAnchor={adapter.stringProp("selectionCheckboxAnchor", defaultProps.selectionCheckboxAnchor)}
        selectionCheckboxOffsetX={adapter.stringProp("selectionCheckboxOffsetX", defaultProps.selectionCheckboxOffsetX)}
        selectionCheckboxOffsetY={adapter.stringProp("selectionCheckboxOffsetY", defaultProps.selectionCheckboxOffsetY)}
        selectionCheckboxSize={adapter.stringProp("selectionCheckboxSize")}
        keyBindings={objectValue(adapter.prop("keyBindings"))}
        emptyListTemplate={emptyTemplate ? renderWithContext({}, emptyTemplate) : undefined}
        renderItem={hasItemTemplate ? ((item, index, count, isSelected) =>
          renderWithContext({
            $item: item,
            $itemIndex: index,
            $isFirst: index === 0,
            $isLast: index === count - 1,
            $isSelected: isSelected,
          })) : undefined}
        renderGroupHeader={(group, groupItems) =>
          groupHeaderTemplate ? renderWithContext(groupContext(group, groupItems), groupHeaderTemplate) : undefined}
        renderGroupFooter={(group, groupItems) =>
          groupFooterTemplate ? renderWithContext(groupContext(group, groupItems), groupFooterTemplate) : undefined}
        onContextMenu={() => void adapter.event("contextMenu")()}
        onRowDoubleClick={(item) => void adapter.event("rowDoubleClick")(item)}
        onSelectionDidChange={(selectedItems) => void adapter.event("selectionDidChange")(selectedItems)}
        onRequestFetchPrevPage={() => void adapter.event("requestFetchPrevPage")()}
        onRequestFetchNextPage={() => void adapter.event("requestFetchNextPage")()}
        onSelectAllAction={(row, items, ids) => void adapter.event("selectAllAction")(row, items, ids)}
        onCutAction={(row, items, ids) => void adapter.event("cutAction")(row, items, ids)}
        onCopyAction={(row, items, ids) => void adapter.event("copyAction")(row, items, ids)}
        onPasteAction={(row, items, ids) => void adapter.event("pasteAction")(row, items, ids)}
        onDeleteAction={(row, items, ids) => void adapter.event("deleteAction")(row, items, ids)}
      />
    );
  },
});

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function functionValue(value: unknown): ((item: unknown) => unknown) | undefined {
  return typeof value === "function" ? value as (item: unknown) => unknown : undefined;
}

function objectValue(value: unknown): Record<string, string> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, string>
    : undefined;
}

function groupContext(group: string, items: unknown[]): Record<string, unknown> {
  const groupInfo = { id: group, key: group, items };
  return { $item: groupInfo, $group: groupInfo };
}

function listDataUrl(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return /^(https?:\/\/|\/)/.test(trimmed) ? trimmed : undefined;
}

function useRemoteListData(url: string | undefined): { items: unknown[]; loading: boolean } {
  const request = useMemo(
    () => url ? managedFetchService.buildRequest({ url, method: "get", dataType: "json" }) : undefined,
    [url],
  );
  const [state, setState] = useState<{ url?: string; items: unknown[]; loading: boolean }>({
    items: [],
    loading: false,
  });

  useEffect(() => {
    if (!request) {
      setState({ items: [], loading: false });
      return;
    }

    let cancelled = false;
    setState((current) => ({
      url: request.url,
      items: current.url === request.url ? current.items : [],
      loading: true,
    }));

    managedFetchService.load(request)
      .then((entry) => {
        if (!cancelled) {
          setState({
            url: request.url,
            items: Array.isArray(entry.value) ? entry.value : [],
            loading: false,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ url: request.url, items: [], loading: false });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [request]);

  if (url && state.url !== url) {
    return { items: [], loading: true };
  }
  return state;
}

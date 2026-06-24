import { createMetadata, dComponent, dContextMenu, dInternal } from "../../component-core/metadata/helpers";
import { createRuntimeScope } from "../../runtime/state";
import { nonPropertyChildren, templateChildren, wrapComponent } from "../../runtime/rendering/adapter";
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
    testId: { description: "The test id.", valueType: "string" },
    data: { description: "The list data to display.", valueType: "any" },
    items: dInternal("Alias for the `data` property. When both are provided, `items` has priority."),
    loading: { description: "Shows loading state when true and no items are available.", valueType: "boolean" },
    limit: { description: "Limits the number of displayed items.", valueType: "number" },
    groupBy: { description: "Field name used to group list items.", valueType: "any" },
    orderBy: { description: "Field name used to sort list items.", valueType: "string" },
    itemTemplate: dComponent("Template used to render each item."),
    emptyListTemplate: dComponent("Template displayed when the list is empty."),
    groupHeaderTemplate: dComponent("Template used to render a group header."),
    groupFooterTemplate: dComponent("Template used to render a group footer."),
    idKey: { description: "Item field used as row ID.", valueType: "string", defaultValue: defaultProps.idKey },
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
    const items = adapter.prop("items") ?? adapter.prop("data");
    const itemTemplate = templateChildren(adapter.node, "itemTemplate") ?? nonPropertyChildren(adapter.node.children);
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
        loading={adapter.booleanProp("loading", false)}
        limit={adapter.numberProp("limit", 0)}
        groupBy={adapter.stringProp("groupBy")}
        orderBy={adapter.stringProp("orderBy")}
        idKey={adapter.stringProp("idKey", defaultProps.idKey)}
        rowsSelectable={adapter.booleanProp("rowsSelectable", defaultProps.rowsSelectable)}
        enableMultiRowSelection={adapter.booleanProp("enableMultiRowSelection", defaultProps.enableMultiRowSelection)}
        initiallySelected={arrayValue(adapter.prop("initiallySelected"))}
        hideSelectionCheckboxes={adapter.booleanProp("hideSelectionCheckboxes", defaultProps.hideSelectionCheckboxes)}
        emptyListTemplate={emptyTemplate ? renderWithContext({}, emptyTemplate) : undefined}
        renderItem={(item, index, count, isSelected) =>
          renderWithContext({
            $item: item,
            $itemIndex: index,
            $isFirst: index === 0,
            $isLast: index === count - 1,
            $isSelected: isSelected,
          })}
        renderGroupHeader={(group, groupItems) =>
          groupHeaderTemplate
            ? renderWithContext({ $item: { group, items: groupItems }, $group: group }, groupHeaderTemplate)
            : undefined}
        renderGroupFooter={(group, groupItems) =>
          groupFooterTemplate
            ? renderWithContext({ $item: { group, items: groupItems }, $group: group }, groupFooterTemplate)
            : undefined}
        onContextMenu={() => void adapter.event("contextMenu")()}
        onRowDoubleClick={(item) => void adapter.event("rowDoubleClick")(item)}
        onSelectionDidChange={(selectedItems) => void adapter.event("selectionDidChange")(selectedItems)}
      />
    );
  },
});

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

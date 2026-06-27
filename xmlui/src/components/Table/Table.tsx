import type { XmluiElement } from "../../compiler/ir";
import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";
import { createMetadata, dComponent, dContextMenu, dInternal } from "../../component-core/metadata/helpers";
import { createRuntimeScope, hasLocalName, readLocal, writeLocal, type RuntimeScope } from "../../runtime/state";
import { templateChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { runEvent } from "../../runtime/rendering/bindings";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./Table.defaults";
import { TableNative, type TableApi } from "./TableReact";
import type { TableColumnDefinition } from "../Column/ColumnReact";

const COMP = "Table";

const tableStylesSource = `
$backgroundColor-Table: createThemeVar("backgroundColor-Table");
$backgroundColor-header-Table: createThemeVar("backgroundColor-header-Table");
$backgroundColor-heading-Table: createThemeVar("backgroundColor-heading-Table");
$backgroundColor-row-Table: createThemeVar("backgroundColor-row-Table");
$backgroundColor-row-Table--even: createThemeVar("backgroundColor-row-Table--even");
$backgroundColor-evenRow-Table: createThemeVar("backgroundColor-evenRow-Table");
$backgroundColor-oddRow-Table: createThemeVar("backgroundColor-oddRow-Table");
$backgroundColor-row-Table--hover: createThemeVar("backgroundColor-row-Table--hover");
$backgroundColor-selected-Table: createThemeVar("backgroundColor-selected-Table");
$border-Table: createThemeVar("border-Table");
$borderRadius-Table: createThemeVar("borderRadius-Table");
$borderBottom-header-Table: createThemeVar("borderBottom-header-Table");
$borderBottom-row-Table: createThemeVar("borderBottom-row-Table");
$headerHeight-Table: createThemeVar("headerHeight-Table");
$padding-TableCell: createThemeVar("padding-TableCell");
$rowHeight-Table: createThemeVar("rowHeight-Table");
$fontSize-checkbox-Table: createThemeVar("fontSize-checkbox-Table");
$textColor-Table: createThemeVar("textColor-Table");
$textColor-header-Table: createThemeVar("textColor-header-Table");
$textColor-empty-Table: createThemeVar("textColor-empty-Table");
$userSelectCell-Table: createThemeVar("userSelectCell-Table");
$userSelectHeading-Table: createThemeVar("userSelectHeading-Table");
$userSelectRow-Table: createThemeVar("userSelectRow-Table");
$userSelect-cell-Table: createThemeVar("userSelect-cell-Table");
$userSelect-heading-Table: createThemeVar("userSelect-heading-Table");
$userSelect-row-Table: createThemeVar("userSelect-row-Table");
`;

export const TableMd = createMetadata({
  status: "experimental",
  description: "`Table` presents structured data for viewing, sorting, selection, and interaction.",
  optimization: {
    isImplicitContainerByDefault: true,
  },
  props: {
    items: dInternal("Alias for the `data` property. When both are used, `items` has priority."),
    data: { description: "The data rows to display.", valueType: "any" },
    idKey: { description: "The unique ID property in the data rows.", valueType: "string", defaultValue: defaultProps.idKey },
    isPaginated: { description: "Enables pagination controls.", valueType: "boolean", defaultValue: defaultProps.isPaginated },
    pageSize: { description: "Number of rows per page.", valueType: "number" },
    pageSizeOptions: { description: "Selectable page-size values.", valueType: "any" },
    alwaysShowPagination: { description: "Shows pagination controls even when there is only one page.", valueType: "boolean" },
    paginationControlsLocation: { description: "Pagination control placement.", valueType: "string" },
    rowHeight: { description: "Estimated row height used by virtualization.", valueType: "number", defaultValue: defaultProps.rowHeight },
    loading: { description: "Shows loading state.", valueType: "boolean", defaultValue: defaultProps.loading },
    rowsSelectable: { description: "Whether rows are selectable.", valueType: "boolean", defaultValue: defaultProps.rowsSelectable },
    autoFocus: { description: "Focuses the table root when mounted.", valueType: "boolean", defaultValue: defaultProps.autoFocus },
    initiallySelected: { description: "Initially selected row IDs.", valueType: "any" },
    syncWithVar: { description: "Synchronizes selected row IDs with a local or global variable.", valueType: "string" },
    refreshOn: { description: "Refresh key controlling table cell template remounting.", valueType: "any" },
    hideHeader: { description: "Hides the table header.", valueType: "boolean", defaultValue: defaultProps.hideHeader },
    noBottomBorder: { description: "Removes the bottom border from the table.", valueType: "boolean", defaultValue: defaultProps.noBottomBorder },
    rowDisabledPredicate: { description: "Predicate that disables matching rows.", valueType: "any" },
    rowUnselectablePredicate: { description: "Predicate that disables selection for matching rows.", valueType: "any" },
    toggleSelectionOnClick: { description: "Toggles clicked rows without replacing other selected rows.", valueType: "boolean", defaultValue: defaultProps.toggleSelectionOnClick },
    hideSelectionCheckboxes: {
      description: "Hides row-selection checkboxes.",
      valueType: "boolean",
      defaultValue: defaultProps.hideSelectionCheckboxes,
    },
    hideSelectionCheckboxesHeader: {
      description: "Hides the select-all header checkbox while preserving row checkboxes.",
      valueType: "boolean",
      defaultValue: defaultProps.hideSelectionCheckboxesHeader,
    },
    alwaysShowSelectionCheckboxes: {
      description: "Keeps row-selection checkboxes visible.",
      valueType: "boolean",
      defaultValue: defaultProps.alwaysShowSelectionCheckboxes,
    },
    alwaysShowSortingIndicator: {
      description: "Keeps sorting indicators visible on sortable columns.",
      valueType: "boolean",
      defaultValue: defaultProps.alwaysShowSortingIndicator,
    },
    checkboxTolerance: {
      description: "Controls the clickable tolerance around selection checkboxes.",
      valueType: "string",
      availableValues: ["none", "compact", "comfortable", "spacious"],
      defaultValue: defaultProps.checkboxTolerance,
    },
    sortBy: { description: "Initial sorted column.", valueType: "string" },
    sortDirection: { description: "Initial sort direction.", valueType: "string", availableValues: ["ascending", "descending"] },
    iconNoSort: { description: "Icon used when the column is sortable but unsorted.", valueType: "string" },
    iconSortAsc: { description: "Icon used when the column is sorted ascending.", valueType: "string" },
    iconSortDesc: { description: "Icon used when the column is sorted descending.", valueType: "string" },
    userSelectCell: { description: "CSS user-select for table cells.", valueType: "string", defaultValue: defaultProps.userSelectCell },
    userSelectRow: { description: "CSS user-select for rows.", valueType: "string", defaultValue: defaultProps.userSelectRow },
    userSelectHeading: { description: "CSS user-select for headings.", valueType: "string", defaultValue: defaultProps.userSelectHeading },
    cellVerticalAlign: { description: "Vertical alignment for header and body cells.", valueType: "string", defaultValue: defaultProps.cellVerticalAlign },
    keyBindings: { description: "Keyboard shortcut map for table actions.", valueType: "any" },
    striped: { description: "Applies alternating row stripe classes and theme colors.", valueType: "boolean", defaultValue: defaultProps.striped },
    noDataTemplate: dComponent("Template displayed when the table has no rows."),
  },
  events: {
    contextMenu: dContextMenu(COMP),
    rowClick: { description: "Fired when a row is clicked.", signature: "rowClick(item: any): void" },
    rowDoubleClick: { description: "Fired when a row is double-clicked.", signature: "rowDoubleClick(item: any): void" },
    selectionDidChange: {
      description: "Fired when row selection changes.",
      signature: "selectionDidChange(selectedItems: any[]): void",
    },
    selectAllAction: { description: "Fired when the select-all keyboard action is invoked.", signature: "selectAllAction(row: any, selectedItems: any[], selectedIds: any[]): void" },
    cutAction: { description: "Fired when the cut keyboard action is invoked.", signature: "cutAction(row: any, selectedItems: any[], selectedIds: any[]): void" },
    copyAction: { description: "Fired when the copy keyboard action is invoked.", signature: "copyAction(row: any, selectedItems: any[], selectedIds: any[]): void" },
    pasteAction: { description: "Fired when the paste keyboard action is invoked.", signature: "pasteAction(row: any, selectedItems: any[], selectedIds: any[]): void" },
    deleteAction: { description: "Fired when the delete keyboard action is invoked.", signature: "deleteAction(row: any, selectedItems: any[], selectedIds: any[]): void" },
  },
  apis: {
    getSelectedIds: { description: "Returns selected row IDs.", signature: "getSelectedIds(): any[]" },
    getSelectedItems: { description: "Returns selected row items.", signature: "getSelectedItems(): any[]" },
    clearSelection: { description: "Clears selection.", signature: "clearSelection(): void" },
    selectAll: { description: "Selects all rows.", signature: "selectAll(): void" },
  },
  contextVars: {
    $item: { description: "The complete data row object being rendered." },
    $itemIndex: { description: "Zero-based row index." },
    $cell: { description: "The value of the current cell." },
    $colIndex: { description: "Zero-based column index." },
    $row: { description: "The complete data row object being rendered." },
    $rowIndex: { description: "Zero-based row index." },
  },
  themeVars: extractScssThemeVars(tableStylesSource),
  defaultThemeVars: {
    "backgroundColor-Table": "$color-surface-0",
    "backgroundColor-header-Table": "$color-surface-100",
    "backgroundColor-heading-Table": "$backgroundColor-header-Table",
    "backgroundColor-row-Table": "$color-surface-0",
    "backgroundColor-row-Table--even": "$color-surface-50",
    "backgroundColor-evenRow-Table": "$backgroundColor-row-Table--even",
    "backgroundColor-oddRow-Table": "$backgroundColor-row-Table",
    "backgroundColor-row-Table--hover": "$color-surface-100",
    "backgroundColor-selected-Table": "$color-primary-100",
    "border-Table": "1px solid $color-border",
    "borderRadius-Table": "$borderRadius",
    "borderBottom-header-Table": "1px solid $color-border",
    "borderBottom-row-Table": "1px solid $color-border",
    "headerHeight-Table": "40px",
    "padding-TableCell": "8px 12px",
    "rowHeight-Table": "40px",
    "fontSize-checkbox-Table": "inherit",
    "textColor-Table": "$textColor-primary",
    "textColor-header-Table": "$textColor-primary",
    "textColor-empty-Table": "$textColor-secondary",
    "userSelectCell-Table": defaultProps.userSelectCell,
    "userSelectHeading-Table": defaultProps.userSelectHeading,
    "userSelectRow-Table": defaultProps.userSelectRow,
    "userSelect-cell-Table": "$userSelectCell-Table",
    "userSelect-heading-Table": "$userSelectHeading-Table",
    "userSelect-row-Table": "$userSelectRow-Table",
  },
});

export const tableRenderer = wrapComponent({
  name: COMP,
  metadata: TableMd,
  renderer: ({ adapter }) => {
    const items = adapter.prop("items") ?? adapter.prop("data");
    const columns = collectColumns(adapter.node);
    const noDataTemplate = templateChildren(adapter.node, "noDataTemplate");
    const noDataTemplateProp = adapter.prop("noDataTemplate");
    const refreshOn = adapter.prop("refreshOn");
    const cellTemplateCache = useRef(new Map<string, ReactNode>());
    const idKey = adapter.stringProp("idKey", defaultProps.idKey) ?? defaultProps.idKey;
    const syncWithVar = adapter.stringProp("syncWithVar");
    const syncValue = syncWithVar && validIdentifier(syncWithVar) && hasSyncTarget(adapter.scope, syncWithVar)
      ? readLocal(adapter.scope, syncWithVar)
      : undefined;
    const initialSelectedIds = syncValue && typeof syncValue === "object" && Array.isArray((syncValue as { selectedIds?: unknown }).selectedIds)
      ? (syncValue as { selectedIds: unknown[] }).selectedIds
      : arrayValue(adapter.prop("initiallySelected"));
    const apiRef = { current: null as TableApi | null };
    const emitRowEvent = (name: string, item: unknown, rowIndex: number) => {
      const rowScope = createRuntimeScope({
        store: adapter.scope.store,
        parent: adapter.scope,
        props: adapter.scope.props,
        contextValues: rowContext(item, rowIndex),
        references: adapter.scope.references,
        slots: adapter.scope.slots,
        emitEvent: adapter.scope.emitEvent,
      });
      return runEvent(adapter.node.parsed?.events?.[name], rowScope, [item]);
    };
    const renderCell = (item: unknown, rowIndex: number, column: TableColumnDefinition, colIndex: number) => {
      const columnNode = columnNodes(adapter.node)[colIndex];
      const templateChildrenForColumn = columnNode?.children ?? [];
      if (templateChildrenForColumn.length === 0) {
        return undefined;
      }
      const cell = column.bindTo && item && typeof item === "object"
        ? (item as Record<string, unknown>)[column.bindTo]
        : undefined;
      const parentScope = refreshOn === undefined ? adapter.scope : frozenReadScope(adapter.scope);
      const cellScope = createRuntimeScope({
        store: parentScope.store,
        parent: parentScope,
        props: adapter.scope.props,
        contextValues: {
          $item: item,
          $itemIndex: rowIndex,
          $row: item,
          $rowIndex: rowIndex,
          $cell: cell,
          $colIndex: colIndex,
        },
        references: adapter.scope.references,
        slots: adapter.scope.slots,
        emitEvent: adapter.scope.emitEvent,
      });
      const cacheKey = `${rowIndex}:${colIndex}:${String(refreshOn)}`;
      if (refreshOn !== undefined) {
        const cached = cellTemplateCache.current.get(cacheKey);
        if (cached !== undefined) {
          return cached;
        }
      }
      const rendered = (
        <span key={refreshOn === undefined ? `${rowIndex}:${colIndex}` : cacheKey}>
          {adapter.context.renderChildren(templateChildrenForColumn, cellScope)}
        </span>
      );
      if (refreshOn !== undefined) {
        cellTemplateCache.current.set(cacheKey, rendered);
      }
      return rendered;
    };
    return (
      <TableNative
        {...adapter.rootAttrs()}
        ref={(api) => {
          apiRef.current = api;
          if (api) {
            adapter.registerApi(api as unknown as Record<string, unknown>);
          }
        }}
        id={adapter.stringProp("id")}
        items={Array.isArray(items) ? items : []}
        columns={columns}
        idKey={idKey}
        loading={adapter.booleanProp("loading", defaultProps.loading)}
        rowsSelectable={adapter.booleanProp("rowsSelectable", defaultProps.rowsSelectable)}
        autoFocus={adapter.booleanProp("autoFocus", defaultProps.autoFocus)}
        isPaginated={optionalBoolean(adapter.prop("isPaginated"))}
        pageSize={adapter.numberProp("pageSize", 0)}
        alwaysShowPagination={optionalBoolean(adapter.prop("alwaysShowPagination"))}
        rowHeight={adapter.numberProp("rowHeight", defaultProps.rowHeight)}
        sortBy={adapter.stringProp("sortBy")}
        sortDirection={adapter.stringProp("sortDirection", defaultProps.sortingDirection)}
        enableMultiRowSelection={adapter.booleanProp("enableMultiRowSelection", defaultProps.enableMultiRowSelection)}
        toggleSelectionOnClick={adapter.booleanProp("toggleSelectionOnClick", defaultProps.toggleSelectionOnClick)}
        initiallySelected={initialSelectedIds}
        hideHeader={adapter.booleanProp("hideHeader", defaultProps.hideHeader)}
        hideSelectionCheckboxes={adapter.booleanProp("hideSelectionCheckboxes", defaultProps.hideSelectionCheckboxes)}
        hideSelectionCheckboxesHeader={adapter.booleanProp("hideSelectionCheckboxesHeader", defaultProps.hideSelectionCheckboxesHeader)}
        alwaysShowSelectionCheckboxes={adapter.booleanProp("alwaysShowSelectionCheckboxes", defaultProps.alwaysShowSelectionCheckboxes)}
        alwaysShowSortingIndicator={adapter.booleanProp("alwaysShowSortingIndicator", defaultProps.alwaysShowSortingIndicator)}
        checkboxTolerance={adapter.stringProp("checkboxTolerance", defaultProps.checkboxTolerance)}
        userSelectCell={adapter.stringProp("userSelectCell")}
        userSelectRow={adapter.stringProp("userSelectRow")}
        userSelectHeading={adapter.stringProp("userSelectHeading")}
        cellVerticalAlign={adapter.stringProp("cellVerticalAlign", defaultProps.cellVerticalAlign)}
        keyBindings={recordValue(adapter.prop("keyBindings"))}
        striped={adapter.booleanProp("striped", defaultProps.striped)}
        syncKey={syncWithVar && validIdentifier(syncWithVar) && hasSyncTarget(adapter.scope, syncWithVar) ? syncWithVar : undefined}
        rowDisabledPredicate={functionValue(adapter.prop("rowDisabledPredicate"))}
        rowUnselectablePredicate={functionValue(adapter.prop("rowUnselectablePredicate"))}
        emptyTemplate={noDataTemplate
          ? adapter.context.renderChildren(noDataTemplate, adapter.scope)
          : noDataTemplateProp === "" || noDataTemplateProp === null
            ? ""
            : undefined}
        renderCell={renderCell}
        onRowClick={(item) => void adapter.event("rowClick")(item)}
        onRowDoubleClick={(item) => void adapter.event("rowDoubleClick")(item)}
        onContextMenu={adapter.node.events.contextMenu ? ((item, rowIndex) => void emitRowEvent("contextMenu", item, rowIndex)) : undefined}
        onSelectionDidChange={(selectedItems) => {
          if (syncWithVar && validIdentifier(syncWithVar) && hasSyncTarget(adapter.scope, syncWithVar)) {
            const selectedIds = selectedItems.map((item) => rowId(item, idKey));
            writeLocal(adapter.scope, syncWithVar, { selectedIds });
          }
          void adapter.event("selectionDidChange")(selectedItems);
        }}
        onSelectAllAction={adapter.node.events.selectAllAction ? ((row, selectedItems, selectedIds) => void emitActionEvent("selectAllAction", row, selectedItems, selectedIds)) : undefined}
        onCutAction={adapter.node.events.cutAction ? ((row, selectedItems, selectedIds) => void emitActionEvent("cutAction", row, selectedItems, selectedIds)) : undefined}
        onCopyAction={adapter.node.events.copyAction ? ((row, selectedItems, selectedIds) => void emitActionEvent("copyAction", row, selectedItems, selectedIds)) : undefined}
        onPasteAction={adapter.node.events.pasteAction ? ((row, selectedItems, selectedIds) => void emitActionEvent("pasteAction", row, selectedItems, selectedIds)) : undefined}
        onDeleteAction={adapter.node.events.deleteAction ? ((row, selectedItems, selectedIds) => void emitActionEvent("deleteAction", row, selectedItems, selectedIds)) : undefined}
      />
    );

    function emitActionEvent(name: string, row: unknown, selectedItems: unknown[], selectedIds: unknown[]) {
      return runEvent(adapter.node.parsed?.events?.[name], adapter.scope, [row, selectedItems, selectedIds]);
    }
  },
});

function frozenReadScope(scope: RuntimeScope): RuntimeScope {
  const localSnapshots = new Map<string, Record<string, unknown>>();
  for (let current: RuntimeScope | undefined = scope; current; current = current.parent) {
    if (current.localOwnerId && !localSnapshots.has(current.localOwnerId)) {
      localSnapshots.set(current.localOwnerId, current.store.getLocalSnapshot(current.localOwnerId));
    }
  }
  const globalSnapshot = scope.store.getGlobalSnapshot();
  const store = scope.store;
  const frozenStore = new Proxy(store, {
    get(target, property, receiver) {
      if (property === "hasLocal") {
        return (ownerId: string | undefined, name: string) =>
          (!!ownerId && Object.prototype.hasOwnProperty.call(localSnapshots.get(ownerId), name)) ||
          target.hasLocal(ownerId, name);
      }
      if (property === "readLocal") {
        return (ownerId: string | undefined, name: string) => {
          if (ownerId && Object.prototype.hasOwnProperty.call(localSnapshots.get(ownerId), name)) {
            return localSnapshots.get(ownerId)?.[name];
          }
          return target.readLocal(ownerId, name);
        };
      }
      if (property === "hasGlobal") {
        return (name: string) =>
          Object.prototype.hasOwnProperty.call(globalSnapshot, name) || target.hasGlobal(name);
      }
      if (property === "readGlobal") {
        return (name: string) =>
          Object.prototype.hasOwnProperty.call(globalSnapshot, name)
            ? globalSnapshot[name]
            : target.readGlobal(name);
      }
      const value = Reflect.get(target, property, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
  return {
    ...scope,
    store: frozenStore,
    parent: scope.parent ? frozenReadScope(scope.parent) : undefined,
  };
}

function columnNodes(tableNode: XmluiElement): XmluiElement[] {
  return tableNode.children.filter((child): child is XmluiElement => child.kind === "element" && child.type === "Column");
}

function collectColumns(tableNode: XmluiElement): TableColumnDefinition[] {
  const seenIds = new Map<string, number>();
  return columnNodes(tableNode).map((column, index) => {
    const baseId = column.props.id ?? column.props.bindTo ?? `column-${index}`;
    const seenCount = seenIds.get(baseId) ?? 0;
    seenIds.set(baseId, seenCount + 1);
    return {
      id: seenCount === 0 ? baseId : `${baseId}-${seenCount}`,
      bindTo: column.props.bindTo,
      header: column.props.header,
      width: column.props.width,
      minWidth: column.props.minWidth,
      maxWidth: column.props.maxWidth,
      canSort: column.props.canSort === undefined ? true : column.props.canSort !== "false",
      canResize: column.props.canResize === undefined ? false : column.props.canResize !== "false",
      cellStyle: columnCellStyle(column),
    };
  });
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function functionValue(value: unknown): ((item: unknown) => unknown) | undefined {
  return typeof value === "function" ? value as (item: unknown) => unknown : undefined;
}

function recordValue(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

function optionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  return value === true || value === "true";
}

function rowContext(item: unknown, rowIndex: number): Record<string, unknown> {
  return {
    $item: item,
    $itemIndex: rowIndex,
    $row: item,
    $rowIndex: rowIndex,
  };
}

function columnCellStyle(column: XmluiElement): CSSProperties | undefined {
  const style: CSSProperties = {};
  const horizontalAlignment = column.props.horizontalAlignment;
  const verticalAlignment = column.props.verticalAlignment;
  const backgroundColor = column.props.backgroundColor;
  if (backgroundColor) {
    style.backgroundColor = backgroundColor;
  }
  if (horizontalAlignment) {
    style.display = "flex";
    style.justifyContent = horizontalAlignment === "start"
      ? "flex-start"
      : horizontalAlignment === "end"
        ? "flex-end"
        : String(horizontalAlignment) as CSSProperties["justifyContent"];
    style.textAlign = String(horizontalAlignment) as CSSProperties["textAlign"];
  }
  if (verticalAlignment) {
    style.display = "flex";
    style.alignItems = verticalAlignment === "start"
      ? "flex-start"
      : verticalAlignment === "end"
        ? "flex-end"
        : String(verticalAlignment) as CSSProperties["alignItems"];
    style.verticalAlign = verticalAlignment === "start"
      ? "top"
      : verticalAlignment === "end"
        ? "bottom"
        : String(verticalAlignment) as CSSProperties["verticalAlign"];
  }
  return Object.keys(style).length > 0 ? style : undefined;
}

function validIdentifier(value: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value);
}

function hasSyncTarget(scope: Parameters<typeof readLocal>[0], name: string): boolean {
  return hasLocalName(scope, name) || !!scope?.store.hasGlobal(name);
}

function rowId(item: unknown, idKey: string): unknown {
  if (!item || typeof item !== "object") {
    return item;
  }
  return idKey.split(".").reduce<unknown>((current, part) => {
    if (!current || typeof current !== "object") {
      return undefined;
    }
    return (current as Record<string, unknown>)[part];
  }, item) ?? item;
}

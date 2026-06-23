import type { XmluiElement } from "../../compiler/ir";
import { createMetadata, dComponent, dContextMenu, dInternal } from "../../component-core/metadata/helpers";
import { createRuntimeScope } from "../../runtime/state";
import { templateChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./Table.defaults";
import { TableNative, type TableApi } from "./TableReact";
import type { TableColumnDefinition } from "../Column/ColumnReact";

const COMP = "Table";

const tableStylesSource = `
$backgroundColor-Table: createThemeVar("backgroundColor-Table");
$backgroundColor-header-Table: createThemeVar("backgroundColor-header-Table");
$backgroundColor-row-Table: createThemeVar("backgroundColor-row-Table");
$backgroundColor-row-Table--even: createThemeVar("backgroundColor-row-Table--even");
$backgroundColor-row-Table--hover: createThemeVar("backgroundColor-row-Table--hover");
$backgroundColor-selected-Table: createThemeVar("backgroundColor-selected-Table");
$border-Table: createThemeVar("border-Table");
$borderRadius-Table: createThemeVar("borderRadius-Table");
$borderBottom-header-Table: createThemeVar("borderBottom-header-Table");
$borderBottom-row-Table: createThemeVar("borderBottom-row-Table");
$headerHeight-Table: createThemeVar("headerHeight-Table");
$padding-TableCell: createThemeVar("padding-TableCell");
$rowHeight-Table: createThemeVar("rowHeight-Table");
$textColor-Table: createThemeVar("textColor-Table");
$textColor-header-Table: createThemeVar("textColor-header-Table");
$textColor-empty-Table: createThemeVar("textColor-empty-Table");
$userSelectCell-Table: createThemeVar("userSelectCell-Table");
$userSelectHeading-Table: createThemeVar("userSelectHeading-Table");
$userSelectRow-Table: createThemeVar("userSelectRow-Table");
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
    loading: { description: "Shows loading state.", valueType: "boolean", defaultValue: defaultProps.loading },
    rowsSelectable: { description: "Whether rows are selectable.", valueType: "boolean", defaultValue: defaultProps.rowsSelectable },
    initiallySelected: { description: "Initially selected row IDs.", valueType: "any" },
    hideHeader: { description: "Hides the table header.", valueType: "boolean", defaultValue: defaultProps.hideHeader },
    hideSelectionCheckboxes: {
      description: "Hides row-selection checkboxes.",
      valueType: "boolean",
      defaultValue: defaultProps.hideSelectionCheckboxes,
    },
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
    "backgroundColor-row-Table": "$color-surface-0",
    "backgroundColor-row-Table--even": "$color-surface-50",
    "backgroundColor-row-Table--hover": "$color-surface-100",
    "backgroundColor-selected-Table": "$color-primary-100",
    "border-Table": "1px solid $color-border",
    "borderRadius-Table": "$borderRadius",
    "borderBottom-header-Table": "1px solid $color-border",
    "borderBottom-row-Table": "1px solid $color-border",
    "headerHeight-Table": "40px",
    "padding-TableCell": "8px 12px",
    "rowHeight-Table": "40px",
    "textColor-Table": "$textColor-primary",
    "textColor-header-Table": "$textColor-primary",
    "textColor-empty-Table": "$textColor-secondary",
    "userSelectCell-Table": defaultProps.userSelectCell,
    "userSelectHeading-Table": defaultProps.userSelectHeading,
    "userSelectRow-Table": defaultProps.userSelectRow,
  },
});

export const tableRenderer = wrapComponent({
  name: COMP,
  metadata: TableMd,
  renderer: ({ adapter }) => {
    const items = adapter.prop("items") ?? adapter.prop("data");
    const columns = collectColumns(adapter.node);
    const noDataTemplate = templateChildren(adapter.node, "noDataTemplate");
    const apiRef = { current: null as TableApi | null };
    const renderCell = (item: unknown, rowIndex: number, column: TableColumnDefinition, colIndex: number) => {
      const columnNode = columnNodes(adapter.node)[colIndex];
      const templateChildrenForColumn = columnNode?.children ?? [];
      if (templateChildrenForColumn.length === 0) {
        return undefined;
      }
      const cell = column.bindTo && item && typeof item === "object"
        ? (item as Record<string, unknown>)[column.bindTo]
        : undefined;
      const cellScope = createRuntimeScope({
        store: adapter.scope.store,
        parent: adapter.scope,
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
      return adapter.context.renderChildren(templateChildrenForColumn, cellScope);
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
        idKey={adapter.stringProp("idKey", defaultProps.idKey)}
        loading={adapter.booleanProp("loading", defaultProps.loading)}
        rowsSelectable={adapter.booleanProp("rowsSelectable", defaultProps.rowsSelectable)}
        enableMultiRowSelection={adapter.booleanProp("enableMultiRowSelection", defaultProps.enableMultiRowSelection)}
        initiallySelected={arrayValue(adapter.prop("initiallySelected"))}
        hideHeader={adapter.booleanProp("hideHeader", defaultProps.hideHeader)}
        hideSelectionCheckboxes={adapter.booleanProp("hideSelectionCheckboxes", defaultProps.hideSelectionCheckboxes)}
        emptyTemplate={noDataTemplate ? adapter.context.renderChildren(noDataTemplate, adapter.scope) : undefined}
        renderCell={renderCell}
        onSelectionDidChange={(selectedItems) => void adapter.event("selectionDidChange")(selectedItems)}
      />
    );
  },
});

function columnNodes(tableNode: XmluiElement): XmluiElement[] {
  return tableNode.children.filter((child): child is XmluiElement => child.kind === "element" && child.type === "Column");
}

function collectColumns(tableNode: XmluiElement): TableColumnDefinition[] {
  return columnNodes(tableNode).map((column, index) => ({
    id: column.props.id ?? column.props.bindTo ?? `column-${index}`,
    bindTo: column.props.bindTo,
    header: column.props.header,
    width: column.props.width,
    minWidth: column.props.minWidth,
    maxWidth: column.props.maxWidth,
    canSort: column.props.canSort === undefined ? true : column.props.canSort !== "false",
  }));
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

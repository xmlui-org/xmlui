import { forwardRef, useMemo, useRef, useState, memo, useId } from "react";
import produce from "immer";

import styles from "./Table.module.scss";

import "./react-table-config.d.ts";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { EMPTY_ARRAY, EMPTY_OBJECT } from "../../components-core/constants";
import { createMetadata, d, dAutoFocus, dComponent, dContextMenu, dInternal } from "../metadata-helpers";
import type { OurColumnMetadata } from "../Column/TableContext";
import { TableContext } from "../Column/TableContext";
import {
  StandaloneSelectionStore,
  useSelectionContext,
} from "../SelectionStore/SelectionStoreNative";
import {
  Table,
  TablePaginationControlsLocationValues,
  CheckboxToleranceValues,
  defaultProps,
} from "./TableNative";
import type { RendererContext } from "../../abstractions/RendererDefs";
import { PositionValues } from "../Pagination/PaginationNative";
import type { PropertyValueDescription } from "../../abstractions/ComponentDefs";

const COMP = "Table";

const userSelectValues: PropertyValueDescription[] = [
  { value: "auto", description: "Default text selection behavior" },
  { value: "text", description: "Text can be selected by the user" },
  { value: "none", description: "Text cannot be selected" },
  { value: "contain", description: "Selection is contained within this element" },
  { value: "all", description: "The entire element content is selected as one unit" },
];

export const TableMd = createMetadata({
  status: "stable",
  description: "`Table` presents structured data for viewing, sorting, selection, and interaction.",
  // NOTE: let's leave it like this for now, we'll expand later when the need arises
  parts: {
    table: {
      description: "The main table container.",
    },
    pagination: {
      description: "The pagination controls container.",
    },
  },
  props: {
    items: dInternal(
      `You can use \`items\` as an alias for the \`data\` property. ` +
        `When you bind the table to a data source (e.g. an API endpoint), ` +
        `the \`data\` acts as the property that accepts a URL to fetch information from an API. ` +
        `When both \`items\` and \`data\` are used, \`items\` has priority.`,
    ),
    data: d(
      `The component receives data via this property. The \`data\` property is a list of items ` +
        `that the \`Table\` can display.`,
    ),
    idKey: {
      description:
        `This property is used to specify the unique ID property in the data array. ` +
        `If the idKey points to a property that does not exist in the data items, ` +
        `that will result in incorrect behavior when using selectable rows.`,
      valueType: "string",
      defaultValue: defaultProps.idKey,
    },
    isPaginated: {
      description: `This property adds pagination controls to the \`${COMP}\`.`,
      valueType: "boolean",
      defaultValue: defaultProps.isPaginated,
    },
    loading: d(
      `This boolean property indicates if the component is fetching (or processing) data. This ` +
        `property is useful when data is loaded conditionally or receiving it takes some time.`,
    ),
    headerHeight: d(`This optional property is used to specify the height of the table header.`),
    rowsSelectable: d(`Indicates whether the rows are selectable (\`true\`) or not (\`false\`).`),
    initiallySelected: d(
      `An array of IDs that should be initially selected when the table is rendered. ` +
        `This property only has an effect when the rowsSelectable property is set to \`true\`.`,
    ),
    syncWithAppState: d(
      `An AppState instance to synchronize the table's selection state with. The table will ` +
        `read from and write to the 'selectedIds' property of the AppState object. When provided, ` +
        `this takes precedence over the initiallySelected property for initial selection. ` +
        `You can use the AppState's didUpdate event to receive notifications when the selection changes.`,
    ),
    pageSize: d(
      `This property defines the number of rows to display per page when pagination is enabled.`,
    ),
    pageSizeOptions: {
      description:
        "This property holds an array of page sizes (numbers) the user can select for " +
        "pagination. If this property is not defined, the component allows only a page size of 10 items.",
    },
    showPageInfo: d(
      "Whether to show page information. It works the same as the [Pagination component property](./Pagination#showpageinfo).",
      undefined,
      "boolean",
      defaultProps.showPageInfo,
    ),
    showPageSizeSelector: d(
      "Whether to show the page size selector. It works the same as the [Pagination component property](./Pagination#showpagesizeselector).",
      undefined,
      "boolean",
      defaultProps.showPageSizeSelector,
    ),
    showCurrentPage: d(
      "Whether to show the current page indicator. It works the same as the [Pagination component property](./Pagination#showcurrentpage).",
      undefined,
      "boolean",
      defaultProps.showCurrentPage,
    ),
    pageSizeSelectorPosition: {
      description:
        "Determines where to place the page size selector in the layout. " +
        "It works the same as the [Pagination component property](./Pagination#pagesizeselectorposition).",
      options: PositionValues,
      type: "string",
      default: defaultProps.pageSizeSelectorPosition,
    },
    pageInfoPosition: {
      description:
        "Determines where to place the page information in the layout. " +
        "It works the same as the [Pagination component property](./Pagination#pageinfoposition).",
      options: PositionValues,
      type: "string",
      default: defaultProps.pageInfoPosition,
    },
    buttonRowPosition: d(
      "Determines where to place the pagination button row in the layout. " +
        "It works the same as the [Pagination component property](./Pagination#buttonrowposition).",
      PositionValues,
      "string",
      defaultProps.buttonRowPosition,
    ),
    rowDisabledPredicate: d(
      `This property defines a predicate function with a return value that determines if the ` +
        `row should be disabled. The function retrieves the item to display and should return ` +
        `a Boolean-like value.`,
    ),
    rowUnselectablePredicate: {
      description: `This property defines a predicate function with a return value that determines if the ` +
        `row should be unselectable. The function retrieves the item to display and should return ` +
        `a Boolean-like value. This property only has an effect when the \`rowsSelectable\` property is set to \`true\`.`,
    },
    noDataTemplate: dComponent(
      `A property to customize what to display if the table does not contain any data.`,
    ),
    sortBy: d(
      "This property is used to determine which data property to sort by. If not defined, " +
        "the data is not sorted",
    ),
    sortDirection: d(
      "This property determines the sort order to be \`ascending\` or \`descending\`. This " +
        "property only works if the [\`sortBy\`](#sortby) property is also set. By default " +
        "ascending order is used.",
    ),
    autoFocus: dAutoFocus(),
    hideHeader: {
      description:
        "Set the header visibility using this property. Set it to \`true\` to hide the header.",
      valueType: "boolean",
      defaultValue: defaultProps.hideHeader,
    },
    hideSelectionCheckboxes: {
      description:
        "If true, hides selection checkboxes for both rows and header. Selection logic still works via API and keyboard.",
      valueType: "boolean",
      defaultValue: false,
    },
    iconNoSort: d(
      `Allows setting an alternate icon displayed in the ${COMP} column header when sorting is ` +
        `enabled, but the column remains unsorted. You can change the default icon for all ${COMP} ` +
        `instances with the "icon.nosort:Table" declaration in the app configuration file.`,
    ),
    iconSortAsc: d(
      `Allows setting an alernate icon displayed in the ${COMP} column header when sorting is enabled, ` +
        `and the column is sorted in ascending order. You can change the default icon for all ${COMP} ` +
        `instances with the "icon.sortasc:Table" declaration in the app configuration file.`,
    ),
    iconSortDesc: d(
      `Allows setting an alternate icon displayed in the ${COMP} column header when sorting is enabled, ` +
        `and the column is sorted in descending order. You can change the default icon for all ${COMP} ` +
        `instances with the "icon.sortdesc:Table" declaration in the app configuration file.`,
    ),
    enableMultiRowSelection: {
      description:
        `This boolean property indicates whether you can select multiple rows in the table. ` +
        `This property only has an effect when the rowsSelectable property is set. Setting it ` +
        `to \`false\` limits selection to a single row.`,
      valueType: "boolean",
      defaultValue: defaultProps.enableMultiRowSelection,
    },
    alwaysShowSelectionHeader: {
      description:
        "This property indicates when the row selection header is displayed. When the value is " +
        "`true,` the selection header is always visible. Otherwise, it is displayed only " +
        "when hovered.",
      valueType: "boolean",
      defaultValue: defaultProps.alwaysShowSelectionHeader,
    },
    alwaysShowSortingIndicator: {
      description:
        `This property indicates whether the sorting indicator is always visible in the column ` +
        `headers. When set to \`true\`, the sorting indicator is always visible. Otherwise, it is ` +
        `visible only when the user hovers over/focuses the column header or the column is sorted.`,
      valueType: "boolean",
      defaultValue: defaultProps.alwaysShowSortingIndicator,
    },
    noBottomBorder: {
      description:
        `This property indicates whether the table should have a bottom border. When set to ` +
        `\`true\`, the table does not have a bottom border. Otherwise, it has a bottom border.`,
      valueType: "boolean",
      defaultValue: defaultProps.noBottomBorder,
    },
    paginationControlsLocation: {
      description:
        `This property determines the location of the pagination controls.` +
        ` It can be set to \`top\`, \`bottom\`, or \`both\`.`,
      valueType: "string",
      availableValues: TablePaginationControlsLocationValues,
      defaultValue: defaultProps.paginationControlsLocation,
    },
    alwaysShowPagination: {
      description:
        `This property explicitly toggles pagination controls visibility. ` +
        `If set to \`true\`, controls are always shown even if there is only one page. ` +
        `If set to \`false\`, controls are hidden. ` +
        `If omitted, controls are hidden when there is only one page and shown otherwise. ` +
        `This property only has effect when pagination is enabled. ` +
        `It acts as an alias for showPaginationControls.`,
      valueType: "boolean",
    },
    cellVerticalAlign: {
      description:
        `This property controls the vertical alignment of cell content. ` +
        `It can be set to \`top\`, \`center\`, or \`bottom\`.`,
      valueType: "string",
      availableValues: ["top", "center", "bottom"],
      defaultValue: defaultProps.cellVerticalAlign,
    },
    checkboxTolerance: {
      description:
        `This property controls the tolerance area around checkboxes for easier interaction. ` +
        `This property only has an effect when the rowsSelectable property is set to \`true\`. ` +
        `\`none\` provides no tolerance (0px), \`compact\` provides minimal tolerance (8px), ` +
        `\`comfortable\` provides medium tolerance (12px), and \`spacious\` provides generous tolerance (16px) ` +
        `for improved accessibility.`,
      valueType: "string",
      availableValues: CheckboxToleranceValues,
      defaultValue: defaultProps.checkboxTolerance,
    },
    userSelectCell: {
      description:
        `This property controls whether users can select text within table cells. ` +
        `Use \`text\` to allow text selection, \`none\` to prevent selection, or \`auto\` for default behavior.`,
      valueType: "string",
      availableValues: userSelectValues,
      defaultValue: defaultProps.userSelectCell,
    },
    userSelectRow: {
      description:
        `This property controls whether users can select text within table rows. ` +
        `Use \`text\` to allow text selection, \`none\` to prevent selection, or \`auto\` for default behavior.`,
      valueType: "string",
      availableValues: userSelectValues,
      defaultValue: defaultProps.userSelectRow,
    },
    userSelectHeading: {
      description:
        `This property controls whether users can select text within table headings. ` +
        `Use \`text\` to allow text selection, \`none\` to prevent selection, or \`auto\` for default behavior.`,
      valueType: "string",
      availableValues: userSelectValues,
      defaultValue: defaultProps.userSelectHeading,
    },
    keyBindings: {
      description:
        "This property defines keyboard shortcuts for table actions. Provide an object with " +
        "action names as keys and keyboard shortcut strings as values. The shortcut strings use " +
        "Electron accelerator syntax (e.g., 'CmdOrCtrl+A', 'Delete'). Available actions: " +
        "\`selectAll\`, \`cut\`, \`copy\`, \`paste\`, \`delete\`. If not provided, default shortcuts are used.",
      valueType: "any",
    },
  },
  events: {
    contextMenu: dContextMenu(COMP),
    sortingDidChange: {
      description:
        `This event is fired when the table data sorting has changed. It has two arguments: ` +
        `the column's name and the sort direction. When the column name is empty, the table ` +
        `displays the data list as it received it.`,
      signature: "sortingDidChange(columnName: string, sortDirection: 'asc' | 'desc' | null): void",
      parameters: {
        columnName: "The name of the column being sorted.",
        sortDirection: "The sort direction: 'asc' for ascending, 'desc' for descending, or null for unsorted.",
      },
    },
    willSort: {
      description:
        `This event is fired before the table data is sorted. It has two arguments: the ` +
        `column's name and the sort direction. When the method returns a literal \`false\` ` +
        `value (and not any other falsy one), the method indicates that the sorting should be aborted.`,
      signature: "willSort(columnName: string, sortDirection: 'asc' | 'desc'): boolean | void",
      parameters: {
        columnName: "The name of the column about to be sorted.",
        sortDirection: "The intended sort direction: 'asc' for ascending or 'desc' for descending.",
      },
    },
    rowDoubleClick: {
      description: `This event is fired when the user double-clicks a table row. The handler receives the clicked row item as its only argument.`,
      signature: "rowDoubleClick(item: any): void",
      parameters: {
        item: "The clicked table row item.",
      },
    },
    selectionDidChange: {
      description:
        `This event is triggered when the table's current selection (the rows selected) changes. ` +
        `Its parameter is an array of the selected table row items. `,
      signature: "selectionDidChange(selectedItems: any[]): void",
      parameters: {
        selectedItems: "An array of the selected table row items.",
      },
    },
    selectAllAction: {
      description:
        `This event is triggered when the user presses the select all keyboard shortcut ` +
        `(default: Ctrl+A/Cmd+A) and \`rowsSelectable\` is set to \`true\`. The component ` +
        `automatically selects all rows before invoking this handler. The handler receives ` +
        `three parameters: the currently focused row (if any), all selected items, and all selected IDs.`,
      signature: "selectAll(row: TableRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>",
      parameters: {
        row: "The currently focused row context, or null if no row is focused. Contains item data, row index, row ID, and selection state.",
        selectedItems: "Array of all selected row items. When selectAll is triggered, this contains all table rows.",
        selectedIds: "Array of all selected row IDs (as strings). When selectAll is triggered, this contains all row IDs.",
      },
    },
    cutAction: {
      description:
        `This event is triggered when the user presses the cut keyboard shortcut ` +
        `(default: Ctrl+X/Cmd+X) and \`rowsSelectable\` is set to \`true\`. The handler receives ` +
        `three parameters: the focused row, selected items, and selected IDs. Note: The component ` +
        `does not automatically modify data; the handler must implement the cut logic (e.g., ` +
        `copying data to clipboard and removing from the data source).`,
      signature: "cut(row: TableRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>",
      parameters: {
        row: "The currently focused row context, or null if no row is focused.",
        selectedItems: "Array of selected row items.",
        selectedIds: "Array of selected row IDs (as strings).",
      },
    },
    copyAction: {
      description:
        `This event is triggered when the user presses the copy keyboard shortcut ` +
        `(default: Ctrl+C/Cmd+C) and \`rowsSelectable\` is set to \`true\`. The handler receives ` +
        `three parameters: the focused row, selected items, and selected IDs. The handler should ` +
        `implement the copy logic (e.g., using the Clipboard API to copy selected data).`,
      signature: "copy(row: TableRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>",
      parameters: {
        row: "The currently focused row context, or null if no row is focused.",
        selectedItems: "Array of selected row items.",
        selectedIds: "Array of selected row IDs (as strings).",
      },
    },
    pasteAction: {
      description:
        `This event is triggered when the user presses the paste keyboard shortcut ` +
        `(default: Ctrl+V/Cmd+V) and \`rowsSelectable\` is set to \`true\`. The handler receives ` +
        `three parameters: the focused row, selected items, and selected IDs. The handler must ` +
        `implement the paste logic (e.g., reading from clipboard and inserting data into the table).`,
      signature: "paste(row: TableRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>",
      parameters: {
        row: "The currently focused row context, or null if no row is focused.",
        selectedItems: "Array of selected row items.",
        selectedIds: "Array of selected row IDs (as strings).",
      },
    },
    deleteAction: {
      description:
        `This event is triggered when the user presses the delete keyboard shortcut ` +
        `(default: Delete key) and \`rowsSelectable\` is set to \`true\`. The handler receives ` +
        `three parameters: the focused row, selected items, and selected IDs. Note: The component ` +
        `does not automatically remove data; the handler must implement the delete logic (e.g., ` +
        `removing selected items from the data source).`,
      signature: "delete(row: TableRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>",
      parameters: {
        row: "The currently focused row context, or null if no row is focused.",
        selectedItems: "Array of selected row items.",
        selectedIds: "Array of selected row IDs (as strings).",
      },
    },
  },
  apis: {
    clearSelection: {
      description: `This method clears the list of currently selected table rows.`,
      signature: "clearSelection(): void",
    },
    getSelectedItems: {
      description: `This method returns the list of currently selected table rows items.`,
      signature: "getSelectedItems(): Array<TableRowItem>",
    },
    getSelectedIds: {
      description: `This method returns the list of currently selected table rows IDs.`,
      signature: "getSelectedIds(): Array<string>",
    },
    selectAll: {
      description:
        `This method selects all the rows in the table. This method has no effect if the ` +
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
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`padding-heading-${COMP}`]: `$space-2 $space-1 $space-2 $space-2`,
    [`padding-cell-${COMP}`]: "$space-2 $space-1 $space-2 $space-2",
    [`paddingHorizontal-cell-first-${COMP}`]: "$space-5",
    [`paddingHorizontal-cell-last-${COMP}`]: "$space-1",
    [`border-cell-${COMP}`]: "1px solid $borderColor",
    [`outlineWidth-heading-${COMP}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-heading-${COMP}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-heading-${COMP}--focus`]: "$outlineOffset--focus",
    [`outlineColor-heading-${COMP}--focus`]: "$outlineColor--focus",
    [`fontSize-heading-${COMP}`]: "$fontSize-tiny",
    [`fontWeight-heading-${COMP}`]: "$fontWeight-bold",
    [`textTransform-heading-${COMP}`]: "uppercase",
    [`fontSize-row-${COMP}`]: "$fontSize-sm",
    // [`backgroundColor-${COMP}`]: "transparent",
    // [`backgroundColor-row-${COMP}`]: "inherit",
    [`backgroundColor-selected-${COMP}--hover`]: `$backgroundColor-row-${COMP}--hover`,
    [`backgroundColor-pagination-${COMP}`]: `$backgroundColor-${COMP}`,
    [`textColor-pagination-${COMP}`]: "$color-secondary",
    [`backgroundColor-row-${COMP}--hover`]: "$color-primary-50",
    [`backgroundColor-selected-${COMP}`]: "$color-primary-100",
    [`backgroundColor-heading-${COMP}--hover`]: "$color-surface-200",
    [`backgroundColor-heading-${COMP}--active`]: "$color-surface-300",
    [`backgroundColor-heading-${COMP}`]: "$color-surface-100",
    [`textColor-heading-${COMP}`]: "$color-surface-500",
    [`border-${COMP}`]: "0px solid transparent",
    [`borderBottom-last-row-${COMP}`]: `$borderBottom-cell-${COMP}`,
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`userSelect-heading-${COMP}`]: "text",
    [`userSelect-cell-${COMP}`]: "none",
    [`userSelect-row-${COMP}`]: "none",
  },
});

const TableWithColumns = memo(
  forwardRef(
    (
      {
        extractValue,
        node,
        renderChild,
        lookupEventHandler,
        lookupSyncCallback,
        className,
        registerComponentApi,
      }: Pick<
        RendererContext,
        | "extractValue"
        | "node"
        | "renderChild"
        | "lookupEventHandler"
        | "className"
        | "registerComponentApi"
        | "lookupSyncCallback"
      >,
      ref,
    ) => {
      const idKey = extractValue.asOptionalString(node.props.idKey, defaultProps.idKey);
      const data = extractValue(node.props.items) || extractValue(node.props.data);
      const [columnIds, setColumnIds] = useState(EMPTY_ARRAY);
      const [columnsByIds, setColumnByIds] = useState(EMPTY_OBJECT);
      const columnIdsRef = useRef([]);
      const [tableKey, setTableKey] = useState(0);
      const tableContextValue = useMemo(() => {
        return {
          registerColumn: (column: OurColumnMetadata, id: string) => {
            setColumnIds(
              produce((draft) => {
                const existing = draft.findIndex((colId) => colId === id);
                if (existing < 0) {
                  draft.push(id);
                }
              }),
            );
            setColumnByIds(
              produce((draft) => {
                draft[id] = column;
              }),
            );
          },
          unRegisterColumn: (id: string) => {
            setColumnIds(
              produce((draft) => {
                return draft.filter((colId) => colId !== id);
              }),
            );
            setColumnByIds(
              produce((draft) => {
                delete draft[id];
              }),
            );
          },
        };
      }, []);
      const columnRefresherContextValue = useMemo(() => {
        return {
          registerColumn: (column: OurColumnMetadata, id: string) => {
            if (!columnIdsRef.current.find((colId) => colId === id)) {
              setTableKey((prev) => prev + 1);
              columnIdsRef.current.push(id);
            }
          },
          unRegisterColumn: (id: string) => {
            if (columnIdsRef.current.find((colId) => colId === id)) {
              columnIdsRef.current = columnIdsRef.current.filter((colId) => colId !== id);
              setTableKey((prev) => prev + 1);
            }
          },
        };
      }, []);

      const columns = useMemo(
        () => columnIds.map((colId) => columnsByIds[colId]),
        [columnIds, columnsByIds],
      );

      const selectionContext = useSelectionContext();

      const tableContent = (
        <>
          {/* HACK: we render the column children twice, once in a context (with the key: 'tableKey') where we register the columns,
            and once in a context where we refresh the columns (by forcing the first context to re-mount, via the 'tableKey').
            This way the order of the columns is preserved.
        */}
          <TableContext.Provider value={tableContextValue} key={tableKey}>
            {renderChild(node.children)}
          </TableContext.Provider>
          <TableContext.Provider value={columnRefresherContextValue}>
            {renderChild(node.children)}
          </TableContext.Provider>
          <Table
            className={className}
            ref={ref}
            data={data}
            columns={columns}
            pageSizeOptions={extractValue(node.props.pageSizeOptions)}
            pageSize={extractValue.asOptionalNumber(node.props.pageSize)}
            rowsSelectable={extractValue.asOptionalBoolean(node.props.rowsSelectable)}
            registerComponentApi={registerComponentApi}
            noDataRenderer={
              node.props.noDataTemplate &&
              (() => {
                return renderChild(node.props.noDataTemplate);
              })
            }
            hideNoDataView={node.props.noDataTemplate === null || node.props.noDataTemplate === ""}
            loading={extractValue.asOptionalBoolean(node.props.loading)}
            isPaginated={extractValue.asOptionalBoolean(node.props?.isPaginated)}
            headerHeight={extractValue.asSize(node.props.headerHeight)}
            rowDisabledPredicate={lookupSyncCallback(node.props.rowDisabledPredicate)}
            rowUnselectablePredicate={lookupSyncCallback(node.props.rowUnselectablePredicate)}
            sortBy={extractValue(node.props?.sortBy)}
            sortingDirection={extractValue(node.props?.sortDirection)}
            iconSortAsc={extractValue.asOptionalString(node.props?.iconSortAsc)}
            iconSortDesc={extractValue.asOptionalString(node.props?.iconSortDesc)}
            iconNoSort={extractValue.asOptionalString(node.props?.iconNoSort)}
            onContextMenu={lookupEventHandler("contextMenu")}
            sortingDidChange={lookupEventHandler("sortingDidChange")}
            onSelectionDidChange={lookupEventHandler("selectionDidChange")}
            willSort={lookupEventHandler("willSort")}
            rowDoubleClick={lookupEventHandler("rowDoubleClick")}
            onSelectAllAction={lookupEventHandler("selectAllAction")}
            onCutAction={lookupEventHandler("cutAction")}
            onCopyAction={lookupEventHandler("copyAction")}
            onPasteAction={lookupEventHandler("pasteAction")}
            onDeleteAction={lookupEventHandler("deleteAction")}
            uid={node.uid}
            autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
            hideHeader={extractValue.asOptionalBoolean(node.props.hideHeader)}
            enableMultiRowSelection={extractValue.asOptionalBoolean(
              node.props.enableMultiRowSelection,
            )}
            alwaysShowSelectionHeader={extractValue.asOptionalBoolean(
              node.props.alwaysShowSelectionHeader,
            )}
            alwaysShowSortingIndicator={extractValue.asOptionalBoolean(
              node.props.alwaysShowSortingIndicator,
            )}
            noBottomBorder={extractValue.asOptionalBoolean(node.props.noBottomBorder)}
            paginationControlsLocation={extractValue.asOptionalString(
              node.props.paginationControlsLocation,
            )}
            alwaysShowPagination={extractValue.asOptionalBoolean(
              node.props.alwaysShowPagination,
            )}
            cellVerticalAlign={extractValue.asOptionalString(node.props.cellVerticalAlign)}
            buttonRowPosition={extractValue.asOptionalString(node.props.buttonRowPosition)}
            pageSizeSelectorPosition={extractValue.asOptionalString(
              node.props.pageSizeSelectorPosition,
            )}
            pageInfoPosition={extractValue.asOptionalString(node.props.pageInfoPosition)}
            showCurrentPage={extractValue.asOptionalBoolean(node.props.showCurrentPage)}
            showPageInfo={extractValue.asOptionalBoolean(node.props.showPageInfo)}
            showPageSizeSelector={extractValue.asOptionalBoolean(node.props.showPageSizeSelector)}
            checkboxTolerance={extractValue.asOptionalString(node.props.checkboxTolerance)}
            initiallySelected={extractValue(node.props.initiallySelected)}
            syncWithAppState={extractValue(node.props.syncWithAppState)}
            userSelectCell={extractValue.asOptionalString(node.props.userSelectCell)}
            userSelectRow={extractValue.asOptionalString(node.props.userSelectRow)}
            userSelectHeading={extractValue.asOptionalString(node.props.userSelectHeading)}
            hideSelectionCheckboxes={extractValue.asOptionalBoolean(node.props.hideSelectionCheckboxes)}
            keyBindings={extractValue(node.props.keyBindings)}
          />
        </>
      );

      if (selectionContext === null) {
        return <StandaloneSelectionStore idKey={idKey}>{tableContent}</StandaloneSelectionStore>;
      }
      return tableContent;
    },
  ),
);
TableWithColumns.displayName = "TableWithColumns";

export const tableComponentRenderer = createComponentRenderer(
  COMP,
  TableMd,
  ({
    extractValue,
    node,
    renderChild,
    lookupEventHandler,
    lookupSyncCallback,
    className,
    registerComponentApi,
  }) => {
    return (
      <TableWithColumns
        node={node}
        extractValue={extractValue}
        lookupEventHandler={lookupEventHandler as any}
        lookupSyncCallback={lookupSyncCallback}
        className={className}
        renderChild={renderChild}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);

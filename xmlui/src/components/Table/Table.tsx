import { forwardRef, useMemo, useRef, useState, memo, startTransition } from "react";
import produce from "immer";

import styles from "./Table.module.scss";

import "./react-table-config.d.ts";
import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { EMPTY_ARRAY, EMPTY_OBJECT } from "../../components-core/constants";
import {
  createMetadata,
  d,
  dAutoFocus,
  dComponent,
  dContextMenu,
  dInternal,
} from "../metadata-helpers";
import { useEvent } from "../../components-core/utils/misc";
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
import type { RendererContext, LayoutContext } from "../../abstractions/RendererDefs";
import { createChildLayoutContext } from "../../abstractions/layout-context-utils";
import { PositionValues } from "../Pagination/Pagination";
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
      description:
        `This property adds pagination controls to the \`${COMP}\`. ` +
        `When enabled, the pagination bar is automatically hidden if all rows fit on a single page. ` +
        `You can omit this property and set only \`pageSize\` instead — pagination will then ` +
        `activate automatically when the data length exceeds the page size and hide itself when it does not.`,
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
    syncWithVar: d(
      `The name of a global variable to synchronize the table's selection state with. ` +
        `The named variable must reference an object; the table will read from and write to its ` +
        `'selectedIds' property. When provided, this takes precedence over both ` +
        `\`initiallySelected\` and \`syncWithAppState\`. Multiple tables sharing the same variable ` +
        `name will keep their selections in sync automatically. ` +
        `A runtime error is signalled if the value is not a valid JavaScript variable name.`,
    ),
    pageSize: d(
      `This property defines the number of rows to display per page. ` +
        `When set without also setting \`isPaginated\`, pagination is activated automatically ` +
        `whenever the number of data rows exceeds this value and suppressed otherwise. ` +
        `This makes \`pageSize\` the minimal way to get auto-activating, auto-hiding pagination: ` +
        `no conditional expressions on \`isPaginated\` or the position props are needed.`,
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
      description:
        `This property defines a predicate function with a return value that determines if the ` +
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
    hideSelectionCheckboxesHeader: {
      description:
        "If true, the selection checkbox in the table header is never displayed, not even on hover. " +
        "Row checkboxes are unaffected. Selection logic still works via API and keyboard.",
      valueType: "boolean",
      defaultValue: defaultProps.hideSelectionCheckboxesHeader,
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
    toggleSelectionOnClick: {
      description:
        "When `true`, a plain click toggles the row's selection state instead of replacing the " +
        "current selection. Ctrl+Click and Shift+Click behavior is unchanged. " +
        "Only has an effect when `rowsSelectable` is `true`.",
      valueType: "boolean",
      defaultValue: defaultProps.toggleSelectionOnClick,
    },
    alwaysShowSelectionCheckboxesHeader: {
      description:
        "This property indicates when the row selection header is displayed. When the value is " +
        "`true,` the selection header is always visible. Otherwise, it is displayed only " +
        "when hovered.",
      valueType: "boolean",
      defaultValue: defaultProps.alwaysShowSelectionCheckboxesHeader,
    },
    alwaysShowSelectionCheckboxes: {
      description:
        "When set to `true`, selection checkboxes are always visible for all rows instead of " +
        "appearing only on hover. Has no effect when `hideSelectionCheckboxes` is `true` or " +
        "when row selection is disabled.",
      valueType: "boolean",
      defaultValue: defaultProps.alwaysShowSelectionCheckboxes,
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
    refreshOn: d(
      `An expression whose value change forces all table rows and cells to re-render. ` +
        `Use this to ensure that closure variables bound in row or cell templates are updated when ` +
        `global state changes (e.g. \`{selectMode}\`). Without this, virtualized rows might retain ` +
        `stale references to global variables for performance reasons.`,
    ),
    headerUserSelect: {
      description: `This property controls whether users can select text within table headers.`,
      valueType: "string",
      availableValues: userSelectValues,
      defaultValue: "text",
    },
    cellUserSelect: {
      description: `This property controls whether users can select text within table cells.`,
      valueType: "string",
      availableValues: userSelectValues,
      defaultValue: "none",
    },
    userSelectCell: {
      description: `This property controls whether users can select text within table cells.`,
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
    alwaysShowHeader: {
      description:
        "This property indicates whether the table header is always visible when scrolling and no height is specified. " +
        "When set to \`true\`, the header is sticky and always visible on page scroll. " +
        "Otherwise, it scrolls with the content and may not be visible when scrolled down.",
      valueType: "boolean",
      defaultValue: defaultProps.alwaysShowHeader,
    },
    striped: {
      description:
        "When set to `true`, the table rows alternate between the `backgroundColor-evenRow-Table` " +
        "and `backgroundColor-oddRow-Table` theme variables, creating a striped appearance.",
      valueType: "boolean",
      defaultValue: defaultProps.striped,
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
        sortDirection:
          "The sort direction: 'asc' for ascending, 'desc' for descending, or null for unsorted.",
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
      signature:
        "selectAll(row: TableRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>",
      parameters: {
        row: "The currently focused row context, or null if no row is focused. Contains item data, row index, row ID, and selection state.",
        selectedItems:
          "Array of all selected row items. When selectAll is triggered, this contains all table rows.",
        selectedIds:
          "Array of all selected row IDs (as strings). When selectAll is triggered, this contains all row IDs.",
      },
    },
    cutAction: {
      description:
        `This event is triggered when the user presses the cut keyboard shortcut ` +
        `(default: Ctrl+X/Cmd+X) and \`rowsSelectable\` is set to \`true\`. The handler receives ` +
        `three parameters: the focused row, selected items, and selected IDs. Note: The component ` +
        `does not automatically modify data; the handler must implement the cut logic (e.g., ` +
        `copying data to clipboard and removing from the data source).`,
      signature:
        "cut(row: TableRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>",
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
      signature:
        "copy(row: TableRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>",
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
      signature:
        "paste(row: TableRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>",
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
      signature:
        "delete(row: TableRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>",
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
    [`fontSize-checkbox-${COMP}`]: "$fontSize",
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
    [`backgroundColor-evenRow-${COMP}`]: `$backgroundColor-row-${COMP}`,
    [`backgroundColor-oddRow-${COMP}`]: `$color-surface-100`,
    [`backgroundColor-pinnedCell-${COMP}`]: "$color-surface-50",
    [`backgroundColor-pinnedCell-${COMP}--hover`]: `$backgroundColor-row-${COMP}--hover`,
    [`backgroundColor-selectionCell-${COMP}`]: "$backgroundColor-pinnedCell-Table",
    [`backgroundColor-selectionCell-${COMP}--hover`]: `$backgroundColor-row-${COMP}--hover`,
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
        | "classes"
        | "registerComponentApi"
        | "lookupSyncCallback"
      > & { layoutContext?: LayoutContext },
      ref,
    ) => {
      const idKey = extractValue.asOptionalString(node.props.idKey, defaultProps.idKey);
      const data = extractValue(node.props.items) || extractValue(node.props.data);

      const refreshOn = extractValue(node.props.refreshOn);
      const renderVersionRef = useRef(0);
      const prevRefreshOnRef = useRef(refreshOn);

      const shouldForceRefresh = node.props.refreshOn === undefined || prevRefreshOnRef.current !== refreshOn;
      if (shouldForceRefresh) {
        prevRefreshOnRef.current = refreshOn;
        renderVersionRef.current++;
      }

      const [columnIds, setColumnIds] = useState(EMPTY_ARRAY);
      const [columnsByIds, setColumnByIds] = useState(EMPTY_OBJECT);
      const columnIdsRef = useRef([]);
      const [tableKey, setTableKey] = useState(0);

      // Keep lookupAction stable across renders so the sync adapter closure always calls the latest version.
      const lookupActionRef = useRef(lookupAction);
      lookupActionRef.current = lookupAction;

      // Stable delegates to prevent React.memo busts on TableNative.
      const stableSortingDidChange = useEvent((...args: any[]) => lookupEventHandler("sortingDidChange")?.(...args));
      const stableSelectionDidChange = useEvent((...args: any[]) => lookupEventHandler("selectionDidChange")?.(...args));
      const stableWillSort = useEvent((...args: any[]) => lookupEventHandler("willSort")?.(...args));
      const stableRowDoubleClick = useEvent((...args: any[]) => lookupEventHandler("rowDoubleClick")?.(...args));
      const stableSelectAllAction = useEvent((...args: any[]) => lookupEventHandler("selectAllAction")?.(...args));
      const stableCutAction = useEvent((...args: any[]) => lookupEventHandler("cutAction")?.(...args));
      const stableCopyAction = useEvent((...args: any[]) => lookupEventHandler("copyAction")?.(...args));
      const stablePasteAction = useEvent((...args: any[]) => lookupEventHandler("pasteAction")?.(...args));
      const stableDeleteAction = useEvent((...args: any[]) => lookupEventHandler("deleteAction")?.(...args));
      const stableLookupEventHandler = useEvent((...args: Parameters<typeof lookupEventHandler>) => lookupEventHandler(...args));

      const rowDisabledPredicate = node.props.rowDisabledPredicate;
      const stableRowDisabledPredicate = useEvent((item: any) => lookupSyncCallback(rowDisabledPredicate)?.(item));
      const rowUnselectablePredicate = node.props.rowUnselectablePredicate;
      const stableRowUnselectablePredicate = useEvent((item: any) => lookupSyncCallback(rowUnselectablePredicate)?.(item));

      const tableContextValue = useMemo(() => {
        return {
          registerColumn: (column: OurColumnMetadata, id: string) => {
            setColumnIds((prev) => {
              if (prev.includes(id)) return prev;
              return [...prev, id];
            });
            setColumnByIds((prev) => {
              const prevCol = prev[id];
              // Even if it's the exact same object by reference, or same content, we only
              // want to bail out if we don't need to change state.
              if (prevCol === column) return prev;
              if (prevCol) {
                const prevKeys = Object.keys(prevCol);
                const nextKeys = Object.keys(column);
                if (prevKeys.length === nextKeys.length) {
                  let isSame = true;
                  for (let i = 0; i < prevKeys.length; i++) {
                    const key = prevKeys[i];
                    if ((prevCol as any)[key] !== (column as any)[key]) {
                      isSame = false;
                      break;
                    }
                  }
                  if (isSame) return prev;
                }
              }
              return { ...prev, [id]: column };
            });
          },
          unRegisterColumn: (id: string) => {
            setColumnIds((prev) => {
              if (!prev.includes(id)) return prev;
              return prev.filter((colId) => colId !== id);
            });
            setColumnByIds((prev) => {
              if (!(id in prev)) return prev;
              const next = { ...prev };
              delete next[id];
              return next;
            });
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

      const columns = useMemo(() => {
        const result = new Array(columnIds.length);
        for (let i = 0; i < columnIds.length; i++) {
          result[i] = columnsByIds[columnIds[i]];
        }
        return result;
      }, [columnIds, columnsByIds]);

      const selectionContext = useSelectionContext();

      // Build a syncWithAppState-compatible adapter for the syncWithVar global-variable sync.
      //
      // KEY POINTS:
      // 1. extractValue({varName}) returns the PLAIN state value, not a reactive proxy.
      //    Mutating it directly has no effect on XMLUI state.
      // 2. Writes must go through lookupAction so the expression runs inside XMLUI's
      //    reactive execution engine (buildProxy + statePartChanged chain).
      // 3. The adapter object must stay STABLE (same reference) across renders so that
      //    useRowSelection's effects do not fire on every render.  We achieve this with
      //    a ref whose .value property is updated in-place each render.
      const VALID_IDENTIFIER_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
      const syncVarName = extractValue.asOptionalString(node.props.syncWithVar);

      const pendingOwnWriteRef = useRef(false);
      // Version counter for own-write detection.
      // Each write embeds a monotonically-increasing __v number in the stored object.
      // We compare this primitive on read-back — reliable even when XMLUI does not
      // preserve inner array references across state evaluations.
      const pendingOwnWriteVersionRef = useRef<number>(0);
      const ownWriteCountRef = useRef<number>(0);
      const pendingOwnWrite = pendingOwnWriteRef.current;
      pendingOwnWriteRef.current = false; // consume immediately

      // Holder for the stable adapter object.
      const syncAdapterHolderRef = useRef<{ value: any; update: any; _raw?: any; selectedIds?: any } | null>(null);

      let syncAdapter: any;
      if (syncVarName !== undefined) {
        if (!VALID_IDENTIFIER_RE.test(syncVarName)) {
          console.error(`[Table syncWithVar] Invalid variable name: "${syncVarName}"`);
          syncAdapterHolderRef.current = null;
        } else {
          const currentSyncVarValue = extractValue(`{${syncVarName}}`);
          if (shouldForceRefresh && syncAdapterHolderRef.current) {
             syncAdapterHolderRef.current = { ...syncAdapterHolderRef.current };
          }
          if (currentSyncVarValue != null) {
            if (!syncAdapterHolderRef.current) {
              // Create the stable adapter object once.  The update function always
              // uses the latest lookupAction via the ref.
              syncAdapterHolderRef.current = {
                value: currentSyncVarValue,
                update: ({ selectedIds }: { selectedIds: string[] }) => {
                  pendingOwnWriteRef.current = true;
                  const thisVersion = ++ownWriteCountRef.current;
                  pendingOwnWriteVersionRef.current = thisVersion;
                  const windowKey = `__tgSync_${syncVarName}`;
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
              // Stable across concurrent React re-render passes: treat as own write if
              // the inner selectedIds array is the exact same reference we wrote.
              // XMLUI evaluates `{selectedIds: window.__tgSync_x}` and preserves the
              // window array reference, so this O(1) check is sufficient.
              const isOwnWrite = pendingOwnWrite ||
                (pendingOwnWriteVersionRef.current > 0 &&
                  currentSyncVarValue?.__v === pendingOwnWriteVersionRef.current);

              if (isOwnWrite) {
                // Update value in-place — object identity is preserved, so
                // Table (memo'd) does not re-render for this change.
                syncAdapterHolderRef.current.value = currentSyncVarValue;
              } else {
                // Genuine external change — reset version sentinel so stale
                // __v values from prior writes cannot cause false positives.
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

      // Memoize so the reference is stable across re-renders — ComponentWrapper
      // is React.memo'd, so a new object would defeat memo and re-render Columns
      // on every Table state update, causing an infinite registerColumn loop.
      const tableChildLayoutContext = useMemo(
        () => createChildLayoutContext(layoutContext, { type: "Table" }),
        [layoutContext],
      );

      const noDataRenderer = node.props.noDataTemplate
        ? () => renderChild(node.props.noDataTemplate, tableChildLayoutContext)
        : undefined;

      const tableContent = (
        <>
          {/* HACK: we render the column children twice, once in a context (with the key: 'tableKey') where we register the columns,
            and once in a context where we refresh the columns (by forcing the first context to re-mount, via the 'tableKey').
            This way the order of the columns is preserved.
        */}
          <TableContext.Provider value={tableContextValue} key={tableKey}>
            {renderChild(node.children, tableChildLayoutContext)}
          </TableContext.Provider>
          <TableContext.Provider value={columnRefresherContextValue}>
            {renderChild(node.children, tableChildLayoutContext)}
          </TableContext.Provider>
          <Table
            classes={classes}
            ref={ref}
            data={data}
            columns={columns}
            pageSizeOptions={extractValue(node.props.pageSizeOptions)}
            pageSize={extractValue.asOptionalNumber(node.props.pageSize)}
            rowsSelectable={extractValue.asOptionalBoolean(node.props.rowsSelectable)}
            registerComponentApi={registerComponentApi}
            noDataRenderer={noDataRenderer}
            hideNoDataView={node.props.noDataTemplate === null || node.props.noDataTemplate === ""}
            loading={extractValue.asOptionalBoolean(node.props.loading)}
            isPaginated={extractValue.asOptionalBoolean(node.props?.isPaginated)}
            headerHeight={extractValue.asSize(node.props.headerHeight)}
            rowDisabledPredicate={stableRowDisabledPredicate}
            rowUnselectablePredicate={stableRowUnselectablePredicate}
            sortBy={extractValue(node.props?.sortBy)}
            sortingDirection={extractValue(node.props?.sortDirection)}
            iconSortAsc={extractValue.asOptionalString(node.props?.iconSortAsc)}
            iconSortDesc={extractValue.asOptionalString(node.props?.iconSortDesc)}
            iconNoSort={extractValue.asOptionalString(node.props?.iconNoSort)}
            lookupEventHandler={!!node.events?.contextMenu ? stableLookupEventHandler : undefined}
            sortingDidChange={stableSortingDidChange}
            onSelectionDidChange={stableSelectionDidChange}
            willSort={stableWillSort}
            rowDoubleClick={node.events?.rowDoubleClick ? stableRowDoubleClick : undefined}
            onSelectAllAction={node.events?.selectAllAction ? stableSelectAllAction : undefined}
            onCutAction={node.events?.cutAction ? stableCutAction : undefined}
            onCopyAction={node.events?.copyAction ? stableCopyAction : undefined}
            onPasteAction={node.events?.pasteAction ? stablePasteAction : undefined}
            onDeleteAction={node.events?.deleteAction ? stableDeleteAction : undefined}
            uid={node.uid}
            autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
            hideHeader={extractValue.asOptionalBoolean(node.props.hideHeader)}
            enableMultiRowSelection={extractValue.asOptionalBoolean(
              node.props.enableMultiRowSelection,
            )}
            toggleSelectionOnClick={extractValue.asOptionalBoolean(
              node.props.toggleSelectionOnClick,
            )}
            alwaysShowSelectionCheckboxesHeader={extractValue.asOptionalBoolean(
              node.props.alwaysShowSelectionCheckboxesHeader,
            )}
            alwaysShowSortingIndicator={extractValue.asOptionalBoolean(
              node.props.alwaysShowSortingIndicator,
            )}
            noBottomBorder={extractValue.asOptionalBoolean(node.props.noBottomBorder)}
            paginationControlsLocation={extractValue.asOptionalString(
              node.props.paginationControlsLocation,
            )}
            alwaysShowPagination={extractValue.asOptionalBoolean(node.props.alwaysShowPagination)}
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
            syncWithAppState={syncAdapter ?? extractValue(node.props.syncWithAppState)}
            headerUserSelect={extractValue.asOptionalString(node.props.headerUserSelect)}
            cellUserSelect={extractValue.asOptionalString(node.props.cellUserSelect)}
            userSelectCell={extractValue.asOptionalString(node.props.userSelectCell)}
            userSelectRow={extractValue.asOptionalString(node.props.userSelectRow)}
            userSelectHeading={extractValue.asOptionalString(node.props.userSelectHeading)}
            hideSelectionCheckboxes={extractValue.asOptionalBoolean(
              node.props.hideSelectionCheckboxes,
            )}
            renderVersion={renderVersionRef.current}
            hideSelectionCheckboxesHeader={extractValue.asOptionalBoolean(
              node.props.hideSelectionCheckboxesHeader,
            )}
            alwaysShowSelectionCheckboxes={extractValue.asOptionalBoolean(
              node.props.alwaysShowSelectionCheckboxes,
            )}
            keyBindings={extractValue(node.props.keyBindings)}
            alwaysShowHeader={extractValue.asOptionalBoolean(node.props.alwaysShowHeader)}
            striped={extractValue.asOptionalBoolean(node.props.striped)}
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

export const tableComponentRenderer = wrapComponent(COMP, Table, TableMd, {
  customRender: (_props, { extractValue, node, renderChild, lookupEventHandler, lookupAction, lookupSyncCallback, classes, registerComponentApi, layoutContext }) => (
    <TableWithColumns
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
  ),
});

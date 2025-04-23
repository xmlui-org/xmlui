import { forwardRef, useMemo, useRef, useState } from "react";
import produce from "immer";

import styles from "./Table.module.scss";

import "./react-table-config.d.ts";
import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { EMPTY_ARRAY, EMPTY_OBJECT } from "../../components-core/constants";
import { dAutoFocus, dComponent, dInternal } from "../metadata-helpers";
import type { OurColumnMetadata } from "../Column/TableContext";
import { TableContext } from "../Column/TableContext";
import {
  StandaloneSelectionStore,
  useSelectionContext,
} from "../SelectionStore/SelectionStoreNative";
import { Table } from "./TableNative";
import type { RendererContext } from "../../abstractions/RendererDefs";

const COMP = "Table";

export const TableMd = createMetadata({
  description:
    `\`${COMP}\` is a component that displays cells organized into rows and columns. The \`${COMP}\` ` +
    `component is virtualized so it only renders visible cells.`,
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
    isPaginated: {
      description: `This property adds pagination controls to the \`${COMP}\`.`,
      valueType: "boolean",
      defaultValue: false,
    },
    loading: d(
      `This boolean property indicates if the component is fetching (or processing) data. This ` +
        `property is useful when data is loaded conditionally or receiving it takes some time.`,
    ),
    headerHeight: d(`This optional property is used to specify the height of the table header.`),
    rowsSelectable: d(`Indicates whether the rows are selectable (\`true\`) or not (\`false\`).`),
    pageSizes: {
      description:
        "This property holds an array of page sizes (numbers) the user can select for " +
        "pagination. If this property is not defined, the component allows only a page size of 10 items.",
    },
    rowDisabledPredicate: d(
      `This property defines a predicate function with a return value that determines if the ` +
        `row should be disabled. The function retrieves the item to display and should return ` +
        `a Boolean-like value.`,
    ),
    noDataTemplate: dComponent(
      `A property to customize what to display if the table does not contain any data.`,
    ),
    sortBy: d(`This property is used to determine which data attributes to sort by.`),
    sortDirection: d(
      `This property determines the sort order to be \`ascending\` or \`descending\`. This ` +
        `property only works if the [\`sortBy\`](#sortby) property is also set.`,
    ),
    autoFocus: dAutoFocus(),
    hideHeader: {
      description:
        "Set the header visibility using this property. Set it to \`true\` to hide the header.",
      valueType: "boolean",
      defaultValue: false,
    },
    iconNoSort: d(
      `Allows setting the icon displayed in the ${COMP} column header when sorting is ` +
        `enabled, but the column remains unsorted.`,
    ),
    iconSortAsc: d(
      `Allows setting the icon displayed in the ${COMP} column header when sorting is enabled, ` +
        `and the column is sorted in ascending order.`,
    ),
    iconSortDesc: d(
      `Allows setting the icon displayed in the ${COMP} column header when sorting is enabled, ` +
        `and the column is sorted in descending order.`,
    ),
    enableMultiRowSelection: {
      description:
        `This boolean property indicates whether you can select multiple rows in the table. ` +
        `This property only has an effect when the rowsSelectable property is set. Setting it ` +
        `to \`false\` limits selection to a single row.`,
      valueType: "boolean",
      defaultValue: true,
    },
    alwaysShowSelectionHeader: {
      description:
        "This property indicates when the row selection header is displayed. When the value is " +
        "`true,` the selection header is always visible. Otherwise, it is displayed only " +
        "when hovered.",
      valueType: "boolean",
      defaultValue: false,
    },
    noBottomBorder: {
      description:
        `This property indicates whether the table should have a bottom border. When set to ` +
        `\`true\`, the table does not have a bottom border. Otherwise, it has a bottom border.`,
      valueType: "boolean",
      defaultValue: false,
    }
  },
  events: {
    sortingDidChange: d(
      `This event is fired when the table data sorting has changed. It has two arguments: ` +
        `the column's name and the sort direction. When the column name is empty, the table ` +
        `displays the data list as it received it.`,
    ),
    willSort: d(
      `This event is fired before the table data is sorted. It has two arguments: the ` +
        `column's name and the sort direction. When the method returns a literal \`false\` ` +
        `value (and not any other falsy one), the method indicates that the sorting should be aborted.`,
    ),
    selectionDidChange: d(
      `This event is triggered when the table's current selection (the rows selected) changes. ` +
        `Its parameter is an array of the selected table row items. `,
    ),
  },
  apis: {
    clearSelection: d("This method clears the list of currently selected table rows."),
    getSelectedItems: d(`This method returns the list of currently selected table rows items.`),
    getSelectedIds: d(`This method returns the list of currently selected table rows IDs.`),
    selectAll: d(
      `This method selects all the rows in the table. This method has no effect if the ` +
        `rowsSelectable property is set to \`false\`.`,
    ),
    selectId: d(
      `This method selects the row with the specified ID. This method has no effect if the ` +
        `\`rowsSelectable\` property is set to \`false\`. The method argument can be a ` +
        `single id or an array of them.`,
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`padding-heading-${COMP}`]: `$space-2`,
    [`paddingHorizontal-cell-${COMP}`]: "$space-2",
    [`paddingHorizontal-cell-first-${COMP}`]: "$space-5",
    [`paddingHorizontal-cell-last-${COMP}`]: "$space-5",
    [`paddingVertical-cell-${COMP}`]: "$space-2",
    [`border-cell-${COMP}`]: "1px solid $borderColor",
    [`outlineWidth-heading-${COMP}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-heading-${COMP}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-heading-${COMP}--focus`]: "$outlineOffset--focus",
    [`fontSize-heading-${COMP}`]: "$fontSize-tiny",
    [`fontWeight-heading-${COMP}`]: "$fontWeight-bold",
    [`textTransform-heading-${COMP}`]: "uppercase",
    [`fontSize-row-${COMP}`]: "$fontSize-small",
    // [`backgroundColor-${COMP}`]: "transparent",
    // [`backgroundColor-row-${COMP}`]: "inherit",
    [`backgroundColor-selected-${COMP}--hover`]: `$backgroundColor-row-${COMP}--hover`,
    [`backgroundColor-pagination-${COMP}`]: `$backgroundColor-${COMP}`,
    [`outlineColor-heading-${COMP}--focus`]: "$outlineColor--focus",
    [`textColor-pagination-${COMP}`]: "$color-secondary",
    [`backgroundColor-row-${COMP}--hover`]: "$color-primary-50",
    [`backgroundColor-selected-${COMP}`]: "$color-primary-100",
    [`backgroundColor-heading-${COMP}--hover`]: "$color-surface-200",
    [`backgroundColor-heading-${COMP}--active`]: "$color-surface-300",
    [`backgroundColor-heading-${COMP}`]: "$color-surface-100",
    [`textColor-heading-${COMP}`]: "$color-surface-500",
  },
});

const TableWithColumns = forwardRef(
  (
    {
      extractValue,
      node,
      renderChild,
      lookupEventHandler,
      lookupSyncCallback,
      layoutCss,
      registerComponentApi,
    }: Pick<
      RendererContext,
      | "extractValue"
      | "node"
      | "renderChild"
      | "lookupEventHandler"
      | "layoutCss"
      | "registerComponentApi"
      | "lookupSyncCallback"
    >,
    ref,
  ) => {
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
          ref={ref}
          data={data}
          columns={columns}
          pageSizes={extractValue(node.props.pageSizes)}
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
          sortBy={extractValue(node.props?.sortBy)}
          sortingDirection={extractValue(node.props?.sortDirection)}
          iconSortAsc={extractValue.asOptionalString(node.props?.iconSortAsc)}
          iconSortDesc={extractValue.asOptionalString(node.props?.iconSortDesc)}
          iconNoSort={extractValue.asOptionalString(node.props?.iconNoSort)}
          sortingDidChange={lookupEventHandler("sortingDidChange")}
          onSelectionDidChange={lookupEventHandler("selectionDidChange")}
          willSort={lookupEventHandler("willSort")}
          style={layoutCss}
          uid={node.uid}
          autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
          hideHeader={extractValue.asOptionalBoolean(node.props.hideHeader)}
          enableMultiRowSelection={extractValue.asOptionalBoolean(
            node.props.enableMultiRowSelection,
          )}
          alwaysShowSelectionHeader={extractValue.asOptionalBoolean(
            node.props.alwaysShowSelectionHeader,
          )}
          noBottomBorder={extractValue.asOptionalBoolean(node.props.noBottomBorder)}
        />
      </>
    );

    if (selectionContext === null) {
      return <StandaloneSelectionStore>{tableContent}</StandaloneSelectionStore>;
    }
    return tableContent;
  },
);

export const tableComponentRenderer = createComponentRenderer(
  COMP,
  TableMd,
  ({
    extractValue,
    node,
    renderChild,
    lookupEventHandler,
    lookupSyncCallback,
    layoutCss,
    registerComponentApi,
  }) => {
    return (
      <TableWithColumns
        node={node}
        extractValue={extractValue}
        lookupEventHandler={lookupEventHandler}
        lookupSyncCallback={lookupSyncCallback}
        layoutCss={layoutCss}
        renderChild={renderChild}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);

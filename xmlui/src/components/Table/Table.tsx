import styles from "./Table.module.scss";
import "./react-table-config.d.ts";
import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { Table } from "./TableNative";
import { dAutoFocus, dComponent } from "@components/metadata-helpers";
import { useMemo, useRef, useState } from "react";
import type { OurColumnMetadata} from "@components/Column/TableContext";
import { TableContext } from "@components/Column/TableContext";
import produce from "immer";
import { EMPTY_ARRAY } from "@components-core/constants";

const COMP = "Table";

export const TableMd = createMetadata({
  description:
    `\`${COMP}\` is a component that displays cells organized into rows and columns. The \`${COMP}\` ` +
    `component is virtualized so it only renders visible cells.`,
  props: {
    items: d(
      `You can use \`items\` as an alias for the \`data\` property. When you bind the table to a ` +
        `data source (for example, you set the \`datasource\` property to a URL to fetch the data ` +
        `from), \`data\` represents the information obtained from the API.`,
    ),
    data: d(``),
    isPaginated: d(`This property adds pagination controls to the \`${COMP}\`.`),
    loading: d(
      `This boolean property indicates if the component is fetching (or processing) data. This ` +
        `property is useful when data is loaded conditionally or receiving it takes some time.`,
    ),
    headerHeight: d(`This optional property is used to specify the height of the table header.`),
    rowsSelectable: d(`Indicates whether the rows are selectable (\`true\`) or not (\`false\`).`),
    pageSizes: d(`Describes how big a page should be for pagination.`),
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
    hideHeader: d(
      `Set the header visibility using this property. Set it to \`true\` to hide the header.`,
    ),
    iconNoSort: d(
      `Allows the customization of the icon displayed in the ${COMP} column header when ` +
        `when sorting is enabled and sorting is not done according to the column.`,
    ),
    iconSortAsc: d(
      `Allows the customization of the icon displayed in the ${COMP} column header when sorting ` +
        `is enabled, sorting is done according to the column, and the column is sorted in ` +
        `ascending order.`,
    ),
    iconSortDesc: d(
      `Allows the customization of the icon displayed in the ${COMP} column header when sorting ` +
        `is enabled, sorting is done according to the column, and the column is sorted in ` +
        `descending order.`,
    ),
    enableMultiRowSelection: d(
      `This boolean property indicates whether you can select multiple rows in the table. ` +
        `This property only has an effect when the rowsSelectable property is set. Setting it ` +
        `to \`false\` limits selection to a single row.`,
    ),
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
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`padding-horizontal-heading-${COMP}`]: "$space-2",
    [`padding-vertical-heading-${COMP}`]: "$space-2",
    [`padding-heading-${COMP}`]: `$padding-vertical-heading-${COMP} $padding-horizontal-heading-${COMP}`,
    [`padding-horizontal-cell-${COMP}`]: "$space-2",
    [`padding-horizontal-cell-first-${COMP}`]: "$space-5",
    [`padding-horizontal-cell-last-${COMP}`]: "$space-5",
    [`padding-vertical-cell-${COMP}`]: "$space-2",
    [`padding-cell-${COMP}`]: `$padding-vertical-cell-${COMP} $padding-horizontal-cell-${COMP}`,
    [`thickness-border-cell-${COMP}`]: "1px",
    [`style-border-cell-${COMP}`]: "solid",
    [`border-cell-${COMP}`]: `$thickness-border-cell-${COMP} $style-border-cell-${COMP} $color-border-cell-${COMP}`,
    [`thickness-outline-heading-${COMP}--focus`]: "$thickness-outline--focus",
    [`style-outline-heading-${COMP}--focus`]: "$style-outline--focus",
    [`offset-outline-heading-${COMP}--focus`]: "$offset-outline--focus",
    [`font-size-heading-${COMP}`]: "$font-size-tiny",
    [`font-weight-heading-${COMP}`]: "$font-weight-bold",
    [`transform-text-heading-${COMP}`]: "uppercase",
    [`font-size-row-${COMP}`]: "$font-size-small",
    [`color-bg-${COMP}`]: "$color-bg",
    [`color-border-cell-${COMP}`]: "$color-border",
    [`color-bg-selected-${COMP}--hover`]: `$color-bg-row-${COMP}--hover`,
    [`color-bg-pagination-${COMP}`]: `$color-bg-${COMP}`,
    [`color-outline-heading-${COMP}--focus`]: "$color-outline--focus",
    [`color-text-pagination-${COMP}`]: "$color-secondary",
    light: {
      [`color-bg-row-${COMP}--hover`]: "$color-primary-50",
      [`color-bg-selected-${COMP}`]: "$color-primary-100",
      [`color-bg-heading-${COMP}--hover`]: "$color-surface-200",
      [`color-bg-heading-${COMP}--active`]: "$color-surface-300",
      [`color-bg-heading-${COMP}`]: "$color-surface-100",
      [`color-text-heading-${COMP}`]: "$color-surface-500",
    },
    dark: {
      [`color-bg-row-${COMP}--hover`]: "$color-primary-900",
      [`color-bg-selected-${COMP}`]: "$color-primary-800",
      [`color-bg-heading-${COMP}--hover`]: "$color-surface-800",
      [`color-bg-heading-${COMP}`]: "$color-surface-950",
      [`color-bg-heading-${COMP}--active`]: "$color-surface-700",
    },
  },
});

const TableWithColumns = ({
  extractValue,
  node,
  renderChild,
  lookupEventHandler,
  lookupSyncCallback,
  layoutCss,
}) => {
  const data = extractValue(node.props.items) || extractValue(node.props.data);

  const [stableColumns, setStableColumns] = useState(EMPTY_ARRAY);
  const stableColumnsRef = useRef(stableColumns);
  stableColumnsRef.current = stableColumns;
  const [tableKey, setTableKey] = useState(0);
  const tableContextValue = useMemo(() => {
    return {
      registerColumn: (column: OurColumnMetadata) => {
        setStableColumns(
          produce((draft) => {
            const existing = draft.findIndex((col) => col.id === column.id);
            if (existing < 0) {
              draft.push(column);
            } else {
              draft[existing] = column;
            }
          }),
        );
      },
      unRegisterColumn: (id: string) => {
        setStableColumns(
          produce((draft) => {
            return draft.filter((col) => col.id !== id);
          }),
        );
      },
    };
  }, []);
  const columnRefresherContextValue = useMemo(() => {
    return {
      registerColumn: (column: OurColumnMetadata) => {
        if (!stableColumnsRef.current.find((col) => col.id === column.id)) {
          setTableKey((prev) => prev + 1);
        }
      },
      unRegisterColumn: (id: string) => {
        if (stableColumnsRef.current.find((col) => col.id === id)) {
          setTableKey((prev) => prev + 1);
        }
      },
    };
  }, []);

  return (
    <>
      <span style={{ position: "absolute", width: 0, left: 0, display: "none" }}>
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
      </span>
      <Table
        data={data}
        columns={stableColumns}
        pageSizes={extractValue(node.props.pageSizes)}
        rowsSelectable={extractValue.asOptionalBoolean(node.props.rowsSelectable)}
        noDataRenderer={
          node.props.noDataTemplate &&
          (() => {
            return renderChild(node.props.noDataTemplate);
          })
        }
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
        willSort={lookupEventHandler("willSort")}
        style={layoutCss}
        uid={node.uid}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        hideHeader={extractValue.asOptionalBoolean(node.props.hideHeader)}
        enableMultiRowSelection={extractValue.asOptionalBoolean(node.props.enableMultiRowSelection)}
      />
    </>
  );
};

export const tableComponentRenderer = createComponentRenderer(
  COMP,
  TableMd,
  ({ extractValue, node, renderChild, lookupEventHandler, lookupSyncCallback, layoutCss }) => {
    return (
      <TableWithColumns
        node={node}
        extractValue={extractValue}
        lookupEventHandler={lookupEventHandler}
        lookupSyncCallback={lookupSyncCallback}
        layoutCss={layoutCss}
        renderChild={renderChild}
      />
    );
  },
);

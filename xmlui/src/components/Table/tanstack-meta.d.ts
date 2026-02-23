import type { CSSProperties, ReactNode } from "react";
import type { RowData } from "@tanstack/table-core";

// Declaration merging, see: https://tanstack.com/table/v8/docs/api/core/table#meta
declare module "@tanstack/table-core" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    cellRenderer: (...args: any[]) => any;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    style?: CSSProperties;
    className?: string;
    starSizedWidth?: string;
    accessorKey?: string;
    pinTo?: string;
    cellRenderer?: (row: any, rowIdx: number, colIdx: number, value?: any) => ReactNode;
  }
}

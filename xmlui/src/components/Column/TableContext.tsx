import type { CSSProperties, ReactNode } from "react";
import { createContext, useContext } from "react";

type TypedCellChangeHandler = (
  newValue: any,
  row: any,
  rowIndex: number,
  columnId: string,
  cellValue: any,
) => any;

export type TypedCellBooleanResolver = (
  row: any,
  rowIndex: number,
  colIndex: number,
  columnId: string,
  cellValue: any,
) => boolean | undefined;

export type OurColumnMetadata = {
  style?: CSSProperties;
  className?: string;
  header: string;
  headerHorizontalAlignment?: string;
  accessorKey?: string;
  id?: string;
  size?: number;
  width?: string;
  minWidth?: number;
  maxWidth?: number;
  canSort?: boolean;
  pinTo?: string;
  canResize?: boolean;
  type?: string;
  typeOptions?: any;
  readOnly?: boolean;
  readOnlyResolver?: TypedCellBooleanResolver;
  enabled?: boolean;
  enabledResolver?: TypedCellBooleanResolver;
  willChange?: TypedCellChangeHandler;
  didChange?: TypedCellChangeHandler;
  fillCellContent?: boolean;
  tooltipOptions?: any;
  tooltipRenderer?: (row: any, rowIndex: number, colIndex: number, value: any) => ReactNode;
  cellRenderer?: (row: any, rowIndex: number, colIndex: number, value: any) => ReactNode;
};

export const TableContext = createContext({
  registerColumn: (col: OurColumnMetadata, id: string) => {},
  unRegisterColumn: (id: string) => {},
});

export function useTableContext() {
  return useContext(TableContext);
}

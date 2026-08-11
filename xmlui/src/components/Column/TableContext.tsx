import type { CSSProperties, ReactNode } from "react";
import { createContext, useContext } from "react";
import type { AsyncFunction } from "../../abstractions/FunctionDefs";

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
  enabled?: boolean;
  willChange?: AsyncFunction;
  didChange?: AsyncFunction;
  fillCellContent?: boolean;
  cellRenderer?: (row: any, rowIndex: number, colIndex: number, value: any) => ReactNode;
};

export const TableContext = createContext({
  registerColumn: (col: OurColumnMetadata, id: string) => {},
  unRegisterColumn: (id: string) => {},
});

export function useTableContext() {
  return useContext(TableContext);
}

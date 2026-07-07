import type { CSSProperties, ReactNode } from "react";
import { createContext, useContext } from "react";

export type OurColumnMetadata = {
  style?: CSSProperties;
  className?: string;
  header: string;
  accessorKey?: string;
  id?: string;
  size?: number;
  width?: string;
  minWidth?: number;
  maxWidth?: number;
  canSort?: boolean;
  pinTo?: string;
  canResize?: boolean;
  cellRenderer?: (row: any, rowIndex: number, colIndex: number, value: any) => ReactNode;
};

export const TableContext = createContext({
  registerColumn: (col: OurColumnMetadata, id: string) => {},
  unRegisterColumn: (id: string) => {},
});

export function useTableContext() {
  return useContext(TableContext);
}

import { createContext, CSSProperties, ReactNode, useContext } from "react";

export type OurColumnMetadata = {
  style?: CSSProperties;
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
  cellRenderer?: (row: any) => ReactNode;
  index: number;
};

export const TableContext = createContext({
  registerColumn: (col: OurColumnMetadata) => {},
  unRegisterColumn: (id: string) => {},
});

export function useTableContext() {
  return useContext(TableContext);
}

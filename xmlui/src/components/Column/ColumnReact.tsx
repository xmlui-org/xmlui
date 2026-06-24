import type { CSSProperties, ReactNode } from "react";

export type TableColumnDefinition = {
  id: string;
  bindTo?: string;
  header?: string;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  canSort?: boolean;
  cellStyle?: CSSProperties;
  children?: ReactNode;
};

export function ColumnNative() {
  return null;
}

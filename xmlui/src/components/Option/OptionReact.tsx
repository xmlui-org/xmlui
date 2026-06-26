import { memo, type ReactNode } from "react";

export type XmluiOption = {
  value: unknown;
  label: ReactNode;
  enabled: boolean;
  testId?: string;
  keywords?: string[];
  selectionLabel?: string;
  searchText?: string;
  [key: string]: unknown;
};

export type OptionProps = XmluiOption;

export function convertOptionValue(value: unknown): unknown {
  if (
    typeof value !== "string" &&
    (typeof value !== "number" || Number.isNaN(value)) &&
    typeof value !== "boolean" &&
    value !== null
  ) {
    return "";
  }
  return value;
}

export const OptionNative = memo(function OptionNative(_props: OptionProps) {
  return null;
});

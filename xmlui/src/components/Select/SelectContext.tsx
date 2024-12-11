import { createContext, useContext } from "react";
import type { SingleValueType, ValueType } from "@components/Select/SelectNative";

type SelectContextValue = {
  multi?: boolean;
  value: ValueType | null;
  onChange?: (selectedValue: SingleValueType) => void;
};

export const SelectContext = createContext<SelectContextValue>(null);

export function useSelect() {
  return useContext(SelectContext);
}

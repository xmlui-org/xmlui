import type { ReactNode} from "react";
import {createContext, useContext} from "react";
import type { SingleValueType, ValueType } from "@components/Select/SelectNative";
import type {Option} from "@components/abstractions";

type SelectContextValue = {
  multi?: boolean;
  value: ValueType | null;
  onChange?: (selectedValue: SingleValueType) => void;
  optionRenderer: (option: Option) => ReactNode;
};

export const SelectContext = createContext<SelectContextValue>(null);

export function useSelect() {
  return useContext(SelectContext);
}

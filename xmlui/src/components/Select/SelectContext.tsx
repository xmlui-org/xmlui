import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import type { Option } from "../abstractions";
import type { SingleValueType, ValueType } from "./SelectNative";

type SelectContextValue = {
  multiSelect?: boolean;
  value: ValueType | null;
  onChange?: (selectedValue: SingleValueType) => void;
  optionLabelRenderer: (option: Option) => ReactNode;
  optionRenderer: (option: Option, selectedValue: SingleValueType, inTrigger: boolean) => ReactNode;
  setOpen: (open: boolean) => void;
};

export const SelectContext = createContext<SelectContextValue>(null);

export function useSelect() {
  return useContext(SelectContext);
}

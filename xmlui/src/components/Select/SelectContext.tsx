import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import type { SingleValueType, ValueType } from "./SelectNative";
import type { Option } from "../abstractions";

type SelectContextValue = {
  multiSelect?: boolean;
  value: ValueType | null;
  onChange?: (selectedValue: SingleValueType) => void;
  setOpen: (open: boolean) => void;
  setSelectedIndex?: (index: number) => void;
  options: Set<Option>;
  optionRenderer?: (
    option: Option,
    selectedValue: SingleValueType,
    inTrigger: boolean,
  ) => ReactNode;
};

export const SelectContext = createContext<SelectContextValue>({
  value: null,
  onChange: (selectedValue: SingleValueType) => {},
  setOpen: (open: boolean) => {},
  setSelectedIndex: (index: number) => {},
  options: new Set<Option>(),
  optionRenderer: undefined,
});

export function useSelect() {
  return useContext(SelectContext);
}

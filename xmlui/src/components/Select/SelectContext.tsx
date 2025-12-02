import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import type { SingleValueType, ValueType } from "./SelectNative";
import type { Option } from "../abstractions";

type SelectContextValue = {
  multiSelect?: boolean;
  readOnly?: boolean;
  value: ValueType | null;
  onChange?: (selectedValue: SingleValueType) => void;
  setOpen: (open: boolean) => void;
  setSelectedIndex?: (index: number) => void;
  highlightedValue?: string;
  optionRenderer?: (
    option: Option,
    selectedValue: SingleValueType,
    inTrigger: boolean,
  ) => ReactNode;
  onOptionAdd?: (option: Option) => void;
  onOptionRemove?: (option: Option) => void;
};

export const SelectContext = createContext<SelectContextValue>({
  value: null,
  onChange: (selectedValue: SingleValueType) => {},
  setOpen: (open: boolean) => {},
  setSelectedIndex: (index: number) => {},
  optionRenderer: undefined,
  onOptionAdd: () => {},
  onOptionRemove: () => {},
});

export function useSelect() {
  return useContext(SelectContext);
}

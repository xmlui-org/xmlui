import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import type { Option, SingleOptionValue, OptionValue } from "../abstractions";

type SelectContextValue = {
  multiSelect?: boolean;
  readOnly?: boolean;
  value: OptionValue | null;
  onChange?: (selectedValue: SingleOptionValue) => void;
  setOpen: (open: boolean) => void;
  setSelectedIndex?: (index: number) => void;
  options: Set<Option>;
  highlightedValue?: SingleOptionValue;
  optionRenderer?: (
    option: Option,
    selectedValue: SingleOptionValue,
    inTrigger: boolean,
  ) => ReactNode;
};

export const SelectContext = createContext<SelectContextValue>({
  value: null,
  onChange: (selectedValue: SingleOptionValue) => {},
  setOpen: (open: boolean) => {},
  setSelectedIndex: (index: number) => {},
  options: new Set<Option>(),
  optionRenderer: undefined,
});

export function useSelect() {
  return useContext(SelectContext);
}

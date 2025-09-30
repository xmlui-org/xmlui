import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import type { Option } from "../abstractions";
import type { SingleValueType } from "../Select/SelectNative";

type AutoCompleteContextValue = {
  multi?: boolean;
  value: string | string[] | null;
  onChange?: (selectedValue: string) => void;
  inputValue: string;
  searchTerm: string;
  options: Set<Option>;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  optionRenderer: (option: Option, selectedValue: SingleValueType, inTrigger: boolean) => ReactNode;
};

export const AutoCompleteContext = createContext<AutoCompleteContextValue>({
  value: null,
  onChange: (selectedValue: string) => {},
  inputValue: "",
  searchTerm: "",
  options: new Set<Option>(),
  open: false,
  setOpen: (open: boolean) => {},
  optionRenderer: (option: Option, selectedValue: SingleValueType, inTrigger: boolean) => null,
});

export function useAutoComplete() {
  return useContext(AutoCompleteContext);
}

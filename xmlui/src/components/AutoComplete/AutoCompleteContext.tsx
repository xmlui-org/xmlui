import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import type { Option } from "../abstractions";

type AutoCompleteContextValue = {
  multi?: boolean;
  value: string | string[] | null;
  onChange?: (selectedValue: string) => void;
  inputValue: string;
  options: Set<Option>;
  open?: boolean;
  setOpen?: (open: boolean) => void;
};

export const AutoCompleteContext = createContext<AutoCompleteContextValue>({
  value: null,
  onChange: (selectedValue: string) => {},
  inputValue: "",
  options: new Set<Option>(),
  open: false,
  setOpen: (open: boolean) => {},
});

export function useAutoComplete() {
  return useContext(AutoCompleteContext);
}

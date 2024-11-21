import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { Option } from "@components/abstractions";

type MultiComboboxContextValue = {
  value: string[];
  onChange?: (selectedValue: string) => void;
  optionRenderer: (option: Option) => ReactNode;
};

export const MultiComboboxContext = createContext<MultiComboboxContextValue>({
  value: [],
  onChange: (selectedValue: string) => {},
  optionRenderer: (option: Option) => <div>{option.label}</div>,
});

export function useSelect() {
  return useContext(MultiComboboxContext);
}

import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { Option } from "@components/abstractions";

type MultiSelectContextValue = {
  value: string[];
  onChange?: (selectedValue: string) => void;
  optionRenderer: (option: Option) => ReactNode;
};

export const MultiSelectContext = createContext<MultiSelectContextValue>({
  value: [],
  onChange: (selectedValue: string) => {},
  optionRenderer: (option: Option) => <div>{option.label}</div>,
});

export function useSelect() {
  return useContext(MultiSelectContext);
}

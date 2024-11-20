import type { ReactNode} from "react";
import { createContext, useContext } from "react";
import type { Option } from "@components/abstractions";

type SelectContextValue = {
  value: string;
  onChange?: (selectedOption: Option) => void;
  optionRenderer: (option: Option) => ReactNode;
};

export const SelectContext = createContext<SelectContextValue>({
  value: "",
  onChange: (selectedOption: Option) => {},
  optionRenderer: (option: Option) => <div>{option.label}</div>,
});

export function useSelect() {
  return useContext(SelectContext);
}

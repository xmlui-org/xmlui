import type { ReactNode} from "react";
import { createContext, useContext } from "react";
import type { Option } from "@components/abstractions";

type SelectContextValue = {
  multi?: boolean;
  value: string | string[] | null;
  onChange?: (selectedValue: string) => void;
  optionRenderer: (option: Option) => ReactNode;
};

export const SelectContext = createContext<SelectContextValue>({
  value: null,
  onChange: (selectedValue: string) => {},
  optionRenderer: (option: Option) => <div>{option.label}</div>,
});

export function useSelect() {
  return useContext(SelectContext);
}

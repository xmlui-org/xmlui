import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

type SelectContextValue = {
  value: string;
  onChange: (value: string) => void;
  optionRenderer: (label: string) => ReactNode;
};

export const SelectContext2 = createContext<SelectContextValue>({
  value: "",
  onChange: (value: string) => {},
  optionRenderer: (label: string) => <div>{label}</div>,
});

export function useSelect() {
  return useContext(SelectContext2);
}

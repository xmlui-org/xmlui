import type { Option } from "../abstractions";
import { createContext, useContext } from "react";

type OptionContextValue = {
  onOptionAdd: (option: Option) => void;
  onOptionRemove: (option: Option) => void;
};

export const OptionContext = createContext<OptionContextValue>({
  onOptionAdd: () => {},
  onOptionRemove: () => {},
});

export function useOption() {
  return useContext(OptionContext);
}

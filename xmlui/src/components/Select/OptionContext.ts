import { createContext, useContext } from "react";

import type { Option } from "../abstractions";

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

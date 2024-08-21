import { createContext, useContext, useMemo, useState } from "react";
import produce from "immer";
import { EMPTY_ARRAY } from "@components-core/constants";
import type { Option } from "@components/abstractions";

type SelectOption = Option & { id: string };
export const SelectContext = createContext({
  register: (col: SelectOption) => {},
  unRegister: (id: string) => {},
});

export function useSelectContextValue() {
  const [options, setOptions] = useState(EMPTY_ARRAY);
  const selectContextValue = useMemo(() => {
    return {
      register: (column: SelectOption) => {
        setOptions(
          produce((draft) => {
            const existing = draft.findIndex((col) => col.id === column.id);
            if (existing < 0) {
              draft.push(column);
            } else {
              draft[existing] = column;
            }
          })
        );
      },
      unRegister: (id: string) => {
        setOptions(
          produce((draft) => {
            return draft.filter((col) => col.id !== id);
          })
        );
      },
    };
  }, [setOptions]);

  return {
    options,
    selectContextValue,
  };
}

export function useSelectContext() {
  return useContext(SelectContext);
}

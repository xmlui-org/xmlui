import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import type { Option } from "../abstractions";
import type { SingleValueType } from "../Select/SelectReact";

type AutoCompleteContextValue = {
  multi?: boolean;
  value: string | string[] | null;
  onChange?: (selectedValue: string) => void;
  inputValue: string;
  searchTerm: string;
  options: Option[];
  open?: boolean;
  setOpen?: (open: boolean) => void;
  setSelectedIndex?: (index: number) => void;
  selectedIndex: number;
  allItems: Array<{ type: string; value: any; label?: any; enabled?: boolean; [k: string]: any }>;
  readOnly?: boolean;
  optionRenderer: (option: Option, selectedValue: SingleValueType, inTrigger: boolean) => ReactNode;
  /** Name of the field on each Option to group by (passed via `groupBy` prop). */
  groupBy?: string;
  /** Renders the section header above each group when `groupBy` is set. Receives
   *  the group name as `$group` context var. When absent, the group key string
   *  is rendered as plain text. */
  groupHeaderRenderer?: (groupName: string) => ReactNode;
  /** Renders the section header for the "Ungrouped" bucket (options missing the groupBy field).
   *  When absent, the Ungrouped bucket has no header. */
  ungroupedHeaderRenderer?: () => ReactNode;
};

export const AutoCompleteContext = createContext<AutoCompleteContextValue>({
  value: null,
  onChange: (selectedValue: string) => {},
  inputValue: "",
  searchTerm: "",
  options: [],
  open: false,
  setOpen: (open: boolean) => {},
  setSelectedIndex: (index: number) => {},
  selectedIndex: -1,
  allItems: [],
  readOnly: false,
  optionRenderer: (option: Option, selectedValue: SingleValueType, inTrigger: boolean) => null,
  groupBy: undefined,
  groupHeaderRenderer: undefined,
  ungroupedHeaderRenderer: undefined,
});

export function useAutoComplete() {
  return useContext(AutoCompleteContext);
}

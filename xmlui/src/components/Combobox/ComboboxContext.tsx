import type { ReactNode} from "react";
import { createContext, useContext } from "react";
import type { Option } from "@components/abstractions";

type ComboboxContextValue = {
    value: string;
    onChange?: (selectedValue: string) => void;
    optionRenderer: (option: Option) => ReactNode;
};

export const ComboboxContext = createContext<ComboboxContextValue>({
    value: "",
    onChange: (selectedValue: string) => {},
    optionRenderer: (option: Option) => <div>{option.label}</div>,
});

export function useCombobox() {
    return useContext(ComboboxContext);
}

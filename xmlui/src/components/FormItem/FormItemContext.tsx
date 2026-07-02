import { createContext, useContext, useId } from "react";

export const FormItemContext = createContext<{
  parentFormItemId: string | null;
  isInsideFormItem: boolean;
  inputId: string | null;
}>({
  parentFormItemId: null,
  isInsideFormItem: false,
  inputId: null,
});

export function useIsInsideFormItem(): boolean {
  return useContext(FormItemContext).isInsideFormItem;
}

export function useFormItemInputId(explicitId?: string): string {
  const context = useContext(FormItemContext);
  const fallbackId = useId();
  return explicitId ?? context.inputId ?? fallbackId;
}

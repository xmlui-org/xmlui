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

/**
 * Hook to check if a component is rendered inside a FormItem.
 * This is used by FormBindingBehavior to avoid double-wrapping inputs.
 */
export function useIsInsideFormItem(): boolean {
  const context = useContext(FormItemContext);
  return context.isInsideFormItem;
}

/**
 * Returns the DOM id an input component should apply to its focusable element so
 * the FormItem label's `htmlFor` connects to the actual input.
 *
 * Priority: explicit `id` prop > `FormItemContext.inputId` (set by the surrounding
 * FormItem/FormBindingWrapper so labels can target inputs even when rendered via
 * a custom template) > local `useId()` fallback (for inputs outside a FormItem).
 */
export function useFormItemInputId(explicitId?: string): string {
  const context = useContext(FormItemContext);
  const fallbackId = useId();
  return explicitId ?? context.inputId ?? fallbackId;
}

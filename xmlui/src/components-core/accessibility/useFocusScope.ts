import { useEffect, useRef } from "react";
import { popFocusScope, pushFocusScope, topFocusScope } from "./focusScopeStack";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export type FocusScopeOptions = {
  trap?: boolean;
  restore?: boolean;
  autoFocus?: boolean;
};

export function useFocusScope<T extends HTMLElement>({
  trap = true,
  restore = true,
  autoFocus = false,
}: FocusScopeOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const scopeId = pushFocusScope(element, typeof document !== "undefined" ? document.activeElement : null);

    if (autoFocus) {
      queueMicrotask(() => {
        firstFocusable(element)?.focus();
      });
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!trap || event.key !== "Tab" || topFocusScope()?.id !== scopeId) return;
      const focusables = focusableElements(element);
      if (focusables.length === 0) {
        event.preventDefault();
        element.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    element.addEventListener("keydown", onKeyDown);
    return () => {
      element.removeEventListener("keydown", onKeyDown);
      const popped = popFocusScope(scopeId);
      if (restore && popped?.restoreTo instanceof HTMLElement && document.contains(popped.restoreTo)) {
        popped.restoreTo.focus();
      }
    };
  }, [autoFocus, restore, trap]);

  return ref;
}

export function focusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true",
  );
}

function firstFocusable(root: HTMLElement): HTMLElement | undefined {
  return focusableElements(root)[0] ?? (root.tabIndex >= 0 ? root : undefined);
}

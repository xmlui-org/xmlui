import { useEffect, useLayoutEffect } from "react";

import type { AsyncFunction } from "../../abstractions/FunctionDefs";

export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useOnMount(onMount?: AsyncFunction) {
  useEffect(() => {
    void onMount?.();
  }, [onMount]);
}

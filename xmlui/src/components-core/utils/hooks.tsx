import { useEffect, useLayoutEffect } from "react";

export const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? useLayoutEffect : useEffect;

export function useOnMount(onMount?: () => void | Promise<void>) {
  useEffect(() => {
    void onMount?.();
  }, [onMount]);
}

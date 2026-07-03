import { useCallback, useLayoutEffect, useRef } from "react";

export function useEvent<T extends (...args: any[]) => any>(handler: T): T {
  const handlerRef = useRef(handler);
  useLayoutEffect(() => {
    handlerRef.current = handler;
  });
  return useCallback(((...args: Parameters<T>) => handlerRef.current(...args)) as T, []);
}

export function capitalizeFirstLetter(str: string) {
  return str[0].toUpperCase() + str.substring(1);
}

import { useCallback, useLayoutEffect, useRef } from "react";
import type { ThrottleSettings } from "lodash-es";
import { throttle } from "lodash-es";

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

export function partitionObject<T extends Record<string, any>>(
  obj: T,
  discriminator: (key?: string, value?: any) => boolean,
): [T, T] {
  return Object.entries(obj).reduce(
    ([pass, fail], [key, value]) =>
      discriminator(key, value)
        ? [{ ...pass, [key]: value }, fail]
        : [pass, { ...fail, [key]: value }],
    [{} as T, {} as T],
  );
}

export function asyncThrottle<F extends (...args: any[]) => Promise<any>>(
  func: F,
  wait?: number,
  options?: ThrottleSettings,
) {
  const throttled = throttle(
    (resolve, reject, args: Parameters<F>) => {
      void func(...args)
        .then(resolve)
        .catch(reject);
    },
    wait,
    options,
  );
  return (...args: Parameters<F>): ReturnType<F> =>
    new Promise((resolve, reject) => {
      throttled(resolve, reject, args);
    }) as ReturnType<F>;
}

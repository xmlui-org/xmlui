import { useInsertionEffect, useRef } from "react";

type Callback = (...args: Array<any>) => any;

export function useEvent<T extends Callback>(callback: T): T {
  const callbackRef = useRef(callback);
  useInsertionEffect(() => {
    callbackRef.current = callback;
  });
  return useRef(((...args: Parameters<T>) => callbackRef.current(...args)) as T).current;
}

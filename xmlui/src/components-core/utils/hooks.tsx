import React, { useEffect, useLayoutEffect, useRef } from "react";

import { useEvent } from "./misc";

export const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? useLayoutEffect : useEffect;

export function useOnMount(onMount?: () => void | Promise<void>) {
  useEffect(() => {
    void onMount?.();
  }, [onMount]);
}

export const useResizeObserver = (
  element: React.MutableRefObject<Element | undefined | null>,
  callback: ResizeObserverCallback,
) => {
  const current = element?.current;
  const observer = useRef<ResizeObserver>();

  useEffect(() => {
    if (observer.current && current) {
      observer.current.unobserve(current);
    }
    observer.current = new ResizeObserver(callback);
    if (element?.current) {
      observer.current.observe(element.current);
    }
    return () => observer.current?.disconnect();
  }, [callback, current, element]);
};

export function useDocumentKeydown(onDocumentKeydown: (event: KeyboardEvent) => void) {
  const onKeyDown = useEvent(onDocumentKeydown);
  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);
}

export function useDocumentKeyup(onDocumentKeyup: (event: KeyboardEvent) => void) {
  const onKeyUp = useEvent(onDocumentKeyup);
  useEffect(() => {
    document.addEventListener("keyup", onKeyUp);
    return () => document.removeEventListener("keyup", onKeyUp);
  }, [onKeyUp]);
}

export function useShallowCompareMemoize<T extends Record<any, any> | undefined>(value: T) {
  const ref = React.useRef<T>(value);
  const signalRef = React.useRef(0);
  if (!shallowCompare(value, ref.current)) {
    ref.current = value;
    signalRef.current++;
  }
  return React.useMemo(() => ref.current, [signalRef.current]);
}

function shallowCompare(left: any, right: any) {
  if (Object.is(left, right)) {
    return true;
  }
  if (!left || !right || typeof left !== "object" || typeof right !== "object") {
    return false;
  }
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  return leftKeys.length === rightKeys.length &&
    leftKeys.every((key) => Object.prototype.hasOwnProperty.call(right, key) && Object.is(left[key], right[key]));
}

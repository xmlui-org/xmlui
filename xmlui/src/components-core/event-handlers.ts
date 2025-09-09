import { ComponentMetadata } from "../abstractions/ComponentDefs";
import { LookupEventHandlerFn } from "../abstractions/RendererDefs";
import { EventHandler, useCallback } from "react";
import { EMPTY_OBJECT } from "./constants";

/**
 * This hook sets up the mouse event handlers for the component
 * @param lookupEvent Function to lookup the event handler
 * @param shouldSkip Indicates if the event handlers should be skipped
 * @returns
 */
export function useMouseEventHandlers(lookupEvent: LookupEventHandlerFn, shouldSkip: boolean) {
  // *** Because we use nested React hooks, we cannot use an early return
  // *** when shouldSkip is true.
  const onClick = useEventHandler("click", lookupEvent, shouldSkip);
  const onMouseLeave = useEventHandler("mouseLeave", lookupEvent, shouldSkip);
  const onMouseEnter = useEventHandler("mouseEnter", lookupEvent, shouldSkip);
  const onDoubleClick = useEventHandler("doubleClick", lookupEvent, shouldSkip);

  if (shouldSkip) {
    return EMPTY_OBJECT;
  }

  return Object.fromEntries(
    Object.entries({
      onClick,
      onMouseLeave,
      onMouseEnter,
      onDoubleClick,
    }).filter(([, value]) => value !== undefined)
  );

  // --- Creates a particular event handler
  function useEventHandler<TMd extends ComponentMetadata>(
    eventName: string,
    lookupEvent: LookupEventHandlerFn<TMd>,
    shouldSkip: boolean,
  ) {
    // *** Because we use nested React hooks, we cannot use an early return
    // *** when shouldSkip is true.
    const onEvent = shouldSkip
      ? undefined
      : lookupEvent(eventName as keyof NonNullable<TMd["events"]>);
    const eventHandler: EventHandler<any> = useCallback(
      (event) => {
        // If the event handler is not defined, we do nothing
        if (onEvent) {
          if (typeof event.stopPropagation === "function") {
            event?.stopPropagation();
          }
          onEvent(event);
        }
      },
      [onEvent],
    );
    return !onEvent ? undefined : eventHandler;
  }
}

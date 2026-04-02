import type { ComponentMetadata } from "../abstractions/ComponentDefs";
import type { LookupEventHandlerFn } from "../abstractions/RendererDefs";
import type { EventHandler} from "react";
import { useCallback } from "react";
import { EMPTY_OBJECT } from "./constants";

/**
 * This hook sets up the mouse event handlers for the component
 * @param lookupEvent Function to lookup the event handler
 * @param shouldSkip Indicates if the event handlers should be skipped
 * @param bubbleEvents EXPERIMENTAL: array of event names for which stopPropagation/preventDefault
 *   should be skipped, allowing the DOM event to bubble to parent components.
 * @returns
 */
export function useMouseEventHandlers(
  lookupEvent: LookupEventHandlerFn,
  shouldSkip: boolean,
  bubbleEvents?: string[], // EXPERIMENTAL
) {
  // *** Because we use nested React hooks, we cannot use an early return
  // *** when shouldSkip is true.
  const onClick = useEventHandler("click", lookupEvent, shouldSkip, bubbleEvents);
  const onMouseLeave = useEventHandler("mouseLeave", lookupEvent, shouldSkip, bubbleEvents);
  const onMouseEnter = useEventHandler("mouseEnter", lookupEvent, shouldSkip, bubbleEvents);
  const onDoubleClick = useEventHandler("doubleClick", lookupEvent, shouldSkip, bubbleEvents);
  const onContextMenu = useEventHandler("contextMenu", lookupEvent, shouldSkip, bubbleEvents);

  if (shouldSkip) {
    return EMPTY_OBJECT;
  }

  return Object.fromEntries(
    Object.entries({
      onClick,
      onMouseLeave,
      onMouseEnter,
      onDoubleClick,
      onContextMenu,
    }).filter(([, value]) => value !== undefined)
  );

  // --- Creates a particular event handler
  function useEventHandler<TMd extends ComponentMetadata>(
    eventName: string,
    lookupEvent: LookupEventHandlerFn<TMd>,
    shouldSkip: boolean,
    bubbleEvents?: string[], // EXPERIMENTAL
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
          // EXPERIMENTAL: skip propagation stop if this event is listed in bubbleEvents
          if (!bubbleEvents || !bubbleEvents.includes(eventName)) {
            if (typeof event.stopPropagation === "function") {
              event?.stopPropagation();
            }
            if (typeof event.preventDefault === "function") {
              event?.preventDefault();
            }
          }
          onEvent(event);
        }
      },
      [onEvent, bubbleEvents, eventName],
    );
    return !onEvent ? undefined : eventHandler;
  }
}

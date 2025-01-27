import { ComponentMetadata } from "@abstractions/ComponentDefs";
import { LookupEventHandlerFn, UpdateStateFn } from "@abstractions/RendererDefs";
import { EventHandler, useCallback } from "react";
import { EMPTY_OBJECT } from "./constants";

const PROPAGATED_SUFFIX = "-propagate";
const NON_PROPAGATED_SUFFIX = "-noPropagate";

/**
 * This hook creates event handlers for mouse events.
 * @param lookupEvent Function to lookup an event handler
 * @param defaultHoverHandler Default handler for mouse enter and mouse leave events
 * @param shouldSkip Should skip the event handler creation?
 * @returns Object with mouse event handlers
 */
export function useMouseEventHandlers(
  lookupEvent: LookupEventHandlerFn,
  updateState: UpdateStateFn,
  shouldSkip: boolean,
) {
  const onClick = useEventHandler("click", lookupEvent, shouldSkip);
  const onMouseLeave = useHoverEventHandler("mouseLeave", lookupEvent, updateState, shouldSkip);
  const onMouseEnter = useHoverEventHandler("mouseEnter", lookupEvent, updateState, shouldSkip);
  const onDoubleClick = useEventHandler("doubleClick", lookupEvent, shouldSkip);

  if (shouldSkip) {
    return EMPTY_OBJECT;
  }

  return {
    onClick,
    onMouseLeave,
    onMouseEnter,
    onDoubleClick,
  };

  // --- Creates an event handler for a particular event (checking for the propagated
  // --- and non-propagated versions of the event as well)
  function useEventHandler<TMd extends ComponentMetadata>(
    eventName: string,
    lookupEvent: LookupEventHandlerFn<TMd>,
    shouldSkip: boolean,
  ) {
    // *** Because we're using a nested hook, we cannot make an early 
    // *** return when shouldSkip is true!
    
    // --- Get event handlers for the event, the propagated event, and the non-propagated event
    const onEvent = shouldSkip ? undefined : lookupEvent(eventName);
    const onPropagatedEvent = shouldSkip
      ? undefined
      : lookupEvent(`${eventName}${PROPAGATED_SUFFIX}`);
    const onNonPropagatedEvent = shouldSkip
      ? undefined
      : lookupEvent(`${eventName}${NON_PROPAGATED_SUFFIX}`);

    // --- Create the actual event handler
    const eventHandler: EventHandler<any> = useCallback(
      (event) => {
        if (onPropagatedEvent) {
          onPropagatedEvent(event);
        } else if (onNonPropagatedEvent) {
          event.stopPropagation();
          onNonPropagatedEvent(event);
        } else if (onEvent) {
          event.stopPropagation();
          onEvent(event);
        }
      },
      [onEvent, onPropagatedEvent, onNonPropagatedEvent],
    );
    return !onEvent && !onPropagatedEvent && !onNonPropagatedEvent ? undefined : eventHandler;
  }

  function useHoverEventHandler<TMd extends ComponentMetadata>(
    eventName: "mouseEnter" | "mouseLeave",
    lookupEvent: LookupEventHandlerFn<TMd>,
    updateState: UpdateStateFn,
    shouldSkip: boolean,
  ) {
    // *** Because we're using a nested hook, we cannot make an early 
    // *** return when shouldSkip is true!

    // --- We use this event handler even if there is no event handler defined in the component
    const defaultHoverHandler = useCallback((e: MouseEvent) => {
      updateState({ isHovered: e.type === "mouseenter" });
    }, [updateState]);
    const onEvent = shouldSkip ? undefined : lookupEvent(eventName);
    const onPropagatedEvent = shouldSkip
      ? undefined
      : lookupEvent(`${eventName}${PROPAGATED_SUFFIX}`);
    const onNonPropagatedEvent = shouldSkip
      ? undefined
      : lookupEvent(`${eventName}${NON_PROPAGATED_SUFFIX}`);

    // --- Create the actual event handler
    const hoverEventHandler: EventHandler<any> = useCallback(
      (event) => {
        // --- We always call the default hover handler
        defaultHoverHandler(event);
        if (onPropagatedEvent) {
          onPropagatedEvent(event);
        } else if (onNonPropagatedEvent) {
          event.stopPropagation();
          onNonPropagatedEvent(event);
        } else if (onEvent) {
          // --- Note, with hover events, we don't stop propagation by default
          onEvent(event);
        }
      },
      [onEvent, onPropagatedEvent, onNonPropagatedEvent, defaultHoverHandler],
    );
    return hoverEventHandler;
  }
}

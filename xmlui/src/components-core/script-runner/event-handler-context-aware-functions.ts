import { debounce } from "../utils/misc";
import type { EventHandlerContext } from "./BindingTreeEvaluationContext";

export interface EventHandlerContextAwareFunctionInfo {
  func: (...args: any[]) => any;
  injectContext: boolean;
  transformArgs?: (context: EventHandlerContext, args: any[]) => any[];
  help?: string;
}

/**
 * Registry of functions that should receive event handler context as their first argument.
 * Uses direct function references like bannedFunctions.ts to ensure we only affect our own functions.
 */
const eventHandlerContextAwareFunctions: EventHandlerContextAwareFunctionInfo[] = [
  {
    func: debounce,
    injectContext: true,
    help: "Enhanced with event handler context for stable debouncing"
  },
  // Add other XMLUI functions that need event handler context
];

/**
 * Checks if the specified function object is registered as EventHandlerContextAware.
 * @param functionObj Function to check
 * @return Information about the EventHandlerContextAware state, including transformation options
 */
export function isEventHandlerContextAwareFunction(functionObj: any): EventHandlerContextAwareFunctionInfo | undefined {
  if (functionObj === undefined) {
    return undefined;
  }
  return eventHandlerContextAwareFunctions.find(f => f.func === functionObj);
}
import type { ActionFunction, ActionRendererDef } from "../../abstractions/ActionDefs";

/**
 * Creates an action renderer definition object that can be registered in the action registry.
 * @param actionName The name of the action
 * @param actionFn The function that executes the action
 * @returns An action renderer definition object
 */
export function createAction(actionName: string, actionFn: ActionFunction): ActionRendererDef {
  return {
    actionName,
    actionFn,
  };
}

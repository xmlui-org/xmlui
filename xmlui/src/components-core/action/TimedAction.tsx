import type { ActionExecutionContext } from "@abstractions/ActionDefs";

import { delay as doDelay } from "@components-core/utils/misc";
import { createAction } from "./actions";

async function delay(_executionContext: ActionExecutionContext, timeoutInMs: number, callback?: any) {
  await doDelay(timeoutInMs);
  await callback?.();
}

export const timedAction = createAction("delay", delay);

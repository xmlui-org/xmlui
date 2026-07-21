import type { BindingTreeEvaluationContext } from "../script-runner/BindingTreeEvaluationContext";
import {
  callSyncFunction,
  notifySyncFunctionCallUpdate,
  readSyncIdentifier,
  readSyncMember,
} from "../script-runner/sync-runtime";

export const bindingSyncRuntime = {
  id(name: string, evalContext: BindingTreeEvaluationContext, thread?: any): any {
    return readSyncIdentifier(name, evalContext, thread);
  },

  member(obj: any, member: string | number, evalContext: BindingTreeEvaluationContext): any {
    return readSyncMember(obj, member, evalContext);
  },

  call(
    functionObj: any,
    thisArg: any,
    args: any[],
    evalContext: BindingTreeEvaluationContext,
    thread?: any,
    updateRootName?: string,
  ): any {
    notifySyncFunctionCallUpdate(updateRootName, "will", evalContext, thread);
    try {
      return callSyncFunction({
        functionObj,
        thisArg,
        args,
        evalContext,
        optional: evalContext.options?.defaultToOptionalMemberAccess,
      });
    } finally {
      notifySyncFunctionCallUpdate(updateRootName, "did", evalContext, thread);
    }
  },
};

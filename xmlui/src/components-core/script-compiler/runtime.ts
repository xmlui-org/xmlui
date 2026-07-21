import type { BindingTreeEvaluationContext } from "../script-runner/BindingTreeEvaluationContext";
import { readSyncIdentifier, readSyncMember } from "../script-runner/sync-runtime";

export const bindingSyncRuntime = {
  id(name: string, evalContext: BindingTreeEvaluationContext, thread?: any): any {
    return readSyncIdentifier(name, evalContext, thread);
  },

  member(obj: any, member: string | number, evalContext: BindingTreeEvaluationContext): any {
    return readSyncMember(obj, member, evalContext);
  },
};


import type { BindingTreeEvaluationContext } from "../script-runner/BindingTreeEvaluationContext";
import { isArrowExpressionObject } from "../../abstractions/InternalMarkers";
import type { ArrowExpression } from "../script-runner/ScriptingSourceTree";
import {
  applySyncAssignment,
  applySyncPrePost,
  assertSyncResult,
  callSyncFunction,
  deleteSyncTarget,
  notifySyncFunctionCallUpdate,
  readSyncIdentifier,
  readSyncMember,
} from "../script-runner/sync-runtime";
import {
  T_IDENTIFIER,
  type AssignmentSymbols,
  type PrefixOpSymbol,
} from "../script-runner/ScriptingSourceTree";
import { getIdentifierScope, obtainClosures } from "../script-runner/eval-tree-common";

const DEFAULT_SYNC_EVAL_TIMEOUT = 1000;

export const bindingSyncRuntime = {
  start(evalContext: BindingTreeEvaluationContext): void {
    evalContext.startTick = new Date().valueOf();
  },

  checkTimeout(evalContext: BindingTreeEvaluationContext): void {
    const syncTimeout =
      evalContext.appContext?.xmluiConfig?.syncExecutionTimeout ?? DEFAULT_SYNC_EVAL_TIMEOUT;
    if (
      evalContext.startTick !== undefined &&
      new Date().valueOf() - evalContext.startTick > syncTimeout
    ) {
      throw new Error(`Sync evaluation timeout exceeded ${syncTimeout} milliseconds`);
    }
  },

  id(name: string, evalContext: BindingTreeEvaluationContext, thread?: any): any {
    return readSyncIdentifier(name, evalContext, thread);
  },

  member(obj: any, member: string | number, evalContext: BindingTreeEvaluationContext): any {
    return readSyncMember(obj, member, evalContext);
  },

  arrow(
    expr: ArrowExpression,
    evalContext: BindingTreeEvaluationContext,
    thread?: any,
  ): ArrowExpression {
    const lazyArrow = {
      ...expr,
      _ARROW_EXPR_: true,
      closureContext: obtainClosures(thread ?? evalContext.mainThread),
    } as ArrowExpression;
    Object.defineProperty(lazyArrow, "closureEvalContext", {
      value: evalContext,
      enumerable: false,
      configurable: true,
    });
    return lazyArrow;
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
      if (isArrowExpressionObject(functionObj)) {
        if (!evalContext.compiledArrowInvoker) {
          throw new Error("Cannot invoke XMLUI arrow expression from compiled binding context.");
        }
        const result = evalContext.compiledArrowInvoker(functionObj, args, evalContext, thread);
        assertSyncResult(result);
        return result;
      }
      const callArgs = args.map((arg) =>
        isArrowExpressionObject(arg)
          ? (...arrowArgs: any[]) => {
              if (!evalContext.compiledArrowInvoker) {
                throw new Error(
                  "Cannot invoke XMLUI arrow expression from compiled binding context.",
                );
              }
              const result = evalContext.compiledArrowInvoker(arg, arrowArgs, evalContext, thread);
              assertSyncResult(result);
              return result;
            }
          : arg,
      );
      return callSyncFunction({
        functionObj,
        thisArg,
        args: callArgs,
        evalContext,
        optional: evalContext.options?.defaultToOptionalMemberAccess,
      });
    } finally {
      notifySyncFunctionCallUpdate(updateRootName, "did", evalContext, thread);
    }
  },

  assignId(
    name: string,
    op: AssignmentSymbols,
    value: any,
    evalContext: BindingTreeEvaluationContext,
    thread?: any,
  ): any {
    const target = getIdentifierTarget(name, evalContext, thread);
    notifySyncFunctionCallUpdate(name, "will", evalContext, thread, "assignment");
    try {
      return applySyncAssignment(
        { valueScope: target.scope, valueIndex: name, rootName: name },
        op,
        value,
        evalContext,
      ).newValue;
    } finally {
      notifySyncFunctionCallUpdate(name, "did", evalContext, thread, "assignment");
    }
  },

  assignMember(
    obj: any,
    member: string | number,
    op: AssignmentSymbols,
    value: any,
    evalContext: BindingTreeEvaluationContext,
    thread?: any,
    rootName?: string,
  ): any {
    notifySyncFunctionCallUpdate(rootName, "will", evalContext, thread, "assignment");
    try {
      return applySyncAssignment(
        {
          valueScope: obj,
          valueIndex: member,
          rootName,
          pathArray: rootName ? [rootName, member] : [member],
        },
        op,
        value,
        evalContext,
      ).newValue;
    } finally {
      notifySyncFunctionCallUpdate(rootName, "did", evalContext, thread, "assignment");
    }
  },

  prePostId(
    name: string,
    op: PrefixOpSymbol,
    prefix: boolean,
    evalContext: BindingTreeEvaluationContext,
    thread?: any,
  ): any {
    const target = getIdentifierTarget(name, evalContext, thread);
    notifySyncFunctionCallUpdate(name, "will", evalContext, thread, "pre-post");
    try {
      return applySyncPrePost(
        { valueScope: target.scope, valueIndex: name, rootName: name },
        op,
        prefix,
        evalContext,
      ).value;
    } finally {
      notifySyncFunctionCallUpdate(name, "did", evalContext, thread, "pre-post");
    }
  },

  prePostMember(
    obj: any,
    member: string | number,
    op: PrefixOpSymbol,
    prefix: boolean,
    evalContext: BindingTreeEvaluationContext,
    thread?: any,
    rootName?: string,
  ): any {
    notifySyncFunctionCallUpdate(rootName, "will", evalContext, thread, "pre-post");
    try {
      return applySyncPrePost(
        {
          valueScope: obj,
          valueIndex: member,
          rootName,
          pathArray: rootName ? [rootName, member] : [member],
        },
        op,
        prefix,
        evalContext,
      ).value;
    } finally {
      notifySyncFunctionCallUpdate(rootName, "did", evalContext, thread, "pre-post");
    }
  },

  deleteMember(
    obj: any,
    member: string | number,
    evalContext: BindingTreeEvaluationContext,
    thread?: any,
    rootName?: string,
  ): boolean {
    notifySyncFunctionCallUpdate(rootName, "will", evalContext, thread, "assignment");
    try {
      return deleteSyncTarget(
        {
          valueScope: obj,
          valueIndex: member,
          rootName,
          pathArray: rootName ? [rootName, member] : [member],
        },
        evalContext,
      ).newValue;
    } finally {
      notifySyncFunctionCallUpdate(rootName, "did", evalContext, thread, "assignment");
    }
  },
};

function getIdentifierTarget(
  name: string,
  evalContext: BindingTreeEvaluationContext,
  thread?: any,
): { scope: any } {
  const idScope = getIdentifierScope({ type: T_IDENTIFIER, nodeId: -1, name }, evalContext, thread);
  return { scope: idScope.scope };
}

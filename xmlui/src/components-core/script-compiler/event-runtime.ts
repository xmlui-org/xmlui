import type { LogicalThread } from "../../abstractions/scripting/LogicalThread";
import { isArrowExpressionObject } from "../../abstractions/InternalMarkers";
import { HandlerCancelledError } from "../concurrency/token";
import { ThrowStatementError } from "../EngineError";
import type { BindingTreeEvaluationContext } from "../script-runner/BindingTreeEvaluationContext";
import { getAsyncProxy } from "../script-runner/asyncProxy";
import { isBannedFunction } from "../script-runner/bannedFunctions";
import {
  completePromise,
  obtainClosures,
  getAllowedNewConstructor,
} from "../script-runner/eval-tree-common";
import { executeArrowExpression } from "../script-runner/eval-tree-async";
import {
  applySyncAssignment,
  applySyncPrePost,
  deleteSyncTarget,
  readSyncIdentifier,
  readSyncMember,
  type SyncWriteTarget,
} from "../script-runner/sync-runtime";
import type {
  ArrowExpression,
  AssignmentSymbols,
  PrefixOpSymbol,
  Statement,
} from "../script-runner/ScriptingSourceTree";
import { UnsupportedCompiledScriptNodeError } from "./errors";

const DEFAULT_YIELD_INTERVAL_MS = 100;

type EventYieldState = {
  lastYieldReferenceTs: number;
  intervalMs: number;
};

type EventStatementBoundaryOptions = {
  checkYield?: boolean;
};

export const eventAsyncRuntime = {
  createInvocation(options?: { yieldIntervalMs?: number; suppressYield?: boolean }) {
    const invocation = Object.create(this) as typeof eventAsyncRuntime & {
      __yieldState?: EventYieldState;
      __suppressYield?: boolean;
    };
    invocation.__yieldState = {
      lastYieldReferenceTs: this.now(),
      intervalMs: options?.yieldIntervalMs ?? DEFAULT_YIELD_INTERVAL_MS,
    };
    invocation.__suppressYield = options?.suppressYield === true;
    return invocation;
  },

  unsupported(target: string, sourceId: string, sourceRange?: any): never {
    throw new UnsupportedCompiledScriptNodeError(target, sourceId, sourceRange);
  },

  async start(evalContext: BindingTreeEvaluationContext): Promise<void> {
    evalContext.mainThread ??= {
      childThreads: [],
      blocks: [{ vars: {} }],
      loops: [],
      breakLabelValue: -1,
    };
    this.ensureYieldState();
    await this.checkCancel(evalContext);
  },

  async beforeStatement(
    evalContext: BindingTreeEvaluationContext,
    statement?: Statement,
  ): Promise<void> {
    await this.checkCancel(evalContext);
    await evalContext.onStatementStarted?.(evalContext, statement as Statement);
  },

  async afterStatement(
    evalContext: BindingTreeEvaluationContext,
    statement?: Statement,
    options?: EventStatementBoundaryOptions,
  ): Promise<void> {
    await evalContext.onStatementCompleted?.(evalContext, statement as Statement);
    await this.checkCancel(evalContext);
    if (!this.isYieldSuppressed() && options?.checkYield !== false) {
      await this.maybeYield();
    }
    await this.checkCancel(evalContext);
  },

  async maybeYield(): Promise<void> {
    const state = this.ensureYieldState();
    const now = this.now();
    if (now - state.lastYieldReferenceTs < state.intervalMs) {
      return;
    }
    state.lastYieldReferenceTs = now;
    await this.yield();
  },

  async yield(): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  },

  now(): number {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
  },

  ensureYieldState(): EventYieldState {
    const runtime = this as typeof eventAsyncRuntime & { __yieldState?: EventYieldState };
    runtime.__yieldState ??= {
      lastYieldReferenceTs: this.now(),
      intervalMs: DEFAULT_YIELD_INTERVAL_MS,
    };
    return runtime.__yieldState;
  },

  isYieldSuppressed(): boolean {
    return (this as typeof eventAsyncRuntime & { __suppressYield?: boolean }).__suppressYield === true;
  },

  async checkCancel(evalContext: BindingTreeEvaluationContext): Promise<void> {
    const cancelToken = evalContext.localContext?.$cancel;
    if (cancelToken?.throwIfAborted) {
      cancelToken.throwIfAborted();
    }
    if (evalContext.cancellationToken?.cancelled) {
      throw new HandlerCancelledError("user");
    }
  },

  id(name: string, evalContext: BindingTreeEvaluationContext, thread?: LogicalThread): any {
    return readSyncIdentifier(name, evalContext, thread);
  },

  member(obj: any, member: string | number, evalContext: BindingTreeEvaluationContext): any {
    return readSyncMember(obj, member, evalContext);
  },

  async complete(value: any): Promise<any> {
    if (isArrowExpressionObject(value)) {
      return value;
    }
    return await completePromise(value);
  },

  setBlockReturnValue(
    evalContext: BindingTreeEvaluationContext,
    value: any,
    thread?: LogicalThread,
  ): any {
    const activeThread = thread ?? evalContext.mainThread;
    const blocks = activeThread?.blocks;
    if (blocks?.length) {
      blocks[blocks.length - 1].returnValue = value;
    }
    return value;
  },

  arrow(
    expr: ArrowExpression,
    evalContext: BindingTreeEvaluationContext,
    thread?: LogicalThread,
  ): ArrowExpression {
    if (expr.async) {
      throw new Error("XMLUI does not support async arrow functions.");
    }
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

  throwStatement(value: any): never {
    throw new ThrowStatementError(value);
  },

  catchValue(error: any): any {
    return error instanceof ThrowStatementError ? error.errorObject : error;
  },

  destructure(value: any, specs: Array<[string, Array<string | number>]>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [name, path] of specs) {
      let current = value;
      for (const member of path) {
        current = current?.[member];
      }
      result[name] = current;
    }
    return result;
  },

  async call(
    functionObj: any,
    thisArg: any,
    args: any[],
    evalContext: BindingTreeEvaluationContext,
    thread?: LogicalThread,
    updateRootName?: string,
  ): Promise<any> {
    await notifyEventStateUpdate(updateRootName, "will", evalContext, "function-call");
    try {
      if (isArrowExpressionObject(functionObj)) {
        return await executeArrowExpression(
          functionObj,
          evalContext,
          thread ?? evalContext.mainThread,
          ...args,
        );
      }

      const callArgs: any[] = args.map((arg) =>
        isArrowExpressionObject(arg)
          ? async (...arrowArgs: any[]) =>
              await executeArrowExpression(
                arg as ArrowExpression,
                evalContext,
                thread ?? evalContext.mainThread,
                ...arrowArgs,
              )
          : arg,
      );

      if (thisArg?._SUPPORT_IMPLICIT_CONTEXT) {
        if (!evalContext.implicitContextGetter) {
          throw new Error("Cannot use implicitContextGetter, it is undefined");
        }
        callArgs.unshift(evalContext.implicitContextGetter(thisArg));
      }

      assertEventFunctionAllowed(functionObj);
      const proxiedFunction = getAsyncProxy(functionObj as Function, callArgs, thisArg);
      const value =
        evalContext.options?.defaultToOptionalMemberAccess !== false
          ? (proxiedFunction as Function)?.call(thisArg, ...callArgs)
          : (proxiedFunction as Function).call(thisArg, ...callArgs);
      return await completePromise(value);
    } finally {
      await notifyEventStateUpdate(updateRootName, "did", evalContext, "function-call");
    }
  },

  async construct(constructorObj: any, args: any[]): Promise<any> {
    const allowedConstructor = getAllowedNewConstructor(constructorObj);
    return await completePromise(new allowedConstructor(...args));
  },

  assignId(
    name: string,
    op: AssignmentSymbols,
    value: any,
    evalContext: BindingTreeEvaluationContext,
    thread?: LogicalThread,
  ): any {
    const target = { valueScope: evalContext.localContext, valueIndex: name, rootName: name };
    return applySyncAssignment(target, op, value, evalContext).newValue;
  },

  assignMember(
    obj: any,
    member: string | number,
    op: AssignmentSymbols,
    value: any,
    evalContext: BindingTreeEvaluationContext,
    _thread?: LogicalThread,
    rootName?: string,
  ): any {
    return applySyncAssignment(
      createMemberTarget(obj, member, rootName),
      op,
      value,
      evalContext,
    ).newValue;
  },

  prePostId(
    name: string,
    op: PrefixOpSymbol,
    prefix: boolean,
    evalContext: BindingTreeEvaluationContext,
    _thread?: LogicalThread,
  ): any {
    return applySyncPrePost(
      { valueScope: evalContext.localContext, valueIndex: name, rootName: name },
      op,
      prefix,
      evalContext,
    ).value;
  },

  prePostMember(
    obj: any,
    member: string | number,
    op: PrefixOpSymbol,
    prefix: boolean,
    evalContext: BindingTreeEvaluationContext,
    _thread?: LogicalThread,
    rootName?: string,
  ): any {
    return applySyncPrePost(
      createMemberTarget(obj, member, rootName),
      op,
      prefix,
      evalContext,
    ).value;
  },

  deleteMember(
    obj: any,
    member: string | number,
    evalContext: BindingTreeEvaluationContext,
    _thread?: LogicalThread,
    rootName?: string,
  ): boolean {
    return deleteSyncTarget(createMemberTarget(obj, member, rootName), evalContext).newValue;
  },
};

function assertEventFunctionAllowed(functionObj: any): void {
  const bannedInfo = isBannedFunction(functionObj);
  if (bannedInfo.banned) {
    throw new Error(
      `Function ${bannedInfo.func?.name ?? "unknown"} is not allowed to call. ${bannedInfo?.help ?? ""}`,
    );
  }
}

function createMemberTarget(
  obj: any,
  member: string | number,
  rootName?: string,
): SyncWriteTarget {
  return {
    valueScope: obj,
    valueIndex: member,
    rootName,
    pathArray: rootName ? [rootName, member] : [member],
  };
}

async function notifyEventStateUpdate(
  rootName: string | undefined,
  phase: "will" | "did",
  evalContext: BindingTreeEvaluationContext,
  kind: "assignment" | "pre-post" | "function-call",
): Promise<void> {
  if (!rootName) return;
  const hook = phase === "will" ? evalContext.onWillUpdate : evalContext.onDidUpdate;
  await hook?.({ type: "localContext", name: rootName }, rootName, kind);
}

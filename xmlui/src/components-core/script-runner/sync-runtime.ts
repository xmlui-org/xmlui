import type { LogicalThread, ValueResult } from "../../abstractions/scripting/LogicalThread";
import type { AssignmentSymbols, PrefixOpSymbol } from "./ScriptingSourceTree";
import type { BindingTreeEvaluationContext } from "./BindingTreeEvaluationContext";
import { isBannedFunction } from "./bannedFunctions";
import { isBannedMember } from "./bannedMembers";
import { isPromise } from "./eval-tree-common";
import { handleMemberBan } from "./eval-tree-common";

export type SyncRuntimeUpdateKind = "assignment" | "pre-post" | "function-call";

export type SyncRuntimeChange = {
  rootName?: string;
  pathArray: Array<string | number>;
  valueScope: any;
  valueIndex: string | number;
  newValue: any;
  action: "set" | "delete" | "mutate";
  kind: SyncRuntimeUpdateKind;
};

export type SyncFunctionCallOptions = {
  functionObj: any;
  thisArg: any;
  args: any[];
  evalContext: BindingTreeEvaluationContext;
  optional?: boolean;
};

export type SyncWriteTarget = Pick<ValueResult, "valueScope" | "valueIndex"> & {
  rootName?: string;
  pathArray?: Array<string | number>;
};

export function assertSyncFunctionAllowed(functionObj: any): void {
  const bannedInfo = isBannedFunction(functionObj);
  if (bannedInfo.banned) {
    throw new Error(
      `Function ${bannedInfo.func?.name ?? "unknown"} is not allowed to call. ${bannedInfo?.help ?? ""}`,
    );
  }
}

export function assertSyncResult(value: any): void {
  if (isPromise(value)) {
    throw new Error("Promises (async function calls) are not allowed in binding expressions.");
  }
}

export function callSyncFunction({
  functionObj,
  thisArg,
  args,
  evalContext,
  optional,
}: SyncFunctionCallOptions): any {
  assertSyncFunctionAllowed(functionObj);
  const value = optional
    ? (functionObj as Function)?.call(thisArg, ...args)
    : (functionObj as Function).call(thisArg, ...args);
  assertSyncResult(value);
  return value;
}

export function applySyncAssignment(
  target: SyncWriteTarget,
  op: AssignmentSymbols,
  newValue: any,
  evalContext: BindingTreeEvaluationContext,
): SyncRuntimeChange {
  const { valueScope, valueIndex } = ensureWritableTarget(target, op);
  handleMemberBan(isBannedMember(valueScope, valueIndex as string), evalContext.options);

  switch (op) {
    case "=":
      valueScope[valueIndex] = newValue;
      break;
    case "+=":
      valueScope[valueIndex] += newValue;
      break;
    case "-=":
      valueScope[valueIndex] -= newValue;
      break;
    case "**=":
      valueScope[valueIndex] **= newValue;
      break;
    case "*=":
      valueScope[valueIndex] *= newValue;
      break;
    case "/=":
      valueScope[valueIndex] /= newValue;
      break;
    case "%=":
      valueScope[valueIndex] %= newValue;
      break;
    case "<<=":
      valueScope[valueIndex] <<= newValue;
      break;
    case ">>=":
      valueScope[valueIndex] >>= newValue;
      break;
    case ">>>=":
      valueScope[valueIndex] >>>= newValue;
      break;
    case "&=":
      valueScope[valueIndex] &= newValue;
      break;
    case "^=":
      valueScope[valueIndex] ^= newValue;
      break;
    case "|=":
      valueScope[valueIndex] |= newValue;
      break;
    case "&&=":
      valueScope[valueIndex] &&= newValue;
      break;
    case "||=":
      valueScope[valueIndex] ||= newValue;
      break;
    case "??=":
      valueScope[valueIndex] ??= newValue;
      break;
  }
  return createChange(target, valueScope[valueIndex], "set", "assignment");
}

export function applySyncPrePost(
  target: SyncWriteTarget,
  op: PrefixOpSymbol,
  prefix: boolean,
  evalContext: BindingTreeEvaluationContext,
): { value: any; change: SyncRuntimeChange } {
  const { valueScope, valueIndex } = ensureWritableTarget(target, op);
  handleMemberBan(isBannedMember(valueScope, valueIndex as string), evalContext.options);

  const value =
    op === "++"
      ? prefix
        ? ++valueScope[valueIndex]
        : valueScope[valueIndex]++
      : prefix
        ? --valueScope[valueIndex]
        : valueScope[valueIndex]--;

  return {
    value,
    change: createChange(target, valueScope[valueIndex], "set", "pre-post"),
  };
}

export function deleteSyncTarget(
  target: SyncWriteTarget,
  evalContext: BindingTreeEvaluationContext,
): SyncRuntimeChange {
  const { valueScope, valueIndex } = ensureWritableTarget(target, "delete");
  handleMemberBan(isBannedMember(valueScope, valueIndex as string), evalContext.options);
  delete valueScope[valueIndex];
  return createChange(target, undefined, "delete", "assignment");
}

export function markReceiverDirty(
  target: SyncWriteTarget,
  newValue: any,
  kind: SyncRuntimeUpdateKind = "function-call",
): SyncRuntimeChange {
  const { valueScope, valueIndex } = ensureWritableTarget(target, kind);
  return createChange({ ...target, valueScope, valueIndex }, newValue, "mutate", kind);
}

function ensureWritableTarget(
  target: SyncWriteTarget,
  operation: string,
): Required<Pick<SyncWriteTarget, "valueScope" | "valueIndex">> {
  const { valueScope, valueIndex } = target;
  if (!valueScope || valueIndex === undefined || valueIndex === null) {
    throw new Error(`Evaluation of ${operation} requires a left-hand value.`);
  }
  if (typeof valueScope !== "object" || valueScope === null) {
    throw new Error("Unknown left-hand value");
  }
  if (valueScope === globalThis && !(valueIndex in valueScope)) {
    throw new Error(`Left value variable (${valueIndex}) not found in the scope.`);
  }
  return { valueScope, valueIndex };
}

function createChange(
  target: SyncWriteTarget,
  newValue: any,
  action: SyncRuntimeChange["action"],
  kind: SyncRuntimeUpdateKind,
): SyncRuntimeChange {
  const pathArray = target.pathArray ?? [target.valueIndex];
  return {
    rootName: target.rootName ?? (typeof pathArray[0] === "string" ? pathArray[0] : undefined),
    pathArray,
    valueScope: target.valueScope,
    valueIndex: target.valueIndex,
    newValue,
    action,
    kind,
  };
}

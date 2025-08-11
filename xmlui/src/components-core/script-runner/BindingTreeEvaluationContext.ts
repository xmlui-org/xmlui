import type { LogicalThread } from "../../abstractions/scripting/LogicalThread";
import type { ActionExecutionContext } from "../../abstractions/ActionDefs";
import type { ArrowExpression, Statement } from "./ScriptingSourceTree";
import type { BlockScope } from "../../abstractions/scripting/BlockScope";

/**
 * A function that resolves a module name to the text of the module
 */
export type ModuleResolver = (sourceModule: string, moduleName: string) => string | null;

// This type represents the context in which binding expressions and statements should be evaluated
export type BindingTreeEvaluationContext = {
  // --- Container scope
  localContext?: any;

  // --- Function to obtain the current working copy of the local context
  getLocalContext?: () => any;

  // --- Application context scope
  appContext?: any;

  // --- The main execution thread;
  mainThread?: LogicalThread;

  // --- The cancellation token to signal the cancellation of an operation
  cancellationToken?: CancellationToken;

  // --- Execution timeout in milliseconds
  timeout?: number;

  // --- Evaluation options
  options?: EvalTreeOptions;

  // --- Start time of the synchronous statement processing
  startTick?: number;

  // --- The values of event arguments to process in an ArrowExpressionStatement
  eventArgs?: any[];

  // --- Cached closure contexts for arrow expressions
  closureContexts?: Map<ArrowExpression, BlockScope[]>

  // --- Use this context wrapper with function that support implicit context
  implicitContextGetter?: ImplicitContextGetter;

  // --- Function to call on updating a localContext property (directly or indirectly)
  onUpdateHook?: (updateFn: () => any) => Promise<any>;

  // --- Call this method when a non-local variable is accessed
  onWillAccess?: (scope: any, index: string | number) => void | Promise<void>;

  // --- Call this method when a non-local variable is updated
  onWillUpdate?: (scope: any, index: string | number, updateType: UpdateType) => void | Promise<void>;

  // --- Call this method after a non-local variable has been updated
  onDidUpdate?: (scope: any, index: string | number, updateType: UpdateType) => void | Promise<void>;

  // --- Sign that a particular statement has started
  onStatementStarted?(evalContext: BindingTreeEvaluationContext, stmt: Statement): void | Promise<void>;

  // --- Sign that a particular statement has completed
  onStatementCompleted?(evalContext: BindingTreeEvaluationContext, stmt: Statement): void | Promise<void>;
};

// --- The type of non-local variable update
type UpdateType = "assignment" | "pre-post" | "function-call";

/**
 * A token that signals the cancellation of an operation
 */
class CancellationToken {
  private _cancelled = false;

  public get cancelled (): boolean {
    return this._cancelled;
  }

  public cancel (): void {
    this._cancelled = true;
  }
}

// Evaluation options to use with binding tree evaluation
export type EvalTreeOptions = {
  defaultToOptionalMemberAccess?: boolean;
};

// This function gets an object to pass as an implicit context when invoking a function on "objectWithFunction"
type ImplicitContextGetter = (objectWithFunction: any) => ActionExecutionContext;

/**
 * Creates an evaluation context with the given parts
 * @param parts Parts of the evaluation context
 * @returns New evaluation context
 */
export function createEvalContext (parts: Partial<BindingTreeEvaluationContext>): BindingTreeEvaluationContext {
  return {
    ...{
      mainThread: {
        childThreads: [],
        blocks: [{ vars: {} }],
        loops: [],
        breakLabelValue: -1
      },
      localContext: {}
    },
    ...parts
  };
}

/**
 * Error thrown when an expression attempts to access a banned DOM API while
 * `App.appGlobals.strictDomSandbox` is `true`.
 */
export class BannedApiError extends Error {
  constructor(
    public readonly api: string,
    public readonly helpText?: string,
  ) {
    super(
      `DOM API '${api}' is not allowed in XMLUI expressions.${helpText ? ` ${helpText}` : ""}`,
    );
    this.name = "BannedApiError";
  }
}

/**
 * Checks if the specified function object is banned from running.
 * @param func Function to check
 * @return Information about the banned state, including a helper text
 */
export function isBannedFunction(func: any): BannedFunctionResult {
  if (func === undefined) {
    return { banned: false };
  }
  const bannedInfo = bannedFunctions.find((f) => f.func === func);
  return bannedInfo
    ? { banned: true, func: bannedInfo.func, help: bannedInfo.help }
    : { banned: false };
}

/**
 * List of global functions we do not allow to call
 */
const bannedFunctions: BannedFunctionInfo[] = [
  { func: globalThis.cancelAnimationFrame },
  { func: globalThis.cancelIdleCallback },
  { func: globalThis.clearInterval },
  { func: globalThis.clearImmediate },
  { func: globalThis.clearTimeout },
  { func: globalThis.eval },
  { func: globalThis.queueMicrotask },
  { func: globalThis.requestAnimationFrame },
  { func: globalThis.requestIdleCallback },
  { func: globalThis.setImmediate },
  { func: globalThis.setInterval },
  { func: globalThis.setTimeout, help: "Use 'delay'" },
  // --- Step 1.1: code-injection constructors
  { func: globalThis.Function, help: "Dynamic code execution is not allowed." },
  // --- Step 1.1: WebAssembly
  ...(typeof WebAssembly !== "undefined"
    ? [
        {
          func: WebAssembly.compile as (...args: any[]) => any,
          help: "WebAssembly execution is not allowed.",
        },
        {
          func: WebAssembly.instantiate as (...args: any[]) => any,
          help: "WebAssembly execution is not allowed.",
        },
        {
          func: WebAssembly.compileStreaming as (...args: any[]) => any,
          help: "WebAssembly execution is not allowed.",
        },
        {
          func: WebAssembly.instantiateStreaming as (...args: any[]) => any,
          help: "WebAssembly execution is not allowed.",
        },
        { func: WebAssembly.Module as unknown as (...args: any[]) => any },
        { func: WebAssembly.Instance as unknown as (...args: any[]) => any },
      ]
    : []),
];

type BannedFunctionInfo = {
  func?: (...args: any[]) => any;
  help?: string;
};

type BannedFunctionResult = BannedFunctionInfo & {
  banned: boolean;
};

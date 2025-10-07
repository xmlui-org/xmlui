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
];

type BannedFunctionInfo = {
  func?: (...args: any[]) => any;
  help?: string;
};

type BannedFunctionResult = BannedFunctionInfo & {
  banned: boolean;
};

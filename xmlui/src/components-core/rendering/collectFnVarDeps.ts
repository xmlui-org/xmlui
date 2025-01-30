/**
 * This function collects all the dependencies of a function in a flat list 
 * (no circular deps).
 * @param fnDeps The dependencies of the functions. Each key is a function name
 * and the value is an array of the dependencies.
 * @returns The flat dependencies of the functions.
 * 
 * Example:
 * it("simple", () => {
 *   const fnDeps = {
 *     fn1: ["fn2", "var1", "var2"],
 *     fn2: ["var1", "var3", "fn3"],
 *     fn3: ["var4"]
 *   };
 *
 *   expect(collectFnVarDeps(fnDeps)).deep.eq({
 *     fn1: ["var1", "var3", "var4", "var2"],
 *     fn2: ["var1", "var3", "var4"],
 *     fn3: ["var4"]
 *   });
 * });
 */
export function collectFnVarDeps(fnDeps: Record<string, string[]> = {}): Record<string, string[]> {
  const fnKeys = Object.keys(fnDeps);

  function collectFnDeps(depKey: string, visitedPath = new Set<string>()) {
    if (!fnKeys.includes(depKey)) {
      return [depKey];
    }
    visitedPath.add(depKey);
    const ret: Array<string> = [];
    fnDeps[depKey].forEach((key) => {
      if (visitedPath.has(key)) {
        //we already walked here, skip this one (avoid infinite loops for circular deps)
        return;
      }
      visitedPath.add(key);
      ret.push(...collectFnDeps(key, visitedPath));
    });
    return ret;
  }

  const flatFnDeps: Record<string, string[]> = {};
  fnKeys.forEach((key) => {
    flatFnDeps[key] = [...new Set(collectFnDeps(key))];
  });
  return flatFnDeps;
}

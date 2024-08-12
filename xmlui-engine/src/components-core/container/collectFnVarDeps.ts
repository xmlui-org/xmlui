export function collectFnVarDeps(fnDeps: Record<string, Array<string>> = {}){
    const fnKeys = Object.keys(fnDeps);

    function collectFnDeps(depKey: string, visitedPath = new Set<string>()) {
        if (!fnKeys.includes(depKey)) {
            return [depKey];
        }
        visitedPath.add(depKey);
        const ret: Array<string> = [];
        fnDeps[depKey].forEach((key) => {
            if(visitedPath.has(key)){       //we already walked here, skip this one (avoid infinite loops for circular deps)
                return;
            }
            visitedPath.add(key);
            ret.push(...collectFnDeps(key, visitedPath));
        });
        return ret;
    }

    const flatFnDeps: Record<string, Array<string>> = {};
    fnKeys.forEach((key) => {
        flatFnDeps[key] = [...new Set(collectFnDeps(key))];
    });
    return flatFnDeps;
}
import type { ContainerState } from "@components-core/container/ContainerComponentDef";
import type { AppContextObject } from "@abstractions/AppContextDefs";

import { DataLoaderQueryKeyGenerator } from "@components-core/utils/DataLoaderQueryKeyGenerator";
import { extractParam } from "@components-core/utils/extractParam";

export async function invalidateQueries(
  invalidates: undefined | string | string[],
  appContext: AppContextObject,
  state: ContainerState
) {
  if (invalidates) {
    let arrayToInvalidate = [invalidates];
    if (Array.isArray(invalidates)) {
      arrayToInvalidate = invalidates;
    }
    arrayToInvalidate.forEach((invalidate) => {
      appContext.queryClient?.invalidateQueries(
        new DataLoaderQueryKeyGenerator(extractParam(state, invalidate, appContext), undefined, appContext?.appGlobals.apiUrl).asPredicate()
      );
    });
  } else {
    await appContext.queryClient?.invalidateQueries();
  }
}

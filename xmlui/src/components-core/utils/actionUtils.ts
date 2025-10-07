import type { ContainerState } from "../rendering/ContainerWrapper";
import type { AppContextObject } from "../../abstractions/AppContextDefs";

import { DataLoaderQueryKeyGenerator } from "../utils/DataLoaderQueryKeyGenerator";
import { extractParam } from "../utils/extractParam";

export async function invalidateQueries(
  invalidates: undefined | string | string[],
  appContext: AppContextObject,
  state: ContainerState,
) {
  if (invalidates) {
    let arrayToInvalidate = [invalidates];
    if (Array.isArray(invalidates)) {
      arrayToInvalidate = invalidates;
    }
    arrayToInvalidate.forEach((invalidate) => {
      void appContext.queryClient?.invalidateQueries(
        new DataLoaderQueryKeyGenerator(
          extractParam(state, invalidate, appContext),
          undefined,
          appContext?.appGlobals.apiUrl,
          undefined,
          undefined,
        ).asPredicate(),
      );
    });
  } else {
    await appContext.queryClient?.invalidateQueries();
  }
}

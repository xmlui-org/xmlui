import { useCallback } from "react";

import type {
  LoaderErrorFn,
  LoaderInProgressChangedFn,
  LoaderLoadedFn,
} from "@components-core/abstractions/LoaderRenderer";
import type { ContainerState } from "@components-core/container/ContainerComponentDef";
import type { ComponentDef } from "@abstractions/ComponentDefs";

import { Loader } from "./Loader";
import { asyncWait } from "@components-core/utils/misc";
import { extractParam } from "@components-core/utils/extractParam";
import { createLoaderRenderer } from "@components-core/renderers";
import { useAppContext } from "@components-core/AppContext";

type MockLoaderProps = {
  loader: MockLoaderDef;
  loaderInProgressChanged: LoaderInProgressChangedFn;
  loaderLoaded: LoaderLoadedFn;
  loaderError: LoaderErrorFn;
  state: ContainerState;
};

function ApiLoader({ loader, loaderInProgressChanged, loaderError, loaderLoaded, state }: MockLoaderProps) {
  const appContext = useAppContext();
  const waitTime: number = extractParam(state, loader.props.waitTime, appContext);
  const responseObj: Record<string, any>[] = extractParam(state, loader.props.data, appContext);

  const doLoad = useCallback(async () => {
    waitTime && (await asyncWait(waitTime));
    return responseObj;
  }, [responseObj, waitTime]);

  return (
    <Loader
      state={state}
      loader={loader}
      loaderInProgressChanged={loaderInProgressChanged}
      loaderLoaded={loaderLoaded}
      loaderError={loaderError}
      loaderFn={doLoad}
    />
  );
}

/**
 * Represents a loader that calls an API through an HTTP/HTTPS GET request
 */
interface MockLoaderDef extends ComponentDef<"MockLoader"> {
  props: {
    waitTime?: number;
    data: Record<string, any>;
  };
}

export const mockLoaderRenderer = createLoaderRenderer<MockLoaderDef>(
  "MockLoader",
  ({ loader, state, loaderInProgressChanged, loaderLoaded, loaderError }) => {
    return (
      <ApiLoader
        loader={loader}
        state={state}
        loaderInProgressChanged={loaderInProgressChanged}
        loaderLoaded={loaderLoaded}
        loaderError={loaderError}
      />
    );
  }
);

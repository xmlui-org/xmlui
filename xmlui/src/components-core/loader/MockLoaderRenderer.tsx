import { useCallback } from "react";

import type {
  LoaderErrorFn,
  LoaderInProgressChangedFn,
  LoaderLoadedFn,
} from "../abstractions/LoaderRenderer";
import { ComponentDef } from "../../abstractions/ComponentDefs";
import type { ContainerState } from "../rendering/ContainerWrapper";
import { asyncWait } from "../utils/misc";
import { extractParam } from "../utils/extractParam";
import { createLoaderRenderer } from "../renderers";
import { useAppContext } from "../AppContext";
import { Loader } from "./Loader";
import { createMetadata, d } from "../../components/metadata-helpers";

type MockLoaderProps = {
  loader: MockLoaderDef;
  loaderInProgressChanged: LoaderInProgressChangedFn;
  loaderIsRefetchingChanged: LoaderInProgressChangedFn;
  loaderLoaded: LoaderLoadedFn;
  loaderError: LoaderErrorFn;
  state: ContainerState;
  structuralSharing?: boolean;
};

function MockLoader({
  loader,
  loaderInProgressChanged,
  loaderIsRefetchingChanged,
  loaderError,
  loaderLoaded,
  state,
  structuralSharing
}: MockLoaderProps) {
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
      loaderIsRefetchingChanged={loaderIsRefetchingChanged}
      loaderLoaded={loaderLoaded}
      loaderError={loaderError}
      loaderFn={doLoad}
      structuralSharing={structuralSharing}
    />
  );
}

export const MockLoaderMd = createMetadata({
  status: "stable",
  description: "A loader that simulates a delay and returns a predefined response",
  props: {
    waitTime: d("The time to wait before returning the response"),
    data: d("The data to return"),
  },
});

type MockLoaderDef = ComponentDef<typeof MockLoaderMd>;

export const mockLoaderRenderer = createLoaderRenderer(
  "MockLoader",
  ({ loader, state, loaderInProgressChanged, loaderLoaded, loaderError }) => {
    return (
      <MockLoader
        loader={loader}
        state={state}
        loaderInProgressChanged={loaderInProgressChanged}
        loaderIsRefetchingChanged={loaderInProgressChanged}
        loaderLoaded={loaderLoaded}
        loaderError={loaderError}
      />
    );
  },
  MockLoaderMd,
);

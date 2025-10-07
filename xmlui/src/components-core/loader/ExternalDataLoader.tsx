import { useCallback } from "react";

import type {
  LoaderErrorFn,
  LoaderInProgressChangedFn,
  LoaderLoadedFn,
} from "../abstractions/LoaderRenderer";
import type { ComponentDef} from "../../abstractions/ComponentDefs";
import type { ContainerState } from "../rendering/ContainerWrapper";
import { removeNullProperties } from "../utils/misc";
import { extractParam } from "../utils/extractParam";
import { createLoaderRenderer } from "../renderers";
import { useAppContext } from "../AppContext";
import { Loader } from "./Loader";
import { createMetadata, d } from "../../components/metadata-helpers";

/**
 * Properties of the Data loader component
 */
type ExternalDataLoaderProps = {
  loader: ExternalDataLoaderDef;
  state: ContainerState;
  doNotRemoveNulls?: boolean;
  loaderInProgressChanged: LoaderInProgressChangedFn;
  loaderIsRefetchingChanged: LoaderInProgressChangedFn;
  loaderLoaded: LoaderLoadedFn;
  loaderError: LoaderErrorFn;
  structuralSharing?: boolean;
};

/**
 * Represents a non-displayed React component, which handles the specified API loader
 */
function ExternalDataLoader({
  loader,
  loaderInProgressChanged,
  loaderIsRefetchingChanged,
  loaderError,
  loaderLoaded,
  state,
  doNotRemoveNulls,
  structuralSharing = true,
}: ExternalDataLoaderProps) {
  const appContext = useAppContext();
  const method = extractParam(state, loader.props.method, appContext);
  const headers: Record<string, string> = extractParam(state, loader.props.headers, appContext);
  const data = extractParam(state, loader.props.data, appContext);

  const url = extractParam(state, loader.props.url, appContext);
  const urlLoadable = !!url;

  const doLoad = useCallback(async () => {
    if (!urlLoadable) {
      return;
    }
    const response = await fetch(url, {
      method: method || "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(data),
    });
    const responseObj = await response.json();
    if (!doNotRemoveNulls) {
      removeNullProperties(responseObj);
    }
    return responseObj;
  }, [urlLoadable, headers, data, url, method, doNotRemoveNulls]);

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

export const ExternalDataLoaderMd = createMetadata({
  status: "stable",
  description: `Represents a loader that calls an API through an HTTP/HTTPS GET request`,
  props: {
    url: d("URL segment to use in the GET request"),
    method: d("The HTTP method to use"),
    headers: d("Headers to send with the request"),
    data: d("The body of the request to be sent as JSON"),
  },
});

type ExternalDataLoaderDef = ComponentDef<typeof ExternalDataLoaderMd>;

export const externalDataLoaderRenderer = createLoaderRenderer(
  "ExternalDataLoader",
  ({ loader, state, loaderInProgressChanged, loaderIsRefetchingChanged, loaderError, loaderLoaded }) => {
    return (
      <ExternalDataLoader
        loader={loader}
        state={state}
        loaderInProgressChanged={loaderInProgressChanged}
        loaderIsRefetchingChanged={loaderIsRefetchingChanged}
        loaderLoaded={loaderLoaded}
        loaderError={loaderError}
      />
    );
  },
  ExternalDataLoaderMd,
);

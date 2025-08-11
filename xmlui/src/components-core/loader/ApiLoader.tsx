import { useCallback } from "react";

import type {
  LoaderErrorFn,
  LoaderInProgressChangedFn,
  LoaderLoadedFn,
} from "../abstractions/LoaderRenderer";
import { ComponentDef } from "../../abstractions/ComponentDefs";
import type { ContainerState } from "../rendering/ContainerWrapper";
import { removeNullProperties } from "../utils/misc";
import { extractParam } from "../utils/extractParam";
import { createLoaderRenderer } from "../renderers";
import { useAppContext } from "../AppContext";
import { Loader } from "./Loader";
import { createMetadata, d } from "../../components/metadata-helpers";

/**
 * Properties of the API loader component
 */
type ApiLoaderProps = {
  loader: ApiLoaderDef;
  loaderInProgressChanged: LoaderInProgressChangedFn;
  loaderIsRefetchingChanged: LoaderInProgressChangedFn;
  loaderLoaded: LoaderLoadedFn;
  loaderError: LoaderErrorFn;
  state: ContainerState;
  doNotRemoveNulls?: boolean;
  structuralSharing?: boolean;
};

/**
 * Represents a non-displayed React component, which handles the specified API loader
 */
function ApiLoader({
  loader,
  loaderInProgressChanged,
  loaderIsRefetchingChanged,
  loaderLoaded,
  loaderError,
  state,
  doNotRemoveNulls,
  structuralSharing = true,
}: ApiLoaderProps) {
  const appContext = useAppContext();

  const url = extractParam(state, loader.props.url, appContext);
  const loadable = !!url;

  const doLoad = useCallback(async () => {
    if (!loadable) {
      return;
    }
    const response = await fetch(url);
    if (loader.props.raw) {
      return await response.text();
    }
    const responseObj = await response.json();
    if (!doNotRemoveNulls) {
      removeNullProperties(responseObj);
    }
    return responseObj;
  }, [doNotRemoveNulls, loadable, loader.props.raw, url]);

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

const ApiLoaderMd = createMetadata({
  status: "stable",
  description: `Represents a loader that calls an API through an HTTP/HTTPS GET request`,
  props: {
    url: d("URL segment to use in the GET request"),
    raw: d("If true, the loader returns the raw text response instead of parsing it as JSON"),
  },
});

type ApiLoaderDef = ComponentDef<typeof ApiLoaderMd>;

export const apiLoaderRenderer = createLoaderRenderer(
  "ApiLoader",
  ({ loader, state, loaderInProgressChanged, loaderIsRefetchingChanged, loaderLoaded, loaderError }) => {
    return (
      <ApiLoader
        loader={loader}
        state={state}
        loaderInProgressChanged={loaderInProgressChanged}
        loaderIsRefetchingChanged={loaderIsRefetchingChanged}
        loaderLoaded={loaderLoaded}
        loaderError={loaderError}
      />
    );
  },
  ApiLoaderMd,
);

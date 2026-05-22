import { useCallback } from "react";

import type {
  LoaderErrorFn,
  LoaderInProgressChangedFn,
  LoaderLoadedFn,
} from "../abstractions/LoaderRenderer";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { ContainerState } from "../rendering/ContainerWrapper";
import { removeNullProperties } from "../utils/misc";
import { extractParam } from "../utils/extractParam";
import { createLoaderRenderer } from "../renderers";
import { useAppContext } from "../AppContext";
import { Loader } from "./Loader";
import { createMetadata, d } from "../../components/metadata-helpers";

// Wires an XMLUI ApiLoader definition to the shared Loader lifecycle.
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

// Non-visual loader that resolves its URL and fetches either JSON or raw text.
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
  const hasResolvedUrl = !!url;

  const loadFromApi = useCallback(async () => {
    if (!hasResolvedUrl) {
      return;
    }

    const response = await fetch(url);
    if (loader.props.raw) {
      return await response.text();
    }

    const responseData = await response.json();
    if (!doNotRemoveNulls) {
      removeNullProperties(responseData);
    }
    return responseData;
  }, [doNotRemoveNulls, hasResolvedUrl, loader.props.raw, url]);

  return (
    <Loader
      state={state}
      loader={loader}
      loaderInProgressChanged={loaderInProgressChanged}
      loaderIsRefetchingChanged={loaderIsRefetchingChanged}
      loaderLoaded={loaderLoaded}
      loaderError={loaderError}
      loaderFn={loadFromApi}
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
  ({
    loader,
    state,
    loaderInProgressChanged,
    loaderIsRefetchingChanged,
    loaderLoaded,
    loaderError,
  }) => {
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

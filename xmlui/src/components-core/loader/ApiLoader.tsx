import { useCallback } from "react";

import type {
  LoaderErrorFn,
  LoaderInProgressChangedFn,
  LoaderLoadedFn,
} from "@components-core/abstractions/LoaderRenderer";
import type { ContainerState } from "@components-core/container/ContainerComponentDef";
import type { ComponentDef } from "@abstractions/ComponentDefs";

import { Loader } from "./Loader";
import { removeNullProperties } from "@components-core/utils/misc";
import { extractParam } from "@components-core/utils/extractParam";
import { createLoaderRenderer } from "@components-core/renderers";
import { useAppContext } from "@components-core/AppContext";

/**
 * Properties of the API loader component
 */
type ApiLoaderProps = {
  loader: ApiLoaderDef;
  loaderInProgressChanged: LoaderInProgressChangedFn;
  loaderLoaded: LoaderLoadedFn;
  loaderError: LoaderErrorFn;
  state: ContainerState;
  doNotRemoveNulls?: boolean;
};

/**
 * Represents a non-displayed React component, which handles the specified API loader
 */
function ApiLoader({
  loader,
  loaderInProgressChanged,
  loaderLoaded,
  loaderError,
  state,
  doNotRemoveNulls,
}: ApiLoaderProps) {
  const appContext = useAppContext();

  const url = extractParam(state, loader.props.url, appContext);
  const loadable = !!url;

  const doLoad = useCallback(async () => {
    if (!loadable) {
      return;
    }
    console.log("doLoad ", url);
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
      loaderLoaded={loaderLoaded}
      loaderError={loaderError}
      loaderFn={doLoad}
    />
  );
}

/**
 * Represents a loader that calls an API through an HTTP/HTTPS GET request
 */
interface ApiLoaderDef extends ComponentDef<"ApiLoader"> {
  props: {
    /**
     * URL segment to use in the GET request
     */
    url: string;
    raw?: boolean;
  };
}

export const apiLoaderRenderer = createLoaderRenderer<ApiLoaderDef>(
  "ApiLoader",
  ({ loader, state, dispatch, loaderInProgressChanged, loaderLoaded, loaderError }) => {
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

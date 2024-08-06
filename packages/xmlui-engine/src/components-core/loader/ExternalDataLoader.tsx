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
 * Properties of the Data loader component
 */
type ExternalDataLoaderProps = {
  loader: ExternalDataLoaderDef;
  state: ContainerState;
  doNotRemoveNulls?: boolean;
  loaderInProgressChanged: LoaderInProgressChangedFn;
  loaderLoaded: LoaderLoadedFn;
  loaderError: LoaderErrorFn;
};

/**
 * Represents a non-displayed React component, which handles the specified API loader
 */
function ExternalDataLoader({
  loader,
  loaderInProgressChanged,
  loaderError,
  loaderLoaded,
  state,
  doNotRemoveNulls,
}: ExternalDataLoaderProps) {
  const appContext = useAppContext();
  const method = extractParam(state, loader.props.method, appContext);
  const headers: Record<string, string> = extractParam(state, loader.props.headers, appContext);
  const data = extractParam(state, loader.props.data, appContext);

  console.log("resolve");
  const url = extractParam(state, loader.props.url, appContext);
  const urlLoadable = !!url;

  const doLoad = useCallback(async () => {
    if (!urlLoadable) {
      return;
    }
    console.log("doLoad ", url, data);
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
    console.log("result", responseObj);
    return responseObj;
  }, [urlLoadable, headers, data, url, method, doNotRemoveNulls]);

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
interface ExternalDataLoaderDef extends ComponentDef<"ExternalDataLoader"> {
  props: {
    url: string;
    method: "GET" | "POST";
    headers: Record<string, string>;
    data: any;
  };
}

export const externalDataLoaderRenderer = createLoaderRenderer<ExternalDataLoaderDef>(
  "ExternalDataLoader",
  ({ loader, state, loaderInProgressChanged, loaderError, loaderLoaded }) => {
    return (
      <ExternalDataLoader
        loader={loader}
        state={state}
        loaderInProgressChanged={loaderInProgressChanged}
        loaderLoaded={loaderLoaded}
        loaderError={loaderError}
      />
    );
  }
);

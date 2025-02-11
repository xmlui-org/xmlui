import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { ActionExecutionContext } from "../../abstractions/ActionDefs";
import type { ApiActionOptions, DownloadOperationDef } from "../RestApiProxy";
import RestApiProxy from "../RestApiProxy";

import { createAction } from "./actions";

export interface DownloadActionComponent extends ComponentDef {
  props: DownloadOperationDef;
}

async function download(
  { state, appContext }: ActionExecutionContext,
  {
    params,
    url,
    queryParams,
    method,
    rawBody,
    body,
    fileName,
    headers,
  }: {
    params: any;
  } & DownloadOperationDef,
  { resolveBindingExpressions }: ApiActionOptions = {}
) {
  const context = { ...params, ...state };
  const operation: DownloadOperationDef = {
    url,
    queryParams,
    method,
    rawBody,
    body,
    fileName,
    headers,
  };

  const api = new RestApiProxy(appContext);
  const _url = api.resolveUrl({ operation, params: context, resolveBindingExpressions });

  if (
    (operation.method && (operation.method as string).toLowerCase() !== "get") ||
    Object.keys(appContext.appGlobals?.headers || {}).length !== 0 || //if we have any headers for the api, we can't use the iframe trick
    appContext.apiInterceptorContext.isMocked(_url) //if we mock this url, the mock can't work in an iframe, so we must fall back to download it with the restApiProxy
  ) {
    const file: File = await api.execute({
      operation,
      params: context,
      parseOptions: {
        asFile: true,
      },
      resolveBindingExpressions,
    });
    downloadWithAnchor(file);
  } else {
    downloadInIframe(_url);
  }
}

//we use a hidden iframe trick here,
// we set the iframe source as the download url, this way the browser will ask to download the file, and show a progress bar
// (we could use an anchor tag with a download attribute, but in this case we can't show progress )
// we can use it if we don't have to add extra headers to the request in order to download a file (pre-signed urls, or public urls)
function downloadInIframe(fileUrl: string) {
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.hidden = true;
  iframe.name = fileUrl;
  iframe.id = `download-iframe_${fileUrl}`;
  iframe.src = fileUrl;
  document.body.appendChild(iframe);
  setTimeout(() => {
    iframe.remove();
  }, 20000);
}

// we can use it if we do have to add extra headers to the request in order to download a file (urls require authentication)
function downloadWithAnchor(file: File) {
  const url = window.URL.createObjectURL(file);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  // the filename you want
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}

export const downloadAction = createAction("download", download);

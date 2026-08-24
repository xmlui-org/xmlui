import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { ActionExecutionContext } from "../../abstractions/ActionDefs";
import type { ApiActionOptions, DownloadOperationDef } from "../RestApiProxy";
import RestApiProxy from "../RestApiProxy";
import { extractParam } from "../utils/extractParam";

import { createAction } from "./actions";
import {
  createCancelledOperationResult,
  createOperationAbortError,
  getAbortSignalReason,
  isAbortError,
} from "./operationCancellation";

export interface DownloadActionComponent extends ComponentDef {
  props: DownloadOperationDef;
  events?: {
    cancel?: string;
  };
}

async function download(
  { state, appContext, lookupAction, uid }: ActionExecutionContext,
  {
    params,
    url,
    queryParams,
    method,
    rawBody,
    body,
    fileName,
    headers,
    onCancel,
    abortSignal,
  }: {
    params: any;
    onCancel?: string;
    abortSignal?: AbortSignal;
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
  const operationHeaders = resolveBindingExpressions
    ? extractParam(context, headers, appContext)
    : headers;
  const configHeaders = appContext.xmluiConfig?.headers ?? appContext.appGlobals?.headers;
  const hasOperationHeaders = Object.keys(operationHeaders || {}).length !== 0;
  const hasConfigHeaders = Object.keys(configHeaders || {}).length !== 0;
  const cancel = async () => {
    const reason = getAbortSignalReason(abortSignal);
    const onCancelFn = lookupAction(onCancel, uid, { eventName: "cancel" });
    await onCancelFn?.(reason, context["$param"]);
    return createCancelledOperationResult(reason);
  };

  if (abortSignal?.aborted) {
    return await cancel();
  }

  if (
    (operation.method && (operation.method as string).toLowerCase() !== "get") ||
    hasOperationHeaders || // if the download needs per-request headers, we can't use the iframe trick
    hasConfigHeaders || //if we have any headers for the api, we can't use the iframe trick
    appContext.apiInterceptorContext.isMocked(_url) //if we mock this url, the mock can't work in an iframe, so we must fall back to download it with the restApiProxy
  ) {
    try {
      const file: File = await api.execute({
        operation,
        params: context,
        parseOptions: {
          asFile: true,
        },
        resolveBindingExpressions,
        abortSignal,
      });
      if (abortSignal?.aborted) {
        throw createOperationAbortError();
      }
      downloadWithAnchor(file);
    } catch (e) {
      if (isAbortError(e) || abortSignal?.aborted) {
        return await cancel();
      }
      throw e;
    }
  } else {
    downloadInIframe(_url, abortSignal, () => {
      void cancel();
    });
  }
}

//we use a hidden iframe trick here,
// we set the iframe source as the download url, this way the browser will ask to download the file, and show a progress bar
// (we could use an anchor tag with a download attribute, but in this case we can't show progress )
// we can use it if we don't have to add extra headers to the request in order to download a file (pre-signed urls, or public urls)
function downloadInIframe(fileUrl: string, abortSignal?: AbortSignal, onCancel?: () => void) {
  if (abortSignal?.aborted) {
    onCancel?.();
    return;
  }
  const iframe = document.createElement("iframe");
  let cleanupTimeout: ReturnType<typeof setTimeout> | undefined;
  const cleanup = () => {
    if (cleanupTimeout) {
      clearTimeout(cleanupTimeout);
      cleanupTimeout = undefined;
    }
    abortSignal?.removeEventListener("abort", abortHandler);
    iframe.remove();
  };
  const abortHandler = () => {
    cleanup();
    onCancel?.();
  };

  iframe.style.display = "none";
  iframe.hidden = true;
  iframe.name = fileUrl;
  iframe.id = `download-iframe_${fileUrl}`;
  iframe.src = fileUrl;
  document.body.appendChild(iframe);
  abortSignal?.addEventListener("abort", abortHandler, { once: true });
  cleanupTimeout = setTimeout(() => {
    cleanup();
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

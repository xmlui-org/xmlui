import type { ActionExecutionContext } from "../../abstractions/ActionDefs";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import { extractParam } from "../utils/extractParam";
import { invalidateQueries } from "../utils/actionUtils";
import type { ApiActionOptions, UploadOperationDef } from "../RestApiProxy";
import RestApiProxy from "../RestApiProxy";
import { createAction } from "./actions";

export interface UploadActionComponent extends ComponentDef {
  props: {
    invalidates?: string | string[];
  } & UploadOperationDef;
  events?: {
    error?: string;
    success?: string;
  };
}

export type UploadActionParams = {
  invalidates?: string | string[];
  params: any;
  chunkSizeInBytes?: number;
  onError?: string;
  onProgress?: (...args: any) => void;
} & UploadOperationDef;

async function uploadFile(
  { appContext, state, lookupAction, uid }: ActionExecutionContext,
  {
    params,
    invalidates,
    onError,
    queryParams,
    asForm,
    file,
    headers,
    url,
    method,
    formParams,
    rawBody,
    body,
    chunkSizeInBytes,
    onProgress,
  }: UploadActionParams,
  { resolveBindingExpressions }: ApiActionOptions = {},
) {
  const stateContext = { ...params, ...state };
  const api = new RestApiProxy(appContext);

  const operation: UploadOperationDef = {
    file,
    body,
    asForm,
    formParams,
    rawBody,
    method,
    url,
    queryParams,
    headers,
  };

  let result = null;
  try {
    const _chunkSizeInBytes = extractParam(stateContext, chunkSizeInBytes, appContext);
    const _onProgress = extractParam(stateContext, onProgress, appContext);
    if (_chunkSizeInBytes !== undefined) {
      const _file = extractParam(stateContext, file, appContext);
      const numberOfChunks = Math.ceil(_file.size / _chunkSizeInBytes);

      for (let i = 0; i < numberOfChunks; i++) {
        const start = i * _chunkSizeInBytes;
        const chunkEnd = Math.min(start + _chunkSizeInBytes, _file.size);
        const chunk = _file.slice(start, chunkEnd);
        result = await api.upload({
          operation,
          chunk: {
            blob: chunk,
            chunkStart: start,
            chunkEnd: chunkEnd,
          },
          params: stateContext,
          onUploadProgress: (progressEvent) => {
            const overallTotal = _file.size;
            const overallLoaded = start + progressEvent.loaded;
            const overallProgressEvent = {
              total: overallTotal,
              loaded: overallLoaded,
              progress: overallLoaded / overallTotal,
            };
            _onProgress?.(overallProgressEvent);
          },
          resolveBindingExpressions,
        });
      }
    } else {
      result = await api.upload({
        operation,
        params: stateContext,
        onUploadProgress: _onProgress,
        resolveBindingExpressions,
      });
    }
  } catch (e) {
    const onErrorFn = lookupAction(onError, uid, { eventName: "error" });
    const result = await onErrorFn?.(e, stateContext["$param"]);
    if (result !== false) {
      throw e;
    }
  }
  void invalidateQueries(invalidates, appContext, state);
  return result;
}

export const uploadAction = createAction("upload", uploadFile);

import type { ActionExecutionContext } from "../../abstractions/ActionDefs";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import { extractParam } from "../utils/extractParam";
import { invalidateQueries } from "../utils/actionUtils";
import type { ApiActionOptions, UploadOperationDef } from "../RestApiProxy";
import RestApiProxy from "../RestApiProxy";
import { createAction } from "./actions";
import {
  createCancelledOperationResult,
  createOperationAbortError,
  getAbortSignalReason,
  isAbortError,
} from "./operationCancellation";

export interface UploadActionComponent extends ComponentDef {
  props: {
    invalidates?: string | string[];
  } & UploadOperationDef;
  events?: {
    error?: string;
    success?: string;
    cancel?: string;
  };
}

export type UploadActionParams = {
  invalidates?: string | string[];
  params: any;
  chunkSizeInBytes?: number;
  onError?: string;
  onSuccess?: string;
  onCancel?: string;
  onProgress?: (...args: any) => void;
  abortSignal?: AbortSignal;
  omitTransactionId?: boolean;
} & UploadOperationDef;

function throwIfAborted(abortSignal?: AbortSignal) {
  if (abortSignal?.aborted) {
    throw createOperationAbortError();
  }
}

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
    onSuccess,
    onCancel,
    abortSignal,
    fieldName,
    omitTransactionId,
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
    fieldName,
  };

  let result = null;
  try {
    throwIfAborted(abortSignal);
    const _chunkSizeInBytes = extractParam(stateContext, chunkSizeInBytes, appContext);
    const _onProgress = extractParam(stateContext, onProgress, appContext);
    if (_chunkSizeInBytes !== undefined) {
      const _file = extractParam(stateContext, file, appContext);
      const numberOfChunks = Math.ceil(_file.size / _chunkSizeInBytes);

      for (let i = 0; i < numberOfChunks; i++) {
        throwIfAborted(abortSignal);
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
          onUploadProgress: _onProgress
            ? (progressEvent) => {
                if (abortSignal?.aborted) {
                  return;
                }
                const overallTotal = _file.size;
                const overallLoaded = start + progressEvent.loaded;
                const overallProgressEvent = {
                  total: overallTotal,
                  loaded: overallLoaded,
                  progress: overallLoaded / overallTotal,
                };
                _onProgress(overallProgressEvent);
              }
            : undefined,
          abortSignal,
          resolveBindingExpressions,
          omitTransactionId,
        });
      }
    } else {
      result = await api.upload({
        operation,
        params: stateContext,
        onUploadProgress: _onProgress,
        abortSignal,
        resolveBindingExpressions,
        omitTransactionId,
      });
    }
  } catch (e) {
    if (isAbortError(e) || abortSignal?.aborted) {
      const onCancelFn = lookupAction(onCancel, uid, { eventName: "cancel" });
      const reason = getAbortSignalReason(abortSignal);
      await onCancelFn?.(reason, stateContext["$param"]);
      return createCancelledOperationResult(reason);
    }
    const onErrorFn = lookupAction(onError, uid, { eventName: "error" });
    const result = await onErrorFn?.(e, stateContext["$param"]);
    if (result !== false) {
      throw e;
    }
  }
  const onSuccessFn = lookupAction(onSuccess, uid, { eventName: "success" });
  const onSuccessResult = await onSuccessFn?.(result, stateContext["$param"]);
  if (onSuccessResult !== false) {
    void invalidateQueries(invalidates, appContext, state);
  }
  return result;
}

export const uploadAction = createAction("upload", uploadFile);

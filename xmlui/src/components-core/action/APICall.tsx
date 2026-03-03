import toast from "react-hot-toast";
import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { createDraft, finishDraft } from "immer";

import type { AppContextObject } from "../../abstractions/AppContextDefs";
import { pushXsLog, getCurrentTrace } from "../inspector/inspectorUtils";

// --- Tracing helper for API calls
function traceApiCall(
  appContext: AppContextObject,
  kind: "api:start" | "api:complete" | "api:error",
  url: string,
  method: string,
  details?: Record<string, any>,
) {
  if (appContext.appGlobals?.xsVerbose !== true) return;
  pushXsLog({
    ts: Date.now(),
    perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
    traceId: getCurrentTrace(),
    kind,
    url,
    method,
    ...details,
  });
}
import type { AsyncFunction } from "../../abstractions/FunctionDefs";
import type { ActionExecutionContext, LookupAsyncFnInner } from "../../abstractions/ActionDefs";
import { invalidateQueries } from "../utils/actionUtils";
import { extractParam, shouldKeep } from "../utils/extractParam";
import { randomUUID } from "../utils/misc";
import type { ApiActionOptions, ApiOperationDef } from "../RestApiProxy";
import RestApiProxy, { getLastApiStatus } from "../RestApiProxy";
import { createAction } from "./actions";
import { createContextVariableError } from "../EngineError";

function findQueryKeysToUpdate(updates: string | string[], queryClient: QueryClient) {
  const queryKeysToUpdate: Array<QueryKey> = [];
  if (updates) {
    let updatesArray: Array<string>;
    if (Array.isArray(updates)) {
      updatesArray = updates;
    } else {
      updatesArray = [updates];
    }
    updatesArray.forEach((queryUrl) => {
      queryClient
        .getQueryCache()
        .getAll()
        .forEach((query) => {
          if (query.queryKey[0] === queryUrl) {
            queryKeysToUpdate.push(query.queryKey);
          }
        });
    });
  }
  return queryKeysToUpdate;
}

function prepareOptimisticValue(value: any, clientTxId: string) {
  return {
    ...value,
    id: value.id || clientTxId,
    _optimisticValue: true,
    _initiatorClientTxId: clientTxId,
  };
}

async function prepareOptimisticValuesForQueries(
  queryKeys: Array<QueryKey>,
  queryClient: QueryClient,
  clientTxId: string,
  stateContext: any,
  resolvedOptimisticValue?: any,
  optimisticValueGetter?: AsyncFunction,
) {
  const ret: Map<QueryKey, any> = new Map();

  await Promise.all(
    queryKeys.map(async (queryKey) => {
      if (resolvedOptimisticValue) {
        ret.set(queryKey, prepareOptimisticValue(resolvedOptimisticValue, clientTxId));
        return;
      }
      if (!optimisticValueGetter) {
        return;
      }
      const currentData = queryClient.getQueryData(queryKey) as any;
      const flatData = currentData?.pages
        ? currentData.pages.flatMap((page: any) => page)
        : currentData;
      const optimisticValue = await optimisticValueGetter(flatData, stateContext["$param"]);
      if (optimisticValue) {
        ret.set(queryKey, prepareOptimisticValue(optimisticValue, clientTxId));
      }
    }),
  );

  return ret;
}

async function doOptimisticUpdate(
  optimisticValuesByQueryKeys: Map<QueryKey, any>,
  queryClient: QueryClient,
) {
  if (!optimisticValuesByQueryKeys.size) {
    return;
  }
  for (const entry of optimisticValuesByQueryKeys.entries()) {
    const [key, optimisticValue] = entry;
    await queryClient.cancelQueries({ queryKey: key });
    const oldData = queryClient.getQueryData(key) as any;

    const draft = createDraft(oldData as any);
    if (draft.pages) {
      let updated = false;
      draft.pages.forEach((page: any) => {
        page.forEach((item: any) => {
          if (item.id === optimisticValue.id) {
            Object.assign(item, optimisticValue);
            updated = true;
          }
        });
      });
      if (!updated) {
        draft.pages[draft.pages.length - 1].push(optimisticValue);
      }
    } else {
      let updated = false;
      draft.forEach((item: any) => {
        if (item.id === optimisticValue.id) {
          Object.assign(item, optimisticValue);
          updated = true;
        }
      });
      if (!updated) {
        draft.push(optimisticValue);
      }
    }
    const newData = finishDraft(draft);
    queryClient.setQueryData(key, newData);
    // console.log("optimistic added", { finalOptimisticValue, newData });
  }
}

function updateQueriesWithResult(
  queryKeysToUpdate: Array<QueryKey>,
  optimisticValuesByQueryKeys: Map<QueryKey, any>,
  clientTxId: string,
  queryClient: QueryClient,
  result: any,
) {
  if (!queryKeysToUpdate.length) {
    return;
  }
  queryKeysToUpdate.forEach((key) => {
    const oldData = queryClient.getQueryData(key) as any;
    const draft = createDraft(oldData as any);
    const optimisticValue = optimisticValuesByQueryKeys.get(key);
    if (draft.pages) {
      //pageable loader
      if (optimisticValue) {
        draft.pages[draft.pages.length - 1] = draft.pages[draft.pages.length - 1].map(
          (item: any) =>
            item.id === optimisticValue.id && item._initiatorClientTxId === clientTxId
              ? result || {
              ...item,
              _optimisticValue: undefined,
              _initiatorClientTxId: undefined,
            }
              : item,
        );
      } else {
        let updated = false;
        draft.pages.forEach((page: any) => {
          page?.forEach((item: any) => {
            if (item.id === result?.id) {
              Object.assign(item, result);
              updated = true;
            }
          });
        });
        if (!updated && result) {
          draft.pages[draft.pages.length - 1].push(result);
        }
      }
    } else {
      if (optimisticValue) {
        draft.forEach((item: any, index: number) => {
          if (item.id === optimisticValue.id && item._initiatorClientTxId === clientTxId) {
            draft[index] = result || {
              ...item,
              _optimisticValue: undefined,
              _initiatorClientTxId: undefined,
            };
          }
        });
      } else {
        let updated = false;
        draft.forEach((item: any, index: number) => {
          if (item.id === result.id) {
            draft[index] = result || {
              ...item,
              _optimisticValue: undefined,
              _initiatorClientTxId: undefined,
            };
            updated = true;
          }
        });
        if (!updated && result) {
          draft.push(result);
        }
      }
    }
    const newData = finishDraft(draft);
    queryClient.setQueryData(key, newData);
  });
}

async function updateQueriesWithOptimisticValue({
                                                  stateContext,
                                                  updates,
                                                  appContext,
                                                  queryClient,
                                                  clientTxId,
                                                  optimisticValue,
                                                  lookupAction,
                                                  getOptimisticValue,
                                                  uid,
                                                }: {
  stateContext: any;
  updates: string | string[] | undefined;
  appContext: AppContextObject;
  queryClient: QueryClient;
  clientTxId: string;
  optimisticValue: any;
  lookupAction: LookupAsyncFnInner;
  getOptimisticValue?: string;
  uid: symbol;
}) {
  const queryKeysToUpdate = findQueryKeysToUpdate(
    extractParam(stateContext, updates, appContext),
    queryClient,
  );
  const optimisticValuesByQueryKeys = await prepareOptimisticValuesForQueries(
    queryKeysToUpdate,
    queryClient,
    clientTxId,
    stateContext,
    extractParam(stateContext, optimisticValue, appContext),
    lookupAction(getOptimisticValue, uid, { eventName: "getOptimisticValue" }),
  );

  await doOptimisticUpdate(optimisticValuesByQueryKeys, queryClient);
  return { queryKeysToUpdate, optimisticValuesByQueryKeys };
}

type APICall = {
  invalidates?: string | string[];
  updates?: string | string[];
  confirmTitle?: string;
  confirmMessage?: string;
  confirmButtonLabel?: string;
  params?: any;
  payloadType?: string;
  optimisticValue?: any;
  getOptimisticValue?: string;
  inProgressNotificationMessage?: string;
  completedNotificationMessage?: string;
  errorNotificationMessage?: string;
  credentials?: "omit" | "same-origin" | "include";

  uid?: string | symbol;
  when?: string;

  onBeforeRequest?: string;
  onSuccess?: string | ((...args: any[]) => Promise<any>);
  onProgress?: string;
  onError?: string;
} & ApiOperationDef;

export async function callApi(
  { state, appContext, lookupAction, getCurrentState, apiInstance, location }: ActionExecutionContext,
  {
    confirmTitle,
    confirmMessage,
    confirmButtonLabel,
    params = {},
    onBeforeRequest,
    onSuccess,
    onError,
    invalidates,
    updates,
    optimisticValue,
    payloadType,
    when,
    getOptimisticValue,
    inProgressNotificationMessage,
    completedNotificationMessage,
    errorNotificationMessage,
    uid: actionUid,
    onProgress,

    //operation
    headers,
    url,
    queryParams,
    rawBody,
    method,
    body,
    credentials,
  }: APICall,
  { resolveBindingExpressions }: ApiActionOptions = {},
) {
  const uid = typeof actionUid === "symbol" ? actionUid : Symbol(actionUid);
  const stateContext = { ...state, ...params };
  if (!shouldKeep(when, stateContext, appContext)) {
    return;
  }
  if (confirmTitle || confirmMessage || confirmButtonLabel) {
    const title = extractParam(stateContext, confirmTitle, appContext);
    const message = extractParam(stateContext, confirmMessage, appContext);
    const buttonLabel = extractParam(stateContext, confirmButtonLabel, appContext);
    const dialogCheck = await appContext.confirm(
      title ?? "Confirm Operation",
      message ?? "Are you sure you want to perform this operation?",
      buttonLabel ?? "Yes",
    );
    if (!dialogCheck) return;
  }
  const resolvedInvalidates = extractParam(stateContext, invalidates, appContext);

  const clientTxId = randomUUID();
  const beforeRequestFn = lookupAction(onBeforeRequest, uid, { eventName: "beforeRequest" });
  const beforeRequestResult = await beforeRequestFn?.();
  if (typeof beforeRequestResult === "boolean" && beforeRequestResult === false) {
    return;
  }

  const { queryKeysToUpdate, optimisticValuesByQueryKeys } = await updateQueriesWithOptimisticValue(
    {
      stateContext,
      updates,
      appContext,
      queryClient: appContext.queryClient!,
      clientTxId,
      optimisticValue,
      lookupAction,
      getOptimisticValue,
      uid,
    },
  );

  const inProgressMessage = extractParam(stateContext, inProgressNotificationMessage, appContext);

  let loadingToastId;
  if (inProgressMessage) {
    loadingToastId = toast.loading(inProgressMessage);
  }

  // Resolve URL/body for tracing (handle binding expressions)
  // Wrapped in try-catch since tracing should never break the API call
  const resolvedMethod = method || "GET";
  let resolvedUrl: string | undefined;
  let resolvedBody: any = undefined;
  try {
    resolvedUrl = extractParam(stateContext, url, appContext);
    if (rawBody) {
      resolvedBody = extractParam(stateContext, rawBody, appContext);
    } else if (body) {
      resolvedBody = extractParam(stateContext, body, appContext);
    }
  } catch {
    // Tracing resolution failed - use raw values as fallback
    resolvedUrl = typeof url === "string" ? url : "[unresolved]";
    resolvedBody = rawBody || body;
  }

  try {
    const operation: ApiOperationDef = {
      headers,
      url,
      queryParams,
      rawBody,
      method,
      body,
      payloadType,
      credentials,
    };
    const _onProgress = lookupAction(onProgress, uid, {
      eventName: "progress",
    });

    // Trace API call start
    traceApiCall(appContext, "api:start", resolvedUrl, resolvedMethod, {
      transactionId: clientTxId,
      body: resolvedBody,
    });

    const result = await new RestApiProxy(appContext, apiInstance).execute({
      operation,
      params: stateContext,
      transactionId: clientTxId,
      resolveBindingExpressions,
      onProgress: _onProgress,
    });

    // Trace API call completion
    traceApiCall(appContext, "api:complete", resolvedUrl, resolvedMethod, {
      transactionId: clientTxId,
      body: resolvedBody,
      result,
      status: getLastApiStatus(clientTxId),
    });

    const onSuccessFn = typeof onSuccess === "function"
      ? onSuccess
      : lookupAction(onSuccess, uid, { eventName: "success", context: getCurrentState() });
    const onSuccessResult = await onSuccessFn?.(result, stateContext["$param"]);

    updateQueriesWithResult(
      queryKeysToUpdate,
      optimisticValuesByQueryKeys,
      clientTxId,
      appContext.queryClient!,
      result,
    );

    // An explicit `false` return from onSuccess opts out of invalidation.
    // Any other return value (including undefined/void) proceeds normally.
    const skipInvalidation = onSuccessResult === false;
    if (!skipInvalidation && (resolvedInvalidates || !updates)) {
      // Defer invalidation to a macrotask so that any navigate() call made
      // synchronously in a parent success handler (e.g. Form.onSuccess) has
      // time to be scheduled. React then commits the navigation render and
      // unmounts DataSource components before the invalidation triggers a
      // re-fetch. The react-query AbortController cancels any in-flight
      // requests from unmounted components, preventing wasted network traffic.
      setTimeout(() => {
        void invalidateQueries(resolvedInvalidates, appContext, state);
      }, 0);
    }
    const completedMessage = extractParam(
      { ...stateContext, $result: result },
      completedNotificationMessage,
      appContext,
    );
    if (completedMessage) {
      toast.success(completedMessage, {
        id: loadingToastId,
      });
    } else if (loadingToastId) {
      toast.dismiss(loadingToastId);
    }
    return result;
  } catch (e: any) {
    // Trace API call error
    traceApiCall(appContext, "api:error", resolvedUrl, resolvedMethod, {
      transactionId: clientTxId,
      body: resolvedBody,
      error: { message: e?.message || String(e), stack: e?.stack },
    });

    if (optimisticValuesByQueryKeys.size) {
      await appContext.queryClient!.invalidateQueries();
    }
    const onErrorFn = lookupAction(onError, uid, {
      eventName: "error",
    });
    const result = await onErrorFn?.(e, stateContext["$param"]);
    const errorMessage = extractParam(
      { ...stateContext, $error: createContextVariableError(e) },
      errorNotificationMessage,
      appContext,
    );
    if (errorMessage) {
      toast.error(errorMessage, {
        id: loadingToastId,
      });
    } else {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      if (result !== false) {
        //stop the error propagation, if the error handler returns false
        throw e;
      }
    }
  }
}

export const apiAction = createAction("callApi", callApi);

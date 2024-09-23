import toast from "react-hot-toast";

import type { ApiActionOptions, ApiOperationDef } from "@components-core/RestApiProxy";
import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { AppContextObject } from "@abstractions/AppContextDefs";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { AsyncFunction } from "@abstractions/FunctionDefs";
import type { ActionExecutionContext, LookupAsyncFnInner } from "@abstractions/ActionDefs";

import RestApiProxy from "@components-core/RestApiProxy";
import { invalidateQueries } from "@components-core/utils/actionUtils";
import { extractParam, shouldKeep } from "@components-core/utils/extractParam";
import { createDraft, finishDraft } from "immer";
import { randomUUID } from "@components-core/utils/misc";
import { createAction } from "./actions";

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
  optimisticValueGetter?: AsyncFunction
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
      const flatData = currentData?.pages ? currentData.pages.flatMap((page: any) => page.result) : currentData;
      const optimisticValue = await optimisticValueGetter(flatData, stateContext["$eventArgs"]);
      if (optimisticValue) {
        ret.set(queryKey, prepareOptimisticValue(optimisticValue, clientTxId));
      }
    })
  );

  return ret;
}

async function doOptimisticUpdate(optimisticValuesByQueryKeys: Map<QueryKey, any>, queryClient: QueryClient) {
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
        page.result?.forEach((item: any) => {
          if (item.id === optimisticValue.id) {
            Object.assign(item, optimisticValue);
            updated = true;
          }
        });
      });
      if (!updated) {
        draft.pages[draft.pages.length - 1].result.push(optimisticValue);
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
  result: any
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
        draft.pages[draft.pages.length - 1].result = draft.pages[draft.pages.length - 1].result.map((item: any) =>
          item.id === optimisticValue.id && item._initiatorClientTxId === clientTxId ? result : item
        );
      } else {
        let updated = false;
        draft.pages.forEach((page: any) => {
          page.result?.forEach((item: any) => {
            if (item.id === result.id) {
              Object.assign(item, result);
              updated = true;
            }
          });
        });
        if (!updated) {
          draft.pages[draft.pages.length - 1].result.push(result);
        }
      }
    } else {
      if (optimisticValue) {
        draft.forEach((item: any, index: number) => {
          if (item.id === optimisticValue.id && item._initiatorClientTxId === clientTxId) {
            draft[index] = result;
          }
        });
      } else {
        let updated = false;
        draft.forEach((item: any, index: number) => {
          if (item.id === result.id) {
            draft[index] = result;
            updated = true;
          }
        });
        if (!updated) {
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
  const queryKeysToUpdate = findQueryKeysToUpdate(extractParam(stateContext, updates, appContext), queryClient);
  const optimisticValuesByQueryKeys = await prepareOptimisticValuesForQueries(
    queryKeysToUpdate,
    queryClient,
    clientTxId,
    stateContext,
    extractParam(stateContext, optimisticValue, appContext),
    lookupAction(getOptimisticValue, uid)
  );

  await doOptimisticUpdate(optimisticValuesByQueryKeys, queryClient);
  return { queryKeysToUpdate, optimisticValuesByQueryKeys };
}

type ApiAction = {
  invalidates?: string | string[];
  updates?: string | string[];
  confirmTitle?: string;
  confirmMessage?: string;
  confirmButtonLabel?: string;
  beforeRequest?: string;
  onSuccess?: string;
  onProgress?: string;
  onError?: string;
  params: any;
  payloadType?: string;
  optimisticValue: any;
  when: string;
  getOptimisticValue: string;
  inProgressNotificationMessage?: string;
  completedNotificationMessage?: string;
  errorNotificationMessage?: string;
  uid?: string;
} & ApiOperationDef;

export interface ApiActionComponent extends ComponentDef {
  props: {
    payloadType?: string;
    invalidates?: string | string[];
    updates?: string | string[];
    confirmTitle?: string;
    confirmMessage?: string;
    confirmButtonLabel?: string;
    optimisticValue: any;
    getOptimisticValue: string;
    inProgressNotificationMessage?: string;
    errorNotificationMessage?: string;
    completedNotificationMessage?: string;
  } & ApiOperationDef;
  events: {
    success: string;
    progress: string;
    error: string;
    beforeRequest: string;
  };
}

async function callApi(
  { state, appContext, lookupAction, uid: containerUid }: ActionExecutionContext,
  {
    confirmTitle,
    confirmMessage,
    confirmButtonLabel,
    params = {},
    beforeRequest,
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
  }: ApiAction,
  { resolveBindingExpressions }: ApiActionOptions = {}
) {
  const uid = Symbol(actionUid);
  const stateContext = { ...params, ...state };
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
  const beforeRequestFn = lookupAction(beforeRequest, uid);
  await beforeRequestFn?.();

  const { queryKeysToUpdate, optimisticValuesByQueryKeys } = await updateQueriesWithOptimisticValue({
    stateContext,
    updates,
    appContext,
    queryClient: appContext.queryClient!,
    clientTxId,
    optimisticValue,
    lookupAction,
    getOptimisticValue,
    uid,
  });

  const inProgressMessage = extractParam(stateContext, inProgressNotificationMessage, appContext);

  let loadingToastId;
  if (inProgressMessage) {
    loadingToastId = toast.loading(inProgressMessage);
  }
  try {
    const operation: ApiOperationDef = {
      headers,
      url,
      queryParams,
      rawBody,
      method,
      body,
      payloadType
    };
    const _onProgress = lookupAction(onProgress, uid, {
      eventName: "progress"
    });
    const result = await new RestApiProxy(appContext).execute({
      operation,
      params: stateContext,
      transactionId: clientTxId,
      resolveBindingExpressions,
      onProgress: _onProgress
    });

    const onSuccessFn = lookupAction(onSuccess, uid, {
      eventName: "success",
    });
    await onSuccessFn?.(result, stateContext["$eventArgs"]);

    updateQueriesWithResult(
      queryKeysToUpdate,
      optimisticValuesByQueryKeys,
      clientTxId,
      appContext.queryClient!,
      result
    );

    if (resolvedInvalidates || !updates) {
      await invalidateQueries(resolvedInvalidates, appContext, state);
    }
    const completedMessage = extractParam({ ...stateContext, $result: result }, completedNotificationMessage, appContext);
    if (completedMessage) {
      toast.success(completedMessage, {
        id: loadingToastId,
      });
    } else if (loadingToastId) {
      toast.dismiss(loadingToastId);
    }
    return result;
  } catch (e) {
    if (optimisticValuesByQueryKeys.size) {
      await appContext.queryClient!.invalidateQueries();
    }
    const onErrorFn = lookupAction(onError, uid, {
      eventName: "error"
    });
    const result = await onErrorFn?.(e, stateContext["$eventArgs"]);
    const errorMessage = extractParam({ ...stateContext, $error: e }, errorNotificationMessage, appContext);
    if(errorMessage){
      toast.error(errorMessage, {
        id: loadingToastId
      });
    } else {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      if (result !== false) {   //stop the error propagation, if the error handler returns false
        throw e;
      }
    }
  }
}

export const apiAction = createAction("callApi", callApi);

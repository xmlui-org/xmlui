import { useEffect, useRef, useState } from "react";
import { managedFetchService } from "../../runtime/data";
import { createRuntimeScope, readLocal } from "../../runtime/state";
import { evaluateExpressionOrText, runEvent } from "../../runtime/rendering/bindings";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";
import { useEvaluatedProp, useStringProp } from "../../runtime/rendering/props";
import { executeWithRetryPolicy, useRetryPolicy } from "../../runtime/retryPolicy";
import { registerReference, updateApi as updateReferenceApi } from "../DataSource/DataSource";
import toast from "../../components-core/toast";
import { type ComponentDef } from "../../abstractions/ComponentDefs";
import { wrapComponent } from "../../components-core/wrapComponent";
import type { ApiOperationDef } from "../../components-core/RestApiProxy";
import { createMetadata, dInternal } from "../../components/metadata-helpers";
import { httpMethodNames } from "../abstractions";
import { defaultProps } from "./APICall.defaults";
import { APICallReact } from "./APICallReact";

const COMP = "APICall";

export interface ApiActionComponent extends ComponentDef {
  props?: ApiOperationDef & {
    invalidates?: string | string[];
    updates?: string | string[];
    confirmTitle?: string;
    confirmMessage?: string;
    confirmButtonLabel?: string;
    cancelButtonLabel?: string;
    optimisticValue: any;
    getOptimisticValue: string;
    inProgressNotificationMessage?: string;
    errorNotificationMessage?: string;
    completedNotificationMessage?: string;
  };
  events?: {
    success: string;
    progress: string;
    error: string;
    beforeRequest: string;
    mockExecute: string;
  };
}

export const APICallMd = createMetadata({
  status: "stable",
  description:
    "`APICall` creates, updates or deletes data on the backend, versus [`DataSource`]" +
    "(/docs/reference/components/DataSource) which fetches data. Unlike DataSource, APICall doesn't " +
    "automatically execute - you must trigger it manually with the `execute()` method, " +
    "typically from form submissions or button clicks. See also [Actions.callAPI](/docs/globals#actionscallapi).",
  nonVisual: true,
  props: {
    method: {
      description: "The method of data manipulation can be done via setting this property.",
      valueType: "string",
      availableValues: httpMethodNames,
      defaultValue: defaultProps.method,
    },
    url: {
      description:
        "Use this property to set the URL to which data will be sent. If not provided, an empty URL is used.",
      isRequired: true,
      valueType: "string",
    },
    rawBody: {
      description:
        "This optional property sets the request body to the value provided here without any conversion. " +
        "Use the * \`body\` property if you want the object sent in JSON. When you define " +
        "\`body\` and \`rawBody\`, the latest one prevails.",
      valueType: "string",
    },
    body: {
      description:
        "This optional property sets the request body. Use to pass an object that will be " +
        "serialized as a JSON string. If you have an object that is already serialized as " +
        "a JSON string, use `rawBody` instead.",
      valueType: "string",
    },
    queryParams: {
      description:
        "This optional property sets the query parameters for the request. The object you pass here will " +
        "be serialized to a query string and appended to the request URL. You can specify key " +
        "and value pairs where the key is the name of a particular query parameter and the value " +
        "is that parameter's value.",
    },
    headers: {
      description:
        "You can optionally define request header values as key-value pairs, where the key is the ID " +
        "of the particular header and the value is that header's corresponding value.",
      valueType: "hash",
      audit: {
        classification: "secret",
        defaultRedaction: "mask",
        fieldPolicies: {
          Authorization: { classification: "secret", defaultRedaction: "mask" },
          Cookie: { classification: "secret", defaultRedaction: "drop" },
        },
      },
    },
    credentials: {
      description:
        `Controls whether cookies and other credentials are sent with the request. ` +
        `Set to \`"include"\` to send credentials in cross-origin requests (requires ` +
        `\`Access-Control-Allow-Credentials: true\` header on the server).`,
      availableValues: [
        { value: "omit", description: "Never send credentials" },
        {
          value: "same-origin",
          description: "Send credentials only for same-origin requests (default browser behavior)",
        },
        {
          value: "include",
          description: "Always send credentials, even for cross-origin requests",
        },
      ],
      valueType: "string",
    },
    confirmTitle: {
      description:
        "This optional string sets the title in the confirmation dialog that is displayed before " +
        `the \`${COMP}\` is executed.`,
      valueType: "string",
    },
    confirmMessage: {
      description:
        "This optional string sets the message in the confirmation dialog that is displayed before " +
        `the \`${COMP}\` is executed.`,
      valueType: "string",
    },
    confirmButtonLabel: {
      description:
        "This optional string property enables the customization of the submit button in the " +
        `confirmation dialog that is displayed before the \`${COMP}\` is executed.`,
      valueType: "string",
    },
    cancelButtonLabel: {
      description:
        "This optional string property enables the customization of the cancel button in the " +
        `confirmation dialog that is displayed before the \`${COMP}\` is executed.`,
      valueType: "string",
    },
    deferredMode: {
      description:
        "Enable deferred operation mode for long-running operations that return **202 Accepted**. " +
        "When enabled, the component will automatically poll a status endpoint to track operation progress. " +
        "(Experimental feature)",
      valueType: "boolean",
      defaultValue: defaultProps.deferredMode,
    },
    statusUrl: {
      description:
        "The URL to poll for status updates when deferredMode is enabled. " +
        "Can use $result context from initial response (e.g., '/api/status/{$result.operationId}'). " +
        "Required when deferredMode is true.",
      valueType: "string",
    },
    statusMethod: {
      description: "HTTP method for status requests. Defaults to 'get'.",
      valueType: "string",
      availableValues: httpMethodNames,
      defaultValue: defaultProps.statusMethod,
    },
    pollingInterval: {
      description: "Controls how often status checks run in deferred mode (in milliseconds).",
      valueType: "number",
      defaultValue: defaultProps.pollingInterval,
    },
    maxPollingDuration: {
      description: "Maximum time to poll before timing out, in milliseconds.",
      valueType: "number",
      defaultValue: defaultProps.maxPollingDuration,
    },
    pollingBackoff: {
      description:
        "Strategy for increasing polling interval over time. Options: 'none' (fixed interval), " +
        "'linear' (adds 1 second per attempt), 'exponential' (doubles each time). Defaults to 'none'.",
      valueType: "string",
      availableValues: ["none", "linear", "exponential"],
      isStrictEnum: true,
      defaultValue: defaultProps.pollingBackoff,
    },
    maxPollingInterval: {
      description: "Maximum interval between polls when using backoff strategies, in milliseconds.",
      valueType: "number",
      defaultValue: defaultProps.maxPollingInterval,
    },
    completionCondition: {
      description:
        "Expression that returns true when the deferred operation is complete. " +
        "Can access $statusData context variable containing the latest status response.",
      valueType: "string",
    },
    errorCondition: {
      description:
        "Expression that returns true when the deferred operation has failed. " +
        "Can access $statusData context variable containing the latest status response.",
      valueType: "string",
    },
    progressExtractor: {
      description:
        "Expression to extract progress value (0-100) from the status response. " +
        "Can access $statusData context variable. If not specified, no progress tracking.",
      valueType: "string",
    },
    cancelUrl: {
      description:
        "URL to call when cancelling the deferred operation. " +
        "Can use $result context from initial response (e.g., '/api/cancel/{$result.operationId}'). " +
        "If not provided, cancel() will only stop polling without notifying the server.",
      valueType: "string",
    },
    cancelMethod: {
      description: "HTTP method for cancel requests. Defaults to 'post'.",
      valueType: "string",
      availableValues: httpMethodNames,
      defaultValue: defaultProps.cancelMethod,
    },
    cancelBody: {
      description:
        "Optional body to send with the cancel request. " +
        "Can use $result context from initial response.",
      valueType: "any",
    },
    inProgressNotificationMessage: {
      description:
        "Message to show in toast notification during deferred operation polling. " +
        "Can include {$progress}, {$statusData.property}, and other context variables. " +
        "Notification will update on each poll with current values.",
      valueType: "string",
    },
    completedNotificationMessage: {
      description:
        "Message to show in toast notification when deferred operation completes successfully. " +
        "Can include {$statusData.property} and other context variables from the final status.",
      valueType: "string",
    },
    errorNotificationMessage: {
      description:
        "Message to show in toast notification when deferred operation fails. " +
        "Can include {$statusData.property} and other context variables from the error status.",
      valueType: "string",
    },
    payloadType: dInternal(),
    invalidates: dInternal(),
    updates: dInternal(),
    optimisticValue: dInternal(),
    getOptimisticValue: dInternal(),
  },
  events: {
    beforeRequest: {
      description:
        "This event fires before the request is sent. Returning an explicit boolean" +
        "\`false\` value will prevent the request from being sent.",
      signature: "() => boolean | void",
      parameters: {},
    },
    success: {
      description:
        "This event fires when a request results in a success. " +
        "Returning an explicit `false` value suppresses automatic query invalidation, " +
        "giving you full control over which cached data gets refreshed after the call.",
      signature: "(result: any) => false | void",
      parameters: {
        result: "The response data returned from the successful API request.",
      },
    },
    // This event fires when a request results in an error.
    error: {
      description: "This event fires when a request results in an error.",
      signature: "(error: any) => void",
      parameters: {
        error: "The error object containing details about what went wrong with the API request.",
      },
    },
    statusUpdate: {
      description:
        "Fires on each poll when in deferred mode. Passes the status data and current progress.",
      signature: "(statusData: any, progress: number) => void",
      parameters: {
        statusData: "The latest status response data from polling.",
        progress: "Current progress value 0-100.",
      },
    },
    pollingStart: {
      description: "Fires when polling begins in deferred mode.",
      signature: "(initialResult: any) => void",
      parameters: {
        initialResult: "The result from the initial API call that returned 202.",
      },
    },
    pollingComplete: {
      description:
        "Fires when polling stops in deferred mode (success, failure, timeout, or manual stop).",
      signature: "(finalStatus: any, reason: string) => void",
      parameters: {
        finalStatus: "The final status data.",
        reason: "Reason for completion: 'completed', 'failed', 'timeout', or 'manual'.",
      },
    },
    timeout: {
      description: "Fires if max polling duration is exceeded in deferred mode.",
      signature: "() => void",
      parameters: {},
    },
    mockExecute: {
      injectedVars: ["$pathParams", "$queryParams", "$requestBody", "$cookies", "$requestHeaders", "$param", "$params"],
      description:
        "When defined, this event handler replaces the actual API request. " +
        "The handler receives the resolved request properties as context variables: " +
        "`$pathParams`, `$queryParams`, `$requestBody`, `$cookies`, `$requestHeaders`. " +
        "When triggered via the `execute()` method, `$param` and `$params` are also available. " +
        "The return value of the handler becomes the result of the API call.",
      signature: "() => any",
      parameters: {},
    },
    progress: dInternal(),
  },
  contextVars: {
    $param: {
      description: "The first parameter passed to `execute()` method",
    },
    $params: {
      description:
        "Array of all parameters passed to `execute()` method (access with " +
        "`$params[0]`, `$params[1]`, etc.)",
    },
    $pathParams: {
      description: "Path parameters extracted from the request URL (available in `mockExecute`)",
    },
    $queryParams: {
      description: "Resolved query parameters (available in `mockExecute`)",
    },
    $requestBody: {
      description: "Resolved request body (available in `mockExecute`)",
    },
    $cookies: {
      description: "Request cookies (available in `mockExecute`)",
    },
    $requestHeaders: {
      description: "Resolved request headers (available in `mockExecute`)",
    },
    $result: {
      description: "Response data (available in `completedNotificationMessage`)",
    },
    $error: {
      description: "Error details (available in `errorNotificationMessage`)",
    },
    $statusData: {
      description:
        "Latest status response data when in deferred mode (available in event handlers and notifications)",
    },
    $progress: {
      description:
        "Current progress 0-100 when in deferred mode (extracted via progressExtractor expression)",
    },
    $polling: {
      description: "Boolean indicating if polling is currently active in deferred mode",
    },
    $attempts: {
      description: "Number of status polls made in deferred mode",
    },
    $elapsed: {
      description: "Time elapsed since polling started in milliseconds",
    },
  },
  apis: {
    execute: {
      description:
        "This method triggers the invocation of the API. You can pass an arbitrary " +
        "number of parameters to the method. In the \`APICall\` instance, you can " +
        "access those with the \`$param\` and \`$params\` context values.",
      signature: "execute(...params: any[])",
      parameters: {
        params: "An arbitrary number of parameters that can be used in the API call.",
      },
    },
    inProgress: {
      description: "Boolean flag indicating whether the API call is currently in progress.",
      signature: "inProgress: boolean",
    },
    loaded: {
      description:
        "Boolean flag indicating whether at least one successful API call has completed.",
      signature: "loaded: boolean",
    },
    lastResult: {
      description: "The result from the most recent successful API call execution.",
      signature: "lastResult: any",
    },
    lastError: {
      description: "The error from the most recent failed API call execution.",
      signature: "lastError: any",
    },
    lastResponseHeaders: {
      description:
        "This property retrieves the HTTP response headers from the last successful " +
        "API call execution, or `undefined` if no successful call has completed yet.",
      signature: "get lastResponseHeaders(): Record<string, string> | undefined",
    },
    stopPolling: {
      description: "Manually stop polling in deferred mode. The operation continues on the server.",
      signature: "stopPolling(): void",
    },
    resumePolling: {
      description: "Resume polling in deferred mode after it was manually stopped.",
      signature: "resumePolling(): void",
    },
    getStatus: {
      description: "Get the current status data in deferred mode.",
      signature: "getStatus(): any",
    },
    isPolling: {
      description: "Check if polling is currently active in deferred mode.",
      signature: "isPolling(): boolean",
    },
    cancel: {
      description:
        "Cancel the deferred operation on the server and stop polling. Requires cancelUrl to be configured.",
      signature: "cancel(): Promise<void>",
    },
  },
});

export const apiCallRenderer = wrapComponent(COMP, APICallReact, APICallMd, {
  exclude: Object.keys(APICallMd.props ?? {}),
  customRender: (_props, { node, registerComponentApi, uid, updateState, lookupEventHandler }) => {
    return (
      <APICallReact
        registerComponentApi={registerComponentApi}
        node={node as any}
        uid={uid}
        updateState={updateState}
        onSuccess={lookupEventHandler("success", { schedulerBypass: true })}
        onStatusUpdate={lookupEventHandler("statusUpdate", { schedulerBypass: true })}
        onTimeout={lookupEventHandler("timeout", { schedulerBypass: true })}
        onPollingStart={lookupEventHandler("pollingStart", { schedulerBypass: true })}
        onPollingComplete={lookupEventHandler("pollingComplete", { schedulerBypass: true })}
        hasMockExecute={!!node.events?.mockExecute}
      />
    );
  },
});


export const apiCallRuntimeRenderer: XmluiBuiltInRenderer = ({ node, scope }) => {
  const id = useStringProp(node, scope, "id", "");
  const url = useStringProp(node, scope, "url", "");
  const method = useStringProp(node, scope, "method", "get");
  const body = useRequestPropFallback(node, "body", undefined);
  const rawBody = useRequestPropFallback(node, "rawBody", "");
  const queryParams = useRequestPropFallback(node, "queryParams", undefined);
  const headers = useRequestPropFallback(node, "headers", undefined);
  const credentials = useStringProp(node, scope, "credentials", "") as RequestCredentials | "";
  const invalidates = useEvaluatedProp(node, scope, "invalidates", undefined);
  const when = useWhenProp(node, scope);
  const optimisticValue = useEvaluatedProp(node, scope, "optimisticValue", undefined);
  const confirmTitle = useStringProp(node, scope, "confirmTitle", "");
  const confirmMessage = useStringProp(node, scope, "confirmMessage", "");
  const confirmButtonLabel = useStringProp(node, scope, "confirmButtonLabel", "");
  const cancelButtonLabel = useStringProp(node, scope, "cancelButtonLabel", "");
  const inProgressNotificationMessage = useRawStringProp(node, scope, "inProgressNotificationMessage", "");
  const completedNotificationMessage = useRawStringProp(node, scope, "completedNotificationMessage", "");
  const errorNotificationMessage = useRawStringProp(node, scope, "errorNotificationMessage", "");
  const deferredMode = Boolean(useEvaluatedProp(node, scope, "deferredMode", false));
  const statusUrl = useRawStringProp(node, scope, "statusUrl", "");
  const statusMethod = useStringProp(node, scope, "statusMethod", "get");
  const pollIntervalInMilliseconds = Number(useEvaluatedProp(node, scope, "pollingInterval", 250) ?? 250);
  const maxPollingDuration = Number(useEvaluatedProp(node, scope, "maxPollingDuration", 0) ?? 0);
  const completionCondition = useRawStringProp(node, scope, "completionCondition", "");
  const errorCondition = useRawStringProp(node, scope, "errorCondition", "");
  const progressExtractor = useRawStringProp(node, scope, "progressExtractor", "");
  const cancelUrl = useRawStringProp(node, scope, "cancelUrl", "");
  const cancelMethod = useStringProp(node, scope, "cancelMethod", "post");
  const retryPolicy = useRetryPolicy();
  const apiRef = useRef<Record<string, unknown>>();
  const [confirmation, setConfirmation] = useState<{
    current: LatestApiCall;
    resolve: (confirmed: boolean) => void;
  }>();
  const latest = useRef({
    url,
    method,
    body,
    rawBody,
    queryParams,
    headers,
    credentials,
    invalidates,
    when,
    optimisticValue,
    confirmTitle,
    confirmMessage,
    confirmButtonLabel,
    cancelButtonLabel,
    inProgressNotificationMessage,
    completedNotificationMessage,
    errorNotificationMessage,
    deferredMode,
    statusUrl,
    statusMethod,
    pollIntervalInMilliseconds,
    maxPollingDuration,
    completionCondition,
    errorCondition,
    progressExtractor,
    cancelUrl,
    cancelMethod,
  });
  latest.current = {
    url,
    method,
    body,
    rawBody,
    queryParams,
    headers,
    credentials,
    invalidates,
    when,
    optimisticValue,
    confirmTitle,
    confirmMessage,
    confirmButtonLabel,
    cancelButtonLabel,
    inProgressNotificationMessage,
    completedNotificationMessage,
    errorNotificationMessage,
    deferredMode,
    statusUrl,
    statusMethod,
    pollIntervalInMilliseconds,
    maxPollingDuration,
    completionCondition,
    errorCondition,
    progressExtractor,
    cancelUrl,
    cancelMethod,
  };
  const confirmExecution = (current: LatestApiCall): Promise<boolean> =>
    new Promise((resolve) => {
      setConfirmation({ current, resolve });
    });
  const closeConfirmation = (confirmed: boolean) => {
    const pending = confirmation;
    setConfirmation(undefined);
    pending?.resolve(confirmed);
  };

  if (!apiRef.current) {
    apiRef.current = createApiCallApi(id, scope);
  }
  useEffect(() => registerReference(scope, id, apiRef.current!), [id, scope]);

  useEffect(() => {
    if (!id) {
      return;
    }
    let cancelled = false;
    let pollTimer: number | undefined;
    const clearPollTimer = () => {
      if (pollTimer !== undefined) {
        window.clearTimeout(pollTimer);
        pollTimer = undefined;
      }
    };
    apiRef.current!.stopPolling = () => {
      clearPollTimer();
      updateApi(apiRef.current!, id, scope, { isPolling: false });
    };
    apiRef.current!.cancel = async () => {
      cancelled = true;
      clearPollTimer();
      updateApi(apiRef.current!, id, scope, { isPolling: false, inProgress: false });
      const current = latest.current;
      if (current.cancelUrl) {
        const request = managedFetchService.buildRequest({
          url: interpolateTemplate(current.cancelUrl, { result: apiRef.current!.lastResult }),
          method: current.cancelMethod,
        });
        await runWithOptionalRetry(() => managedFetchService.execute(request), retryPolicy);
      }
    };
    apiRef.current!.execute = async (...args: unknown[]) => {
      cancelled = false;
      clearPollTimer();
      const current = latest.current;
      if (!current.when) {
        return undefined;
      }
      if (requiresConfirmation(current) && !await confirmExecution(current)) {
        return undefined;
      }
      const before = await runEvent(node.parsed?.events?.beforeRequest, scope, args);
      if (before === false) {
        return undefined;
      }
      updateApi(apiRef.current!, id, scope, {
        inProgress: true,
        lastError: undefined,
        isPolling: false,
      });
      applyOptimisticValue(scope, id, current.invalidates, current.optimisticValue);
      if (!current.deferredMode || !usesDeferredProgressContext(current.inProgressNotificationMessage)) {
        showToast(scope, "loading", current.inProgressNotificationMessage, {});
      }
      try {
        if (!current.url) {
          throw new Error("APICall requires a URL");
        }
        const paramsScope = createRuntimeScope({
          store: scope.store,
          parent: scope,
          references: scope.references,
          contextValues: {
            $param: args[0],
            $params: args,
          },
        });
        const request = managedFetchService.buildRequest({
          url: current.url,
          method: current.method,
          body: evaluateRequestProp(node, paramsScope, "body", current.body),
          rawBody: normalizeRawBody(evaluateRequestProp(node, paramsScope, "rawBody", current.rawBody)),
          queryParams: evaluateRequestProp(node, paramsScope, "queryParams", current.queryParams),
          headers: evaluateRequestProp(node, paramsScope, "headers", current.headers),
          credentials: current.credentials || undefined,
        });
        const executionScope = createRuntimeScope({
          store: scope.store,
          parent: scope,
          references: scope.references,
          contextValues: {
            $param: args[0],
            $params: args,
            $queryParams: request.queryParams,
            $requestBody: request.rawBody ?? request.body,
            $requestHeaders: request.headers,
          },
        });
        const response = await runWithOptionalRetry(async () => {
          if (node.parsed?.events?.mockExecute) {
            return { result: await runEvent(node.parsed.events.mockExecute, executionScope, args) };
          }
          const managedResponse = await managedFetchService.execute(request);
          return { result: managedResponse.data, responseHeaders: managedResponse.headers };
        }, retryPolicy);
        const { result, responseHeaders } = response;
        if (current.deferredMode && current.statusUrl) {
          updateApi(apiRef.current!, id, scope, {
            lastResult: result,
            lastResponseHeaders: responseHeaders,
            isPolling: true,
            pollAttempts: 0,
          });
          const successResult = await runEvent(node.parsed?.events?.success, scope, [result]);
          if (successResult !== false) {
            invalidateDataSources(scope, current.invalidates);
          }
          void runEvent(node.parsed?.events?.pollingStart, scope, [result]);
          void pollDeferredStatus({
            api: apiRef.current!,
            id,
            scope,
            node,
            retryPolicy,
            initialResult: result,
            current,
            clearPollTimer,
            setPollTimer: (timer) => {
              pollTimer = timer;
            },
            isCancelled: () => cancelled,
          }).catch(() => undefined);
          return result;
        }
        updateApi(apiRef.current!, id, scope, {
          inProgress: false,
          loaded: true,
          lastResult: result,
          lastError: undefined,
          lastResponseHeaders: responseHeaders,
        });
        const successResult = await runEvent(node.parsed?.events?.success, scope, [result]);
        if (successResult !== false) {
          invalidateDataSources(scope, current.invalidates);
        }
        showToast(scope, "success", current.completedNotificationMessage, { result });
        return result;
      } catch (error) {
        const apiError = normalizeApiError(error);
        updateApi(apiRef.current!, id, scope, {
          inProgress: false,
          lastError: apiError,
          isPolling: false,
        });
        void runEvent(node.parsed?.events?.error, scope, [apiError]);
        showToast(scope, "error", latest.current.errorNotificationMessage, { error: apiError });
        throw error;
      }
    };
    scope.store.invalidateReference(id);
    return () => {
      cancelled = true;
      clearPollTimer();
    };
  }, [
    id,
    node.parsed?.events?.beforeRequest,
    node.parsed?.events?.error,
    node.parsed?.events?.mockExecute,
    node.parsed?.events?.pollingComplete,
    node.parsed?.events?.pollingStart,
    node.parsed?.events?.statusUpdate,
    node.parsed?.events?.success,
    retryPolicy,
    scope,
  ]);

  if (confirmation) {
    const current = confirmation.current;
    return (
      <div role="dialog" aria-modal="true" aria-label={current.confirmTitle || current.confirmMessage || "Confirm"}>
        {current.confirmTitle ? <h2>{current.confirmTitle}</h2> : null}
        {current.confirmMessage ? <p>{current.confirmMessage}</p> : null}
        <button type="button" onClick={() => closeConfirmation(true)}>
          {current.confirmButtonLabel || "Yes"}
        </button>
        <button type="button" onClick={() => closeConfirmation(false)}>
          {current.cancelButtonLabel || "Cancel"}
        </button>
      </div>
    );
  }

  return null;
};

async function runWithOptionalRetry<T>(
  operation: () => Promise<T>,
  retryPolicy: ReturnType<typeof useRetryPolicy>,
): Promise<T> {
  return retryPolicy
    ? executeWithRetryPolicy(operation, retryPolicy.spec, retryPolicy.circuitState)
    : operation();
}

function createApiCallApi(
  id: string,
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
): Record<string, unknown> {
  const api: Record<string, unknown> = {
    execute: () => Promise.resolve(undefined),
    inProgress: false,
    loaded: false,
    lastResult: undefined,
    lastError: undefined,
    lastResponseHeaders: undefined,
    polling: false,
    pollAttempts: 0,
    statusData: null,
    cancel: () => Promise.resolve(undefined),
    stopPolling: () => undefined,
  };
  api.getStatus = () => api.statusData;
  api.isPolling = () => Boolean(api.polling);
  api.resumePolling = () => updateApi(api, id, scope, { isPolling: true });
  if (id) {
    scope.references[id] = api;
  }
  return api;
}

function updateApi(
  api: Record<string, unknown>,
  id: string,
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
  patch: Record<string, unknown>,
): void {
  if (Object.prototype.hasOwnProperty.call(patch, "isPolling")) {
    const { isPolling, ...rest } = patch;
    updateReferenceApi(api, id, scope, { ...rest, polling: isPolling });
    return;
  }
  updateReferenceApi(api, id, scope, patch);
}

export function invalidateDataSources(
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
  invalidates: unknown,
): void {
  if (invalidates === undefined || invalidates === null || invalidates === "") {
    for (const api of Object.values(scope.references)) {
      if (isRefetchableDataSource(api)) {
        void api.refetch?.();
      }
    }
    return;
  }
  const names = Array.isArray(invalidates)
    ? invalidates
    : typeof invalidates === "string"
      ? invalidates.split(",").map((name) => name.trim()).filter(Boolean)
      : [];
  for (const name of names) {
    const text = String(name);
    const api = scope.references[text] as { refetch?: () => unknown } | undefined;
    void api?.refetch?.();
    for (const candidate of Object.values(scope.references)) {
      if (isRefetchableDataSource(candidate) && candidate.url === text) {
        void candidate.refetch?.();
      }
    }
  }
}

function isRefetchableDataSource(value: unknown): value is {
  __xmluiDataSource?: boolean;
  url?: unknown;
  refetch?: () => unknown;
} {
  return Boolean(
    value &&
    typeof value === "object" &&
    (value as { __xmluiDataSource?: unknown }).__xmluiDataSource &&
    typeof (value as { refetch?: unknown }).refetch === "function",
  );
}

type LatestApiCall = {
  invalidates: unknown;
  when: boolean;
  optimisticValue?: unknown;
  confirmTitle: string;
  confirmMessage: string;
  confirmButtonLabel: string;
  cancelButtonLabel: string;
  inProgressNotificationMessage: string;
  completedNotificationMessage: string;
  errorNotificationMessage: string;
  deferredMode: boolean;
  statusUrl: string;
  statusMethod: string;
  pollIntervalInMilliseconds: number;
  maxPollingDuration: number;
  completionCondition: string;
  errorCondition: string;
  progressExtractor: string;
  cancelUrl: string;
  cancelMethod: string;
};

function applyOptimisticValue(
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
  sourceId: string,
  invalidates: unknown,
  optimisticValue: unknown,
): void {
  if (optimisticValue === undefined) {
    return;
  }
  const names = Array.isArray(invalidates)
    ? invalidates
    : typeof invalidates === "string"
      ? invalidates.split(",").map((name) => name.trim()).filter(Boolean)
      : [];
  for (const name of names) {
    const api = scope.references[String(name)] as Record<string, unknown> | undefined;
    if (api) {
      updateApi(api, String(name), scope, {
        value: optimisticValue,
        loaded: true,
        error: undefined,
      });
    }
  }
  if (sourceId) {
    scope.store.invalidateReference(sourceId);
  }
}

function requiresConfirmation(current: LatestApiCall): boolean {
  return Boolean(
    current.confirmTitle ||
    current.confirmMessage ||
    current.confirmButtonLabel ||
    current.cancelButtonLabel,
  );
}

async function confirmExecution(current: LatestApiCall): Promise<boolean> {
  const message = [current.confirmTitle, current.confirmMessage].filter(Boolean).join("\n");
  return window.confirm(message || "Confirm");
}

async function pollDeferredStatus({
  api,
  id,
  scope,
  node,
  retryPolicy,
  initialResult,
  current,
  clearPollTimer,
  setPollTimer,
  isCancelled,
}: {
  api: Record<string, unknown>;
  id: string;
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"];
  node: Parameters<XmluiBuiltInRenderer>[0]["node"];
  retryPolicy: ReturnType<typeof useRetryPolicy>;
  initialResult: unknown;
  current: LatestApiCall;
  clearPollTimer: () => void;
  setPollTimer: (timer: number) => void;
  isCancelled: () => boolean;
}): Promise<unknown> {
  const statusRequest = managedFetchService.buildRequest({
    url: interpolateTemplate(current.statusUrl, { result: initialResult }),
    method: current.statusMethod,
  });
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const poll = async () => {
      if (isCancelled()) {
        resolve(undefined);
        return;
      }
      if (current.maxPollingDuration > 0 && Date.now() - startedAt >= current.maxPollingDuration) {
        clearPollTimer();
        updateApi(api, id, scope, {
          inProgress: false,
          isPolling: false,
        });
        void runEvent(node.parsed?.events?.timeout, scope, []);
        void runEvent(node.parsed?.events?.pollingComplete, scope, [api.statusData, "timeout"]);
        resolve(api.statusData);
        return;
      }
      try {
        const response = await runWithOptionalRetry(
          () => managedFetchService.execute(statusRequest),
          retryPolicy,
        );
        const statusData = response.data;
        const progress = readDeferredProgress(statusData, current.progressExtractor);
        const attempts = Number(api.pollAttempts ?? 0) + 1;
        updateApi(api, id, scope, {
          statusData,
          progress,
          pollAttempts: attempts,
          isPolling: true,
        });
        void runEvent(node.parsed?.events?.statusUpdate, scope, [statusData, progress]);
        if (isDeferredFailure(statusData, current.errorCondition)) {
          clearPollTimer();
          updateApi(api, id, scope, {
            inProgress: false,
            isPolling: false,
            lastError: statusData,
          });
          void runEvent(node.parsed?.events?.error, scope, [statusData]);
          void runEvent(node.parsed?.events?.pollingComplete, scope, [statusData, "failed"]);
          showToast(scope, "error", current.errorNotificationMessage, { statusData, progress });
          reject(statusData);
          return;
        }
        if (isDeferredComplete(statusData, current.completionCondition, progress)) {
          clearPollTimer();
          updateApi(api, id, scope, {
            inProgress: false,
            loaded: true,
            isPolling: false,
            lastResult: statusData,
            lastError: undefined,
          });
          void runEvent(node.parsed?.events?.pollingComplete, scope, [statusData, "completed"]);
          showToast(scope, "success", current.completedNotificationMessage, { statusData, progress });
          resolve(statusData);
          return;
        }
        showToast(scope, "loading", current.inProgressNotificationMessage, { statusData, progress });
        setPollTimer(window.setTimeout(poll, Math.max(1, current.pollIntervalInMilliseconds)));
      } catch (error) {
        clearPollTimer();
        updateApi(api, id, scope, {
          inProgress: false,
          isPolling: false,
          lastError: error,
        });
        void runEvent(node.parsed?.events?.error, scope, [error]);
        void runEvent(node.parsed?.events?.pollingComplete, scope, [error, "error"]);
        showToast(scope, "error", current.errorNotificationMessage, { error });
        reject(error);
      }
    };
    void poll();
  });
}

function isDeferredComplete(statusData: unknown, condition: string, progress: number): boolean {
  const conditionResult = evaluateDeferredCondition(condition, statusData, progress);
  if (conditionResult !== undefined) {
    return conditionResult;
  }
  const record = statusData as Record<string, unknown> | null | undefined;
  return Boolean(record?.done) || ["completed", "complete", "success", "succeeded"].includes(String(record?.status).toLowerCase());
}

function isDeferredFailure(statusData: unknown, condition: string): boolean {
  const conditionResult = evaluateDeferredCondition(condition, statusData, readNumber(statusData, "progress", 0));
  if (conditionResult !== undefined) {
    return conditionResult;
  }
  const record = statusData as Record<string, unknown> | null | undefined;
  return Boolean(record?.failed) || ["failed", "error", "cancelled"].includes(String(record?.status).toLowerCase());
}

function readDeferredProgress(statusData: unknown, extractor: string): number {
  const extracted = evaluateDeferredExpression(extractor, statusData, 0);
  const numeric = Number(extracted);
  if (Number.isFinite(numeric)) {
    return numeric;
  }
  return readNumber(statusData, "progress", readNumber(statusData, "percent", 0));
}

function evaluateDeferredCondition(condition: string, statusData: unknown, progress: number): boolean | undefined {
  if (!condition) {
    return undefined;
  }
  return Boolean(evaluateDeferredExpression(condition, statusData, progress));
}

function evaluateDeferredExpression(expression: string, statusData: unknown, progress: number): unknown {
  if (!expression) {
    return undefined;
  }
  try {
    return Function(
      "$statusData",
      "$progress",
      `"use strict"; return (${expression});`,
    )(statusData, progress);
  } catch {
    return undefined;
  }
}

function readNumber(value: unknown, key: string, fallback: number): number {
  const record = value as Record<string, unknown> | null | undefined;
  const numeric = Number(record?.[key]);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function showToast(
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
  kind: "loading" | "success" | "error",
  message: string,
  context: Record<string, unknown>,
): void {
  if (!message) {
    return;
  }
  const reference = scope.toast?.reference as Record<string, unknown> | undefined;
  const fn = reference?.[kind];
  const text = interpolateTemplate(message, context);
  if (typeof fn === "function") {
    fn.call(reference, text);
    return;
  }
  toast[kind](text);
}

function usesDeferredProgressContext(message: string): boolean {
  return /\{\s*\$(?:progress|statusData)\b/.test(message);
}

function interpolateTemplate(template: string, context: Record<string, unknown>): string {
  const withPaths = template.replace(/\{\$([a-zA-Z0-9_]+)(?:\.([^}]+))?\}/g, (_match, name: string, path: string) => {
    const root = context[name];
    const value = path ? readPath(root, path) : root;
    return value == null ? "" : String(value);
  });
  return withPaths.replace(/\{([^{}]*\$[a-zA-Z0-9_][^{}]*)\}/g, (_match, expression: string) => {
    try {
      const names = Object.keys(context).map((name) => `$${name}`);
      const value = Function(...names, `"use strict"; return (${expression});`)(...Object.values(context));
      return value == null ? "" : String(value);
    } catch {
      return "";
    }
  });
}

function readPath(value: unknown, path: string): unknown {
  return path.split(".").reduce((current, part) => {
    if (current == null) {
      return undefined;
    }
    return (current as Record<string, unknown>)[part];
  }, value);
}

function evaluateRequestProp(
  node: Parameters<XmluiBuiltInRenderer>[0]["node"],
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
  name: string,
  fallback: unknown,
): unknown {
  if (!Object.prototype.hasOwnProperty.call(node.props, name)) {
    return fallback;
  }
  try {
    return evaluateExpressionOrText(node.props[name], node.parsed?.props?.[name], scope, `${node.type}:${name}:execute`);
  } catch {
    return fallback;
  }
}

function useRequestPropFallback(
  node: Parameters<XmluiBuiltInRenderer>[0]["node"],
  name: string,
  fallback: unknown,
): unknown {
  return Object.prototype.hasOwnProperty.call(node.props, name) ? node.props[name] : fallback;
}

function useWhenProp(
  node: Parameters<XmluiBuiltInRenderer>[0]["node"],
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
): boolean {
  const value = useEvaluatedProp(node, scope, "when", true);
  if (typeof value === "string" && value === node.props.when && /^[A-Za-z_$][\w$]*$/.test(value)) {
    return coerceBoolean(readLocal(scope, value), false);
  }
  return coerceBoolean(value, true);
}

function coerceBoolean(value: unknown, fallback: boolean): boolean {
  if (value == null) {
    return fallback;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }
    if (normalized === "false" || normalized === "") {
      return false;
    }
  }
  return Boolean(value);
}

function normalizeRawBody(value: unknown): string | undefined {
  if (value == null || value === "") {
    return undefined;
  }
  return typeof value === "string" ? value : String(value);
}

function useRawStringProp(
  node: Parameters<XmluiBuiltInRenderer>[0]["node"],
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
  name: string,
  fallback: string,
): string {
  const evaluated = useStringProp(node, scope, name, fallback);
  const raw = node.props[name];
  return typeof raw === "string" && raw.includes("{$") ? raw : evaluated ?? fallback;
}

function normalizeApiError(error: unknown): Record<string, unknown> {
  const record = error as {
    message?: string;
    statusCode?: number;
    response?: unknown;
  };
  const response = record?.response && typeof record.response === "object"
    ? record.response as Record<string, unknown>
    : {};
  return {
    ...response,
    statusCode: record?.statusCode,
    message: response.message ?? record?.message ?? "<No error description>",
    response: record?.response,
  };
}

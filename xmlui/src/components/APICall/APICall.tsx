import { createMetadata } from "../../component-core/metadata/helpers";

const COMP = "APICall";

export const APICallMd = createMetadata({
  status: "stable",
  nonVisual: true,
  description:
    "`APICall` is a non-visual component that exposes an imperative API request through its `execute` API.",
  props: {
    id: {
      description: "The identifier used to expose the API call reference in XMLUI expressions.",
      valueType: "string",
      isRequired: true,
    },
    method: {
      description: "The HTTP method used for the request.",
      valueType: "string",
      defaultValue: "get",
    },
    url: {
      description: "The request URL.",
      valueType: "string",
    },
    body: {
      description: "The structured request body.",
      valueType: "any",
    },
    rawBody: {
      description: "The raw request body.",
      valueType: "string",
    },
    queryParams: {
      description: "Query parameters appended to the request URL.",
      valueType: "any",
    },
    headers: {
      description: "Headers sent with the request.",
      valueType: "any",
    },
    credentials: {
      description: "The browser fetch credentials mode.",
      valueType: "string",
    },
    invalidates: {
      description: "A data source id or list of ids to refetch after a successful call.",
      valueType: "any",
    },
    optimisticValue: {
      description: "A temporary value applied to invalidated DataSource refs while the request is in progress.",
      valueType: "any",
    },
    confirmTitle: {
      description: "Title text used for a confirmation prompt before execution.",
      valueType: "string",
    },
    confirmMessage: {
      description: "Message text used for a confirmation prompt before execution.",
      valueType: "string",
    },
    confirmButtonLabel: {
      description: "Compatibility label for the confirmation accept action.",
      valueType: "string",
    },
    cancelButtonLabel: {
      description: "Compatibility label for the confirmation cancel action.",
      valueType: "string",
    },
    inProgressNotificationMessage: {
      description: "Toast message shown when execution starts.",
      valueType: "string",
    },
    completedNotificationMessage: {
      description: "Toast message shown when execution completes successfully.",
      valueType: "string",
    },
    errorNotificationMessage: {
      description: "Toast message shown when execution fails.",
      valueType: "string",
    },
    deferredMode: {
      description: "When true, poll a status endpoint after the initial request.",
      valueType: "boolean",
      defaultValue: false,
    },
    statusUrl: {
      description: "Status endpoint URL for deferred execution.",
      valueType: "string",
    },
    statusMethod: {
      description: "HTTP method for status requests.",
      valueType: "string",
      defaultValue: "get",
    },
    pollIntervalInMilliseconds: {
      description: "Deferred status polling interval.",
      valueType: "number",
      defaultValue: 250,
    },
    cancelUrl: {
      description: "Endpoint called when cancelling a deferred operation.",
      valueType: "string",
    },
    cancelMethod: {
      description: "HTTP method for cancellation requests.",
      valueType: "string",
      defaultValue: "post",
    },
    updates: {
      description: "Compatibility placeholder for update rules handled by the original runtime.",
      valueType: "any",
    },
  },
  events: {
    beforeRequest: {
      description: "This event fires before the request starts. Returning false cancels execution.",
      signature: "beforeRequest(...args: any[]): boolean | void",
    },
    success: {
      description: "This event fires after the request succeeds.",
      signature: "success(result: any): boolean | void",
      parameters: {
        result: "The request result.",
      },
    },
    error: {
      description: "This event fires when execution fails.",
      signature: "error(error: any): void",
      parameters: {
        error: "The execution error.",
      },
    },
    mockExecute: {
      description: "Overrides the default request with XMLUI script.",
      signature: "mockExecute(...args: any[]): any",
    },
    statusUpdate: {
      description: "This event fires for each deferred status response.",
      signature: "statusUpdate(statusData: any, progress: number): void",
    },
    pollingStart: {
      description: "This event fires when deferred status polling starts.",
      signature: "pollingStart(result: any): void",
    },
    pollingComplete: {
      description: "This event fires when deferred status polling stops.",
      signature: "pollingComplete(statusData: any, reason: string): void",
    },
  },
  contextVars: {
    $param: { description: "The first execute argument." },
    $params: { description: "All execute arguments." },
    $queryParams: { description: "The resolved query parameters." },
    $requestBody: { description: "The resolved request body." },
    $requestHeaders: { description: "The resolved request headers." },
  },
  apis: {
    execute: { description: "Executes the API call.", signature: "execute(...args: any[]): Promise<any>" },
    inProgress: { description: "Indicates that execution is currently running." },
    loaded: { description: "Indicates that the API call has completed successfully at least once." },
    lastResult: { description: "The latest successful result." },
    lastError: { description: "The latest execution error." },
    lastResponseHeaders: { description: "Response headers from the latest request." },
    isPolling: { description: "Indicates that deferred status polling is active." },
    pollAttempts: { description: "Number of deferred status polls made." },
    statusData: { description: "Latest deferred status response." },
    cancel: { description: "Cancels deferred polling and optionally calls cancelUrl.", signature: "cancel(): Promise<void>" },
    stopPolling: { description: "Stops deferred status polling locally.", signature: "stopPolling(): void" },
  },
});

export const APICallComponentName = COMP;

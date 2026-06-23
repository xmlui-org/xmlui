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
  },
});

export const APICallComponentName = COMP;

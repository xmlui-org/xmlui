import { createMetadata } from "../../component-core/metadata/helpers";

const COMP = "DataSource";

export const DataSourceMd = createMetadata({
  status: "stable",
  nonVisual: true,
  description:
    "`DataSource` is a non-visual component that loads data and exposes it through a component API reference.",
  props: {
    id: {
      description: "The identifier used to expose the data source API in XMLUI expressions.",
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
    mockData: {
      description: "Provides local data without issuing a request.",
      valueType: "any",
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
    pollIntervalInSeconds: {
      description: "When greater than zero, the data source refetches at this interval.",
      valueType: "number",
      defaultValue: 0,
    },
    resultSelector: {
      description: "Selects a nested value from the response.",
      valueType: "string",
    },
    transformResult: {
      description: "Transforms the selected result before publishing it.",
      valueType: "any",
    },
    dataType: {
      description: "The expected response data type.",
      valueType: "string",
      availableValues: ["json", "text"],
      defaultValue: "json",
    },
    structuralSharing: {
      description: "Compatibility placeholder for the original structural sharing option.",
      valueType: "boolean",
    },
  },
  events: {
    loaded: {
      description: "This event fires after data is loaded successfully.",
      signature: "loaded(value: any, isRefetch: boolean): void",
      parameters: {
        value: "The loaded value.",
        isRefetch: "Indicates whether this load was triggered by refetch.",
      },
    },
    error: {
      description: "This event fires when loading fails.",
      signature: "error(error: any): void",
      parameters: {
        error: "The load error.",
      },
    },
    fetch: {
      description: "Overrides the default request with XMLUI script.",
      signature: "fetch(): any",
    },
  },
  contextVars: {
    $url: { description: "The resolved request URL." },
    $method: { description: "The resolved request method." },
    $queryParams: { description: "The resolved query parameters." },
    $requestBody: { description: "The resolved request body." },
    $requestHeaders: { description: "The resolved request headers." },
  },
  apis: {
    value: { description: "The latest loaded value." },
    error: { description: "The latest load error." },
    inProgress: { description: "Indicates that a load is currently running." },
    isRefetching: { description: "Indicates that a refetch is currently running." },
    loaded: { description: "Indicates that the data source has loaded successfully." },
    responseHeaders: { description: "Response headers from the latest request." },
    refetch: { description: "Starts a forced reload.", signature: "refetch(): Promise<void>" },
  },
});

export const DataSourceComponentName = COMP;

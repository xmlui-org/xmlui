import { httpMethodNames } from "../abstractions";
import { createMetadata, d } from "../metadata-helpers";

// NOTE: Original component this is based on is the `Loader` component

const COMP = "DataSource";

export const DataSourceMd = createMetadata({
  status: "stable",
  description:
    "`DataSource` fetches and caches data from API endpoints, versus " +
    "[`APICall`](/components/APICall) which creates, updates or deletes data.",
  props: {
    method: {
      description: `Set the HTTP method.`,
      defaultValue: "get",
      availableValues: httpMethodNames,
    },
    id: {
      description:
        `Set the ID used by other components to access the retrieved data in the \`value\`` +
        "property of a \`DataSource\`, or status info in the \`loaded\` and \`error\` properties." +
        "When no `id` is set, the component cannot be used programmatically.",
      isRequired: true,
      valueType: "string",
    },
    url: {
      description: `Set the URL.`,
      isRequired: true,
      valueType: "string",
    },
    body: {
      description: `Set the optional request body. The object you pass is serialized as a JSON string.`,
      valueType: "any",
    },
    rawBody: {
      description:
        `Set the request body with no serialization. Use it to send a payload  ` +
        `that has already been serialized to a JSON string.`,
      valueType: "string",
    },
    queryParams: {
      description: `Append optional key-value pairs to the URL.`,
      valueType: "any",
    },
    headers: {
      description: `Set request headers. Pass an object whose keys are header names and values are header values.`,
      valueType: "any",
    },
    credentials: {
      description:
        `Controls whether cookies and other credentials are sent with the request. ` +
        `Set to \`"include"\` to send credentials in cross-origin requests (requires ` +
        `\`Access-Control-Allow-Credentials: true\` header on the server).`,
      availableValues: [
        { value: "omit", description: "Never send credentials" },
        { value: "same-origin", description: "Send credentials only for same-origin requests (default browser behavior)" },
        { value: "include", description: "Always send credentials, even for cross-origin requests" },
      ],
      valueType: "string",
    },
    pollIntervalInSeconds: {
      description:
        "Set the interval for periodic data fetching. If the data changes on refresh, " +
        "XMLUI will re-render components that refer directly or indirectly to the \`DataSource\`. " +
        "If not set or set to zero, the component does not poll for data.",
      valueType: "number",
    },
    inProgressNotificationMessage: {
      description:
        "Set the message to display when the data fetch is in progress. " +
        "If the property value is not set, no progress message is displayed.",
      valueType: "string",
    },
    completedNotificationMessage: {
      description:
        "Set the message to display when the data fetch completes." +
        "If the property value is not set, no completion message is displayed.",
      valueType: "string",
    },
    errorNotificationMessage: {
      description: "",
      valueType: "string",
    },
    resultSelector: {
      description:
        "Set an optional object key to extract a subset of the response data. If this " +
        "value is not set, the entire response body is considered the result.",
      valueType: "string",
    },
    transformResult: {
      description:
        "Set an optional function to perform a final transformation of the " +
        "response data. If this value is not set, the result is not transformed.",
    },
    prevPageSelector: {
      description:
        `When using \`${COMP}\` with paging, the response may contain information about the ` +
        `previous and next page. This property defines the selector that extracts the ` +
        `previous page information from the response deserialized to an object.`,
    },
    nextPageSelector: {
      description:
        `When using \`${COMP}\` with paging, the response may contain information about ` +
        `the previous and next page. This property defines the selector that extracts ` +
        `the next page information from the response deserialized to an object.`,
    },
    structuralSharing: {
      description:
        "This property allows structural sharing. When turned on, `DataSource` will keep " +
        "the original reference if nothing has changed in the data. If a subset has " +
        "changed, `DataSource` will keep the unchanged parts and only replace the changed " +
        "parts. If you do not need this behavior, set this property to `false`.",
      defaultValue: "true",
    },
  },
  events: {
    loaded: {
      description:
        "The component triggers this event when the fetch operation has been completed " +
        "and the data is loaded. The event has two arguments. The first is the data " +
        "loaded; the second indicates if the event is a result of a refetch.",
      signature: "loaded(data: any, isRefetch: boolean): void",
      parameters: {
        data: "The data loaded from the fetch operation.",
        isRefetch: "Indicates whether this is a result of a refetch operation.",
      },
    },
    error: {
      description: `This event fires when a request results in an error.`,
      signature: "error(error: Error): void",
      parameters: {
        error: "The error object that occurred during the request.",
      },
    },
  },
  apis: {
    value: {
      description: `This property retrieves the data queried from the source after optional transformations.`,
      signature: "get value(): any",
    },
    inProgress: {
      description: "This property indicates if the data is being fetched.",
      signature: "get inProgress(): boolean",
    },
    isRefetching: {
      description: "This property indicates if the data is being re-fetched.",
      signature: "get isRefetching(): boolean",
    },
    loaded: {
      description: "This property indicates if the data has been loaded.",
      signature: "get loaded(): boolean",
    },
    refetch: {
      description: "This method requests the re-fetch of the data.",
      signature: "refetch(): void",
    },
  },
});

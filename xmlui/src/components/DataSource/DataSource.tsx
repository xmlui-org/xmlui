import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { httpMethodNames } from "../abstractions";

// NOTE: Original component this is based on is the `Loader` component

const COMP = "DataSource";

export const DataSourceMd = createMetadata({
  status: "stable",
  description:
    `The \`${COMP}\` component manages fetching data from an API endpoint. This component ` +
    `automatically manages the complexity of the fetch operation and caching. To manipulate data ` +
    `on the backend, use the [\`APICall\`](./APICall.mdx) component.`,
  props: {
    method: {
      description: `Set the HTTP method.`,
      defaultValue: "get",
      availableValues: httpMethodNames,
    },
    id: {
      description:
        `Set the ID used by other components to access the retrieved data in the \`value\`` +
        `property of a \`DataSource\`, or status info in the \`loaded\` and \`error\` properties.`,
      isRequired: true,
      valueType: "string",
    },
    url: {
      description: `Set the URL.`,
      isRequired: true,
      valueType: "string",
    },
    body: {
      description: `Set the request body. The object you pass is serialized as a JSON string.`,
      valueType: "any",
    },
    rawBody: {
      description:
        `Set the request body with no serialization. Use it to send a payload  ` +
        `that has already been serialized to a JSON string.`,
      valueType: "string",
    },
    queryParams: {
      description: `Append key/value pairs to the URL.`,
      valueType: "any",
    },
    headers: {
      description: `Set request headers. Pass an object whose keys are header names and values are header values.`,
      valueType: "any",
    },
    pollIntervalInSeconds: {
      description:
        `Set the interval for periodic data fetching. If the data changes on refresh, ` +
        `XMLUI will re-render components that refer directly or indirectly to the \`DataSource\`. `,
      valueType: "number",
    },
    inProgressNotificationMessage: {
      description: `Set the message to display when the data fetch is in progress.`,
      valueType: "string",
    },
    completedNotificationMessage: {
      description: `Set the message to display when the data fetch completes.`,
      valueType: "string",
    },
    errorNotificationMessage: {
      description: `Set the message to display when the there is an error.`,
      valueType: "string",
    },
    resultSelector: {
      description: `Set an object key to extract a subset of the response data.`,
      valueType: "string",
    },
    transformResult: {
      description: `Set a function to perform a final transformation of the response data.`,
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
        "the original reference if nothing has changed in the data. If a subset has " +
        "changed, `DataSource` will keep the unchanged parts and only replace the changed " +
        "parts. If you do not need this behavior, set this property to `false`.",
      defaultValue: "true",
    },
  },
  events: {
    loaded: d(
      "The component triggers this event when the fetch operation has been completed " +
        "and the data is loaded. The event has two arguments. The first is the data " +
        "loaded; the second indicates if the event is a result of a refetch.",
    ),
    error: d(`This event fires when a request results in an error.`),
  },
  apis: {
    value: d(
      "This property retrieves the data queried from the source after optional transformations.",
    ),
    inProgress: d("This property indicates if the data is being fetched."),
    isRefetching: d("This property indicates if the data is being re-fetched."),
    loaded: d("This property indicates if the data has been loaded."),
    refetch: d("This method requests the re-fetch of the data."),
  },
});

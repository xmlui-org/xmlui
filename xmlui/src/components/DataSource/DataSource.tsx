import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { httpMethodNames } from "../abstractions";

// NOTE: Original component this is based on is the `Loader` component

const COMP = "DataSource";

export const DataSourceMd = createMetadata({
  status: "stable",
  description:
    `The \`${COMP}\` component manages fetching data from a web API endpoint. This component ` +
    `automatically manages the complexity of the fetch operation and caching. To manipulate data ` +
    `on the backend, use the [\`APICall\`](./APICall.mdx) component.`,
  props: {
    method: {
      description: `The method by which the data fetching request is made.`,
      defaultValue: "get",
      availableValues: httpMethodNames,
    },
    url: {
      description: `This property represents the URL to fetch the data.`,
      isRequired: true,
      valueType: "string",
    },
    rawBody: {
      description:
        `This property sets the request body to the value provided here without any conversion. ` +
        `Use the \`body\` property if you want the object sent in JSON. When you define \`body\` ` +
        `and \`rawBody\`, the latest one prevails.`,
      valueType: "string",
    },
    body: {
      description:
        `This property sets the request body. The object you pass here will be serialized to JSON ` +
        `when sending the request. Use the \`rawBody\` property to send another request body using ` +
        `its native format. When you define \`body\` and \`rawBody\`, the latest one prevails.`,
    },
    queryParams: {
      description:
        `This property sets the request body. The object you pass here will be serialized to JSON ` +
        `when sending the request. Use the \`rawBody\` property to send another request body ` +
        `using its native format. When you define \`body\` and \`rawBody\`, the latest one prevails.`,
    },
    headers: {
      description:
        `You can define request header values as key and value pairs, where the key is the ID of ` +
        `the particular header and the value is that header's value.`,
    },
    pollIntervalInSeconds: {
      description:
        `By setting this property, you can define periodic data fetching. The \`DataSource\` ` +
        `component will refresh its data according to the time specified as seconds. When the ` +
        `data changes during the refresh, it will trigger the update mechanism of XMLUI and ` +
        `re-render the UI accordingly.`,
      valueType: "number",
    },
    inProgressNotificationMessage: {
      description:
        `This property defines the message to display when the data fetch ` +
        `operation is in progress.`,
      valueType: "string",
    },
    completedNotificationMessage: {
      description:
        `This property defines the message to display when the data fetch ` +
        `operation has been completed.`,
      valueType: "string",
    },
    errorNotificationMessage: {
      description:
        `This property defines the message to display when the data fetch ` +
        `operation results in an error.`,
      valueType: "string",
    },
    resultSelector: {
      description:
        `The response of a data-fetching query may include additional information that ` +
        `the UI cannot (or does not intend) to process. With this property, you can define ` +
        `a selector that extracts the data from the response body.`,
    },
    transformResult: {
      description:
        "This property accepts a transformation function that receives the data coming from " +
        "the backend after it has been through the evaluation of the optional \`resultSelector\` " +
        "property. The function gets the entire result set and can transform it. The " +
        "\`DataSource\` component `value` property will return the data from this function.",
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
  },
  events: {
    loaded: d(
      `The component triggers this event when the fetch operation has been completed ` +
        `and the data is loaded. The argument of the event is the data loaded.`,
    ),
    error: d(`This event fires when a request results in an error.`),
  },
});

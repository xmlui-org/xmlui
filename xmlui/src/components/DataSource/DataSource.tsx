import { createMetadata, d } from "../../abstractions/ComponentDefs";

// NOTE: Original component this is based on is the `Loader` component

const COMP = "DataSource";

export const DataSourceMd = createMetadata({
  status: "stable",
  description:
    `The \`${COMP}\` component manages fetching data from a web API endpoint. This component ` +
    `automatically manages the complexity of the fetch operation and caching. To manipulate data ` +
    `on the backend, use the [\`APICall\`](./APICall.mdx) component.`,
  props: {
    method: d(
      `By default, data fetching uses the \`get\` operation method. You can change it by ` +
        `setting this property to other supported methods, such as \`post\`, \`put\`, \`delete\`, ` +
        `and others.`,
    ),
    url: {
      description: `This property represents the URL to fetch the data.`,
      isRequired: true,
    },
    rawBody: d(
      `This property sets the request body to the value provided here without any conversion. ` +
        `Use the \`body\` property if you want the object sent in JSON. When you define \`body\` ` +
        `and \`rawBody\`, the latest one prevails.`,
    ),
    body: d(
      `This property sets the request body. The object you pass here will be serialized to JSON ` +
        `when sending the request. Use the \`rawBody\` property to send another request body using ` +
        `its native format. When you define \`body\` and \`rawBody\`, the latest one prevails.`,
    ),
    queryParams: d(
      `This property sets the request body. The object you pass here will be serialized to JSON ` +
        `when sending the request. Use the \`rawBody\` property to send another request body ` +
        `using its native format. When you define \`body\` and \`rawBody\`, the latest one prevails.`,
    ),
    headers: d(
      `You can define request header values as key and value pairs, where the key is the ID of ` +
        `the particular header and the value is that header's value.`,
    ),
    pollIntervalInSeconds: d(
      `By setting this property, you can define periodic data fetching. The \`DataSource\` ` +
        `component will refresh its data according to the time specified as seconds. When the ` +
        `data changes during the refresh, it will trigger the update mechanism of XMLUI and ` +
        `re-render the UI accordingly.`,
    ),
    inProgressNotificationMessage: d(
      `This property defines the message to display while the fetch operation progresses.`,
    ),
    completedNotificationMessage: d(
      `This property defines the message to display automatically when the data fetch ` +
        `operation has been completed.`,
    ),
    errorNotificationMessage: d(
      `This property defines the message to display automatically when the data fetch ` +
        `operation results in an error.`,
    ),
    resultSelector: d(
      `The response of a data-fetching query may include additional information that ` +
        `the UI cannot (or does not intend) to process. With this property, you can define ` +
        `a selector that extracts the data from the response body.`,
    ),
    transformResult: d(
      "This property accepts a transformation function that receives the data coming from " +
        "the backend after it has been through the evaluation of the optional \`resultSelector\` " + 
        "property. The function gets the entire result set and can transform it. The " + 
        "\`DataSource\` component `value` property will return the data from this function.",
    ),
    prevPageSelector: d(
      `When using \`${COMP}\` with paging, the response may contain information about the ` +
        `previous and next page. This property defines the selector that extracts the ` +
        `previous page information from the response deserialized to an object.`,
    ),
    nextPageSelector: d(
      `When using \`${COMP}\` with paging, the response may contain information about ` +
        `the previous and next page. This property defines the selector that extracts ` +
        `the next page information from the response deserialized to an object.`,
    ),
  },
  events: {
    loaded: d(
      `The component triggers this event when the fetch operation has been completed ` +
        `and the data is loaded. The argument of the event is the data loaded.`,
    ),
    error: d(`This event fires when a request results in an error.`),
  },
});

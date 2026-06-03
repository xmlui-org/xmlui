import { createMetadata, d } from "../../components/metadata-helpers";

// Pure-TypeScript metadata for the DataLoader component. Kept in a separate file
// so that xmlui-parser.ts (a Node.js / Vite-plugin context) can import it without
// pulling in the React / papaparse dependencies of DataLoader.tsx.
export const DataLoaderMd = createMetadata({
  status: "stable",
  description: "This component manages data fetching from a web API",
  props: {
    method: d("The HTTP method to use"),
    url: d("The URL to fetch data from"),
    rawBody: d("The raw body of the request"),
    body: d("The body of the request to be sent as JSON"),
    queryParams: d("Query parameters to send with the request"),
    headers: d("Headers to send with the request"),
    credentials: d("Controls whether cookies and credentials are sent with the request (omit, same-origin, or include)"),
    pollIntervalInSeconds: d("The interval in seconds to poll the API for refreshing data"),
    resultSelector: d("An expression to extract the result from the response"),
    prevPageSelector: d("An expression to extract the previous page parameter from the response"),
    nextPageSelector: d("An expression to extract the next page parameter from the response"),
    inProgressNotificationMessage: d("The message to show when the loader is in progress"),
    completedNotificationMessage: d("The message to show when the loader completes"),
    errorNotificationMessage: d("The message to show when an error occurs"),
    transformResult: d("Function for transforming the datasource result"),
    dataType: d("Type of data to fetch (default: json, or csv, sql, or text)"),
    structuralSharing: d("Whether to use structural sharing for the data"),
    mockData: d("Data to return directly without making a network request (for development and testing)"),
  },
  events: {
    loaded: d("Event to trigger when the data is loaded"),
    error: d("This event fires when an error occurs while fetching data"),
    fetch: {
      injectedVars: ["$url", "$method", "$queryParams", "$requestBody", "$requestHeaders", "$pageParams"],
      description: "When defined, this event handler replaces the default fetch logic",
    },
  },
});

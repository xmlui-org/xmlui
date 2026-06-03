import { createMetadata } from "../../components/metadata-helpers";

// Pure-TypeScript metadata for the DataLoader component. Kept in a separate file
// so that xmlui-parser.ts (a Node.js / Vite-plugin context) can import it without
// pulling in the React / papaparse dependencies of DataLoader.tsx.
export const DataLoaderMd = createMetadata({
  status: "stable",
  description: "This component manages data fetching from a web API",
  props: {
    method: { description: "The HTTP method to use" },
    url: { description: "The URL to fetch data from" },
    rawBody: { description: "The raw body of the request" },
    body: { description: "The body of the request to be sent as JSON" },
    queryParams: { description: "Query parameters to send with the request" },
    headers: { description: "Headers to send with the request" },
    credentials: { description: "Controls whether cookies and credentials are sent with the request (omit, same-origin, or include)" },
    pollIntervalInSeconds: { description: "The interval in seconds to poll the API for refreshing data" },
    resultSelector: { description: "An expression to extract the result from the response" },
    prevPageSelector: { description: "An expression to extract the previous page parameter from the response" },
    nextPageSelector: { description: "An expression to extract the next page parameter from the response" },
    inProgressNotificationMessage: { description: "The message to show when the loader is in progress" },
    completedNotificationMessage: { description: "The message to show when the loader completes" },
    errorNotificationMessage: { description: "The message to show when an error occurs" },
    transformResult: { description: "Function for transforming the datasource result" },
    dataType: { description: "Type of data to fetch (default: json, or csv, sql, or text)" },
    structuralSharing: { description: "Whether to use structural sharing for the data" },
    mockData: { description: "Data to return directly without making a network request (for development and testing)" },
  },
  events: {
    loaded: { description: "Event to trigger when the data is loaded" },
    error: { description: "This event fires when an error occurs while fetching data" },
    fetch: {
      injectedVars: ["$url", "$method", "$queryParams", "$requestBody", "$requestHeaders", "$pageParams"],
      description: "When defined, this event handler replaces the default fetch logic",
    },
  },
});

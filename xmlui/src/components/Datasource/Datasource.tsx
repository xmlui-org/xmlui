import { ComponentDef } from "@abstractions/ComponentDefs";

// ================================================================================================
// This is a a placeholder file for document generation.
// ================================================================================================

/**
 * The \`Datasource\` component manages fetching data from a web API endpoint. This component automatically 
 * manages the complexity of the fetch operation and caching. To manipulate data on the backend, use the 
 * [\`ApiAction\`](./ApiAction.mdx) component.
 *
 * See examples on using the \`Datasource\` component in [this tutorial]
 * (../get-started/working-with-datasources.mdx).
 */
export interface DatasourceComponentDef extends ComponentDef<"DataLoader"> {
  props: {
    /**
     * By default, data fetching uses the \`get\` operation method. You can change it by setting this property 
     * to other supported methods, such as \`post\`, \`put\`, `delete\`, and others.
     * @descriptionRef 
     */
    method: "get" | "post" | "put" | "delete";
    /**
     * This property represents the URL to fetch the data.
     * @descriptionRef 
     */
    url: string;
    /**
     * This property sets the request body to the value provided here without any conversion. Use the 
     * \`body\` property if you want the object sent in JSON. When you define \`body\` and \`rawBody\`, 
     * the latest one prevails.
     * @descriptionRef 
     */
    rawBody?: any;
    /**
     * This property sets the request body. The object you pass here will be serialized to JSON when 
     * sending the request. Use the `rawBody` property to send another request body using its native 
     * format. When you define `body` and `rawBody`, the latest one prevails.
     * @descriptionRef 
     */
    body?: any;
    /**
     * This property sets the query parameters for the request. The object you pass here will be serialized 
     * to a query string and appended to the URL. You can specify key and value pairs, where the key is 
     * the name of a particular query parameter, and the value is that parameter's value to send.
     * @descriptionRef 
     */
    queryParams?: Record<string, any>;
    /**
     * You can define request header values as key and value pairs, where the key is the ID of the 
     * particular header and the value is that header's value.
     * @descriptionRef 
     */
    headers?: Record<string, any>;
    /**
     * By setting this property, you can define periodic data fetching. The \`Datasource\` component will 
     * refresh its data according to the time specified as seconds. When the data changes during the 
     * refresh, it will trigger the update mechanism of XMLUI and re-render the UI accordingly.
     * @descriptionRef 
     */
    pollIntervalInSeconds?: number;
    /**
     * This property defines the message to display while the fetch operation progresses.
     * @descriptionRef 
     */
    inProgressNotificationMessage?: string;
    /**
     * This property defines the message to display automatically when the data fetch operation has 
     * been completed.
     * @descriptionRef 
     */
    completedNotificationMessage?: string;
    /**
     * This property defines the message to display automatically when the data fetch operation results 
     * in an error.
     * @descriptionRef 
     */
    errorNotificationMessage?: string;
    /**
     * The response of a data-fetching query may include additional information that the UI cannot (or 
     * does not intend) to process. With this property, you can define a selector that extracts the data 
     * from the response body.
     * @descriptionRef 
     */
    resultSelector?: string;
    /**
     * When using \`Datasource\` with paging, the response may contain information about the previous 
     * and next page. This property defines the selector that extracts the previous page information 
     * from the response deserialized to an object.
     * @descriptionRef 
     */
    prevPageParamSelector?: string;
    /**
     * When using \`Datasource\` with paging, the response may contain information about the previous and 
     * next page. This property defines the selector that extracts the next page information from the 
     * response deserialized to an object.
     * @descriptionRef 
     */
    nextPageParamSelector?: string;
  };
  events: {
    /**
     * The component triggers this event when the fetch operation has been completed and the data is 
     * loaded. The argument of the event is the data loaded.
     */
    loaded?: string;
    /**
     * 
     */
    error?: string;
  };
  api: {
    /**
     * This Boolean property indicates if a fetch operation is in progress. You can use the value 
     * of this property to decide what to display in the UI during this time (such as a progress ring, 
     * a "loading..." text, etc.).
     * @descriptionRef 
     */
    inProgress: boolean;
    /**
     * This method triggers the re-fetching of the data.
     * @descriptionRef 
     */
    refetch: () => void;
    /**
     * This property represents the currently fetched data. Other components can obtain the data and 
     * process or display it through the `value` property.
     * @descriptionRef 
     */
    value: any;
  }
}

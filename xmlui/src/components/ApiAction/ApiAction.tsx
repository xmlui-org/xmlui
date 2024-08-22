import { ComponentDef } from "@abstractions/ComponentDefs";

// ================================================================================================
// This is a a placeholder file for document generation.
// ================================================================================================

/**
 * The \`ApiAction\` component is used to mutate (create, update or delete) some data on the backend. It 
 * is similar in nature to the [\`Datasource\`](./Datasource.mdx) component which retrieves data from the 
 * backend.
 *
 * See examples on using the \`ApiAction\` component in [this tutorial](../tutorials/working-with-apiactions.mdx).
 */
export interface ApiActionComponentDef extends ComponentDef<"ApiAction"> {
  props: {
    /**
     * This optional string sets the title in the confirmation dialog that is displayed before the 
     * \`ApiAction\` is executed.
     * @descriptionRef 
     */
    confirmTitle?: string;
    /**
     * This optional string sets the message in the confirmation dialog that is displayed before the 
     * \`ApiAction\` is executed.
     * @descriptionRef 
     */
    confirmMessage?: string;
    /**
     * This optional string property enables the customization of the submit button in the confirmation 
     * dialog that is displayed before the \`ApiAction\` is executed.
     * @descriptionRef 
     */
    confirmButtonLabel?: string;
    /**
     * This property customizes the message that is displayed in a toast while the API operation is in progress.
     * @descriptionRef 
     */
    inProgressNotificationMessage?: string;
    /**
     * This property defines the message to display automatically when the operation results in an error.
     * @descriptionRef 
     */
    errorNotificationMessage?: string;
    /**
     * This property defines the message to display automatically when the operation has been completed.
     * @descriptionRef 
     */
    completedNotificationMessage?: string;
    /**
     * The method of data manipulation can be done via setting this property. The following HTTP methods are 
     * available: \`post\`, \`put\`, and \`delete\`.

     * @descriptionRef 
     */
    method: "get" | "post" | "put" | "delete";
    /**
     * Use this property to set the URL to send data to.
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
     * to a query string and appended to the request URL. You can specify key and value pairs where the key 
     * is the name of a particular query parameter and the value is that parameter's value.
     * @descriptionRef 
     */
    queryParams?: Record<string, any>;
    /**
     * You can define request header values as key and value pairs, where the key is the ID of the 
     * particular header and the value is that header's value.
     * @descriptionRef 
     */
    headers?: Record<string, any>;
  };
  events: {
    /**
     * This event fires before the request is sent.
     * @descriptionRef 
     */
    beforeRequest: string;
    /**
     * This event fires when a request results in a success.
     * @descriptionRef 
     */
    success: string;
    /**
     * This event fires when a request results in an error.
     * @descriptionRef 
     */
    error: string;
  };
}

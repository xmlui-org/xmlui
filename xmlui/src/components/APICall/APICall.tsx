import { createMetadata, d } from "@abstractions/ComponentDefs";

const COMP = "APICall";

export const APICallMd = createMetadata({
  description:
    `\`${COMP}\` is used to mutate (create, update or delete) some data on the backend. It ` +
    `is similar in nature to the \`DataSource\` component which retrieves data from the backend.`,
  props: {
    confirmTitle: d(
      `This optional string sets the title in the confirmation dialog that is displayed before ` +
        `the \`${COMP}\` is executed.`,
    ),
    confirmMessage: d(
      `This optional string sets the message in the confirmation dialog that is displayed before ` +
        `the \`${COMP}\` is executed.`,
    ),
    confirmButtonLabel: d(
      `This optional string property enables the customization of the submit button in the ` +
        `confirmation dialog that is displayed before the \`${COMP}\` is executed.`,
    ),
    inProgressNotificationMessage: d(
      `This property customizes the message that is displayed in a toast while the API operation ` +
        `is in progress.`,
    ),
    errorNotificationMessage: d(
      `This property defines the message to display automatically when the operation results ` +
        `in an error.`,
    ),
    completedNotificationMessage: d(
      `This property defines the message to display automatically when the operation has ` +
        `been completed.`,
    ),
    method: d(
      `The method of data manipulation can be done via setting this property. The following ` +
        `HTTP methods are available: \`post\`, \`put\`, and \`delete\`.`,
    ),
    url: d(`Use this property to set the URL to send data to.`),
    rawBody: d(
      `This property sets the request body to the value provided here without any conversion. ` +
        `Use the * \`body\` property if you want the object sent in JSON. When you define ` +
        `\`body\` and \`rawBody\`, the latest one prevails.`,
    ),
    body: d(
      `This property sets the request body. The object you pass here will be serialized to ` +
        `JSON when sending the request. Use the \`rawBody\` property to send another request ` +
        `body using its native format. When you define \`body\` and \`rawBody\`, the latest ` +
        `one prevails.`,
    ),
    queryParams: d(
      `This property sets the query parameters for the request. The object you pass here will ` +
        `be serialized to a query string and appended to the request URL. You can specify key ` +
        `and value pairs where the key is the name of a particular query parameter and the value ` +
        `is that parameter's value.`,
    ),
    headers: d(
      `You can define request header values as key and value pairs, where the key is the ID of ` +
        `the particular header and the value is that header's value.`,
    ),
  },
  events: {
    beforeRequest: d(`This event fires before the request is sent.`),
    success: d(`This event fires when a request results in a success.`),
    /**
     * This event fires when a request results in an error.
     * @descriptionRef
     */
    error: d(`This event fires when a request results in an error.`),
  },
});

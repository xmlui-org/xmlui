import { type ComponentDef, createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import type { ApiOperationDef } from "../../components-core/RestApiProxy";
import { dInternal } from "../../components/metadata-helpers";
import { httpMethodNames } from "../abstractions";
import { APICallNative } from "./APICallNative";

const COMP = "APICall";

export interface ApiActionComponent extends ComponentDef {
  props?: ApiOperationDef & {
    invalidates?: string | string[];
    updates?: string | string[];
    confirmTitle?: string;
    confirmMessage?: string;
    confirmButtonLabel?: string;
    optimisticValue: any;
    getOptimisticValue: string;
    inProgressNotificationMessage?: string;
    errorNotificationMessage?: string;
    completedNotificationMessage?: string;
  };
  events?: {
    success: string;
    progress: string;
    error: string;
    beforeRequest: string;
  };
}

export const APICallMd = createMetadata({
  description:
    `\`${COMP}\` is used to mutate (create, update or delete) some data on the backend. It ` +
    `is similar in nature to the \`DataSource\` component which retrieves data from the backend.`,
  props: {
    method: {
      description:
        "The method of data manipulation can be done via setting this property.",
      valueType: "string",
      availableValues: httpMethodNames,
      defaultValue: "get",
    },
    url: {
      description: "Use this property to set the URL to send data to.",
      isRequired: true,
      valueType: "string",
    },
    rawBody: {
      description:
        "This property sets the request body to the value provided here without any conversion. " +
        "Use the * \`body\` property if you want the object sent in JSON. When you define " +
        "\`body\` and \`rawBody\`, the latest one prevails.",
      valueType: "string",
    },
    body: {
      description:
        "This property sets the request body. The object you pass here will be serialized to " +
        "JSON when sending the request. Use the \`rawBody\` property to send another request " +
        "body using its native format. When you define \`body\` and \`rawBody\`, the latest " +
        "one prevails.",
      valueType: "string",
    },
    queryParams: {
      description:
        "This property sets the query parameters for the request. The object you pass here will " +
        "be serialized to a query string and appended to the request URL. You can specify key " +
        "and value pairs where the key is the name of a particular query parameter and the value " +
        "is that parameter's value.",
    },
    headers: {
      description:
        "You can define request header values as key and value pairs, where the key is the ID of " +
        "the particular header and the value is that header's value.",
    },
    confirmTitle: {
      description:
        "This optional string sets the title in the confirmation dialog that is displayed before " +
        `the \`${COMP}\` is executed.`,
      valueType: "string",
    },
    confirmMessage: {
      description:
        "This optional string sets the message in the confirmation dialog that is displayed before " +
        `the \`${COMP}\` is executed.`,
      valueType: "string",
    },
    confirmButtonLabel: {
      description:
        "This optional string property enables the customization of the submit button in the " +
        `confirmation dialog that is displayed before the \`${COMP}\` is executed.`,
      valueType: "string",
    },
    inProgressNotificationMessage: {
      description:
        "This property customizes the message that is displayed in a toast while the API operation " +
        "is in progress.",
      valueType: "string",
    },
    errorNotificationMessage: {
      description:
        "This property defines the message to display automatically when the operation results " +
        "in an error.",
      valueType: "string",
    },
    completedNotificationMessage: {
      description:
        "This property defines the message to display automatically when the operation has " +
        "been completed.",
      valueType: "string",
    },
    payloadType: dInternal(),
    invalidates: dInternal(),
    updates: dInternal(),
    optimisticValue: dInternal(),
    getOptimisticValue: dInternal(),
  },
  events: {
    beforeRequest: d(
      "This event fires before the request is sent. Returning an explicit boolean" +
        "\`false\` value will prevent the request from being sent.",
    ),
    success: d("This event fires when a request results in a success."),
    /**
     * This event fires when a request results in an error.
     * @descriptionRef
     */
    error: d("This event fires when a request results in an error."),
    progress: dInternal(),
  },
  contextVars: {
    $param: d(
      "This value represents the first parameters passed to the \`execute()\` method to " +
        "display the modal dialog.",
    ),
    $params: d(
      "This value represents the array of parameters passed to the \`execute()\` method. " +
        "You can use \`$params[0]\` to access the first and \`$params[1]\` to access the " +
        "second (and so on) parameters. \`$param\` is the same as \`$params[0]\`.",
    ),
  },
  apis: {
    execute: d(
      "This method triggers the invocation of the API. You can pass an arbitrary " +
        "number of parameters to the method. In the \`APICall\` instance, you can " +
        "access those with the \`$param\` and \`$params\` context values.",
    ),
  },
});

export const apiCallRenderer = createComponentRenderer(
  COMP,
  APICallMd,
  ({ node, registerComponentApi, uid, extractValue }) => {
    return <APICallNative registerComponentApi={registerComponentApi} node={node} uid={uid} />;
  },
);

import { type ComponentDef } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import type { ApiOperationDef } from "../../components-core/RestApiProxy";
import { createMetadata, dInternal } from "../../components/metadata-helpers";
import { httpMethodNames } from "../abstractions";
import { APICallNative, defaultProps } from "./APICallNative";

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
  status: "stable",
  description:
    "`APICall` creates, updates or deletes data on the backend, versus [`DataSource`]" +
    "(/components/DataSource) which fetches data. Unlike DataSource, APICall doesn't " +
    "automatically execute - you must trigger it manually with the `execute()` method, " +
    "typically from form submissions or button clicks.",
  props: {
    method: {
      description: "The method of data manipulation can be done via setting this property.",
      valueType: "string",
      availableValues: httpMethodNames,
      defaultValue: defaultProps.method,
    },
    url: {
      description:
        "Use this property to set the URL to which data will be sent. If not provided, an empty URL is used.",
      isRequired: true,
      valueType: "string",
    },
    rawBody: {
      description:
        "This optional property sets the request body to the value provided here without any conversion. " +
        "Use the * \`body\` property if you want the object sent in JSON. When you define " +
        "\`body\` and \`rawBody\`, the latest one prevails.",
      valueType: "string",
    },
    body: {
      description:
        "This optional property sets the request body. Use to pass an object that will be " +
        "serialized as a JSON string. If you have an object that is already serialized as " +
        "a JSON string, use `rawBody` instead.",
      valueType: "string",
    },
    queryParams: {
      description:
        "This optional property sets the query parameters for the request. The object you pass here will " +
        "be serialized to a query string and appended to the request URL. You can specify key " +
        "and value pairs where the key is the name of a particular query parameter and the value " +
        "is that parameter's value.",
    },
    headers: {
      description:
        "You can optionally define request header values as key-value pairs, where the key is the ID " +
        "of the particular header and the value is that header's corresponding value.",
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
        "This property customizes the message that is displayed in a toast while the API " +
        "operation is in progress. If not defined, no progress message is displayed.",
      valueType: "string",
    },
    errorNotificationMessage: {
      description:
        "This property defines the message to display automatically when the operation " +
        "results in an error. You can use the `$error` context value in an expression to " +
        "refer to the original error message.",
      valueType: "string",
    },
    completedNotificationMessage: {
      description:
        "This property defines the message to display automatically when the operation has " +
        "been completed. When this property is not defined, the completion does not display any message.",
      valueType: "string",
    },
    payloadType: dInternal(),
    invalidates: dInternal(),
    updates: dInternal(),
    optimisticValue: dInternal(),
    getOptimisticValue: dInternal(),
  },
  events: {
    beforeRequest: {
      description:
        "This event fires before the request is sent. Returning an explicit boolean" +
        "\`false\` value will prevent the request from being sent.",
    },
    success: {
      description: "This event fires when a request results in a success.",
    },
    // This event fires when a request results in an error.
    error: {
      description: "This event fires when a request results in an error.",
    },
    progress: dInternal(),
  },
  contextVars: {
    $param: {
      description: "The first parameter passed to `execute()` method",
    },
    $params: {
      description:
        "Array of all parameters passed to `execute()` method (access with " +
        "`$params[0]`, `$params[1]`, etc.)",
    },
    $result: {
      description:
        "Response data (available in `completedNotificationMessage` and `success` event)",
    },
    $error: {
      description: "Error details (available in `errorNotificationMessage` and `error` event)",
    },
  },
  apis: {
    execute: {
      description:
        "This method triggers the invocation of the API. You can pass an arbitrary " +
        "number of parameters to the method. In the \`APICall\` instance, you can " +
        "access those with the \`$param\` and \`$params\` context values.",
      signature: "execute(...params: any[])",
      parameters: {
        params: "An arbitrary number of parameters that can be used in the API call.",
      },
    },
  },
});

export const apiCallRenderer = createComponentRenderer(
  COMP,
  APICallMd,
  ({ node, registerComponentApi, uid, extractValue }) => {
    return <APICallNative registerComponentApi={registerComponentApi} node={node} uid={uid} />;
  },
);

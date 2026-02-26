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
    "(/docs/reference/components/DataSource) which fetches data. Unlike DataSource, APICall doesn't " +
    "automatically execute - you must trigger it manually with the `execute()` method, " +
    "typically from form submissions or button clicks. See also [Actions.callAPI](/docs/globals#actionscallapi).",
  nonVisual: true,
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
    credentials: {
      description:
        `Controls whether cookies and other credentials are sent with the request. ` +
        `Set to \`"include"\` to send credentials in cross-origin requests (requires ` +
        `\`Access-Control-Allow-Credentials: true\` header on the server).`,
      availableValues: [
        { value: "omit", description: "Never send credentials" },
        {
          value: "same-origin",
          description: "Send credentials only for same-origin requests (default browser behavior)",
        },
        {
          value: "include",
          description: "Always send credentials, even for cross-origin requests",
        },
      ],
      valueType: "string",
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
    deferredMode: {
      description:
        "Enable deferred operation mode for long-running operations that return 202 Accepted. " +
        "When enabled, the component will automatically poll a status endpoint to track operation progress. " +
        "(Experimental feature)",
      valueType: "boolean",
      defaultValue: false,
    },
    statusUrl: {
      description:
        "The URL to poll for status updates when deferredMode is enabled. " +
        "Can use $result context from initial response (e.g., '/api/status/{$result.operationId}'). " +
        "Required when deferredMode is true.",
      valueType: "string",
    },
    statusMethod: {
      description: "HTTP method for status requests. Defaults to 'get'.",
      valueType: "string",
      availableValues: httpMethodNames,
      defaultValue: "get",
    },
    pollingInterval: {
      description: "Milliseconds between status polls. Defaults to 2000ms.",
      valueType: "number",
      defaultValue: 2000,
    },
    maxPollingDuration: {
      description:
        "Maximum time to poll before timing out, in milliseconds. Defaults to 300000ms (5 minutes).",
      valueType: "number",
      defaultValue: 300000,
    },
    pollingBackoff: {
      description:
        "Strategy for increasing polling interval over time. Options: 'none' (fixed interval), " +
        "'linear' (adds 1 second per attempt), 'exponential' (doubles each time). Defaults to 'none'.",
      valueType: "string",
      availableValues: ["none", "linear", "exponential"],
      defaultValue: "none",
    },
    maxPollingInterval: {
      description:
        "Maximum interval between polls when using backoff strategies, in milliseconds. Defaults to 30000ms (30 seconds).",
      valueType: "number",
      defaultValue: 30000,
    },
    completionCondition: {
      description:
        "Expression that returns true when the deferred operation is complete. " +
        "Can access $statusData context variable containing the latest status response.",
      valueType: "string",
    },
    errorCondition: {
      description:
        "Expression that returns true when the deferred operation has failed. " +
        "Can access $statusData context variable containing the latest status response.",
      valueType: "string",
    },
    progressExtractor: {
      description:
        "Expression to extract progress value (0-100) from the status response. " +
        "Can access $statusData context variable. If not specified, no progress tracking.",
      valueType: "string",
    },
    cancelUrl: {
      description:
        "URL to call when cancelling the deferred operation. " +
        "Can use $result context from initial response (e.g., '/api/cancel/{$result.operationId}'). " +
        "If not provided, cancel() will only stop polling without notifying the server.",
      valueType: "string",
    },
    cancelMethod: {
      description: "HTTP method for cancel requests. Defaults to 'post'.",
      valueType: "string",
      availableValues: httpMethodNames,
      defaultValue: "post",
    },
    cancelBody: {
      description:
        "Optional body to send with the cancel request. " +
        "Can use $result context from initial response.",
    },
    inProgressNotificationMessage: {
      description:
        "Message to show in toast notification during deferred operation polling. " +
        "Can include {$progress}, {$statusData.property}, and other context variables. " +
        "Notification will update on each poll with current values.",
      valueType: "string",
    },
    completedNotificationMessage: {
      description:
        "Message to show in toast notification when deferred operation completes successfully. " +
        "Can include {$statusData.property} and other context variables from the final status.",
      valueType: "string",
    },
    errorNotificationMessage: {
      description:
        "Message to show in toast notification when deferred operation fails. " +
        "Can include {$statusData.property} and other context variables from the error status.",
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
      signature: "() => boolean | void",
      parameters: {},
    },
    success: {
      description:
        "This event fires when a request results in a success. " +
        "Returning an explicit `false` value suppresses automatic query invalidation, " +
        "giving you full control over which cached data gets refreshed after the call.",
      signature: "(result: any) => false | void",
      parameters: {
        result: "The response data returned from the successful API request.",
      },
    },
    // This event fires when a request results in an error.
    error: {
      description: "This event fires when a request results in an error.",
      signature: "(error: any) => void",
      parameters: {
        error: "The error object containing details about what went wrong with the API request.",
      },
    },
    statusUpdate: {
      description:
        "Fires on each poll when in deferred mode. Passes the status data and current progress.",
      signature: "(statusData: any, progress: number) => void",
      parameters: {
        statusData: "The latest status response data from polling.",
        progress: "Current progress value 0-100.",
      },
    },
    pollingStart: {
      description: "Fires when polling begins in deferred mode.",
      signature: "(initialResult: any) => void",
      parameters: {
        initialResult: "The result from the initial API call that returned 202.",
      },
    },
    pollingComplete: {
      description:
        "Fires when polling stops in deferred mode (success, failure, timeout, or manual stop).",
      signature: "(finalStatus: any, reason: string) => void",
      parameters: {
        finalStatus: "The final status data.",
        reason: "Reason for completion: 'completed', 'failed', 'timeout', or 'manual'.",
      },
    },
    timeout: {
      description: "Fires if max polling duration is exceeded in deferred mode.",
      signature: "() => void",
      parameters: {},
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
      description: "Response data (available in `completedNotificationMessage`)",
    },
    $error: {
      description: "Error details (available in `errorNotificationMessage`)",
    },
    $statusData: {
      description:
        "Latest status response data when in deferred mode (available in event handlers and notifications)",
    },
    $progress: {
      description:
        "Current progress 0-100 when in deferred mode (extracted via progressExtractor expression)",
    },
    $polling: {
      description: "Boolean indicating if polling is currently active in deferred mode",
    },
    $attempts: {
      description: "Number of status polls made in deferred mode",
    },
    $elapsed: {
      description: "Time elapsed since polling started in milliseconds",
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
    inProgress: {
      description: "Boolean flag indicating whether the API call is currently in progress.",
      signature: "inProgress: boolean",
    },
    loaded: {
      description:
        "Boolean flag indicating whether at least one successful API call has completed.",
      signature: "loaded: boolean",
    },
    lastResult: {
      description: "The result from the most recent successful API call execution.",
      signature: "lastResult: any",
    },
    lastError: {
      description: "The error from the most recent failed API call execution.",
      signature: "lastError: any",
    },
    stopPolling: {
      description: "Manually stop polling in deferred mode. The operation continues on the server.",
      signature: "stopPolling(): void",
    },
    resumePolling: {
      description: "Resume polling in deferred mode after it was manually stopped.",
      signature: "resumePolling(): void",
    },
    getStatus: {
      description: "Get the current status data in deferred mode.",
      signature: "getStatus(): any",
    },
    isPolling: {
      description: "Check if polling is currently active in deferred mode.",
      signature: "isPolling(): boolean",
    },
    cancel: {
      description:
        "Cancel the deferred operation on the server and stop polling. Requires cancelUrl to be configured.",
      signature: "cancel(): Promise<void>",
    },
  },
});

export const apiCallRenderer = createComponentRenderer(
  COMP,
  APICallMd,
  ({ node, registerComponentApi, uid, updateState, lookupEventHandler }) => {
    return (
      <APICallNative
        registerComponentApi={registerComponentApi}
        node={node as any}
        uid={uid}
        updateState={updateState}
        onSuccess={lookupEventHandler("success")}
        onStatusUpdate={lookupEventHandler("statusUpdate")}
        onTimeout={lookupEventHandler("timeout")}
      />
    );
  },
);

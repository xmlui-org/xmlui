import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { ApiOperationDef } from "../../components-core/RestApiProxy";

export interface ApiActionComponent extends ComponentDef {
  props: ApiOperationDef & {
    invalidates?: string | string[];
    updates?: string | string[];
    confirmTitle?: string;
    confirmMessage?: string;
    confirmButtonLabel?: string;
    cancelButtonLabel?: string;
    optimisticValue?: any;
    getOptimisticValue?: string;
    inProgressNotificationMessage?: string;
    errorNotificationMessage?: string;
    completedNotificationMessage?: string;
    [key: string]: any;
  };
  events?: {
    success?: string;
    progress?: string;
    error?: string;
    beforeRequest?: string;
    mockExecute?: string;
  };
}

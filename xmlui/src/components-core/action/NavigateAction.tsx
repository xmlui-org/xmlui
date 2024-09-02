import type { ActionExecutionContext } from "@abstractions/ActionDefs";

import { createAction } from "./actions";
import { createUrlWithQueryParams } from "@components/component-utils";

function navigate({ appContext, navigate, location }: ActionExecutionContext, pathname: string | number, queryParams?: Record<string, any>) {
    // https://stackoverflow.com/questions/37385570/how-to-know-if-react-router-can-go-back-to-display-back-button-in-react-app
    if(pathname === -1 && location.key === "default"){
        navigate(".");
        return;
    }
  const to = queryParams
    ? createUrlWithQueryParams({
        pathname,
        queryParams,
      })
    : pathname;
  navigate(to);
}

export const navigateAction = createAction("navigate", navigate);

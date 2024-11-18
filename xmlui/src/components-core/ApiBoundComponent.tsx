import type { MutableRefObject } from "react";
import React, { useMemo } from "react";

import type { ComponentDef, ParentRenderContext } from "@abstractions/ComponentDefs";
import type { LayoutContext, RenderChildFn } from "@abstractions/RendererDefs";
import type { UploadActionComponent } from "@components-core/action/FileUploadAction";
import type { DownloadActionComponent } from "@components-core/action/FileDownloadAction";
import type { ApiActionComponent } from "@components/APICall/APICall";

type ApiBoundComponentProps = {
  uid: symbol;
  node: ComponentDef;
  apiBoundProps: Array<string>;
  apiBoundEvents: Array<string>;
  renderChild: RenderChildFn;
  layoutContextRef?: MutableRefObject<LayoutContext | undefined>;
  parentRendererContext?: ParentRenderContext;
};

export function ApiBoundComponent({
  uid,
  node,
  apiBoundProps,
  apiBoundEvents,
  renderChild,
  layoutContextRef,
  parentRendererContext,
}: ApiBoundComponentProps) {
  const wrappedWithAdapter = useMemo(() => {
    function generateloaderUid(key: string) {
      return `${node.uid}_data_${key}`;
    }

    const loaders: Array<ComponentDef> = [...(node.loaders || [])];
    const events = { ...(node.events || {}) } as any;
    const props = { ...(node.props || {}) } as any;
    const vars = { ...(node.vars || {}) };
    const api = { ...(node.api || {}) };

    apiBoundEvents.forEach((key) => {
      const { type } = node.events![key];

      switch (type) {
        case "FileUpload": {
          const actionComponent = node.events![key] as UploadActionComponent;
          const {
            invalidates,
            asForm,
            formParams,
            queryParams,
            rawBody,
            body,
            url,
            headers,
            method,
            file,
          } = actionComponent.props;
          const { success, error } = actionComponent.events || {};
          events[key] = `(eventArgs) => {
            return Actions.upload({
              asForm: ${JSON.stringify(asForm)}, 
              formParams: ${JSON.stringify(formParams)}, 
              queryParams: ${JSON.stringify(queryParams)}, 
              rawBody: ${JSON.stringify(rawBody)}, 
              body: ${JSON.stringify(body)}, 
              url: ${JSON.stringify(url)}, 
              headers: ${JSON.stringify(headers)}, 
              method: ${JSON.stringify(method)}, 
              file: ${JSON.stringify(file)}, 
              params: { '$param': eventArgs }, 
              onError: ${JSON.stringify(error)}, 
              onSuccess: ${JSON.stringify(success)}, 
              onProgress: eventArgs.onProgress, 
              invalidates: ${
                invalidates === undefined ? undefined : JSON.stringify(invalidates)
              }  }, { resolveBindingExpressions: true });
          }`;
          break;
        }
        case "FileDownload": {
          const actionComponent = node.events![key] as DownloadActionComponent;
          const { url, queryParams, rawBody, body, headers, method, fileName } =
            actionComponent.props;
          events[key] = `(eventArgs) => {
            return Actions.download({
              queryParams: ${JSON.stringify(queryParams)}, 
              rawBody: ${JSON.stringify(rawBody)}, 
              body: ${JSON.stringify(body)}, 
              url: ${JSON.stringify(url)}, 
              headers: ${JSON.stringify(headers)}, 
              method: ${JSON.stringify(method)}, 
              fileName: ${JSON.stringify(fileName)}, 
              params: { '$param': eventArgs },
            }, { resolveBindingExpressions: true });
          }`;
          break;
        }
        case "APICall": {
          const actionComponent = node.events![key] as ApiActionComponent;
          const { when, uid } = actionComponent;

          const {
            confirmTitle,
            confirmMessage,
            confirmButtonLabel,
            inProgressNotificationMessage,
            completedNotificationMessage,
            errorNotificationMessage,
            invalidates,
            updates,
            optimisticValue,
            getOptimisticValue,
            headers,
            payloadType,
            method,
            url,
            queryParams,
            rawBody,
            body,
          } = actionComponent.props;
          const { success, error, progress, beforeRequest } = actionComponent.events || {};

          events[key] = `(eventArgs, options) => {
            return Actions.callApi({
              uid: ${JSON.stringify(uid)},
              headers: ${JSON.stringify(headers)}, 
              method: ${JSON.stringify(method)}, 
              url: ${JSON.stringify(url)}, 
              queryParams: ${JSON.stringify(queryParams)}, 
              rawBody: ${JSON.stringify(rawBody)}, 
              body: ${JSON.stringify(body)} || (options?.passAsDefaultBody ? eventArgs : undefined), 
              confirmTitle: ${JSON.stringify(confirmTitle)}, 
              confirmMessage: ${JSON.stringify(confirmMessage)}, 
              confirmButtonLabel: ${JSON.stringify(confirmButtonLabel)}, 
              inProgressNotificationMessage: ${JSON.stringify(inProgressNotificationMessage)}, 
              completedNotificationMessage: ${JSON.stringify(completedNotificationMessage)}, 
              errorNotificationMessage: ${JSON.stringify(errorNotificationMessage)}, 
              params: { '$param': eventArgs }, 
              onError: ${JSON.stringify(error)}, 
              onProgress: ${JSON.stringify(progress)}, 
              onBeforeRequest: ${JSON.stringify(beforeRequest)}, 
              onSuccess: ${JSON.stringify(success)}, 
              updates: ${JSON.stringify(updates)}, 
              optimisticValue: ${JSON.stringify(optimisticValue)}, 
              payloadType: ${JSON.stringify(payloadType)}, 
              getOptimisticValue: ${JSON.stringify(getOptimisticValue)}, 
              invalidates: ${invalidates === undefined ? undefined : JSON.stringify(invalidates)}, 
              when: ${when === undefined ? undefined : JSON.stringify(when)} }, { resolveBindingExpressions: true });
          }`;
          break;
        }
        default: {
          throw new Error("Unknown event handler component type: ", type);
        }
      }
    });

    apiBoundProps.forEach((key) => {
      const isDatasourceRef = node.props![key]?.type === "DataSourceRef";
      const loaderUid = node.props![key].uid || generateloaderUid(key);
      const operation = node.props![key].props || node.props![key];
      const loaderEvents: Record<string, any> = {};
      Object.entries(node.events || {}).forEach(([eventKey, value]) => {
        if (eventKey.startsWith(key)) {
          const capitalizedEventName = eventKey.substring(key.length);
          const eventName =
            capitalizedEventName.charAt(0).toLowerCase() + capitalizedEventName.slice(1);
          loaderEvents[eventName] = value;
        }
      });
      if (key === "data") {
        props.__DATA_RESOLVED = true;
      }
      if (!isDatasourceRef) {
        loaders.push({
          type: "DataLoader",
          uid: loaderUid,
          props: operation,
          events: loaderEvents,
        });
        api[`fetch_${key}`] = `() => { ${loaderUid}.refetch(); }`;
        api[`update_${key}`] = `(updaterFn) => { ${loaderUid}.update(updaterFn); }`;
        api[`addItem_${key}`] = `(element, index) => {  ${loaderUid}.addItem(element, index); }`;
        api[`getItems_${key}`] = `() => { return ${loaderUid}.getItems(); }`;
        api[`deleteItem_${key}`] = `(element) => { ${loaderUid}.deleteItem(element); }`;
        if (key === "data") {
          props._data_url = operation.url;
        }
      }
      props[key] = `{ ${loaderUid}.value }`;
      props.loading = `{${loaderUid}.inProgress === undefined ? true : ${loaderUid}.inProgress}`;
      props.pageInfo = `{${loaderUid}.pageInfo}`;
      events.requestFetchPrevPage = `${loaderUid}.fetchPrevPage()`;
      events.requestFetchNextPage = `${loaderUid}.fetchNextPage()`;
      // TODO if the user provides a requestRefetch handler, we should call it
      //  and then call the loader's refetch method if it returns !false;
      //  requestRefetch could receive parameters to select which apibound props to refetch
      events.requestRefetch = `()=> ${loaderUid}.refetch();`;
    });

    const wrapped = {
      ...node,
      containerUid: uid,
      apiBoundContainer: true,
      props,
      events,
    };
    if (loaders.length) {
      //to make sure that we don't wrap the component with a container if we don't have to
      wrapped.loaders = loaders;
    }
    if (Object.keys(vars).length) {
      //to make sure that we don't wrap the component with a container if we don't have to
      wrapped.vars = vars;
    }
    if (Object.keys(api).length) {
      //to make sure that we don't wrap the component with a container if we don't have to
      wrapped.api = api;
    }
    return wrapped;
  }, [apiBoundEvents, apiBoundProps, node, uid]);

  // useEffect(() => {
  //   console.log("wrapped with adapter changed", wrappedWithAdapter);
  // }, [wrappedWithAdapter]);

  const renderedChild = renderChild(
    wrappedWithAdapter,
    layoutContextRef?.current,
    parentRendererContext,
  );
  return React.isValidElement(renderedChild) ? renderedChild : <>{renderedChild}</>;
}

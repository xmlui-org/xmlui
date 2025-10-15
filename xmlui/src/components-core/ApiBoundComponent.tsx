import type { MutableRefObject } from "react";
import React, { useMemo } from "react";

import type { ComponentDef, ParentRenderContext } from "../abstractions/ComponentDefs";
import type { LayoutContext, RenderChildFn } from "../abstractions/RendererDefs";
import { parseAttributeValue } from "./script-runner/AttributeValueParser";

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

    // Generates a string representation of an event handler function that calls 
    // the appropriate action. This function is used recursively for nested actions.
    function generateEventHandler(actionComponent: any): string {
      const { type } = actionComponent;

      // Prepares an event handler, which can be several types of data
      // (string for inline JS functions, parsed objects, or nested action components)
      const prepareEvent = (eventData: any) => {
        if (!eventData) {
          return "undefined";
        }
        if (typeof eventData === "string") {
          return `"${eventData}"`;
        }
        if (typeof eventData.type === "string") {
          return generateEventHandler(eventData);
        }
        return JSON.stringify(eventData);
      };

      // --- Prepare event handlers
      const { success, error, progress, beforeRequest } = actionComponent.events || {};
      switch (type) {
        case "FileUpload": {
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
          return `(eventArgs) => {
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
              onError: ${prepareEvent(error)}, 
              onSuccess: ${prepareEvent(success)}, 
              onProgress: eventArgs.onProgress, 
              invalidates: ${
                invalidates === undefined ? undefined : JSON.stringify(invalidates)
              }  }, { resolveBindingExpressions: true });
          }`;
        }
        case "FileDownload": {
          const { url, queryParams, rawBody, body, headers, method, fileName } =
            actionComponent.props;
          return `(eventArgs) => {
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
        }
        case "APICall": {
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

          return `(eventArgs, options) => {
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
              onError: ${prepareEvent(error)}, 
              onProgress: ${prepareEvent(progress)}, 
              onBeforeRequest: ${prepareEvent(beforeRequest)}, 
              onSuccess: ${prepareEvent(success)}, 
              updates: ${JSON.stringify(updates)}, 
              optimisticValue: ${JSON.stringify(optimisticValue)}, 
              payloadType: ${JSON.stringify(payloadType)}, 
              getOptimisticValue: ${JSON.stringify(getOptimisticValue)}, 
              invalidates: ${invalidates === undefined ? undefined : JSON.stringify(invalidates)}, 
              when: ${when === undefined ? undefined : JSON.stringify(when)} }, { resolveBindingExpressions: true });
          }`;
        }
        default: {
          throw new Error("Unknown event handler component type: ", type);
        }
      }
    }

    const loaders: Array<ComponentDef> = [...(node.loaders || [])];
    const events = { ...(node.events || {}) } as any;
    const props = { ...(node.props || {}) } as any;
    const vars = { ...(node.vars || {}) };
    const api = { ...(node.api || {}) };

    apiBoundEvents.forEach((key) => {
      const actionComponent = node.events![key];
      events[key] = generateEventHandler(actionComponent);
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
      //illesg really experimental
      let prefetchKey = null;
      const { segments } = parseAttributeValue(operation.url?.trim());
      if (segments?.length === 1) {
        if (segments[0].literal) {
          prefetchKey = `"${segments[0].literal}"`;
        } else if (segments[0].expr) {
          // we remove the first and last characters, which are the curly braces
          prefetchKey = operation.url?.trim().substring(1, operation.url.length - 1);
        }
      }
      if (prefetchKey === null) {
        props[key] = `{ ${loaderUid}.value }`;
      } else {
        props[key] =
          `{ ${loaderUid}.value || ( appGlobals.prefetchedContent[${prefetchKey}] || appGlobals.prefetchedContent['/' + ${prefetchKey}] ) }`;
      }
      props.loading = `{ ${loaderUid}.inProgress === undefined ? true : ${loaderUid}.inProgress}`;
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

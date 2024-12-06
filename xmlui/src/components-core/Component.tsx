import type { EventHandler, MutableRefObject, ReactElement, ReactNode } from "react";
import React, { cloneElement, forwardRef, useCallback, useEffect, useMemo } from "react";

import type {ComponentMetadata, ParentRenderContext} from "@abstractions/ComponentDefs";
import type {
  LayoutContext,
  LookupEventHandlerFn,
  RegisterComponentApiFn,
  RenderChildFn,
  RendererContext,
} from "@abstractions/RendererDefs";
import type { LookupAsyncFn, LookupSyncFn } from "@abstractions/ActionDefs";

import UnknownComponent from "./UnknownComponent";
import InvalidComponent from "./InvalidComponent";
import { isEmpty, isPlainObject } from "lodash-es";
import { extractParam } from "./utils/extractParam";
import { useTheme } from "@components-core/theming/ThemeContext";
import { mergeProps } from "@components-core/utils/mergeProps";
import ComponentDecorator from "@components-core/ComponentDecorator";
import { createValueExtractor } from "@components-core/container/valueExtractor";
import { EMPTY_OBJECT } from "@components-core/constants";
import { useComponentRegistry } from "@components/ViewComponentRegistryContext";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { ApiBoundComponent } from "@components-core/ApiBoundComponent";
import { useReferenceTrackedApi, useShallowCompareMemoize } from "./utils/hooks";
import type { InnerRendererContext } from "./abstractions/ComponentRenderer";
import { ContainerActionKind } from "./abstractions/containers";
import { useInspector } from "@components-core/InspectorContext";
import { SlotItem } from "@components/slot-helpers";
import { layoutOptionKeys } from "@components-core/descriptorHelper";
import { compileLayout } from "../parsers/style-parser/style-compiler";

// --- The available properties of Component
type ComponentProps = Omit<InnerRendererContext, "layoutContext"> & {
  layoutContextRef: MutableRefObject<LayoutContext | undefined>;
  onUnmount: (uid: symbol) => void;
};

function useEventHandler<TMd extends ComponentMetadata>(
  eventName: string,
  lookupEvent: LookupEventHandlerFn<TMd>,
  shouldSkip: boolean,
) {
  const onEvent = shouldSkip
    ? undefined
    : lookupEvent(eventName as keyof NonNullable<TMd["events"]>);
  const eventHandler: EventHandler<any> = useCallback(
    (event) => {
      if (onEvent) {
        event.stopPropagation();
        onEvent(event);
      }
    },
    [onEvent],
  );
  return !onEvent ? undefined : eventHandler;
}

function useMouseEventHandlers(lookupEvent: LookupEventHandlerFn, shouldSkip: boolean) {
  const onClick = useEventHandler("click", lookupEvent, shouldSkip);
  const onMouseLeave = useEventHandler("mouseLeave", lookupEvent, shouldSkip);
  const onMouseEnter = useEventHandler("mouseEnter", lookupEvent, shouldSkip);
  const onDoubleClick = useEventHandler("doubleClick", lookupEvent, shouldSkip);

  if (shouldSkip) {
    return EMPTY_OBJECT;
  }

  return {
    onClick,
    onMouseLeave,
    onMouseEnter,
    onDoubleClick,
  };
}

/**
 * This component's primary responsibility is to transform a particular component definition
 * into its React representation using the current rendering context.
 *
 * Its properties hold a transformed version of an `InnerRendererContext` (which describes the
 * current rendering context). The modified version uses a stable reference to the layout context
 * and provides a cleanup function (`onUnmount`) to call when the component is about to be disposed.
 */
const Component = forwardRef(function Component(
  {
    node,
    state,
    appContext,
    dispatch,
    lookupAction,
    lookupSyncCallback,
    renderChild,
    registerComponentApi,
    layoutContextRef,
    parentRenderContext,
    memoedVarsRef,
    onUnmount,
    uidInfoRef,
    ...rest
  }: ComponentProps,
  ref: React.ForwardedRef<any>,
) {
  // --- Memoizes the node object with a safe version that contains empty objects for props and events
  // --- were they no props or events defined
  const safeNode = useMemo(() => {
    return {
      ...node,
      props: node.props || (EMPTY_OBJECT as Record<string, any>),
      events: node.events || (EMPTY_OBJECT as Record<string, any>),
    };
  }, [node]);

  // --- Each component receives a unique identifier
  const uid = useMemo(() => Symbol(safeNode.uid), [safeNode.uid]);

  // --- Takes care the component cleanup function is called when the component is about to be disposed
  useEffect(() => {
    return () => {
      onUnmount(uid);
    };
  }, [onUnmount, uid]);

  const componentRegistry = useComponentRegistry();
  const { getResourceUrl, themeVars } = useTheme();

  const { inspectId, refreshInspection } = useInspector(safeNode, uid);
  // --- Memoizes component API registration
  const memoedRegisterComponentApi: RegisterComponentApiFn = useCallback(
    (api) => {
      registerComponentApi(uid, api);
    },
    [registerComponentApi, uid],
  );

  // --- Memoizes the state update function
  const memoedUpdateState = useCallback(
    (componentState: any) => {
      dispatch(componentStateChanged(uid, componentState));
    },
    [dispatch, uid],
  );

  // --- Memoizes the action resolution by action definition value
  const memoedLookupAction: LookupAsyncFn = useCallback(
    (action, actionOptions) => {
      return lookupAction(action, uid, actionOptions);
    },
    [lookupAction, uid],
  );

  // --- Get the tracked APIs of the compomnent
  const referenceTrackedApi = useReferenceTrackedApi(state);

  // --- Memoizes the value extractor object
  const valueExtractor = useMemo(() => {
    return createValueExtractor(state, appContext, referenceTrackedApi, memoedVarsRef);
  }, [appContext, memoedVarsRef, referenceTrackedApi, state]);

  // --- Memoizes the lookupSyncCallback function's call
  const memoedLookupSyncCallback: LookupSyncFn = useCallback(
    (action) => {
      return lookupSyncCallback(valueExtractor(action), uid);
    },
    [lookupSyncCallback, uid, valueExtractor],
  );

  // --- Memoizes event handler resolution by event name
  const memoedLookupEventHandler: LookupEventHandlerFn = useCallback(
    (eventName, actionOptions) => {
      const action = safeNode.events?.[eventName] || actionOptions?.defaultHandler;
      return lookupAction(action, uid, { eventName, ...actionOptions });
    },
    [lookupAction, safeNode.events, uid],
  );


  // --- Memoizes the resource URL extraction function
  const extractResourceUrl = useCallback(
    (url?: string) => {
      const extractedUrl = valueExtractor(url);
      return getResourceUrl(extractedUrl);
    },
    [getResourceUrl, valueExtractor],
  );

  // --- Obtain the component renderer and descriptor from the component registry
  const { renderer, descriptor, isCompoundComponent } =
    componentRegistry.lookupComponentRenderer(safeNode.type) || {};

  // --- Memoizes the renderChild function
  const memoedRenderChild: RenderChildFn = useCallback(
    (children, lc, pRenderContext) => {
      return renderChild(children, lc, pRenderContext || parentRenderContext, uidInfoRef);
    },
    [renderChild, parentRenderContext, uidInfoRef],
  );

  const apiBoundProps = useMemo(
    () => getApiBoundItems(safeNode.props, "DataSource", "DataSourceRef"),
    [safeNode.props],
  );
  const apiBoundEvents = useMemo(
    () => getApiBoundItems(safeNode.events, "APICall", "FileDownload", "FileUpload"),
    [safeNode.events],
  );
  const isApiBound = apiBoundProps.length > 0 || apiBoundEvents.length > 0;
  const mouseEventHandlers = useMouseEventHandlers(
    memoedLookupEventHandler,
    descriptor?.nonVisual || isApiBound,
  );

  const { cssProps, nonCssProps } = useMemo(() => {
    const resolvedLayoutProps: Record<string, any> = {};
    layoutOptionKeys.forEach((key) => {
      if (safeNode.props && key in safeNode.props) {
        resolvedLayoutProps[key] = valueExtractor(safeNode.props[key], true);
      }
    });
    return compileLayout(resolvedLayoutProps, themeVars, {
      ...layoutContextRef?.current,
      mediaSize: appContext.mediaSize,
    });
  }, [appContext.mediaSize, layoutContextRef, safeNode.props, themeVars, valueExtractor]);

  const stableLayoutCss = useShallowCompareMemoize(cssProps);
  const stableLayoutNonCss = useShallowCompareMemoize(nonCssProps);

  // --- API-bound components provide helpful behavior out of the box, such as transforming API-bound
  // --- events and properties. This extra functionality is implemented in `ApiBoundComponent`.
  if (isApiBound) {
    return (
      <ApiBoundComponent
        uid={uid}
        renderChild={memoedRenderChild}
        node={safeNode}
        key={safeNode.uid}
        apiBoundEvents={apiBoundEvents}
        apiBoundProps={apiBoundProps}
        layoutContextRef={layoutContextRef}
        parentRendererContext={parentRenderContext}
      />
    );
  }

  // --- No special behavior, let's render the component according to its definition.
  let renderedNode: ReactNode = null;
  let renderingError = null;
  try {
    // --- Assemble the renderer context we pass down the rendering chain
    const rendererContext: RendererContext<any> = {
      node: safeNode,
      state: state[uid] || EMPTY_OBJECT,
      updateState: memoedUpdateState,
      appContext,
      extractValue: valueExtractor,
      lookupEventHandler: memoedLookupEventHandler,
      lookupAction: memoedLookupAction,
      lookupSyncCallback: memoedLookupSyncCallback,
      extractResourceUrl,
      renderChild: memoedRenderChild,
      registerComponentApi: memoedRegisterComponentApi,
      layoutCss: stableLayoutCss,
      layoutNonCss: stableLayoutNonCss,
      layoutContext: layoutContextRef?.current,
      uid
    };

    if (safeNode.type === "Slot") {
      renderedNode = slotRenderer(rendererContext, parentRenderContext);
    } else {
      if (!renderer) {
        console.error(
          `Component '${safeNode.type}' is not available. Did you forget to register it?`,
        );
        return <UnknownComponent message={`${safeNode.type}`} />;
      }

      // --- Render the component using the renderer function obtained from the component registry
      renderedNode = renderer(rendererContext);
    }

    // --- Components may have a `testId` property for E2E testing purposes. Inject the value of `testId`
    // --- into the DOM object of the rendered React component.
    if (
      // --- The component has its "id" (internally, "uid") or "testId" property defined
      ((appContext?.decorateComponentsWithTestId &&
        (safeNode.uid !== undefined || safeNode.testId !== undefined)) ||
        // --- The component has its "inspectId" property defined
        (appContext?.debugEnabled && inspectId !== undefined)) &&
      // // --- The app context indicates test mode
      // --- The component is visual
      descriptor?.nonVisual !== true &&
      // --- The component is not opaque
      descriptor?.opaque !== true
    ) {
      // --- Use `ComponentDecorator` to inject the `data-testid` attribute into the component.
      const testId = safeNode.testId || safeNode.uid;
      const resolvedUid = extractParam(state, testId, appContext, true);

      renderedNode = (
        <ComponentDecorator
          attr={{ "data-testid": resolvedUid, "data-inspectId": inspectId }}
          allowOnlyRefdChild={isCompoundComponent || safeNode.type === "ModalDialog"}
          onTargetMounted={safeNode.type === "ModalDialog" ? refreshInspection : undefined}
          ref={ref}
        >
          {cloneElement(
            renderedNode as ReactElement,
            {
              ...mergeProps(
                { ...(renderedNode as ReactElement).props, ...mouseEventHandlers },
                rest,
              ),
            } as any,
          )}
        </ComponentDecorator>
      );
    }

    // --- The current layout context may suggest to wrap the rendered node.
    if (layoutContextRef.current?.wrapChild) {
      renderedNode = layoutContextRef.current.wrapChild(rendererContext, renderedNode, descriptor);
    }
  } catch (e) {
    // --- Mark the potential rendering error and display it
    renderingError = (e as Error)?.message || "Internal error";
    console.error(e);
  }

  // --- The rendering process may result in errors. If so, we render an error message.
  if (renderingError) {
    return (
      <InvalidComponent errors={[renderingError]} node={safeNode}>
        {renderedNode}
      </InvalidComponent>
    );
  }

  // --- If we have a single React node with forwarded reference, let's merge the "rest"
  // --- properties with it.
  if ((ref || !isEmpty(mouseEventHandlers)) && renderedNode && React.isValidElement(renderedNode)) {
    // --- For radix UI/accessibility, read more here:
    // --- https://www.radix-ui.com/primitives/docs/guides/composition

    return cloneElement(renderedNode, {
      ref: ref ? composeRefs(ref, (renderedNode as any).ref) : undefined,
      ...mergeProps({ ...renderedNode.props, ...mouseEventHandlers }, rest),
    } as any);
  }

  // --- If the rendering resulted in multiple React nodes, wrap them in a fragment.
  return React.isValidElement(renderedNode) ? renderedNode : <>{renderedNode}</>;
});

function slotRenderer(
  { node, extractValue, renderChild, lookupAction, layoutContext }: RendererContext<any>,
  parentRenderContext?: ParentRenderContext,
) {
  if (!parentRenderContext) {
    return undefined;
  }
  const templateName = extractValue(node.props.name);
  if (templateName === undefined) {
    return parentRenderContext.renderChild(parentRenderContext.children, layoutContext);
  } else {
    let slotProps;
    if (!isEmpty(node.props)) {
      slotProps = {};
      Object.keys(node.props).forEach((key) => {
        if (key !== "name") {
          let extractedValue = extractValue(node.props[key], true);
          if (extractedValue?._ARROW_EXPR_) {
            extractedValue = lookupAction(extractedValue);
          }
          slotProps[key] = extractedValue;
        }
      });
    }

    if (parentRenderContext.props[templateName]) {
      return (
        <SlotItem
          node={parentRenderContext.props[templateName]}
          renderChild={parentRenderContext.renderChild}
          slotProps={slotProps}
          layoutContext={layoutContext}
        />
      );
    } else {
      return (
        <SlotItem
          node={node.children}
          renderChild={renderChild}
          slotProps={slotProps}
          layoutContext={layoutContext}
        />
      );
    }
  }
}

/**
 * This function gets the API-bound component properties. A property is API-bound if its value is a
 * component definition with one of the `type` values passed to this function.
 * @param items Hash object of component properties
 * @param type Types to consider as API-bound properties
 * @returns List of API-bound property names
 */
function getApiBoundItems(items: Record<string, any> | undefined, ...type: string[]): string[] {
  const ret: string[] = [];
  if (!items) {
    return ret;
  }
  const entries = Object.entries(items);
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    if (isPlainObject(value) && type.includes(value.type)) {
      ret.push(key);
    }
  }
  return ret;
}

function componentStateChanged(uid: symbol, state: any) {
  return {
    type: ContainerActionKind.COMPONENT_STATE_CHANGED,
    payload: {
      uid,
      state,
    },
  };
}

export default Component;

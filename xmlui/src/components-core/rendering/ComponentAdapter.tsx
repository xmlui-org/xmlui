import type { MutableRefObject, ReactElement, ReactNode } from "react";
import React, {
  cloneElement,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { isEmpty, isPlainObject } from "lodash-es";
import { composeRefs } from "@radix-ui/react-compose-refs";

import type { ParentRenderContext } from "../../abstractions/ComponentDefs";
import type {
  LayoutContext,
  LookupEventHandlerFn,
  RegisterComponentApiFn,
  RenderChildFn,
  RendererContext,
} from "../../abstractions/RendererDefs";
import type { LookupAsyncFn, LookupSyncFn } from "../../abstractions/ActionDefs";

import { extractParam, shouldKeep } from "../utils/extractParam";
import { getCurrentTrace } from "../inspector/inspectorUtils";
import { useTheme } from "../theming/ThemeContext";
import { useComponentStyle } from "../theming/StyleContext";
import { isArrowExpressionObject } from "../../abstractions/InternalMarkers";
import { mergeProps } from "../utils/mergeProps";
import ComponentDecorator from "../ComponentDecorator";
import { createValueExtractor } from "../rendering/valueExtractor";
import { EMPTY_OBJECT } from "../constants";
import { useComponentRegistry } from "../../components/ComponentRegistryContext";
import { ApiBoundComponent } from "../ApiBoundComponent";
import { useReferenceTrackedApi, useShallowCompareMemoize } from "../utils/hooks";
import type { InnerRendererContext } from "../abstractions/ComponentRenderer";
import { ContainerActionKind } from "./containers";
import { useInspector } from "../InspectorContext";
import { SlotItem } from "../../components/SlotItem";
import { layoutOptionKeys } from "../descriptorHelper";
import { useMouseEventHandlers } from "../event-handlers";
import UnknownComponent from "./UnknownComponent";
import InvalidComponent from "./InvalidComponent";
import { resolveLayoutProps } from "../theming/layout-resolver";

// --- The available properties of Component
type Props = Omit<InnerRendererContext, "layoutContext"> & {
  layoutContextRef: MutableRefObject<LayoutContext | undefined>;
  onUnmount: (uid: symbol) => void;
  children?: ReactNode;
};

/**
 * This component's primary responsibility is to transform a particular component definition
 * into its React representation using the current rendering context.
 *
 * Its properties hold a transformed version of an `InnerRendererContext` (which describes the
 * current rendering context). The modified version uses a stable reference to the layout context
 * and provides a cleanup function (`onUnmount`) to call when the component is about to be disposed.
 */
const ComponentAdapter = forwardRef(function ComponentAdapter(
  {
    node,
    state,
    globalVars,
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
    children,
    ...rest
  }: Props,
  ref: React.ForwardedRef<any>,
) {
  const { logInteraction: _ignoredLogInteraction, ...restProps } = rest as any;
  // --- Make sure the component definition has `props` and `events` properties
  // --- (even if they are empty)
  const safeNode = useMemo(() => {
    return {
      ...node,
      props: node.props || (EMPTY_OBJECT as Record<string, any>),
      events: node.events || (EMPTY_OBJECT as Record<string, any>),
    };
  }, [node]);

  // --- Each component receives a unique identifier
  const uid = useMemo(() => Symbol(safeNode.uid), [safeNode.uid]);

  // --- Track the previous "when" condition value to detect transitions
  const prevWhenValueRef = useRef<boolean | undefined>(undefined);
  const cleanupHandlerRef = useRef<(() => void) | null>(null);

  // --- Takes care the component cleanup function is called when the component
  // --- is about to be disposed
  useEffect(() => {
    return () => {
      onUnmount(uid);
      // --- Call cleanup event handler on unmount
      if (cleanupHandlerRef.current) {
        try {
          cleanupHandlerRef.current();
        } catch (e) {
          console.error("Error in cleanup event handler:", e);
        }
      }
    };
  }, [onUnmount, uid]);

  // --- Register component info to global map for inspector
  // --- This allows the inspector to resolve testId -> component type/label
  // --- Only use explicit testId or uid - NOT component type, to avoid collisions
  // --- when multiple components of the same type exist (e.g., multiple NavLinks)
  const testIdForMap = safeNode.testId || safeNode.uid;
  const resolvedTestId = useMemo(
    () => (testIdForMap ? extractParam(state, testIdForMap, appContext, true) : undefined),
    [state, testIdForMap, appContext],
  );
  // Resolve label props using extractParam to evaluate expressions
  const resolvedLabel = useMemo(() => {
    const props = safeNode.props || {};
    const rawLabel = props.label ?? props.title ?? props.name ?? props.text ?? props.value ?? props.placeholder;
    if (rawLabel === undefined) return undefined;
    // Use extractParam to evaluate expressions like "{mediaSize.largeScreen ? 'Delete' : ''}"
    return extractParam(state, rawLabel, appContext, true);
  }, [state, safeNode.props, appContext]);

  const xsVerboseForMap = appContext.appGlobals?.xsVerbose === true;
  useEffect(() => {
    if (!xsVerboseForMap || !resolvedTestId || typeof window === "undefined") return;
    const w = window as any;
    w._xsTestIdMap = w._xsTestIdMap || {};
    const componentType = safeNode.type;
    w._xsTestIdMap[resolvedTestId] = {
      componentType,
      componentLabel: resolvedLabel,
      uid: uid.description,
      testId: resolvedTestId,
    };
    return () => {
      // Cleanup on unmount
      if (w._xsTestIdMap) {
        delete w._xsTestIdMap[resolvedTestId];
      }
    };
  }, [xsVerboseForMap, resolvedTestId, safeNode.type, resolvedLabel, uid]);

  // --- Ref to store inspector context for event handlers
  // --- Using a ref allows memoedLookupEventHandler to stay stable while still
  // --- having access to current values (avoids triggering init/cleanup re-runs)
  const inspectorContextRef = useRef({
    componentType: safeNode.type,
    componentLabel: resolvedLabel,
    componentId: safeNode.uid,
    sourceFileId: (safeNode as any)?.debug?.source?.fileId,
    sourceRange: (safeNode as any)?.debug?.source
      ? { start: (safeNode as any).debug.source.start, end: (safeNode as any).debug.source.end }
      : undefined,
  });
  // Keep the ref updated with current values
  inspectorContextRef.current = {
    componentType: safeNode.type,
    componentLabel: resolvedLabel,
    componentId: safeNode.uid,
    sourceFileId: (safeNode as any)?.debug?.source?.fileId,
    sourceRange: (safeNode as any)?.debug?.source
      ? { start: (safeNode as any).debug.source.start, end: (safeNode as any).debug.source.end }
      : undefined,
  };

  // --- Obtain a function to register the component API
  const memoedRegisterComponentApi: RegisterComponentApiFn = useCallback(
    (api) => {
      registerComponentApi(uid, api);
    },
    [registerComponentApi, uid],
  );

  // --- Obtain a function to update the component state
  const memoedUpdateState = useCallback(
    (componentState: any) => {
      dispatch({
        type: ContainerActionKind.COMPONENT_STATE_CHANGED,
        payload: {
          uid,
          state: componentState,
        },
      });
    },
    [dispatch, uid],
  );

  // --- Get the tracked APIs of the compomnent
  const referenceTrackedApi = useReferenceTrackedApi(state);

  // --- Obtain a function to extract the value of a property (from an expression)
  const valueExtractor = useMemo(() => {
    return createValueExtractor(state, appContext, referenceTrackedApi, memoedVarsRef);
  }, [appContext, memoedVarsRef, referenceTrackedApi, state]);

  // --- Obtain a function that can execute a script synchronously
  const memoedLookupSyncCallback: LookupSyncFn = useCallback(
    (action) => {
      return lookupSyncCallback(valueExtractor(action), uid);
    },
    [lookupSyncCallback, uid, valueExtractor],
  );

  // --- Obtain a function to lookup an action by its name, which is bound
  // --- to this component instance
  const memoedLookupAction: LookupAsyncFn = useCallback(
    (action, actionOptions) => {
      return lookupAction(action, uid, actionOptions);
    },
    [lookupAction, uid],
  );

  // --- Obtain the component renderer and descriptor from the component registry
  // --- Memoizes the renderChild function
  const memoedRenderChild: RenderChildFn = useCallback(
    (children, layoutContext, pRenderContext) => {
      return renderChild(
        children,
        layoutContext,
        pRenderContext || parentRenderContext,
        uidInfoRef,
      );
    },
    [renderChild, parentRenderContext, uidInfoRef],
  );

  // --- Collect the API-bound properties and events of the component to determine
  // --- if the component should be wrapped in an `ApiBoundComponent`
  const apiBoundProps = useMemo(
    () => getApiBoundItems(safeNode.props, "DataSource", "DataSourceRef"),
    [safeNode.props],
  );
  const apiBoundEvents = useMemo(
    () => getApiBoundItems(safeNode.events, "APICall", "FileDownload", "FileUpload"),
    [safeNode.events],
  );
  const isApiBound = apiBoundProps.length > 0 || apiBoundEvents.length > 0;

  // --- Obtain the component renderer and descriptor from the component registry
  const componentRegistry = useComponentRegistry();
  const { renderer, descriptor, isCompoundComponent } =
    componentRegistry.lookupComponentRenderer(safeNode.type) || {};

  // --- Extract context variables (keys starting with "$") from state
  const contextVars = useMemo(() => {
    const vars: Record<string, any> = {};
    for (const key of Object.keys(state)) {
      if (key.startsWith("$")) {
        vars[key] = state[key];
      }
    }
    return vars;
  }, [state]);

  // --- Obtain a function that can lookup an event handler, which is bound to a
  // --- particular event of this component instance
  const memoedLookupEventHandler: LookupEventHandlerFn = useCallback(
    (eventName, actionOptions) => {
      const action = safeNode.events?.[eventName] || actionOptions?.defaultHandler;
      // Read inspector context from ref to avoid changing callback identity
      // when label/type/etc change (which would trigger init/cleanup re-runs)
      const ctx = inspectorContextRef.current;
      return lookupAction(action, uid, {
        eventName,
        componentType: ctx.componentType,
        componentLabel: ctx.componentLabel,
        componentId: ctx.componentId,
        sourceFileId: ctx.sourceFileId,
        sourceRange: ctx.sourceRange,
        ...actionOptions
      });
    },
    [lookupAction, safeNode.events, uid],
  );

  // --- Set up the mouse event handlers for the component
  const mouseEventHandlers = useMouseEventHandlers(
    memoedLookupEventHandler,
    descriptor?.nonVisual || isApiBound || isCompoundComponent,
  );

  // --- Use the current theme to obtain resources and collect theme variables
  // --- (Must be called before any conditional returns to follow Rules of Hooks)
  const { getResourceUrl, disableInlineStyle: themeDisableInlineStyle } = useTheme();

  // --- Obtain a function that can extract a resource URL from a logical URL
  const extractResourceUrl = useCallback(
    (url?: unknown) => {
      const extractedUrl = valueExtractor(url);
      if (typeof extractedUrl !== "string" || extractedUrl.trim() === "") {
        // TODO: Review how we should log this warning
        // console.warn(
        //   `Component '${safeNode.type}': ` +
        //     `the extracted resource URL is not a valid string: value ${extractedUrl}, type ${typeof extractedUrl}`,
        // );
        return undefined;
      }
      return getResourceUrl(extractedUrl);
    },
    [getResourceUrl, valueExtractor],
  );

  // --- Collect and compile the layout property values
  const { cssProps } = useMemo(() => {
    const resolvedLayoutProps: Record<string, any> = {};
    layoutOptionKeys.forEach((key) => {
      if (safeNode.props && key in safeNode.props) {
        resolvedLayoutProps[key] = valueExtractor(safeNode.props[key], true);
      }
    });

    // --- New layout property resolution
    return resolveLayoutProps(
      resolvedLayoutProps,
      {
        ...layoutContextRef?.current,
        mediaSize: appContext.mediaSize,
      },
      themeDisableInlineStyle ?? appContext.appGlobals?.disableInlineStyle,
    );

    // --- Old layout property resolution
    // return compileLayout(resolvedLayoutProps, themeVars, {
    //   ...layoutContextRef?.current,
    //   mediaSize: appContext.mediaSize,
    // });
  }, [
    layoutContextRef,
    appContext.mediaSize,
    appContext.appGlobals?.disableInlineStyle,
    themeDisableInlineStyle,
    safeNode.props,
    valueExtractor,
  ]);

  // const className = useComponentStyle(cssProps);

  // --- As compileLayout generates new cssProps and nonCssProps objects every time, we need to
  // --- memoize them using shallow comparison to avoid unnecessary re-renders.
  const stableLayoutCss = useShallowCompareMemoize(cssProps);

  const className = useComponentStyle(stableLayoutCss);

  const { inspectId, refreshInspection } = useInspector(safeNode, uid);

  // --- Evaluate the current "when" condition
  const currentWhenValue = shouldKeep(safeNode.when, state, appContext);

  // --- Handle init and cleanup events based on "when" condition transitions
  useEffect(() => {
    const initHandler = memoedLookupEventHandler("init" as any);
    cleanupHandlerRef.current = memoedLookupEventHandler("cleanup" as any);

    const prevWhenValue = prevWhenValueRef.current;

    // --- Determine if we should call init
    const shouldCallInit =
      // Case 1: First render and when is not set (implicitly true) or is true
      (prevWhenValue === undefined && currentWhenValue) ||
      // Case 2: Transition from false to true
      (prevWhenValue === false && currentWhenValue === true);

    // --- Determine if we should call cleanup
    const shouldCallCleanup =
      // Transition from true to false
      prevWhenValue === true && currentWhenValue === false;

    if (shouldCallInit && initHandler) {
      try {
        initHandler();
      } catch (e) {
        console.error("Error in init event handler:", e);
      }
    }

    if (shouldCallCleanup && cleanupHandlerRef.current) {
      try {
        cleanupHandlerRef.current();
      } catch (e) {
        console.error("Error in cleanup event handler:", e);
      }
    }

    // --- Update the previous "when" value for next render
    prevWhenValueRef.current = currentWhenValue;
  }, [currentWhenValue, memoedLookupEventHandler]);

  // --- Create interaction logger for inspector/debugging
  // --- IMPORTANT: This must be BEFORE the early return to maintain consistent hook order
  const xsVerbose = appContext.appGlobals?.xsVerbose === true;
  const logInteraction = useCallback(
    (interaction: string, detail?: Record<string, any>) => {
      if (!xsVerbose) return;
      if (typeof window !== "undefined") {
        const w = window as any;
        w._xsLogs = Array.isArray(w._xsLogs) ? w._xsLogs : [];
        w._xsLogs.push({
          ts: Date.now(),
          traceId: getCurrentTrace(),
          kind: "interaction",
          componentType: safeNode.type,
          componentLabel: resolvedLabel,
          uid: safeNode.uid,
          interaction,
          detail,
        });
      }
    },
    [xsVerbose, safeNode.type, resolvedLabel, safeNode.uid]
  );

  // --- If when is false, don't render the component
  if (!currentWhenValue) {
    return null;
  }

  // --- Assemble the renderer context we pass down the rendering chain
  if (globalVars && Object.keys(globalVars).length > 0) {
    console.log('[ComponentAdapter]', safeNode.type, safeNode.uid, 'creating rendererContext with globalVars:', Object.keys(globalVars));
  }
  
  const rendererContext: RendererContext<any> = {
    node: safeNode,
    state: state[uid] || EMPTY_OBJECT,
    globalVars,
    contextVars,
    updateState: memoedUpdateState,
    appContext,
    extractValue: valueExtractor,
    lookupEventHandler: memoedLookupEventHandler,
    lookupAction: memoedLookupAction,
    lookupSyncCallback: memoedLookupSyncCallback,
    extractResourceUrl,
    renderChild: memoedRenderChild,
    registerComponentApi: memoedRegisterComponentApi,
    className,
    layoutContext: layoutContextRef?.current,
    uid,
    logInteraction,
  };

  // --- No special behavior, let's render the component according to its definition.
  let renderedNode: ReactNode = null;
  let renderingError = null;

  try {
    if (safeNode.type === "Slot") {
      // --- Transpose the children from the parent component to the slot in
      // --- the compound component
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

    /**
     * Apply any behaviors to the component.
     */
    const behaviors = componentRegistry.getBehaviors();
    if (!isCompoundComponent) {
      for (const behavior of behaviors) {
        if (behavior.canAttach(rendererContext, rendererContext.node, descriptor)) {
          renderedNode = behavior.attach(rendererContext, renderedNode, descriptor);
        }
      }
    }

    // --- Components may have a `testId` property for E2E testing purposes. Inject the value of `testId`
    // --- into the DOM object of the rendered React component.
    if (
      // --- The component has its "id" (internally, "uid") or "testId" property defined
      ((appContext?.decorateComponentsWithTestId &&
        (safeNode.uid !== undefined || safeNode.testId !== undefined)) ||
        // --- The component has its "inspectId" property defined
        inspectId !== undefined) &&
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
          attr={{ "data-testid": resolvedUid, "data-inspectId": inspectId, "data-component-type": safeNode.type }}
          allowOnlyRefdChild={isCompoundComponent || safeNode.type === "ModalDialog"}
          onTargetMounted={safeNode.type === "ModalDialog" ? refreshInspection : undefined}
          ref={ref}
        >
          {cloneElement(
            renderedNode as ReactElement,
            {
              ...mergeProps(
                { ...(renderedNode as ReactElement).props, ...mouseEventHandlers },
                restProps,
              ),
            } as any,
          )}
        </ComponentDecorator>
      );
    }

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

  let nodeToRender: ReactNode = renderedNode;
  // --- If we have a single React node with forwarded reference, or mouse events
  // --- let's merge the "rest" properties with it.
  if ((ref || !isEmpty(mouseEventHandlers)) && renderedNode && React.isValidElement(renderedNode)) {
    // --- For radix UI/accessibility, read more here:
    // --- https://www.radix-ui.com/primitives/docs/guides/composition

    const childrenArray = !children ? [] : Array.isArray(children) ? children : [children];

    const clonedRef =
      renderedNode.type === React.Fragment
        ? undefined
        : ref
          ? composeRefs(ref, (renderedNode as any).ref)
          : (renderedNode as any).ref;

    nodeToRender = cloneElement(
      renderedNode,
      {
        ref: clonedRef,
        ...mergeProps(
          {
            ...renderedNode.props,
            ...(renderedNode.type !== React.Fragment ? mouseEventHandlers : {}),
          },
          restProps,
        ),
      } as any,
      ...childrenArray,
    );
  } else {
    // --- If the rendering resulted in multiple React nodes, wrap them in a fragment.
    nodeToRender =
      React.isValidElement(renderedNode) && !!children
        ? cloneElement(renderedNode, null, children)
        : renderedNode;
  }

  return nodeToRender;
});

/**
 * This function renders the content of a slot. If the slot is named, it looks for a template
 * in the parent component to render. If the template is not found, it renders the default content
 * of the slot.
 */
function slotRenderer(
  { node, extractValue, renderChild, lookupAction, layoutContext }: RendererContext<any>,
  parentRenderContext?: ParentRenderContext,
) {
  // --- Get the template name from the slot
  const templateName = extractValue.asOptionalString(node.props.name);
  if (templateName && !templateName.endsWith("Template")) {
    return (
      <InvalidComponent
        node={node}
        errors={[
          `Slot name '${templateName}' is not valid. ` +
            "A named slot should use a name ending with 'Template'.",
        ]}
      />
    );
  }

  let slotProps: any = null;
  if (!isEmpty(node.props)) {
    slotProps = {};
    Object.keys(node.props).forEach((key) => {
      if (key !== "name") {
        let extractedValue = extractValue(node.props[key], true);
        if (isArrowExpressionObject(extractedValue)) {
          extractedValue = lookupAction(extractedValue);
        }
        slotProps[key] = extractedValue;
      }
    });
  }

  if (parentRenderContext) {
    // --- We may use a named slot to get the content from the parent
    if (templateName === undefined) {
      // --- The slot is not named
      if (!slotProps) {
        // --- simply render the children from the parent
        // --- The parent does not provide a template for the slot.
        if (parentRenderContext.children) {
          return parentRenderContext.renderChild(parentRenderContext.children, layoutContext);
        }
      } else {
        // --- The slot has properties; let's render the children with the slot properties
        return (
          <SlotItem
            node={parentRenderContext.children}
            renderChild={parentRenderContext.renderChild}
            slotProps={slotProps}
            layoutContext={layoutContext}
          />
        );
      }
    } else {
      // --- We have a named slot with optional other properties; let's collect them
      if (parentRenderContext.props[templateName]) {
        // --- The parent provides a template to put into the slot. Let's use
        // --- the parent's context to render the slot content.
        return (
          <SlotItem
            node={parentRenderContext.props[templateName]}
            renderChild={parentRenderContext.renderChild}
            slotProps={slotProps}
            layoutContext={layoutContext}
          />
        );
      }
    }
  }

  // --- No parent context, render the default slot content
  if (node.children && node.children.length > 0) {
    // --- The parent does not provide a template for the slot. Let's render
    // --- the slot's default children.
    return (
      <SlotItem
        node={node.children}
        renderChild={renderChild}
        slotProps={slotProps ?? EMPTY_OBJECT}
        layoutContext={layoutContext}
      />
    );
  }

  // --- We do not render the named slots with names not ending with "Template"
  return undefined;
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

export default ComponentAdapter;

import type { MutableRefObject, ReactElement, ReactNode } from "react";
import React, { cloneElement, forwardRef, useCallback, useEffect, useMemo, useRef } from "react";
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

import { extractParam, resolveResponsiveWhen } from "../utils/extractParam";
import { getCurrentTrace, pushXsLog } from "../inspector/inspectorUtils";
import { useTheme } from "../theming/ThemeContext";
import { useStyles } from "../theming/StyleContext";
import type { StyleObjectType } from "../theming/StyleRegistry";
import { isArrowExpressionObject } from "../../abstractions/InternalMarkers";
import { mergeProps } from "../utils/mergeProps";
import ComponentDecorator from "../ComponentDecorator";
import { createValueExtractor } from "../rendering/valueExtractor";
import { useFnDeps } from "../FnDepsContext";
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
import { stripDirectChildProps } from "../../abstractions/layout-context-utils";
import InvalidComponent from "./InvalidComponent";
import {
  resolveLayoutProps,
  DIMS_ONLY_PROPS,
  SPACING_ONLY_PROPS,
} from "../theming/layout-resolver";
import { useComponentThemeClass } from "../theming/utils";
import {
  buildResponsiveStyleObjects,
  buildCompositeStyleObject,
  buildWhenStyleObject,
  isVisibleAtAnyBreakpoint,
  COMPONENT_PART_KEY,
} from "../theming/responsive-layout";
import { parseLayoutProperty } from "../theming/parse-layout-props";
import { is } from "immer/dist/internal.js";

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
    const rawLabel =
      props.label ??
      props.title ??
      props.name ??
      props.text ??
      props.value ??
      props.placeholder ??
      props["aria-label"];
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

  // --- Get the function dependencies from the parent container
  const fnDeps = useFnDeps();

  // --- Obtain a function to extract the value of a property (from an expression)
  const valueExtractor = useMemo(() => {
    return createValueExtractor(state, appContext, referenceTrackedApi, memoedVarsRef, fnDeps);
  }, [appContext, memoedVarsRef, referenceTrackedApi, state, fnDeps]);

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
  // --- Memoizes the renderChild function.
  // --- When a component calls renderChild without an explicit layoutContext (undefined),
  // --- we fall back to the component's own incoming context so that "transparent"
  // --- wrapper components propagate the parent layout context automatically.
  // --- Direct-child-only properties (ignoreLayoutProps, wrapChild) are stripped
  // --- from the fallback so they don't leak through component boundaries.
  const memoedRenderChild: RenderChildFn = useCallback(
    (children, layoutContext, pRenderContext) => {
      return renderChild(
        children,
        layoutContext ?? stripDirectChildProps(layoutContextRef.current),
        pRenderContext || parentRenderContext,
        uidInfoRef,
      );
    },
    [renderChild, parentRenderContext, uidInfoRef, layoutContextRef],
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
        ...actionOptions,
      });
    },
    [lookupAction, safeNode.events, uid],
  );

  // EXPERIMENTAL: extract bubbleEvents prop to allow selective propagation bypass
  const bubbleEvents = safeNode.props.bubbleEvents
    ? (valueExtractor(safeNode.props.bubbleEvents) as string[] | undefined)
    : undefined;

  // --- Set up the mouse event handlers for the component
  const mouseEventHandlers = useMouseEventHandlers(
    memoedLookupEventHandler,
    descriptor?.nonVisual || isApiBound || isCompoundComponent,
    bubbleEvents, // EXPERIMENTAL
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
      appContext.appGlobals?.applyLayoutProperties,
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
    appContext.appGlobals?.applyLayoutProperties,
    themeDisableInlineStyle,
    safeNode.props,
    valueExtractor,
  ]);

  // const className = useComponentStyle(cssProps);

  // --- As compileLayout generates new cssProps and nonCssProps objects every time, we need to
  // --- memoize them using shallow comparison to avoid unnecessary re-renders.
  const stableLayoutCss = useShallowCompareMemoize(cssProps);

  const themeClassName = useComponentThemeClass(descriptor);

  // --- Collect extended layout props: keys with part and/or breakpoint suffixes
  // --- (e.g. "fontSize-label", "padding-md", "color-input-lg")
  const extendedLayoutProps = useMemo(() => {
    if (!safeNode.props) return EMPTY_OBJECT as Record<string, any>;
    const applyMode = appContext.appGlobals?.applyLayoutProperties ?? "all";
    // Mirror the applyLayoutProperties check that resolveLayoutProps applies to the base props
    if (applyMode === "none") return EMPTY_OBJECT as Record<string, any>;
    const extended: Record<string, any> = {};
    const ignoreProps = (layoutContextRef?.current?.ignoreLayoutProps as string[]) || [];
    for (const key of Object.keys(safeNode.props)) {
      const parsed = parseLayoutProperty(key);
      if (typeof parsed === "string") continue; // invalid key
      if (parsed.component) continue; // component-scoped, not a layout prop
      // Only collect keys that have a part, breakpoint, or state suffix — base keys are already
      // handled by the existing layoutOptionKeys pass above
      if (
        parsed.part ||
        (parsed.screenSizes && parsed.screenSizes.length > 0) ||
        (parsed.states && parsed.states.length > 0)
      ) {
        // Skip responsive variants of ignored layout props — the parent container
        // (e.g. FlowItemWrapper) handles them via its own width resolution.
        if (ignoreProps.includes(parsed.property)) continue;
        // In "dims" / "spacing" mode, restrict to the allowed property set
        if (applyMode === "dims" && !DIMS_ONLY_PROPS.has(parsed.property)) continue;
        if (applyMode === "spacing" && !SPACING_ONLY_PROPS.has(parsed.property)) continue;
        extended[key] = valueExtractor(safeNode.props[key], true);
      }
    }
    return extended;
  }, [safeNode.props, valueExtractor, appContext.appGlobals?.applyLayoutProperties]);

  // --- Build composite responsive style object covering root + all parts
  const responsiveStyleObject = useMemo(
    () => buildCompositeStyleObject(buildResponsiveStyleObjects(extendedLayoutProps)),
    [extendedLayoutProps],
  );

  // --- Build responsive display rules from when / when-* attributes (SSR only)
  // In normal (client-side) mode the component is either rendered or not based on the
  // runtime `currentWhenValue`, so CSS display rules add no value.
  // In SSR mode (`document` is undefined) we need media-query display rules so the
  // browser shows/hides the pre-rendered HTML correctly before JS hydration.
  const isSSR = typeof document === "undefined";
  const whenStyleObject = useMemo(
    () => (isSSR ? buildWhenStyleObject(safeNode.when, safeNode.responsiveWhen) : {}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSSR, safeNode.when, safeNode.responsiveWhen],
  );

  // --- Merge layout responsive styles and when-display styles into one object
  const mergedStyleObject = useMemo(() => {
    const hasLayout = responsiveStyleObject && Object.keys(responsiveStyleObject).length > 0;
    const hasWhen = whenStyleObject && Object.keys(whenStyleObject).length > 0;
    if (!hasLayout && !hasWhen) return responsiveStyleObject; // stable empty ref
    if (!hasWhen) return responsiveStyleObject;
    if (!hasLayout) return whenStyleObject as StyleObjectType;
    // Deep-merge: both may have @media keys that need combining
    const merged = { ...responsiveStyleObject } as Record<string, any>;
    for (const [key, val] of Object.entries(whenStyleObject)) {
      if (key.startsWith("@media") && merged[key]) {
        merged[key] = { ...(merged[key] as object), ...(val as object) };
      } else {
        merged[key] = val;
      }
    }
    return merged as StyleObjectType;
  }, [responsiveStyleObject, whenStyleObject]);

  const stableResponsiveStyleObject = useShallowCompareMemoize(mergedStyleObject);

  // --- Merge base layout CSS and responsive/when CSS into a single useStyles call so that
  // --- base rules and @media rules always live in the same <style> element in the correct
  // --- source order (base first, then @media). Without this, a second component instance
  // --- with new base styles (new hash) would inject its base <style> *after* the already-
  // --- injected responsive <style> shared with an earlier instance, causing the base
  // --- font-size to override the @media breakpoint override (source-order cascade bug).
  const combinedStyleObject = useMemo((): StyleObjectType => {
    const hasBase = stableLayoutCss && Object.keys(stableLayoutCss).length > 0;
    const hasResponsive =
      stableResponsiveStyleObject && Object.keys(stableResponsiveStyleObject).length > 0;
    if (!hasBase && !hasResponsive) return EMPTY_OBJECT as StyleObjectType;
    if (!hasBase) return stableResponsiveStyleObject;
    if (!hasResponsive) return { "&": stableLayoutCss } as StyleObjectType;
    return { "&": stableLayoutCss, ...stableResponsiveStyleObject } as StyleObjectType;
  }, [stableLayoutCss, stableResponsiveStyleObject]);

  // --- Always call useStyles (Rules of Hooks) — returns undefined when object is empty
  const layoutClassName = useStyles(combinedStyleObject);

  // --- Include any extraClassName propagated from a parent compound component so that
  // --- layout props set on the compound's usage site are applied to its single root child.
  const extraClassName = layoutContextRef?.current?.extraClassName as string | undefined;
  const className = [themeClassName, layoutClassName, extraClassName].filter(Boolean).join(" ");

  // Memoize `classes` so components wrapped in React.memo (e.g. Markdown)
  // don't re-render when `className` is unchanged.
  // MUST be before any conditional return to obey the Rules of Hooks.
  const memoedClasses = useMemo(() => ({ [COMPONENT_PART_KEY]: className }), [className]);

  const { inspectId, refreshInspection } = useInspector(safeNode, uid);

  // --- Evaluate the current "when" condition (respects responsive when-* breakpoint rules)
  const currentWhenValue = resolveResponsiveWhen(
    safeNode.when,
    safeNode.responsiveWhen,
    state,
    appContext,
  );

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
      pushXsLog({
        ts: Date.now(),
        traceId: getCurrentTrace(),
        kind: "interaction",
        componentType: safeNode.type,
        componentLabel: resolvedLabel,
        uid: safeNode.uid,
        interaction,
        detail,
      });
    },
    [xsVerbose, safeNode.type, resolvedLabel, safeNode.uid],
  );

  // --- Decide whether to skip rendering entirely
  // SSR mode (no `document`): render the component if it is visible at ANY breakpoint
  // and rely on CSS display rules (from buildWhenStyleObject) to hide/show per viewport.
  // Normal mode (client-side): trust the runtime `currentWhenValue` which reflects the
  // actual viewport — don't render at all when the component should be hidden.
  if (!currentWhenValue) {
    const isSSR = typeof document === "undefined";
    if (isSSR) {
      const staticVisibility = isVisibleAtAnyBreakpoint(safeNode.when, safeNode.responsiveWhen);
      if (staticVisibility !== true) {
        return null;
      }
      // SSR + visible at some breakpoint → fall through and render with CSS classes
    } else {
      return null;
    }
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
    classes: memoedClasses,
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
    const excludedBehaviors = descriptor?.excludeBehaviors || [];
    if (!isCompoundComponent) {
      for (const behavior of behaviors) {
        // Skip behaviors that are explicitly excluded for this component
        if (excludedBehaviors.includes(behavior.metadata.name)) {
          continue;
        }
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
          attr={{
            "data-testid": resolvedUid,
            "data-inspectId": inspectId,
            "data-component-type": safeNode.type,
          }}
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

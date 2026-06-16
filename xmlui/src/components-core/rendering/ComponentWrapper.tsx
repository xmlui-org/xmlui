import type { MutableRefObject, ReactNode, RefObject } from "react";
import { forwardRef, memo, useMemo, useRef } from "react";

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import { extractParam } from "../utils/extractParam";
import type { ChildRendererContext } from "./renderChild";
import type { ContainerWrapperDef } from "./ContainerWrapper";
import { ContainerWrapper, isContainerLike } from "./ContainerWrapper";
import ComponentAdapter from "./ComponentAdapter";
import { useComponentRegistry } from "../../components/ComponentRegistryContext";
import { EMPTY_ARRAY } from "../constants";
import { useShallowCompareMemoize } from "../utils/hooks";
import { extractScopedState, narrowGlobalVars } from "./ContainerUtils";

/**
 * The ComponentNode it the outermost React component wrapping an xmlui component.
 */
export const ComponentWrapper = memo(
  forwardRef(function ComponentWrapper(
    {
      node,
      resolvedKey,
      state,
      globalVars,
      dispatch,
      appContext,
      lookupAction,
      lookupSyncCallback,
      registerComponentApi,
      renderChild,
      statePartChanged,
      layoutContext,
      parentRenderContext,
      memoedVarsRef,
      cleanup,
      uidInfoRef,
      children,
      ...rest
    }: ChildRendererContext & { resolvedKey: string; children?: ReactNode },
    ref,
  ) {
    // --- We pass the layout context to the child components, so we need to
    // --- make sure that it is stable
    const componentRegistry = useComponentRegistry();
    const { descriptor } = componentRegistry.lookupComponentRenderer(node.type) || {};
    const stableLayoutContext = useRef(layoutContext);


    // --- Transform the various data sources within the xmlui component definition
    const nodeWithTransformedLoaders = useMemo(() => {
      // --- If we have a DataSource child, we transform it to a loader on the node
      let transformed = node;
      transformed = transformNodeWithChildrenAsTemplate(
        transformed,
        descriptor?.childrenAsTemplate,
      );
      transformed = transformNodeWithChildDatasource(transformed);
      transformed = transformNodeWithDataSourceRefProp(transformed, uidInfoRef);
      transformed = transformNodeWithRawDataProp(transformed);

      return transformed;
    }, [descriptor?.childrenAsTemplate, node, uidInfoRef]);

    // --- String values in the "data" prop are treated as URLs. This boolean
    // --- indicates whether the "data" prop is a string or not.
    const resolvedDataPropIsString = useMemo(() => {
      const resolvedDataProp = extractParam(
        state,
        nodeWithTransformedLoaders.props?.data,
        appContext,
        true,
      );
      return typeof resolvedDataProp === "string";
    }, [appContext, nodeWithTransformedLoaders.props?.data, state]);

    // --- If the "data" prop is a string, we transform it to a DataSource component
    // --- so that it can be fetched.
    const nodeWithTransformedDatasourceProp = useMemo(() => {
      return transformNodeWithDataProp(
        nodeWithTransformedLoaders,
        resolvedDataPropIsString,
        uidInfoRef,
      );
    }, [nodeWithTransformedLoaders, resolvedDataPropIsString, uidInfoRef]);

    // When the node declares a scope (uses or computedUses), extract only the
    // relevant slice of parent state and stabilise it with a shallow-equal memo.
    // This prevents ContainerWrapper/StateContainer from re-rendering when
    // unrelated state keys change — e.g. a fast-ticking timer should not
    // cause a scoped Select to re-render on every tick.
    const nodeUses = nodeWithTransformedDatasourceProp.uses;
    const nodeComputedUses = nodeWithTransformedDatasourceProp.computedUses;
    const scopedParentState = useShallowCompareMemoize(
      useMemo(
        () => extractScopedState(state, nodeUses ?? nodeComputedUses) ?? state,
        [state, nodeUses, nodeComputedUses],
      ),
    );

    // Narrow parentGlobalVars to only the globals this subtree reads.
    // When computedGlobalUses is undefined (no global deps), pass globalVars as-is.
    //
    // Two-step approach to handle write targets correctly:
    //   Step 1 — build a narrow snapshot for change-detection. When computedGlobalUses
    //            is absent, return undefined — useShallowCompareMemoize with a stable
    //            undefined is O(1) and avoids an O(n-globals) shallow comparison that
    //            would otherwise run on every render even when no narrowing is needed.
    //   Step 2 — pass the FULL globalVars to the child but update its reference only
    //            when the narrow snapshot changes (or, when absent, whenever globalVars
    //            itself changes).
    //
    // This prevents re-renders on unrelated global changes while still exposing
    // every global variable (including write targets that aren't in
    // computedGlobalUses) to the child's expression evaluator.
    const nodeComputedGlobalUses = nodeWithTransformedDatasourceProp.computedGlobalUses;
    const narrowedGlobalVarsForComparison = useShallowCompareMemoize(
      useMemo(
        () =>
          nodeComputedGlobalUses && globalVars
            ? narrowGlobalVars(globalVars, nodeComputedGlobalUses)
            : undefined,
        [globalVars, nodeComputedGlobalUses],
      ),
    );
    // Two-step memo: return the FULL globalVars but update its reference only when
    // the narrow snapshot changes (or when absent, when globalVars itself changes).
    // A ref is used to read the latest globalVars without adding it as a memo
    // dependency — reading `.current` inside useMemo is the standard React pattern
    // for "I need the current value at the time the memo recomputes, but I do not
    // want the memo to recompute every time the value changes."
    const globalVarsCurrentRef = useRef(globalVars);
    globalVarsCurrentRef.current = globalVars;
    const globalVarsWithStableRef = useMemo(
      () => globalVarsCurrentRef.current,
      // eslint-disable-next-line react-hooks/exhaustive-deps -- ref.current is intentionally excluded; see comment above
      [narrowedGlobalVarsForComparison ?? globalVars],
    );

    // Stable ref holding the full (un-narrowed) parent state for event handlers.
    // Using a MutableRefObject instead of a value prop means ContainerWrapper.memo
    // never sees this as a changed prop — the optimization (no re-render on
    // unrelated state changes) is preserved while event handlers can still write
    // to any parent variable even when it is absent from computedUses.
    const fullParentStateRef = useRef<Record<string, any> | undefined>(undefined);
    fullParentStateRef.current = (nodeUses || nodeComputedUses) ? state : undefined;

    if (isContainerLike(nodeWithTransformedDatasourceProp)) {
      // --- This component should be rendered as a container
      return (
        <ContainerWrapper
          resolvedKey={resolvedKey}
          node={nodeWithTransformedDatasourceProp as ContainerWrapperDef}
          parentState={scopedParentState}
          fullParentStateRef={(nodeUses || nodeComputedUses) ? fullParentStateRef : undefined}
          parentGlobalVars={globalVarsWithStableRef}
          parentDispatch={dispatch}
          layoutContextRef={stableLayoutContext}
          parentRenderContext={parentRenderContext}
          parentStatePartChanged={statePartChanged}
          parentRegisterComponentApi={registerComponentApi}
          uidInfoRef={uidInfoRef}
          ref={ref}
          {...rest}
        >
          {children}
        </ContainerWrapper>
      );
    } else {
      // --- This component should be rendered as a regular component
      return (
        <ComponentAdapter
          onUnmount={cleanup}
          memoedVarsRef={memoedVarsRef}
          node={nodeWithTransformedDatasourceProp}
          state={state}
          globalVars={globalVars}
          dispatch={dispatch}
          appContext={appContext}
          lookupAction={lookupAction}
          lookupSyncCallback={lookupSyncCallback}
          registerComponentApi={registerComponentApi}
          renderChild={renderChild}
          parentRenderContext={parentRenderContext}
          layoutContextRef={stableLayoutContext}
          ref={ref}
          uidInfoRef={uidInfoRef}
          {...rest}
        >
          {children}
        </ComponentAdapter>
      );
    }
  }),
);

function transformNodeWithChildrenAsTemplate(node: ComponentDef, childrenAsTemplate: string) {
  if (!childrenAsTemplate) {
    return node;
  }
  if (!node.children || node.children.length === 0) {
    return node;
  }
  if (node.props?.[childrenAsTemplate]) {
    throw Error("'" + childrenAsTemplate + "' is already used as a property.");
  }
  return {
    ...node,
    props: {
      ...node.props,
      [childrenAsTemplate]: node.children,
    },
    children: EMPTY_ARRAY,
  };
}

// --- Create a DataLoader component for each DataSource child within the
// --- xmlui component
function transformNodeWithChildDatasource(node: ComponentDef) {
  let didResolve = false;
  let loaders = node.loaders;
  let children: Array<ComponentDef> | undefined = undefined;
  node.children?.forEach((child) => {
    if (child?.type === "DataSource") {
      didResolve = true;
      if (!loaders) {
        loaders = [];
      }
      loaders.push({
        uid: child.uid!,
        type: "DataLoader",
        props: child.props,
        events: child.events,
        when: child.when,
        debug: child.debug,
      });
    } else if (child?.type === "External") {
      didResolve = true;
      if (!loaders) {
        loaders = [];
      }
      loaders.push({
        uid: child.uid!,
        type: "External",
        props: child.props,
        events: child.events,
        when: child.when,
        debug: child.debug,
      });
    } else if (node.scriptCollected && child?.type === "Fragment" && child.children?.some((c) => c?.type === "DataSource" || c?.type === "External")) {
      // When a <script> tag and a <DataSource> are siblings, the parser wraps the non-helper
      // siblings in a synthetic Fragment (see transform.ts wrapWithFragment). The parent node
      // will have `scriptCollected` set in exactly this case. We must NOT apply this to
      // user-authored <Fragment> components that legitimately contain <DataSource> children —
      // those are handled correctly when the Fragment itself is rendered.
      didResolve = true;
      if (!loaders) {
        loaders = [];
      }
      const remainingFragmentChildren: ComponentDef[] = [];
      child.children.forEach((fragmentChild) => {
        if (fragmentChild?.type === "DataSource") {
          loaders!.push({
            uid: fragmentChild.uid!,
            type: "DataLoader",
            props: fragmentChild.props,
            events: fragmentChild.events,
            when: fragmentChild.when,
            debug: fragmentChild.debug,
          });
        } else if (fragmentChild?.type === "External") {
          loaders!.push({
            uid: fragmentChild.uid!,
            type: "External",
            props: fragmentChild.props,
            events: fragmentChild.events,
            when: fragmentChild.when,
            debug: fragmentChild.debug,
          });
        } else {
          remainingFragmentChildren.push(fragmentChild);
        }
      });
      if (remainingFragmentChildren.length > 0) {
        if (!children) {
          children = [];
        }
        children.push({ ...child, children: remainingFragmentChildren });
      }
    } else {
      if (!children) {
        children = [];
      }
      children.push(child);
    }
  });

  // --- Return the transform node with the collected loaders
  // --- (or the original one)
  return didResolve
    ? {
        ...node,
        children,
        loaders,
      }
    : node;
}

// --- Properties may use loaders. We transform all of them to the virtual
// --- DataSourceRef component type.
function transformNodeWithDataSourceRefProp(
  node: ComponentDef,
  uidInfoRef: RefObject<Record<string, any>>,
) {
  if (!node.props) {
    return node;
  }
  let ret = { ...node };
  let resolved = false;
  Object.entries(node.props).forEach(([key, value]) => {
    let uidInfoForDatasource: { type: string; uid: any };
    try {
      uidInfoForDatasource = extractParam(uidInfoRef.current, value);
    } catch (e) {}

    if (uidInfoForDatasource?.type === "loader") {
      resolved = true;
      ret = {
        ...ret,
        props: {
          ...ret.props,
          [key]: {
            type: "DataSourceRef",
            uid: uidInfoForDatasource.uid,
          },
        },
      };
    }
  });

  // --- Done
  return resolved ? ret : node;
}

// --- If the "data" prop is a string, we transform it to a DataSource component
function transformNodeWithDataProp(
  node: ComponentDef,
  resolvedDataPropIsString: boolean,
  uidInfoRef: RefObject<Record<string, any>>,
): ComponentDef {
  if (
    !node.props?.__DATA_RESOLVED &&
    node.props &&
    "data" in node.props &&
    resolvedDataPropIsString
  ) {
    // --- We skip the transformation if the data property is a binding expression
    // --- for a loader value
    if (extractParam(uidInfoRef.current, node.props.data) === "loaderValue") {
      return node;
    }
    return {
      ...node,
      props: {
        ...node.props,
        data: {
          type: "DataSource",
          props: {
            url: node.props.data,
          },
        },
      },
    };
  }

  return node;
}

// --- We consider the "raw_data" prop as a resolved data value
function transformNodeWithRawDataProp(node) {
  if (node.props && "raw_data" in node.props) {
    return {
      ...node,
      props: {
        ...node.props,
        __DATA_RESOLVED: true,
        data: node.props.raw_data,
      },
    };
  }
  return node;
}

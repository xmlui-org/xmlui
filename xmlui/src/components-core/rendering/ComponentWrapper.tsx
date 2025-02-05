import { forwardRef, memo, RefObject, useMemo, useRef } from "react";
import ComponentAdapter from "./ComponentAdapter";
import { extractParam } from "@components-core/utils/extractParam";
import { ComponentDef } from "@abstractions/ComponentDefs";
import { ChildRendererContext } from "./renderChild";
import { ContainerWrapper, ContainerWrapperDef, isContainerLike } from "./ContainerWrapper";

/**
 * The ComponentNode it the outermost React component wrapping an xmlui component.
 */
export const ComponentWrapper = memo(
  forwardRef(function ComponentWrapper(
    {
      node,
      resolvedKey,
      state,
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
      ...rest
    }: ChildRendererContext & { resolvedKey: string },
    ref,
  ) {
    // --- We pass the layout context to the child components, so we need to
    // --- make sure that it is stable
    const stableLayoutContext = useRef(layoutContext);

    // --- Transform the various data sources within the xmlui component definition
    const nodeWithTransformedLoaders = useMemo(() => {
      // --- If we have a DataSource child, we transform it to a loader on the node
      let transformed = transformNodeWithChildDatasource(node); 
      transformed = transformNodeWithDataSourceRefProp(transformed, uidInfoRef);
      transformed = transformNodeWithRawDataProp(transformed);
      return transformed;
    }, [node, uidInfoRef]);

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

    if (isContainerLike(nodeWithTransformedDatasourceProp)) {
      // --- This component should be rendered as a container
      return (
        <ContainerWrapper
          resolvedKey={resolvedKey}
          node={nodeWithTransformedDatasourceProp as ContainerWrapperDef}
          parentState={state}
          parentDispatch={dispatch}
          layoutContextRef={stableLayoutContext}
          parentRenderContext={parentRenderContext}
          parentStatePartChanged={statePartChanged}
          parentRegisterComponentApi={registerComponentApi}
          uidInfoRef={uidInfoRef}
          ref={ref}
        />
      );
    } else {
      // --- This component should be rendered as a regular component
      return (
        <ComponentAdapter
          onUnmount={cleanup}
          memoedVarsRef={memoedVarsRef}
          node={nodeWithTransformedDatasourceProp}
          state={state}
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
        />
      );
    }
  }),
);

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
      });
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
    let uidInfoForDatasource: { type: string; uid: any; };
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

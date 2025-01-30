import { forwardRef, memo, RefObject, useMemo, useRef } from "react";
import ComponentBed from "./ComponentBed";
import { extractParam } from "@components-core/utils/extractParam";
import { ComponentDef } from "@abstractions/ComponentDefs";
import { ChildRendererContext } from "./renderChild";
import { ComponentContainer, ContainerComponentDef, isContainerLike } from "./ContainerComponent";

/**
 * The ComponentNode it the outermost React component wrapping an xmlui component.
 */
export const ComponentHarness = memo(
  forwardRef(function ComponentHarness(
    {
      node,
      state,
      dispatch,
      appContext,
      lookupAction,
      lookupSyncCallback,
      registerComponentApi,
      renderChild,
      stateFieldPartChanged,
      layoutContext,
      parentRenderContext,
      memoedVarsRef,
      resolvedKey,
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
      let transformed = transformNodeWithChildDatasource(node); //if we have an DataSource child, we transform it to a loader on the node
      transformed = transformNodeWithDataSourceRefProp(transformed, uidInfoRef);
      transformed = transformNodeWithRawDataProp(transformed);
      return transformed;
    }, [node, uidInfoRef]);

    const resolvedDataPropIsString = useMemo(() => {
      const resolvedDataProp = extractParam(
        state,
        nodeWithTransformedLoaders.props?.data,
        appContext,
        true,
      );
      return typeof resolvedDataProp === "string";
    }, [appContext, nodeWithTransformedLoaders.props?.data, state]);

    const nodeWithTransformedDatasourceProp = useMemo(() => {
      return transformNodeWithDataProp(
        nodeWithTransformedLoaders,
        resolvedDataPropIsString,
        uidInfoRef,
      );
    }, [nodeWithTransformedLoaders, resolvedDataPropIsString, uidInfoRef]);

    let renderedChild = null;
    if (isContainerLike(nodeWithTransformedDatasourceProp)) {
      renderedChild = (
        <ComponentContainer
          resolvedKey={resolvedKey}
          node={nodeWithTransformedDatasourceProp as ContainerComponentDef}
          parentState={state}
          parentDispatch={dispatch}
          layoutContextRef={stableLayoutContext}
          parentRenderContext={parentRenderContext}
          parentStateFieldPartChanged={stateFieldPartChanged}
          parentRegisterComponentApi={registerComponentApi}
          uidInfoRef={uidInfoRef}
          ref={ref}
        />
      );
    } else {
      renderedChild = (
        <ComponentBed
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

    return renderedChild;
  }),
);

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
  if (didResolve) {
    return {
      ...node,
      children,
      loaders,
    };
  }
  return node;
}

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
    let uidInfoForDatasource;
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
  if (resolved) {
    return ret;
  }
  return node;
}

function transformNodeWithDataProp(
  node: ComponentDef,
  resolvedDataPropIsString: boolean,
  uidInfoRef: RefObject<Record<string, any>>,
) {
  if (
    !node.props?.__DATA_RESOLVED &&
    node.props &&
    "data" in node.props &&
    resolvedDataPropIsString
  ) {
    //we skip the transformation if the data prop is a binding expression for a loader value
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

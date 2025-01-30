import type { MutableRefObject, RefObject } from "react";
import { forwardRef, memo, useMemo } from "react";
import type { ComponentDef, ParentRenderContext } from "@abstractions/ComponentDefs";
import type { ContainerDispatcher } from "../abstractions/ComponentRenderer";
import type {
  ContainerComponentDef,
  ContainerState,
  RegisterComponentApiFnInner,
} from "./ContainerComponentDef";
import type { ProxyAction } from "./buildProxy";
import type { LayoutContext } from "@abstractions/RendererDefs";

import { ErrorBoundary } from "@components-core/ErrorBoundary";
import { MemoizedErrorProneContainer } from "@components-core/rendering/MemoizedErrorProneContainer";

/**
 * This function signature is used whenever the engine wants to sign that an object's field (property),
 * which is part of the container state, has changed.
 */
export type StateFieldPartChangedFn = (
  path: string[],
  value: any,
  target: string,
  action: ProxyAction,
) => void;

// --- A component definition with optional container properties
type ComponentDefWithContainerUid = ComponentDef & {
  // --- The unique identifier of the container that wraps this component
  containerUid?: symbol;

  // --- If true, the component is bound to an API container
  apiBoundContainer?: boolean;
};

type ComponentContainerProps = {
  resolvedKey?: string;
  node: ContainerComponentDef;
  parentState: ContainerState;
  parentStateFieldPartChanged: StateFieldPartChangedFn;
  parentRegisterComponentApi: RegisterComponentApiFnInner;
  layoutContextRef: MutableRefObject<LayoutContext | undefined>;
  parentDispatch: ContainerDispatcher;
  parentRenderContext?: ParentRenderContext;
  uidInfoRef?: RefObject<Record<string, any>>;
};

export const ComponentContainer = memo(
  forwardRef(function ComponentContainer(
    {
      resolvedKey,
      node,
      parentState,
      parentStateFieldPartChanged,
      parentRegisterComponentApi,
      layoutContextRef,
      parentRenderContext,
      parentDispatch,
      uidInfoRef,
    }: ComponentContainerProps,
    ref,
  ) {
    const enhancedNode = useMemo(() => getWrappedWithContainer(node), [node]);

    return (
      <ErrorBoundary node={node} location={"container"}>
        <MemoizedErrorProneContainer
          parentStateFieldPartChanged={parentStateFieldPartChanged}
          resolvedKey={resolvedKey}
          node={enhancedNode as any}
          parentState={parentState}
          layoutContextRef={layoutContextRef}
          parentRenderContext={parentRenderContext}
          isImplicit={node.type !== "Container" && enhancedNode.uses === undefined} //in this case it's an auto-wrapped component
          parentRegisterComponentApi={parentRegisterComponentApi}
          parentDispatch={parentDispatch}
          ref={ref}
          uidInfoRef={uidInfoRef}
        />
      </ErrorBoundary>
    );
  }),
);

/**
 * Wraps the specified component node with a container
 * @param node The component node to wrap
 * @returns A "Container" node
 */
const getWrappedWithContainer = (node: ComponentDefWithContainerUid) => {
  if (node.type === "Container") {
    // --- Already wrapped
    return node;
  }

  // --- Clone the node and remove the properties that will be moved to the container
  // --- Note: we need the "when" property in the ModalDialog component, so we don't remove it
  const wrappedNode = { ...node, props: { ...node.props } };
  delete wrappedNode.loaders;
  delete wrappedNode.vars;
  delete wrappedNode.functions;
  delete wrappedNode.script;
  delete wrappedNode.scriptCollected;
  delete wrappedNode.scriptError;
  delete wrappedNode.uses;
  delete (wrappedNode.props as any)?.uses;
  delete wrappedNode.api;
  delete wrappedNode.contextVars;

  // --- Do the wrapping
  return {
    type: "Container",
    uid: node.uid,
    when: node.when,
    loaders: node.loaders,
    vars: node.vars,
    functions: node.functions,
    scriptCollected: node.scriptCollected,
    scriptError: node.scriptError,
    // TODO: it seems so that we need only node.uses, but we have to check it
    uses: node.uses, // || node.props?.uses?.split(",").map((txt: string) => txt.trim()),
    api: node.api,
    containerUid: "containerUid" in node && node.containerUid,
    apiBoundContainer: "apiBoundContainer" in node && node.apiBoundContainer,
    contextVars: node.contextVars,
    props: {
      debug: (node.props as any)?.debug,
      // debug: true,
    },
    children: [wrappedNode],
  } as ContainerComponentDef;
};

import { forwardRef, memo, MutableRefObject, RefObject, useMemo } from "react";
import type { ComponentDef, ParentRenderContext } from "../../abstractions/ComponentDefs";
import { LayoutContext } from "../../abstractions/RendererDefs";
import { ContainerDispatcher } from "../abstractions/ComponentRenderer";
import { ProxyAction } from "../rendering/buildProxy";
import { ErrorBoundary } from "../rendering/ErrorBoundary";
import { StateContainer } from "./StateContainer";

/**
 * This type is the internal representation of a container component, which manages the state of its children.
 */
export interface ContainerWrapperDef extends ComponentDef {
  type: "Container";

  // --- The unique identifier of the container
  containerUid?: symbol;

  // --- The context values this container provides to its children
  contextVars?: Record<string, any>;

  // --- If true, this is an API-bound container
  apiBoundContainer?: boolean;
}

/**
 * We store the state application state in a hierarchical structure of
 * containers. This type represents the state within a single container
 * stored as key and value pairs.
 */
export type ContainerState = Record<string | symbol, any>;

/**
 * Components can provide an API that other components can invoke (using
 * the host component ID). This type defines the shape of a hash object that
 * stores the API endpoints.
 */
export type ComponentApi = Record<string, ((...args: any[]) => any) | boolean>;

/**
 * This type declares that function's signature, which registers an exposed
 * component method (API endpoint).
 */
export type RegisterComponentApiFnInner = (componentUid: symbol, api: ComponentApi) => void;

/**
 * This type declares that function's signature, which runs a clean-up activity.
 */
export type ComponentCleanupFn = (uid: symbol) => void;

/**
 * This function checks if a particular component needs a wrapping container to
 * manage its internal state, which is closed from its external context but
 * available to its children.
 * @param node The component definition node to check
 * @returns Tru, if the component needs a wrapping container
 */
export function isContainerLike(node: ComponentDef) {
  if (node.type === "Container") {
    return true;
  }

  // --- If any of the following properties have a value, we need a container
  return !!(
    node.loaders ||
    node.vars ||
    node.uses ||
    node.contextVars ||
    node.functions ||
    node.scriptCollected
  );
}

/**
 * This type is that function's signature, which signs that an entire
 * state variable or its nested part has been changed.
 */
export type StatePartChangedFn = (
  // --- String representing the component path ("a.b", "a.b[3].c", etc.)
  path: string[],

  // --- The new value of the changed part
  value: any,

  // --- The target component that has changed (along the path)
  target: string,

  // --- Type of change
  action: ProxyAction,
) => void;

// --- Properties of the ComponentContainer component
type Props = {
  node: ContainerWrapperDef;
  resolvedKey?: string;
  parentState: ContainerState;
  parentStatePartChanged: StatePartChangedFn;
  parentRegisterComponentApi: RegisterComponentApiFnInner;
  parentDispatch: ContainerDispatcher;
  parentRenderContext?: ParentRenderContext;
  layoutContextRef: MutableRefObject<LayoutContext | undefined>;
  uidInfoRef?: RefObject<Record<string, any>>;
};

/**
 * This component is a container that manages the state of its children. It
 * provides a context for the children to access the state and the API of the
 * parent component.
 */
export const ContainerWrapper = memo(
  forwardRef(function ContainerWrapper(
    {
      node,
      resolvedKey,
      parentState,
      parentStatePartChanged,
      parentRegisterComponentApi,
      parentDispatch,
      parentRenderContext,
      layoutContextRef,
      uidInfoRef,
      ...rest
    }: Props,
    ref,
  ) {
    // --- Make sure the component node is wrapped with a container
    const containerizedNode = useMemo(() => getWrappedWithContainer(node), [node]);

    return (
      <ErrorBoundary node={node} location={"container"}>
        <StateContainer
          node={containerizedNode as any}
          resolvedKey={resolvedKey}
          parentState={parentState}
          parentStatePartChanged={parentStatePartChanged}
          parentRegisterComponentApi={parentRegisterComponentApi}
          parentDispatch={parentDispatch}
          parentRenderContext={parentRenderContext}
          layoutContextRef={layoutContextRef}
          uidInfoRef={uidInfoRef}
          isImplicit={node.type !== "Container" && containerizedNode.uses === undefined} //in this case it's an auto-wrapped component
          ref={ref}
          {...rest}
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
const getWrappedWithContainer = (node: ContainerWrapperDef) => {
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
    uses: node.uses,
    api: node.api,
    containerUid: node?.containerUid,
    apiBoundContainer: node?.apiBoundContainer,
    contextVars: node.contextVars,
    props: {
      debug: (node.props as any)?.debug,
    },
    children: [wrappedNode],
  } as ContainerWrapperDef;
};

import type { ReactNode} from "react";
import { cloneElement, isValidElement, useMemo, useRef } from "react";
import type { MemoedVars } from "../abstractions/ComponentRenderer";
import { renderChild } from "./renderChild";
import { EMPTY_OBJECT, noop } from "../constants";
import type { ComponentDef } from "../../abstractions/ComponentDefs";

type RootComponentProps = {
  node: ComponentDef;
  children?: ReactNode;
  functions?: Record<string, any>;
  vars?: Record<string, any>;
};

function StandaloneComponent({ node, children, functions, vars }: RootComponentProps) {
  const memoedVarsRef = useRef<MemoedVars>(new Map());
  const rootNode = useMemo(() => {
    if(node.type === "Container"){
      // If the node is already a Container, we can use it directly
      return {
        ...node,
        functions: {
          ...node.functions,
          ...functions,
        },
        vars: {
          ...node.vars,
          ...vars,
        }
      };
    }
    return {
      type: "Container",
      uid: "standaloneComponentRoot",
      children: [node],
      uses: [],
      functions,
      vars,
    };
  }, [functions, node, vars]);

  const renderedRoot = renderChild({
    node: rootNode,
    state: EMPTY_OBJECT,
    dispatch: noop,
    appContext: undefined,
    lookupAction: noop,
    lookupSyncCallback: noop,
    registerComponentApi: noop,
    renderChild: noop,
    statePartChanged: noop,
    cleanup: noop,
    memoedVarsRef,
  });

  return !!children && isValidElement(renderedRoot)
    ? cloneElement(renderedRoot, null, children)
    : renderedRoot;
}

export default StandaloneComponent;

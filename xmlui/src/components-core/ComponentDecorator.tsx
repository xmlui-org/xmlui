import type React from "react";
import {
  cloneElement,
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { useShallowCompareMemoize } from "./utils/hooks";

// --- Describes the properties of the decorator component
interface DecoratorProps {
  // --- Attribute name and value pairs to add to the component's DOM node
  attr: Record<string, any>;

  // --- If true, only the ref'd child will have the attributes added
  allowOnlyRefdChild?: boolean;

  // --- Callback function to be called when the target component is mounted
  onTargetMounted?: () => void;

  // --- The component to decorate
  children: React.ReactElement;
}

const HIDDEN_STYLE: React.CSSProperties = { position: "absolute", width: 0, display: "none" };

function canAcceptRef(element: React.ReactElement) {
  const type: any = element.type;
  if (!type) return false;
  if (typeof type === "string") return true;
  if (type.prototype && type.prototype.isReactComponent) return true;
  const forwardRefType = Symbol.for("react.forward_ref");
  const memoType = Symbol.for("react.memo");
  if (type.$$typeof === forwardRefType) return true;
  if (type.$$typeof === memoType) {
    const inner = type.type;
    if (typeof inner === "string") return true;
    if (inner?.prototype?.isReactComponent) return true;
    if (inner?.$$typeof === forwardRefType) return true;
  }
  return false;
}


/**
 * This component decorates the DOM element of a component with a set of
 * attributes. We use this feature to assign helper attributes to the app's
 * xmlui component nodes for testing, debugging, and other development-related
 * purposes.
 */
const ComponentDecorator = forwardRef((props: DecoratorProps, forwardedRef) => {
  // the concept:
  //   we want to add attributes to the component's DOM node even if that component doesn't handle refs
  //   to find the actual dom node, we use either the ref passed to the component, or the ref of the previous or next sibling
  //   with those sibling refs we can find the actual dom node (via nextElementSibling)
  //   we are making sure that the next and previous elements are not the same, to avoid adding attributes to the wrong element
  const prevSiblingRef = useRef(null);
  const nextSiblingRef = useRef(null);
  const { onTargetMounted } = props;

  const foundNode = useRef(null);
  const itemRef = useRef<HTMLElement | null>(null);
  const [handlesItemRefs, setHandlesItemRefs] = useState(false);
  const itemRefCallback = useCallback(
    (node: any) => {
      itemRef.current = node;
      if (node !== null) {
        onTargetMounted?.();
      }
      setHandlesItemRefs(true);
    },
    [onTargetMounted],
  );
  const [_, setForceRender] = useState(0);

  const shallowAttrs = useShallowCompareMemoize(props.attr);
  const shouldRenderHelperSpan = !props.allowOnlyRefdChild && !handlesItemRefs;

  // --- When the component mounts, we add the attributes to the component's DOM node
  useLayoutEffect(() => {
    let node;
    if (handlesItemRefs) {
      node = itemRef.current;
    } else {
      if (shouldRenderHelperSpan) {
        if (foundNode.current) {
          node = foundNode.current;
        } else {
          node =
            (prevSiblingRef.current.nextElementSibling === nextSiblingRef.current
              ? null
              : prevSiblingRef.current.nextElementSibling) || null;
          foundNode.current = node;
          setForceRender((prev) => prev++);
        }
      }
    }
    if (node) {
      Object.entries(shallowAttrs).forEach(([key, value]) => {
        if (value !== undefined) {
          node.setAttribute?.(key, value);
        } else {
          node.removeAttribute?.(key);
        }
      });
    }
  }, [shouldRenderHelperSpan, shallowAttrs, handlesItemRefs]);

  return (
    <>
      {!foundNode.current && shouldRenderHelperSpan && (
        <span style={HIDDEN_STYLE} ref={prevSiblingRef} />
      )}
      {cloneElement(props.children, {
        ref: canAcceptRef(props.children)
          ? (forwardedRef ? composeRefs(itemRefCallback, forwardedRef) : itemRefCallback)
          : undefined,
      })}
      {!foundNode.current && shouldRenderHelperSpan && (
        <span style={HIDDEN_STYLE} ref={nextSiblingRef} />
      )}
    </>
  );
});
ComponentDecorator.displayName = "ComponentDecorator";

export default ComponentDecorator;

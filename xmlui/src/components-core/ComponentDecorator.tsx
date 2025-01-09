import React, { cloneElement, forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";

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

/**
 * This component decorates the DOM element of a component with a set of 
 * attributes. We use this feature to assign helper attributes to the app's 
 * xmlui component nodes for testing, debugging, and other development-related
 * purposes.
 */
const ComponentDecorator = forwardRef((props: DecoratorProps, forwardedRef) => {
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);
  const { onTargetMounted } = props;

  // --- We wrap the component in a React.Fragment, if it has a parent element; 
  // --- otherwise, we use a `div`
  const Wrapper = parentElement ? React.Fragment : "div";

  const ref = useRef<HTMLDivElement>(null);
  const [itemNodeVisible, setItemNodeVisible] = useState(false);
  const itemRef = useRef<HTMLElement | null>(null);
  const itemRefCallback = useCallback((node: any) => {
    itemRef.current = node;
    setItemNodeVisible(node !== null);
  }, []);
  const targetIndex = useRef(0);

  // --- When the component mounts, we find the index of the component in its parent
  useEffect(() => {
    if (ref.current?.parentElement) {
      targetIndex.current = Array.from(ref.current.parentElement.children).indexOf(ref.current);
      setParentElement(ref.current.parentElement);
      return;
    }
  }, []);

  // --- When the component mounts, we add the attributes to the component's DOM node
  useEffect(() => {
    let node = itemRef.current || parentElement?.children[targetIndex.current] || null;
    if (props.allowOnlyRefdChild) {
      node = itemRef.current;
    }
    Object.entries(props.attr).forEach(([key, value]) => {
      if (value !== undefined) {
        node?.setAttribute(key, value);
      } else {
        node?.removeAttribute(key);
      }
    });
    if (itemNodeVisible) {
      onTargetMounted?.();
    }
  }, [parentElement, targetIndex, props.attr, props.allowOnlyRefdChild, onTargetMounted, itemNodeVisible]);

  return (
    <Wrapper ref={parentElement ? undefined : ref}>
      {cloneElement(props.children, {
        ref: forwardedRef ? composeRefs(itemRefCallback, forwardedRef) : itemRefCallback,
      })}
    </Wrapper>
  );
});

export default ComponentDecorator;

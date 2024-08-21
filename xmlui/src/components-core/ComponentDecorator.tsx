import React, { cloneElement, forwardRef, useEffect, useRef, useState } from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";

// --- Describes the properties of the decorator component
interface DecoratorProps {
  // --- Attribute name and value pairs to add to the component's DOM node
  attr: Record<string, any>;

  // --- If true, only the ref'd child will have the attributes added
  allowOnlyRefdChild?: boolean;

  // --- The component to decorate
  children: React.ReactElement;
}

/**
 * This component decorates a React element's DOM node (through a React ref) with the specified 
 * attributes. We use this component to add test IDs to particular components.
 */
const ComponentDecorator = forwardRef((props: DecoratorProps, forwardedRef) => {
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);
  
  // --- We wrap the component in a `Fragment`, if it has a parent element; otherwise, we use a `div`
  const Wrapper = parentElement ? React.Fragment : "div";
  
  const ref = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLElement>(null);
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
      if(value !== undefined){
        node?.setAttribute(key, value);
      } else {
        node?.removeAttribute(key);
      }
    });
  }, [parentElement, targetIndex, props.attr, props.allowOnlyRefdChild]);

  return (
    <Wrapper ref={parentElement ? undefined : ref}>
      {cloneElement(props.children, {
        ref: forwardedRef ? composeRefs(itemRef, forwardedRef) : itemRef,
      })}
    </Wrapper>
  );
});

export default ComponentDecorator;

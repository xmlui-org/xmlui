type AnyProps = Record<string, any>;

/**
 * Merges child component props with rest props.
 * @param childProps Child component props
 * @param restProps Rest props
 * @returns
 *
 * The origin of this method is:
 * https://github.com/radix-ui/primitives/blob/c31c97274ff357aea99afe6c01c1c8c58b6356e0/packages/react/slot/src/Slot.tsx#L91
 */
export function mergeProps(childProps: AnyProps, restProps: AnyProps) {
  // --- All child props should override
  const overrideProps = { ...restProps };

  for (const propName in restProps) {
    const childPropValue = childProps[propName];
    const restPropValue = restProps[propName];

    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      // --- If the handler exists on both, we compose them...
      if (childPropValue && restPropValue) {
        overrideProps[propName] = (...args: unknown[]) => {
          restPropValue(...args);
          childPropValue(...args);
        };
      }
      // --- ...but if it exists only on the original, we use only this one
      else if (childPropValue) {
        overrideProps[propName] = childPropValue;
      }
    } else if (propName === "style") {
      // --- We merge `style`
      overrideProps[propName] = restPropValue ? { ...restPropValue, ...childPropValue } : childPropValue;
    } else if (propName === "className") {
      // --- We merge `className`
      overrideProps[propName] = restPropValue
        ? [restPropValue, childPropValue].filter(Boolean).join(" ")
        : childPropValue;
    }
  }

  return { ...childProps, ...overrideProps };
}

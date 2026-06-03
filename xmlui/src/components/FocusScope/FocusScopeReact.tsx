import { forwardRef, memo } from "react";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { useFocusScope } from "../../components-core/accessibility/useFocusScope";
import { defaultProps } from "./FocusScope.defaults";

export type FocusScopeProps = React.HTMLAttributes<HTMLDivElement> & {
  trap?: boolean;
  restore?: boolean;
  autoFocus?: boolean;
};

export const FocusScope = memo(forwardRef<HTMLDivElement, FocusScopeProps>(function FocusScope(
  {
    trap = defaultProps.trap,
    restore = defaultProps.restore,
    autoFocus = defaultProps.autoFocus,
    children,
    tabIndex = -1,
    ...rest
  },
  forwardedRef,
) {
  const scopeRef = useFocusScope<HTMLDivElement>({ trap, restore, autoFocus });
  const ref = useComposedRefs(forwardedRef, scopeRef);
  return (
    <div {...rest} ref={ref} tabIndex={tabIndex}>
      {children}
    </div>
  );
}));

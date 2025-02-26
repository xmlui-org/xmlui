import { useEffect, useMemo } from "react";
import { isEqual, throttle } from "lodash-es";
import { usePrevious } from "../../components-core/utils/hooks";

// =====================================================================================================================
// React ChangeListener component implementation

type Props = {
  listenTo: any;
  onChange?: (newValue: any) => void;
  throttleWaitInMs?: number;
};

export const defaultProps: Pick<Props, "throttleWaitInMs"> = {
  throttleWaitInMs: 0,
};

export function ChangeListener({ listenTo, onChange, throttleWaitInMs = defaultProps.throttleWaitInMs }: Props) {
  const prevValue = usePrevious(listenTo);

  const throttledOnChange = useMemo(() => {
    if (throttleWaitInMs !== 0 && onChange) {
      return throttle(onChange, throttleWaitInMs, {
        leading: true,
      });
    }
    return onChange;
  }, [onChange, throttleWaitInMs]);

  useEffect(() => {
    if (throttledOnChange && !isEqual(prevValue, listenTo)) {
      throttledOnChange?.({
        prevValue,
        newValue: listenTo,
      });
    }
  }, [listenTo, throttledOnChange, prevValue]);
  return null;
}

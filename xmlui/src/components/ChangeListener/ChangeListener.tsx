import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { useEffect, useMemo } from "react";
import { isEqual, throttle } from "lodash-es";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import { usePrevious } from "@components-core/utils/hooks";

// =====================================================================================================================
// React ChangeListener component implementation

type Props = {
  listenTo: any;
  onChange?: (newValue: any) => void;
  throttleWaitInMs?: number;
};

function ChangeListener({ listenTo, onChange, throttleWaitInMs = 0 }: Props) {
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

// =====================================================================================================================
// XMLUI ChangeListener component definition

/**
 * \`ChangeListener\` is a functional component (it renders no UI) to trigger an action when a particular value 
 * (component property, state, etc.) changes.
 */
export interface ChangeListenerComponentDef extends ComponentDef<"ChangeListener"> {
  props: {
    /**
     * This property declares the value of the changes the component listens to. 
     * @descriptionRef 
     */
    listenTo: string;
    /** 
     * This variable sets a throttling time (in milliseconds) to apply when executing the \`didChange\` 
     * event handler. All changes within that throttling time will only fire the \`didChange\` event once.
     * @descriptionRef 
     */
    throttleWaitInMs?: string;
  };
  events: {
    /** @descriptionRef */
    didChange: string;
  };
}

export const ChangeListenerMd: ComponentDescriptor<ChangeListenerComponentDef> = {
  displayName: "ChangeListener",
  description: "Non-visual component listening to value changes",
  props: {
    listenTo: desc("Value to the changes of which this component listens"),
    throttleWaitInMs: desc("Value in milliseconds to throttle repeating changes"),
  },
  events: {
    didChange: desc("Sign that a particular value has changed."),
  },
};

export const changeListenerComponentRenderer = createComponentRenderer<ChangeListenerComponentDef>(
  "ChangeListener",
  ({ node, lookupEventHandler, extractValue }) => {
    return (
      <ChangeListener
        listenTo={extractValue(node.props.listenTo)}
        throttleWaitInMs={extractValue(node.props.throttleWaitInMs)}
        onChange={lookupEventHandler("didChange")}
      />
    );
  },
  ChangeListenerMd
);

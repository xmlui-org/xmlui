import { createComponentRenderer } from "../../components-core/renderers";
import { Timer, defaultProps } from "./TimerNative";
import { createMetadata } from "../metadata-helpers";

const COMP = "Timer";

export const TimerMd = createMetadata({
  status: "stable",
  nonVisual: true,
  description:
    "`Timer` is a non-visual component that fires events at regular intervals. " +
    "It can be enabled or disabled and ensures that the timer event handler " +
    "completes before firing the next event.",
  props: {
    enabled: {
      description: "Whether the timer is enabled and should fire events.",
      valueType: "boolean",
      defaultValue: defaultProps.enabled,
    },
    interval: {
      description: "The interval in milliseconds between timer events.",
      valueType: "number",
      defaultValue: defaultProps.interval,
    },
    initialDelay: {
      description: "The delay in milliseconds before the first timer event.",
      valueType: "number",
      defaultValue: defaultProps.initialDelay,
    },
    once: {
      description: "Whether the timer should stop after firing its first tick event.",
      valueType: "boolean",
      defaultValue: defaultProps.once,
    },
  },
  events: {
    tick: {
      description: "This event is triggered at each interval when the ${COMP} is enabled.",
    },
  },
  apis: {
    pause: {
      description: "Pauses the timer. The timer can be resumed later from where it left off.",
      signature: "pause()",
    },
    resume: {
      description: "Resumes a paused timer. If the timer is not paused, this method has no effect.",
      signature: "resume()",
    },
    isPaused: {
      description: "Returns whether the timer is currently paused.",
      signature: "isPaused(): boolean",
    },
    isRunning: {
      description: "Returns whether the timer is currently running (enabled and not paused).",
      signature: "isRunning(): boolean",
    },
  },
});

export const timerComponentRenderer = createComponentRenderer(
  COMP,
  TimerMd,
  ({ node, extractValue, lookupEventHandler, registerComponentApi }) => {
    return (
      <Timer
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        interval={extractValue.asOptionalNumber(node.props.interval)}
        initialDelay={extractValue.asOptionalNumber(node.props.initialDelay)}
        once={extractValue.asOptionalBoolean(node.props.once)}
        onTick={lookupEventHandler("tick")}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);

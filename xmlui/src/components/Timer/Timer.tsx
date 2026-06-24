import { createMetadata } from "../../component-core/metadata/helpers";

export const TimerMd = createMetadata({
  status: "stable",
  nonVisual: true,
  description:
    "`Timer` is a non-visual component that fires `tick` events at a configured cadence.",
  props: {
    id: { description: "The identifier used to expose the Timer API.", valueType: "string" },
    testId: { description: "Test identifier for the hidden timer element.", valueType: "string" },
    enabled: {
      description: "Whether the timer is enabled.",
      valueType: "boolean",
      defaultValue: true,
    },
    interval: {
      description: "The interval in milliseconds between tick events.",
      valueType: "number",
      defaultValue: 1000,
    },
    initialDelay: {
      description: "Delay in milliseconds before the first tick cycle starts.",
      valueType: "number",
      defaultValue: 0,
    },
    once: {
      description: "Whether the timer stops after the first tick.",
      valueType: "boolean",
      defaultValue: false,
    },
  },
  events: {
    tick: {
      description: "This event fires for each timer tick.",
      signature: "tick(): void | Promise<void>",
    },
  },
  apis: {
    pause: { description: "Pauses the timer.", signature: "pause(): void" },
    resume: { description: "Resumes a paused timer.", signature: "resume(): void" },
    isPaused: { description: "Returns whether the timer is paused.", signature: "isPaused(): boolean" },
    isRunning: { description: "Returns whether the timer is running.", signature: "isRunning(): boolean" },
  },
});

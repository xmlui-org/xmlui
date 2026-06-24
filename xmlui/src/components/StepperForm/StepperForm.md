# StepperForm

`StepperForm` is an experimental structured form foundation. It renders each
direct `FormSegment` child as a step and provides generated Back, Next, and
Submit buttons.

The old XMLUI implementation transforms this component into `Form` + `Stepper`
+ `Step` nodes. The rewrite has not migrated the standalone `Stepper` component
yet, so this foundation keeps the same `StepperForm` authoring surface with a
local step header implementation.

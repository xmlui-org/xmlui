import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { nonPropertyChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { defaultProps } from "./Stepper.defaults";
import { StepMd, StepperMd } from "./Stepper";
import { Step } from "./StepReact";
import { Stepper } from "./StepperReact";
import type { StepperOrientation } from "./StepperContext";

export const stepperRenderer = wrapComponent({
  name: "Stepper",
  metadata: StepperMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    return (
      <Stepper
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        activeStep={adapter.numberProp("activeStep", defaultProps.activeStep)}
        orientation={adapter.stringProp("orientation", defaultProps.orientation) as StepperOrientation}
        stackedLabel={adapter.booleanProp("stackedLabel", defaultProps.stackedLabel)}
        nonLinear={adapter.booleanProp("nonLinear", defaultProps.nonLinear)}
        onDidChange={(index, id) => { void adapter.event("didChange")(index, id); }}
        registerComponentApi={adapter.registerApi}
      >
        {adapter.context.renderChildren(nonPropertyChildren(adapter.node.children), adapter.scope)}
      </Stepper>
    );
  },
});

export const stepRenderer = wrapComponent({
  name: "Step",
  metadata: StepMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    return (
      <Step
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        label={adapter.stringProp("label")}
        description={adapter.stringProp("description")}
        icon={adapter.stringProp("icon")}
        error={adapter.booleanProp("error", false)}
        completed={adapter.booleanProp("completed", false)}
        activated={() => { void adapter.event("activated")(); }}
      >
        {adapter.context.renderChildren(nonPropertyChildren(adapter.node.children), adapter.scope)}
      </Step>
    );
  },
});

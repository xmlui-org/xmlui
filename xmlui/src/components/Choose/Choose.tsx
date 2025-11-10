import { Fragment } from "react";
import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata, d } from "../metadata-helpers";

const COMP = "Choose";

export const ChooseMd = createMetadata({
  status: "stable",
  description:
    "`Choose` is a non-visual component that provides switch-like conditional rendering. " +
    "It evaluates a condition and renders the first child whose `case` attribute matches " +
    "the condition value. If no match is found, it renders a child without a `case` attribute " +
    "(the default case). Only one child is rendered. " +
    "If a child component needs its own `case` property, use `$case` for matching instead, " +
    "which will be transposed to `case` in the rendered child.",
  props: {
    condition: d(
      "The value to match against child `case` or `$case` attributes. This can be any expression " +
        "that evaluates to a comparable value (string, number, boolean, etc.).",
    ),
  },
  nonVisual: true,
});

export const chooseComponentRenderer = createComponentRenderer(
  COMP,
  ChooseMd,
  ({ node, extractValue, renderChild, layoutContext }) => {
    // Extract the condition value to match against
    const conditionValue = extractValue(node.props.condition);

    // If no children, nothing to render
    if (!node.children || node.children.length === 0) {
      return null;
    }

    // Traverse children to find first match
    for (const child of node.children) {
      // Check if child has a 'case' prop (used for matching)
      const caseValue = child.props?.case;

      if (caseValue !== undefined) {
        // Extract the case value to match against condition
        const extractedCaseValue = extractValue(caseValue);

        // Check if it matches the condition
        if (extractedCaseValue === conditionValue) {
          // Prepare props for rendering
          let modifiedProps = { ...child.props };
          
          // Check if child has $case prop that should be transposed to case
          const dollarCaseValue = child.props?.$case;
          
          if (dollarCaseValue !== undefined) {
            // Remove both 'case' (used for matching) and '$case', then add 'case' with $case value
            const { case: _, $case: __, ...restProps } = modifiedProps;
            modifiedProps = { ...restProps, case: dollarCaseValue };
          } else {
            // Just remove the 'case' prop used for matching
            const { case: _, ...restProps } = modifiedProps;
            modifiedProps = restProps;
          }

          const childWithModifiedProps = {
            ...child,
            props: modifiedProps,
          };

          // Render this child and return
          const rendered = renderChild([childWithModifiedProps], layoutContext);
          return Array.isArray(rendered) ? (
            <Fragment key={extractValue(node.uid)}>{rendered}</Fragment>
          ) : (
            rendered
          );
        }
      } else {
        // No 'case' prop - this is the default case
        // Render it and return
        const rendered = renderChild([child], layoutContext);
        return Array.isArray(rendered) ? (
          <Fragment key={extractValue(node.uid)}>{rendered}</Fragment>
        ) : (
          rendered
        );
      }
    }

    // No match found and no default case
    return null;
  },
);

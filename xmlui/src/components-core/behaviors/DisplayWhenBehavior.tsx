import type { ReactNode } from "react";

import type { Behavior } from "./Behavior";

/**
 * Wrapper that keeps its children mounted but hides them via CSS `display: none`
 * when `visible` is false. Because children are never unmounted, things like
 * `FormBindingWrapper` continue to register their fields with the enclosing Form
 * even when they are hidden.
 */
function DisplayWhenWrapper({ children, visible }: { children: ReactNode; visible: boolean }) {
  return <div style={visible ? undefined : { display: "none" }}>{children}</div>;
}

/**
 * Behavior that controls visibility through CSS `display: none` instead of
 * removing the component from the React tree.
 *
 * Unlike the built-in `when` prop — which stops rendering entirely — `displayWhen`
 * keeps the component and all its children mounted. This is essential for multi-step
 * wizard forms where hidden steps must remain registered with the enclosing `<Form>`
 * so their values and validations are preserved while the user navigates between steps.
 *
 * The behavior is registered as the outermost wrapper (after all other behaviors),
 * so the entire composed node — including its label, tooltip, and form binding — is
 * hidden or revealed as a unit.
 *
 * Usage in XMLUI markup:
 * ```xml
 * <VStack displayWhen="{step === 1}">
 *   <TextBox label="First Name" bindTo="firstName" required="true" />
 * </VStack>
 * ```
 */
export const displayWhenBehavior: Behavior = {
  metadata: {
    name: "displayWhen",
    friendlyName: "Display When",
    description:
      "Controls visibility of a component via CSS 'display: none' without unmounting it " +
      "from the React tree. Unlike 'when', the component and all its children stay mounted, " +
      "so form fields remain registered with the enclosing Form — essential for multi-step wizards.",
    triggerProps: ["displayWhen"],
    props: {
      displayWhen: {
        valueType: "boolean",
        description:
          "When false, hides the component and its children using 'display: none' while " +
          "keeping them mounted in the React tree. Unlike 'when', form fields inside the " +
          "hidden subtree remain registered and their values are preserved.",
      },
    },
    condition: {
      type: "visual",
    },
  },
  canAttach: (_context, node, metadata) => {
    if (metadata?.nonVisual) {
      return false;
    }
    // Attach whenever the prop is present in the markup, regardless of its current value.
    return node.props?.displayWhen !== undefined;
  },
  attach: (context, node) => {
    const { extractValue } = context;
    const isVisible =
      extractValue.asOptionalBoolean(context.node.props?.displayWhen, true) ?? true;

    return <DisplayWhenWrapper visible={isVisible}>{node}</DisplayWhenWrapper>;
  },
};

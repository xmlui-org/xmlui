import { createComponentRenderer } from "@components-core/renderers";
import { Navigate } from "@remix-run/react";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { To } from "react-router";
import { createUrlWithQueryParams } from "../component-utils";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";

/**
 * \`Redirect\` is a component that immediately redirects the browser to the URL in its \`to\`
 * property when it gets visible (its `when` property gets `true`). *The redirection works only
 * within the app.*
 */
export interface RedirectComponentDef extends ComponentDef<"Redirect"> {
  props: {
    /**
     * This property defines the URL to which this component is about to redirect requests.
     */
    to: string;
  };
}

export const RedirectMd: ComponentDescriptor<RedirectComponentDef> = {
  displayName: "Redirect",
  description:
    "Redirect is a component that immediately redirects the browser to the URL in its `to` property when it gets visible (its `when` property gets `true`). The redirection works only within the app.",
  props: {
    to: desc("The URL to which to redirect the browser."),
  },
};

export const redirectRenderer = createComponentRenderer<RedirectComponentDef>(
  "Redirect",
  ({ node, extractValue }) => {
    return <Navigate to={createUrlWithQueryParams(extractValue(node.props.to)) as To} />;
  },
  RedirectMd,
);

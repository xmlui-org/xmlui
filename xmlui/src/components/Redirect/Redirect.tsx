import type { To } from "react-router";
import { Navigate } from "@remix-run/react";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { createUrlWithQueryParams } from "../component-utils";

const COMP = "Redirect";

export const RedirectMd = createMetadata({
  description:
    `\`${COMP}\` is a component that immediately redirects the browser to the URL in its ` +
    `\`to\` property when it gets visible (its \`when\` property gets \`true\`). The ` +
    `redirection works only within the app.`,
  props: {
    to: d(`This property defines the URL to which this component is about to redirect requests.`),
  },
});

export const redirectRenderer = createComponentRenderer(
  COMP,
  RedirectMd,
  ({ node, extractValue }) => {
    return <Navigate to={createUrlWithQueryParams(extractValue(node.props.to)) as To} />;
  },
);

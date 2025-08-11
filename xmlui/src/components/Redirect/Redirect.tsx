import type { To } from "react-router-dom";
import { Navigate } from "@remix-run/react";

import { createComponentRenderer } from "../../components-core/renderers";
import { createUrlWithQueryParams } from "../component-utils";
import { createMetadata } from "../metadata-helpers";

const COMP = "Redirect";

export const defaultProps = {
  to: "",
};

export const RedirectMd = createMetadata({
  status: "stable",
  description:
    "`Redirect` immediately redirects the browser to the URL in its `to` property when " +
    "it gets visible (its `when` property gets `true`). It works only within " +
    "[App](/components/App), not externally.",
  props: {
    replace: {
      description: `This boolean property indicates whether the redirect should replace the current history entry or create a new one.`,
      defaultValue: false,
    },
    to: {
      description: `This property defines the URL to which this component is about to redirect requests.`,
      defaultValue: defaultProps.to,
    },
  },
});

export const redirectRenderer = createComponentRenderer(
  COMP,
  RedirectMd,
  ({ node, extractValue }) => {
    return <Navigate to={createUrlWithQueryParams(extractValue(node.props.to)) as To} replace={extractValue.asOptionalBoolean(node.props.replace)} />;
  },
);

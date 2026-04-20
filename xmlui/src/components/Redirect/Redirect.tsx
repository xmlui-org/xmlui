import type { To } from "react-router-dom";
import { Navigate } from "react-router-dom";

import { wrapComponent } from "../../components-core/wrapComponent";
import { createUrlWithQueryParams } from "../component-utils";
import { createMetadata } from "../metadata-helpers";

const COMP = "Redirect";

export const defaultProps = {
  to: "",
  replace: false,
};

export const RedirectMd = createMetadata({
  status: "stable",
  description:
    "`Redirect` immediately redirects the browser to the URL in its `to` property when " +
    "it gets visible (its `when` property gets `true`). It works only within " +
    "[App](/components/App), not externally.",
  nonVisual: true,
  props: {
    replace: {
      description: `This boolean property indicates whether the redirect should replace the current history entry or create a new one.`,
      valueType: "boolean",
      defaultValue: defaultProps.replace,
    },
    to: {
      description: `This property defines the URL to which this component is about to redirect requests.`,
      valueType: "string",
      defaultValue: defaultProps.to,
    },
  },
});

export const redirectRenderer = wrapComponent(COMP, Navigate, RedirectMd, {
  customRender: (_props, { node, extractValue }) => (
    <Navigate
      to={createUrlWithQueryParams(extractValue(node.props.to)) as To}
      replace={extractValue.asOptionalBoolean(node.props.replace)}
    />
  ),
});

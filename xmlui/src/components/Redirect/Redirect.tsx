import { useEffect } from "react";
import type { To } from "react-router-dom";
import { Navigate } from "react-router-dom";

import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";
import { useBooleanProp, useStringProp } from "../../runtime/rendering/props";
import { wrapComponent } from "../../components-core/wrapComponent";
import { createUrlWithQueryParams } from "../component-utils";
import { createMetadata } from "../metadata-helpers";
import { defaultProps } from "./Redirect.defaults";

const COMP = "Redirect";

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

export const redirectRuntimeRenderer: XmluiBuiltInRenderer = ({ node, scope }) => {
  const to = useStringProp(node, scope, "to", defaultProps.to);
  const replace = useBooleanProp(node, scope, "replace", defaultProps.replace);

  useEffect(() => {
    if (!to) {
      return;
    }
    if (replace && typeof window !== "undefined" && scope.routing) {
      const href = scope.routing.href(to);
      window.location.hash = href.startsWith("#") ? href.slice(1) : href;
      return;
    }
    scope.routing?.navigate(to);
  }, [replace, scope.routing, to]);

  return null;
};

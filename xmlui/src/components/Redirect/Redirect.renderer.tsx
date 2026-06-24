import { useEffect } from "react";

import { useBooleanProp, useStringProp } from "../../runtime/rendering/props";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";
import { defaultProps } from "./Redirect";

export const redirectRenderer: XmluiBuiltInRenderer = ({ node, scope }) => {
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

import { createMetadata } from "../../component-core/metadata/helpers";
import { defaultProps } from "./Redirect.defaults";

export { defaultProps };

export const RedirectMd = createMetadata({
  status: "stable",
  nonVisual: true,
  description:
    "`Redirect` immediately redirects the browser to the URL in its `to` property when " +
    "it gets visible (its `when` property gets `true`). It works only within " +
    "[App](/components/App), not externally.",
  props: {
    replace: {
      description:
        "This boolean property indicates whether the redirect should replace the current history entry or create a new one.",
      valueType: "boolean",
      defaultValue: defaultProps.replace,
    },
    to: {
      description:
        "This property defines the URL to which this component is about to redirect requests.",
      valueType: "string",
      defaultValue: defaultProps.to,
    },
  },
});

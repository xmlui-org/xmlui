import { createMetadata } from "../../component-core/metadata/helpers";

export const defaultProps = {
  to: "",
  replace: false,
};

export const RedirectMd = createMetadata({
  status: "stable",
  nonVisual: true,
  description:
    "`Redirect` immediately redirects the browser to the URL in its `to` property when visible.",
  props: {
    replace: {
      description: "Whether the redirect should replace the current history entry.",
      valueType: "boolean",
      defaultValue: defaultProps.replace,
    },
    to: {
      description: "The URL to redirect to.",
      valueType: "string",
      defaultValue: defaultProps.to,
    },
  },
});

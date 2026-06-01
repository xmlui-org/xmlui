import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata, d } from "../metadata-helpers";
import { Fallback, defaultProps } from "./FallbackReact";

const COMP = "Fallback";

export const FallbackMd = createMetadata({
  status: "experimental",
  description:
    `\`${COMP}\` is a declarative wrapper that renders an alternative UI when ` +
    `a descendant loader (\`DataSource\`, \`APICall\`) fails or a descendant ` +
    `component throws during render. The error is exposed as the \`$error\` ` +
    `context variable to the \`errorTemplate\`. An optional \`loadingTemplate\` ` +
    `is rendered while the \`isLoading\` prop is truthy.`,
  contextVars: {
    $error: d("The error captured by this Fallback boundary."),
  },
  props: {
    errorTemplate: {
      description:
        `Template to render when a descendant produces an \`AppError\`. The ` +
        `error is available as \`$error\` (code, category, message, data).`,
      valueType: "ComponentDef",
    },
    loadingTemplate: {
      description:
        `Template to render when \`isLoading\` is \`true\` and no error has ` +
        `been reported yet.`,
      valueType: "ComponentDef",
    },
    isLoading: {
      description:
        `When \`true\`, renders the \`loadingTemplate\` (if provided) instead ` +
        `of the children.`,
      valueType: "boolean",
      defaultValue: defaultProps.isLoading,
    },
  },
});

export const fallbackComponentRenderer = wrapComponent(COMP, Fallback, FallbackMd, {
  stateful: false,
  renderers: {
    errorTemplate: { reactProp: "errorRender", contextVars: ["$error"] },
    loadingTemplate: { reactProp: "loadingRender", contextVars: [] },
  },
  customRender: (props, { node, extractValue, renderChild }) => (
    <Fallback
      errorRender={props.errorRender}
      loadingRender={props.loadingRender}
      isLoading={extractValue.asOptionalBoolean(node.props.isLoading)}
    >
      {renderChild(node.children)}
    </Fallback>
  ),
});

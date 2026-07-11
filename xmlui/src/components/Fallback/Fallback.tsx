import { wrapComponent } from "../../components-core/wrapComponent";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { createSlotScope } from "../../runtime/rendering/components";
import { nonPropertyChildren, templateChildren, wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import { createMetadata } from "../metadata-helpers";
import { defaultProps } from "./Fallback.defaults";
import { Fallback } from "./FallbackReact";

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
    $error: { description: "The error captured by this Fallback boundary." },
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

export const fallbackRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: FallbackMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const errorTemplate = templateChildren(adapter.node, "errorTemplate");
    const loadingTemplate = templateChildren(adapter.node, "loadingTemplate");
    return (
      <Fallback
        errorRender={($error) =>
          errorTemplate
            ? adapter.context.renderChildren(
              errorTemplate,
              createSlotScope(adapter.scope, { $error }),
              adapter.node.range.end,
            )
            : undefined}
        loadingRender={() =>
          loadingTemplate
            ? adapter.context.renderChildren(loadingTemplate, adapter.scope, adapter.node.range.end)
            : undefined}
        isLoading={adapter.booleanProp("isLoading", defaultProps.isLoading)}
      >
        {adapter.renderChildren(nonPropertyChildren(adapter.node.children))}
      </Fallback>
    );
  },
});

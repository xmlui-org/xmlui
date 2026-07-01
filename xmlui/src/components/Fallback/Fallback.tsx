import { createMetadata, dComponent } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { createSlotScope } from "../../runtime/rendering/components";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { defaultProps } from "./Fallback.defaults";
import { AppError } from "../../components-core/errors/app-error";
import { Fallback } from "./FallbackReact";

const COMP = "Fallback";

export const FallbackMd = createMetadata({
  status: "experimental",
  description:
    "`Fallback` is a declarative wrapper that renders an alternative UI when a descendant loader (`DataSource`, `APICall`) fails or a descendant component throws during render. The error is exposed as the `$error` context variable to the `errorTemplate`. An optional `loadingTemplate` is rendered while the `isLoading` prop is truthy.",
  contextVars: {
    $error: { description: "The `AppError` captured by this Fallback boundary." },
  },
  props: {
    errorTemplate: dComponent(
      "Template rendered when a descendant produces an `AppError`. Receives `$error` with `code`, `category`, `message`, and `data` fields.",
    ),
    loadingTemplate: dComponent("Template to render while `isLoading` is true."),
    isLoading: {
      description: "When true, renders the loading template if one is provided.",
      valueType: "boolean",
      defaultValue: defaultProps.isLoading,
    },
  },
});

export const fallbackRenderer = wrapComponent({
  name: COMP,
  metadata: FallbackMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const errorTemplate = templateChildren(adapter.node, "errorTemplate");
    const loadingTemplate = templateChildren(adapter.node, "loadingTemplate");
    return (
      <Fallback
        isLoading={adapter.booleanProp("isLoading", defaultProps.isLoading)}
        errorRender={($error: AppError) =>
          errorTemplate
            ? adapter.context.renderChildren(errorTemplate, createSlotScope(adapter.scope, { $error }))
            : undefined}
        loadingRender={() =>
          loadingTemplate
            ? adapter.context.renderChildren(loadingTemplate, adapter.scope)
            : undefined}
      >
        {adapter.renderChildren(nonPropertyChildren(adapter.node.children))}
      </Fallback>
    );
  },
});

function templateChildren(node: { children: Array<any> }, name: string) {
  const property = node.children.find((child) =>
    child.kind === "element" &&
    child.type === "property" &&
    child.props.name === name);
  return property?.children;
}

function nonPropertyChildren(children: Array<any>) {
  return children.filter((child) => !(child.kind === "element" && child.type === "property"));
}

import { createMetadata, d } from "../metadata-helpers";
import { createComponentRenderer } from "../../components-core/renderers";
import { TestMarkerNative } from "./TestMarkerNative";

const COMP = "TestMarker";

export const TestMarkerMd = createMetadata({
  status: "internal",
  description: "A testing utility component that wraps children with data attributes without affecting display layout",
  
  props: {
    tag: d("Test identifier tag added as data-test attribute", undefined, "string"),
  },
});

export const testMarkerComponentRenderer = createComponentRenderer(
  COMP,
  TestMarkerMd,
  ({ node, extractValue, renderChild, className }) => {
    const tag = extractValue.asOptionalString(node.props.tag);

    return (
      <TestMarkerNative
        tag={tag}
        className={className}
      >
        {renderChild(node.children)}
      </TestMarkerNative>
    );
  },
);
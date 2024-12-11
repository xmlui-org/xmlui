import type { ComponentDef } from "xmlui";
import { LazyPdf } from "./LazyPdfNative";
import type { ComponentRendererFn } from "xmlui/src/abstractions/RendererDefs";

interface Pdf extends ComponentDef {
  type: "Pdf";
  props: {
    src: string;
  };
  events: {
    onClick: string;
  };
}

const renderer: ComponentRendererFn<Pdf> = ({ node, extractValue }) => {
  return <LazyPdf src={extractValue(node.props!.src)} />;
};

export default {
  type: "Pdf",
  renderer: renderer,
  metadata: {},
};

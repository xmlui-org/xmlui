import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { LazyPdf } from "./LayPdfNative";

const COMP = "Pdf";

export const PdfMd = createMetadata({
  description: `The \`${COMP}\` component provides a read-only preview of a pdf document's contents.`,
  props: {
    src: d(`This property defines the source URL of the pdf document stream to display.`),
  },
  status: "in progress",
});

export const pdfComponentRenderer = createComponentRenderer(
  COMP,
  PdfMd,
  ({ node, extractValue }) => {
    return <LazyPdf src={extractValue(node.props.src)} />;
  },
);

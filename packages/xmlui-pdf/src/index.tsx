import { createComponentRenderer, createMetadata, d, parseScssVar } from "xmlui";
import { LazyPdf } from "./LazyPdfNative";
import styles from "./Pdf.module.scss";

const COMP = "Pdf";
export const PdfMd = createMetadata({
  description: `The \`${COMP}\` component provides a read-only preview of a pdf document's contents.`,
  status: "experimental",
  props: {
    src: {
      description: `This property defines the source URL of the pdf document to display.`,
      valueType: "string",
    },
    data: d(
      `This property contains the binary data that represents the PDF document.`,
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "boxShadow-page-Pdf": "$boxShadow-md",
    "gap-pages-Pdf": "$space-4",
  },
});
const PdfComponent = createComponentRenderer(COMP, PdfMd, ({ node, extractValue }) => {
  const props = node.props as typeof PdfMd.props;
  return <LazyPdf src={extractValue(props!.src)} data={extractValue(props!.data)} />;
});

export default {
  namespace: "XMLUIExtensions",
  components: [PdfComponent],
};

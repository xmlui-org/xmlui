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
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "shadow-page-Pdf": "$shadow-md",
    "gap-pages-Pdf": "$space-4",
  },
});
const PdfComponent = createComponentRenderer(COMP, PdfMd, ({ node, extractValue }) => {
  return <LazyPdf src={extractValue(node.props.src)} />;
});

export default {
  namespace: "XMLUIExtensions",
  components: [PdfComponent],
};

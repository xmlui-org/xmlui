import { createComponentRenderer, createMetadata, d, parseScssVar } from "xmlui";
import { LazyPdf } from "./LazyPdfNative";
import styles from "./Pdf.module.scss";

const COMP = "Pdf";
const PdfMd = createMetadata({
  description: `The \`${COMP}\` component provides a read-only preview of a pdf document's contents.`,
  props: {
    src: d(`This property defines the source URL of the pdf document stream to display.`),
  },
  status: "in progress",
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "shadow-page-Pdf": "$shadow-md",
    "gap-pages-Pdf": "$space-4",
  }
});

export default createComponentRenderer(COMP, PdfMd, ({ node, extractValue }) => {
  return <LazyPdf src={extractValue(node.props.src)} />;
});

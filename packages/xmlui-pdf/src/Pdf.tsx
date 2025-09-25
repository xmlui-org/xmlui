import { forwardRef, useState } from "react";
import styles from "./Pdf.module.scss";
import { Document, Page, pdfjs } from "react-pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
//
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

// =====================================================================================================================
// React Pdf component implementation

interface Props {
  src?: string;
  data?: any; // Binary data for PDF content
}

const Pdf = forwardRef(({ src, data }: Props, ref) => {
  const [numPages, setNumPages] = useState<number | null>(null);

  function onLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  // Use data if provided, otherwise use src
  const fileSource = data || src;

  return (
    <Document
      file={fileSource}
      onLoadSuccess={onLoadSuccess}
      className={styles.document}
      inputRef={ref as any}
    >
      {Array.from(new Array(numPages), (_, index) => (
        <Page key={index + 1} pageNumber={index + 1} loading="" className={styles.page} />
      ))}
    </Document>
  );
});

export default Pdf;

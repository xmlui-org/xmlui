import { useState } from "react";
import styles from "./Pdf.module.scss";
import { Document, Page, pdfjs } from "react-pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

// =====================================================================================================================
// React Pdf component implementation

interface Props {
  src: string;
}

const Pdf = ({ src }: Props) => {
  const [numPages, setNumPages] = useState<number | null>(null)

  function onLoadSuccess({numPages}: {numPages: number}) {
    setNumPages(numPages)
  }

  return (
    <div className={styles.wrapper}>
      <div style={{ position: "relative", minHeight: 0 }}>
        <Document file={src} onLoadSuccess={onLoadSuccess}>
          {Array.from(new Array(numPages), (_, index) => (
            <Page key={index+1} pageNumber={index + 1} loading="" className={styles.page} />
          ))}
        </Document>
      </div>
    </div>
  );
};

export default Pdf;

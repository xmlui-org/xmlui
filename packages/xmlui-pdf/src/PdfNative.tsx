import { forwardRef, useState, CSSProperties } from "react";
import styles from "./Pdf.module.scss";
import { Document, Page, pdfjs } from "react-pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import type { Annotation } from "./types/annotation.types";
import type { SignatureData } from "./types/signature.types";
import { AnnotationLayer } from "./components/AnnotationLayer/AnnotationLayer";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

// =====================================================================================================================
// PdfNative component - React implementation

export type PdfMode = "view" | "edit";

export interface PdfNativeProps {
  // Document source
  src?: string;
  data?: any; // Binary data for PDF content
  
  // Display and interaction
  mode?: PdfMode;
  scale?: number;
  currentPage?: number;
  
  // Annotations (Phase 1)
  annotations?: Annotation[];
  
  // Signature (Phase 2)
  signatureData?: SignatureData;
  
  // Events
  onDocumentLoad?: (numPages: number) => void;
  onPageChange?: (page: number) => void;
  onAnnotationCreate?: (annotation: Annotation) => void;
  onAnnotationUpdate?: (annotation: Annotation) => void;
  onAnnotationDelete?: (id: string) => void;
  onAnnotationSelect?: (id: string) => void;
  onSignatureCapture?: (signature: SignatureData) => void;
  onSignatureApply?: (fieldId: string, signature: SignatureData) => void;
  
  // API registration
  registerComponentApi?: (api: any) => void;
  updateState?: (state: any) => void;
  
  // Standard props
  id?: string;
  className?: string;
  style?: CSSProperties;
}

export const defaultProps = {
  mode: "view" as PdfMode,
  scale: 1.0,
  annotations: [] as Annotation[],
};

export const PdfNative = forwardRef<HTMLDivElement, PdfNativeProps>(
  function PdfNative(
    {
      src,
      data,
      mode = defaultProps.mode,
      scale = defaultProps.scale,
      currentPage,
      annotations = defaultProps.annotations,
      signatureData,
      onDocumentLoad,
      onPageChange,
      onAnnotationCreate,
      onAnnotationUpdate,
      onAnnotationDelete,
      onAnnotationSelect,
      onSignatureCapture,
      onSignatureApply,
      registerComponentApi,
      updateState,
      id,
      className,
      style,
    },
    ref
  ) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [internalPage, setInternalPage] = useState<number>(1);
    const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | undefined>();
    
    // Use controlled page if provided, otherwise internal state
    const effectivePage = currentPage ?? internalPage;

    function handleLoadSuccess({ numPages }: { numPages: number }) {
      setNumPages(numPages);
      onDocumentLoad?.(numPages);
      
      // Update XMLUI state if connected
      updateState?.({
        pageCount: numPages,
        currentPage: effectivePage,
        annotations,
        mode,
      });
    }

    function handlePageChange(page: number) {
      if (!currentPage) {
        setInternalPage(page);
      }
      onPageChange?.(page);
      updateState?.({ currentPage: page });
    }

    // Register component API methods
    if (registerComponentApi) {
      registerComponentApi({
        goToPage: (page: number) => {
          if (page >= 1 && page <= (numPages ?? 1)) {
            handlePageChange(page);
          }
        },
        setScale: (newScale: number) => {
          updateState?.({ scale: newScale });
        },
        addAnnotation: (annotationData: any) => {
          const newAnnotation: Annotation = {
            ...annotationData,
            id: `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            created: new Date(),
            modified: new Date(),
          };
          onAnnotationCreate?.(newAnnotation);
          updateState?.({ 
            annotations: [...annotations, newAnnotation] 
          });
          return newAnnotation.id;
        },
        updateAnnotation: (id: string, updates: any) => {
          const annotation = annotations.find(a => a.id === id);
          if (annotation) {
            const updated = {
              ...annotation,
              ...updates,
              modified: new Date(),
            };
            onAnnotationUpdate?.(updated);
            updateState?.({
              annotations: annotations.map(a => a.id === id ? updated : a)
            });
          }
        },
        deleteAnnotation: (id: string) => {
          onAnnotationDelete?.(id);
          updateState?.({
            annotations: annotations.filter(a => a.id !== id)
          });
          if (selectedAnnotationId === id) {
            setSelectedAnnotationId(undefined);
          }
        },
        getAnnotations: () => annotations,
        openSignatureModal: (fieldId: string) => {
          // Will be implemented in Phase 2
          console.log("openSignatureModal not yet implemented", fieldId);
        },
        applySignature: (fieldId: string, signature: SignatureData) => {
          onSignatureApply?.(fieldId, signature);
        },
        getSignature: () => signatureData,
      });
    }

    // Use data if provided, otherwise use src
    const fileSource = data || src;

    return (
      <div 
        ref={ref} 
        id={id} 
        className={className}
        style={style}
      >
        <Document
          file={fileSource}
          onLoadSuccess={handleLoadSuccess}
          className={styles.document}
        >
          {Array.from(new Array(numPages), (_, index) => {
            const pageNumber = index + 1;
            // TODO: Get actual page dimensions from PDF
            // For now, use standard A4 dimensions (595 x 842 points)
            const pageWidth = 595;
            const pageHeight = 842;
            
            return (
              <div key={pageNumber} className={styles.pageContainer}>
                <Page
                  pageNumber={pageNumber}
                  loading=""
                  className={styles.page}
                  scale={scale}
                />
                {mode === "edit" && (
                  <AnnotationLayer
                    annotations={annotations}
                    pageNumber={pageNumber}
                    pageWidth={pageWidth}
                    pageHeight={pageHeight}
                    scale={scale}
                    selectedAnnotationId={selectedAnnotationId}
                    onAnnotationSelect={(id) => {
                      setSelectedAnnotationId(id);
                      onAnnotationSelect?.(id);
                    }}
                    onAnnotationUpdate={(id, updates) => {
                      onAnnotationUpdate?.({
                        ...annotations.find(a => a.id === id)!,
                        ...updates,
                      });
                    }}
                  />
                )}
              </div>
            );
          })}
        </Document>
      </div>
    );
  }
);

import { forwardRef, useState, CSSProperties, useEffect, useRef } from "react";
import styles from "./Pdf.module.scss";
import { Document, Page, pdfjs } from "react-pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import type { Annotation, AnnotationType } from "./types/annotation.types";
import type { SignatureData } from "./types/signature.types";
import type { PdfSource } from "./types/source.types";
import { AnnotationLayer } from "./components/AnnotationLayer/AnnotationLayer";
import { FieldToolbar } from "./components/FieldToolbar/FieldToolbar";
import { FieldProperties } from "./components/FieldToolbar/FieldProperties";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * Walk up the DOM from `start` to find the nearest ancestor that acts as a
 * scroll/size container (overflow auto/scroll) or the document root.
 * Used to find the true available viewport size when Pdf is nested inside
 * a ScrollViewer — otherwise fitPage/fitWidth produce a smaller result every
 * call because the inner container grows with the PDF content.
 */
function getNearestScrollAncestor(start: HTMLElement | null): HTMLElement {
  let el = start;
  while (el && el !== document.documentElement) {
    const { overflow, overflowY } = getComputedStyle(el);
    if (/auto|scroll/.test(overflow) || /auto|scroll/.test(overflowY)) {
      return el;
    }
    el = el.parentElement;
  }
  return document.documentElement;
}

// =====================================================================================================================
// PdfNative component - React implementation

export type PdfMode = "view" | "edit";

export interface PdfNativeProps {
  // Document source
  /**
   * URL path to the PDF document.
   * Example: "/documents/sample.pdf" or "https://example.com/file.pdf"
   */
  src?: string;
  
  /**
   * Binary PDF data for in-memory display.
   * Supports multiple formats:
   * - ArrayBuffer: From fetch() or file readers
   * - Uint8Array: Typed array with PDF bytes
   * - Blob: File or Blob objects
   * - string: Data URL ("data:application/pdf;base64,...")
   * 
   * Examples:
   * ```tsx
   * // From fetch
   * const response = await fetch('/api/pdf');
   * const arrayBuffer = await response.arrayBuffer();
   * <Pdf data={arrayBuffer} />
   * 
   * // From file input
   * const file = event.target.files[0];
   * <Pdf data={file} />
   * 
   * // From Uint8Array
   * const bytes = new Uint8Array([...]); 
   * <Pdf data={bytes} />
   * 
   * // From base64
   * const dataUrl = `data:application/pdf;base64,${base64String}`;
   * <Pdf data={dataUrl} />
   * ```
   */
  data?: PdfSource;
  
  // Display and interaction
  mode?: PdfMode;
  scale?: number;
  currentPage?: number;
  
  // Annotations (Phase 1)
  annotations?: Annotation[];
  
  // Signature (Phase 2)
  signatureData?: SignatureData;
  
  // UI visibility
  showToolbar?: boolean;
  showProperties?: boolean;
  
  // Events
  onDocumentLoad?: (numPages: number) => void;
  onPageChange?: (page: number) => void;
  onAnnotationCreate?: (annotation: Annotation) => void;
  onAnnotationUpdate?: (annotation: Annotation) => void;
  onAnnotationDelete?: (id: string) => Promise<boolean | void>;
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
  showToolbar: false,
  showProperties: false,
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
      showToolbar = defaultProps.showToolbar,
      showProperties = defaultProps.showProperties,
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
    // Internal scale — owned here so API methods like zoomIn/fitWidth work independently
    // of whether the parent binds the scale prop.
    const [internalScale, setInternalScale] = useState<number>(scale);
    // Track natural page dimensions (PDF points) captured from the first page render
    const pageDimensionsRef = useRef<{ width: number; height: number }>({ width: 595, height: 842 });
    // Ref to the scrollable viewport div — used for fit-width / fit-page calculations
    const viewportRef = useRef<HTMLDivElement>(null);
    // Measurement sentinel: an absolutely-positioned div that always reflects the true
    // available layout space, independent of PDF content size. Using viewportRef itself
    // fails inside ScrollViewer because that container grows with content — causing a
    // feedback loop where fitPage() makes the PDF smaller on every call.
    const measureRef = useRef<HTMLDivElement>(null);
    // Internal annotation state — initialized from the prop, but owned here so controlled
    // inputs don't snap back to old values when the parent doesn't round-trip updates.
    const [internalAnnotations, setInternalAnnotations] = useState<Annotation[]>(annotations);
    // Ref that always holds the current annotations — used by the registered API
    // methods which close over a stale value (they're registered once on mount).
    const internalAnnotationsRef = useRef<Annotation[]>(annotations);
    internalAnnotationsRef.current = internalAnnotations;

    // Sync internalScale when the scale prop changes externally
    const prevScaleProp = useRef(scale);
    useEffect(() => {
      if (scale !== prevScaleProp.current) {
        prevScaleProp.current = scale;
        setInternalScale(scale);
      }
    }, [scale]);

    // Push scale changes to $scale context var
    useEffect(() => {
      updateState?.({ scale: internalScale });
    }, [internalScale]);

    // Keep internal annotations in sync when the prop changes from outside
    // (e.g. initial load or parent-driven reset), but don't override in-flight edits.
    const prevAnnotationsProp = useRef(annotations);
    useEffect(() => {
      if (annotations !== prevAnnotationsProp.current) {
        prevAnnotationsProp.current = annotations;
        setInternalAnnotations(annotations);
      }
    }, [annotations]);

    // Use controlled page if provided, otherwise internal state
    const effectivePage = currentPage ?? internalPage;
    
    // Store latest values in refs for API methods (avoid re-registering API on every prop change)
    const latestValues = useRef({
      annotations,
      numPages,
      selectedAnnotationId,
      onAnnotationCreate,
      onAnnotationUpdate,
      onAnnotationDelete,
      onAnnotationSelect,
      onSignatureApply,
      updateState,
      signatureData,
    });
    
    // Update refs on every render
    useEffect(() => {
      latestValues.current = {
        annotations,
        numPages,
        selectedAnnotationId,
        onAnnotationCreate,
        onAnnotationUpdate,
        onAnnotationDelete,
        onAnnotationSelect,
        onSignatureApply,
        updateState,
        signatureData,
      };
    });

    // Keyboard event handler for delete
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!selectedAnnotationId || mode !== "edit") return;

        // Don't intercept keys when the user is typing inside an input or textarea
        const target = event.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
        
        if (event.key === "Delete" || event.key === "Backspace") {
          // Prevent default backspace navigation only outside inputs
          event.preventDefault();
          void handleAnnotationDelete(selectedAnnotationId);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [selectedAnnotationId, mode]);

    function handleLoadSuccess({ numPages }: { numPages: number }) {
      setNumPages(numPages);
      onDocumentLoad?.(numPages);
      
      // Update XMLUI state if connected
      if (updateState) {
        updateState?.({
          pageCount: numPages,
          currentPage: effectivePage,
          annotations,
          mode,
          scale: internalScale,
        });
      }
    }

    function handlePageChange(page: number) {
      if (!currentPage) {
        setInternalPage(page);
      }
      onPageChange?.(page);
      updateState?.({ currentPage: page });
    }

    // Helper to create annotation at default position
    function createDefaultAnnotation(type: AnnotationType, page: number): Partial<Annotation> {
      // Default positions for centering annotations
      const defaultSizes = {
        text: { width: 200, height: 50 },
        checkbox: { width: 150, height: 30 },
        signature: { width: 250, height: 100 },
      };
      
      // Center horizontally, place near top
      const pageWidth = 595; // A4 width in points
      const size = defaultSizes[type];
      const x = (pageWidth - size.width) / 2;
      const y = 100; // Near top
      
      return {
        type,
        page,
        position: { x, y },
        size,
        value: type === "checkbox" ? false : "",
        properties: {
          label: type === "text" ? "Text Field" : type === "checkbox" ? "Checkbox" : "Signature",
          required: false,
        },
      };
    }

    // ---- annotation mutation helpers (keep internal state + notify parent) ----
    function handleAnnotationUpdate(id: string, updates: Partial<Annotation>) {
      const annotation = internalAnnotations.find(a => a.id === id);
      if (!annotation) return;
      const updated: Annotation = { ...annotation, ...updates, modified: new Date() };
      const next = internalAnnotations.map(a => a.id === id ? updated : a);
      setInternalAnnotations(next);
      onAnnotationUpdate?.(updated);
      updateState?.({ annotations: next });
    }

    async function handleAnnotationDelete(id: string) {
      const annotation = internalAnnotations.find(a => a.id === id);
      // Respect the locked flag
      if (annotation?.properties.locked) return;
      // Allow the event handler to cancel deletion by returning false (mirrors onWillSubmit pattern)
      const result = await onAnnotationDelete?.(id);
      if (result === false) return;
      const next = internalAnnotations.filter(a => a.id !== id);
      setInternalAnnotations(next);
      updateState?.({ annotations: next });
      if (selectedAnnotationId === id) setSelectedAnnotationId(undefined);
    }

    // Handle adding annotation from toolbar
    function handleAddAnnotation(type: AnnotationType, page: number) {
      const annotationData = createDefaultAnnotation(type, page);
      const newAnnotation: Annotation = {
        ...annotationData as Annotation,
        id: `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created: new Date(),
        modified: new Date(),
      };
      const next = [...internalAnnotations, newAnnotation];
      setInternalAnnotations(next);
      onAnnotationCreate?.(newAnnotation);
      updateState?.({ annotations: next });
      setSelectedAnnotationId(newAnnotation.id);
      return newAnnotation.id;
    }

    // Register component API methods (only once on mount to avoid infinite loops)
    useEffect(() => {
      if (!registerComponentApi) return;
      
      registerComponentApi({
        goToPage: (page: number) => {
          const { numPages } = latestValues.current;
          if (page >= 1 && page <= (numPages ?? 1)) {
            handlePageChange(page);
          }
        },
        // --- Zoom / scale API ---
        zoomTo: (newScale: number) => {
          const clamped = Math.max(0.1, Math.min(5, newScale));
          setInternalScale(clamped);
          latestValues.current.updateState?.({ scale: clamped });
        },
        zoomIn: (factor: number = 1.25) => {
          setInternalScale(prev => {
            const next = Math.min(5, prev * factor);
            latestValues.current.updateState?.({ scale: next });
            return next;
          });
        },
        zoomOut: (factor: number = 1.25) => {
          setInternalScale(prev => {
            const next = Math.max(0.1, prev / factor);
            latestValues.current.updateState?.({ scale: next });
            return next;
          });
        },
        actualSize: () => {
          setInternalScale(1);
          latestValues.current.updateState?.({ scale: 1 });
        },
        fitWidth: () => {
          const outer = measureRef.current;
          if (!outer) return;
          // Use the nearest external scroll ancestor to avoid feedback loop when
          // Pdf is inside a ScrollViewer (the outer div grows with content).
          const ancestor = getNearestScrollAncestor(outer.parentElement);
          const availableWidth = Math.min(outer.clientWidth, ancestor.clientWidth) - 16;
          const newScale = availableWidth / pageDimensionsRef.current.width;
          const clamped = Math.max(0.1, Math.min(5, newScale));
          setInternalScale(clamped);
          latestValues.current.updateState?.({ scale: clamped });
        },
        fitPage: () => {
          const outer = measureRef.current;
          if (!outer) return;
          const ancestor = getNearestScrollAncestor(outer.parentElement);
          const availableWidth = Math.min(outer.clientWidth, ancestor.clientWidth) - 16;
          const availableHeight = Math.min(outer.clientHeight, ancestor.clientHeight) - 16;
          const scaleW = availableWidth / pageDimensionsRef.current.width;
          const scaleH = availableHeight / pageDimensionsRef.current.height;
          const clamped = Math.max(0.1, Math.min(5, Math.min(scaleW, scaleH)));
          setInternalScale(clamped);
          latestValues.current.updateState?.({ scale: clamped });
        },
        getScale: () => internalScale,
        // Legacy — kept for back-compat
        setScale: (newScale: number) => {
          const clamped = Math.max(0.1, Math.min(5, newScale));
          setInternalScale(clamped);
          latestValues.current.updateState?.({ scale: clamped });
        },
        addAnnotation: (annotationData: any) => {
          const { onAnnotationCreate } = latestValues.current;
          const newAnnotation: Annotation = {
            ...annotationData,
            id: annotationData.id || `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            created: new Date(),
            modified: new Date(),
          };
          setInternalAnnotations(prev => {
            const next = [...prev, newAnnotation];
            latestValues.current.updateState?.({ annotations: next });
            return next;
          });
          onAnnotationCreate?.(newAnnotation);
          return newAnnotation.id;
        },
        updateAnnotation: (id: string, updates: any) => {
          const { onAnnotationUpdate } = latestValues.current;
          setInternalAnnotations(prev => {
            const annotation = prev.find(a => a.id === id);
            if (!annotation) return prev;
            const updated = { ...annotation, ...updates, modified: new Date() };
            const next = prev.map(a => a.id === id ? updated : a);
            latestValues.current.updateState?.({ annotations: next });
            onAnnotationUpdate?.(updated);
            return next;
          });
        },
        deleteAnnotation: async (id: string) => {
          const { onAnnotationDelete } = latestValues.current;
          const annotation = internalAnnotationsRef.current.find(a => a.id === id);
          if (annotation?.properties.locked) return;
          const result = await onAnnotationDelete?.(id);
          if (result === false) return;
          setInternalAnnotations(prev => {
            const next = prev.filter(a => a.id !== id);
            latestValues.current.updateState?.({ annotations: next });
            return next;
          });
          setSelectedAnnotationId(prev => prev === id ? undefined : prev);
        },
        getAnnotations: () => internalAnnotations,
        selectAnnotation: (id: string) => {
          setSelectedAnnotationId(id);
          latestValues.current.onAnnotationSelect?.(id);
        },
        deselectAnnotation: () => {
          setSelectedAnnotationId(undefined);
        },
        getSelectedAnnotationId: () => latestValues.current.selectedAnnotationId,
        getSelectedAnnotation: () => {
          const { annotations, selectedAnnotationId } = latestValues.current;
          if (!selectedAnnotationId) return null;
          return annotations.find(a => a.id === selectedAnnotationId) || null;
        },
        openSignatureModal: (fieldId: string) => {
          // Will be implemented in Phase 2
        },
        applySignature: (fieldId: string, signature: SignatureData) => {
          latestValues.current.onSignatureApply?.(fieldId, signature);
        },
        getSignature: () => latestValues.current.signatureData,
      });
    }, [registerComponentApi]); // Only re-run if registerComponentApi function itself changes

    // Use data if provided, otherwise use src
    const fileSource = data || src;
    
    // Get selected annotation for properties panel
    const selectedAnnotation = selectedAnnotationId 
      ? internalAnnotations.find(a => a.id === selectedAnnotationId) || null
      : null;

    // Note: id prop is used internally by XMLUI, not applied to DOM
    return (
      <div 
        ref={ref} 
        className={className}
        style={{ ...style, position: "relative", display: "flex", gap: "16px", minHeight: 0, overflow: "hidden" }}
      >
        {/* Measurement sentinel: absolutely covers the outer container so it always
            reports the true available layout space, unaffected by PDF content size. */}
        <div ref={measureRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", visibility: "hidden" }} />
        {mode === "edit" && showToolbar && (
          <FieldToolbar
            onAddAnnotation={handleAddAnnotation}
            currentPage={effectivePage}
            isEditMode={mode === "edit"}
          />
        )}
        <div ref={viewportRef} style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
          <Document
          file={fileSource as any}
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
                  scale={internalScale}
                  onRenderSuccess={(page) => {
                    // Capture natural page dimensions at scale=1 from the first page
                    if (pageNumber === 1) {
                      pageDimensionsRef.current = {
                        width: page.width / internalScale,
                        height: page.height / internalScale,
                      };
                    }
                  }}
                />
                {mode === "edit" && (
                  <AnnotationLayer
                    annotations={internalAnnotations}
                    pageNumber={pageNumber}
                    pageWidth={pageWidth}
                    pageHeight={pageHeight}
                    scale={internalScale}
                    selectedAnnotationId={selectedAnnotationId}
                    onAnnotationSelect={(id) => {
                      setSelectedAnnotationId(id);
                      onAnnotationSelect?.(id);
                    }}
                    onAnnotationUpdate={handleAnnotationUpdate}
                    onAnnotationDelete={handleAnnotationDelete}
                  />
                )}
              </div>
            );
          })}
        </Document>
        </div>
        {mode === "edit" && showProperties && (
          <FieldProperties
            annotation={selectedAnnotation}
            onUpdate={handleAnnotationUpdate}
          />
        )}
      </div>
    );
  }
);

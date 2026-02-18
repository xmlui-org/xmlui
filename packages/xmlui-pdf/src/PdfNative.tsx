import { forwardRef, useState, CSSProperties, useEffect, useRef } from "react";
import styles from "./Pdf.module.scss";
import { Document, Page, pdfjs } from "react-pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import type { Annotation, AnnotationType } from "./types/annotation.types";
import type { SignatureData } from "./types/signature.types";
import { AnnotationLayer } from "./components/AnnotationLayer/AnnotationLayer";
import { FieldToolbar } from "./components/FieldToolbar/FieldToolbar";
import { FieldProperties } from "./components/FieldToolbar/FieldProperties";
import { FieldProperties } from "./components/FieldToolbar/FieldProperties";

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
    // DIAGNOSTIC: Prevent infinite render loop from freezing browser
    const renderCount = useRef(0);
    const renderTimestamp = useRef(Date.now());
    const renderStack = useRef<string[]>([]);
    
    renderCount.current++;
    const now = Date.now();
    const timeSinceLastRender = now - renderTimestamp.current;
    renderTimestamp.current = now;
    
    // Detect rapid re-renders (likely infinite loop)
    if (renderCount.current > 50) {
      console.error("🚨 INFINITE RENDER LOOP DETECTED! Stopping at render #" + renderCount.current);
      console.error("Render history:", renderStack.current);
      throw new Error(`PdfNative: Infinite render loop detected. Component rendered ${renderCount.current} times. Check console for details.`);
    }
    
    // Log render info
    const renderInfo = `Render #${renderCount.current} (+${timeSinceLastRender}ms) | annotations.length=${annotations.length}`;
    renderStack.current.push(renderInfo);
    if (renderStack.current.length > 20) renderStack.current.shift();
    
    console.log(`[PdfNative] ${renderInfo}`, {
      mode,
      scale,
      currentPage,
      annotationsAreNew: !useRef(annotations).current || useRef(annotations).current !== annotations,
      stack: new Error().stack?.split('\n')[2]
    });
    
    const [numPages, setNumPages] = useState<number | null>(null);
    const [internalPage, setInternalPage] = useState<number>(1);
    const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | undefined>();
    
    // Use controlled page if provided, otherwise internal state
    const effectivePage = currentPage ?? internalPage;
    
    // DIAGNOSTIC: Track all effects
    const effectRunCount = useRef(0);
    
    // Store latest values in refs for API methods (avoid re-registering API on every prop change)
    const latestValues = useRef({
      annotations,
      numPages,
      selectedAnnotationId,
      onAnnotationCreate,
      onAnnotationUpdate,
      onAnnotationDelete,
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
        onSignatureApply,
        updateState,
        signatureData,
      };
    });
    
    // Track prop changes
    const prevProps = useRef({ annotations, mode, scale, currentPage });
    useEffect(() => {
      effectRunCount.current++;
      console.log(`[PdfNative] Effect run #${effectRunCount.current} - Props changed:`, {
        annotationsChanged: prevProps.current.annotations !== annotations,
        modeChanged: prevProps.current.mode !== mode,
        scaleChanged: prevProps.current.scale !== scale,
        pageChanged: prevProps.current.currentPage !== currentPage,
      });
      prevProps.current = { annotations, mode, scale, currentPage };
    }, [annotations, mode, scale, currentPage]);

    // Keyboard event handler for delete
    useEffect(() => {
      console.log('[PdfNative] Keyboard effect mounted/updated', { selectedAnnotationId, mode });
      
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!selectedAnnotationId || mode !== "edit") return;
        
        if (event.key === "Delete" || event.key === "Backspace") {
          console.log('[PdfNative] DELETE key pressed', { selectedAnnotationId });
          // Prevent default backspace navigation
          event.preventDefault();
          
          // Delete selected annotation - let parent component handle state updates
          onAnnotationDelete?.(selectedAnnotationId);
          setSelectedAnnotationId(undefined);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        console.log('[PdfNative] Keyboard effect cleanup');
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [selectedAnnotationId, mode, onAnnotationDelete]);

    function handleLoadSuccess({ numPages }: { numPages: number }) {
      console.log('[PdfNative] handleLoadSuccess called', { numPages });
      setNumPages(numPages);
      onDocumentLoad?.(numPages);
      
      // Update XMLUI state if connected
      if (updateState) {
        console.log('[PdfNative] Calling updateState from handleLoadSuccess');
        updateState?.({
          pageCount: numPages,
          currentPage: effectivePage,
          annotations,
          mode,
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

    // Handle adding annotation from toolbar
    function handleAddAnnotation(type: AnnotationType, page: number) {
      const annotationData = createDefaultAnnotation(type, page);
      const newAnnotation: Annotation = {
        ...annotationData as Annotation,
        id: `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created: new Date(),
        modified: new Date(),
      };
      onAnnotationCreate?.(newAnnotation);
      updateState?.({ 
        annotations: [...annotations, newAnnotation] 
      });
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
        setScale: (newScale: number) => {
          latestValues.current.updateState?.({ scale: newScale });
        },
        addAnnotation: (annotationData: any) => {
          const { annotations, onAnnotationCreate, updateState } = latestValues.current;
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
          const { annotations, onAnnotationUpdate, updateState } = latestValues.current;
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
          const { annotations, selectedAnnotationId, onAnnotationDelete, updateState } = latestValues.current;
          onAnnotationDelete?.(id);
          updateState?.({
            annotations: annotations.filter(a => a.id !== id)
          });
          if (selectedAnnotationId === id) {
            setSelectedAnnotationId(undefined);
          }
        },
        getAnnotations: () => latestValues.current.annotations,
        openSignatureModal: (fieldId: string) => {
          // Will be implemented in Phase 2
          console.log("openSignatureModal not yet implemented", fieldId);
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
      ? annotations.find(a => a.id === selectedAnnotationId) || null
      : null;

    return (
      <div 
        ref={ref} 
        id={id} 
        className={className}
        style={{ ...style, display: "flex", gap: "16px" }}
      >
        {mode === "edit" && (
          <FieldToolbar
            onAddAnnotation={handleAddAnnotation}
            currentPage={effectivePage}
            isEditMode={mode === "edit"}
          />
        )}
        <div style={{ flex: 1 }}>
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
                      console.log('[PdfNative] onAnnotationSelect called', { id });
                      setSelectedAnnotationId(id);
                      onAnnotationSelect?.(id);
                    }}
                    onAnnotationUpdate={(id, updates) => {
                      console.log('[PdfNative] AnnotationLayer.onAnnotationUpdate called', { id, updates });
                      onAnnotationUpdate?.({
                        ...annotations.find(a => a.id === id)!,
                        ...updates,
                      });
                    }}
                    onAnnotationDelete={(id) => {
                      console.log('[PdfNative] AnnotationLayer.onAnnotationDelete called', { id });
                      onAnnotationDelete?.(id);
                      setSelectedAnnotationId(undefined);
                    }}
                  />
                )}
              </div>
            );
          })}
        </Document>
        </div>
        {mode === "edit" && (
          <FieldProperties
            annotation={selectedAnnotation}
            onUpdate={(id, updates) => {
              console.log('[PdfNative] FieldProperties.onUpdate called', { id, updates });
              onAnnotationUpdate?.({
                ...annotations.find(a => a.id === id)!,
                ...updates,
              });
            }}
          />
        )}
      </div>
    );
  }
);

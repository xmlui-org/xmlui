import { forwardRef, useState, CSSProperties, useEffect, useRef, useMemo } from "react";
import styles from "./Pdf.module.scss";
import { Document, Page, pdfjs } from "react-pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import type { Annotation } from "./types/annotation.types";
import type { SignatureData } from "./types/signature.types";
import type { PdfExportData } from "./types/export.types";
import type { PdfSource } from "./types/source.types";
import { AnnotationLayer } from "./components/AnnotationLayer/AnnotationLayer";
import { SignatureCapture } from "./components/SignatureCapture/SignatureCapture";
import { useSignature } from "./hooks/useSignature";
import { createSignatureTimestamp } from "./utils/signatureUtils";

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
  horizontalAlignment?: "start" | "center" | "end";
  verticalAlignment?: "start" | "center" | "end";
  scrollStyle?: "normal" | "overlay" | "whenMouseOver" | "whenScrolling";
  
  // Events
  onDocumentLoad?: (numPages: number) => void;
  onPageChange?: (page: number) => void;
  onAnnotationCreate?: (annotation: Annotation) => void;
  onAnnotationUpdate?: (annotation: Annotation) => void;
  onAnnotationDelete?: (id: string) => Promise<boolean | void>;
  onAnnotationSelect?: (id: string) => void;
  onSignatureCapture?: (signature: SignatureData) => void;
  onSignatureApply?: (fieldId: string, signature: SignatureData) => void;
  onExportRequest?: (data: PdfExportData) => void;
  
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
  horizontalAlignment: "start" as "start" | "center" | "end",
  verticalAlignment: "start" as "start" | "center" | "end",
  scrollStyle: "normal" as "normal" | "overlay" | "whenMouseOver" | "whenScrolling",
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
      horizontalAlignment = defaultProps.horizontalAlignment,
      verticalAlignment = defaultProps.verticalAlignment,
      scrollStyle = defaultProps.scrollStyle,
      onDocumentLoad,
      onPageChange,
      onAnnotationCreate,
      onAnnotationUpdate,
      onAnnotationDelete,
      onAnnotationSelect,
      onSignatureCapture,
      onSignatureApply,
      onExportRequest,
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
    // For whenScrolling mode: update data-scrolling directly on the DOM element
    // (bypasses React render cycle so the scrollbar appears on the very first scroll event)
    const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function handleViewportScroll() {
      if (scrollStyle !== "whenScrolling") return;
      const el = viewportRef.current;
      if (!el) return;
      el.setAttribute("data-scrolling", "true");
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        el.setAttribute("data-scrolling", "false");
      }, 600);
    }
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
    // Signature modal state — null means closed, string means open for fieldId
    const [signatureModalFieldId, setSignatureModalFieldId] = useState<string | null>(null);
    // Separate ref to hold signer metadata — survives annotation prop re-syncs
    const signatureMetaRef = useRef<Map<string, { signerName: string; signerFontIndex: number }>>(new Map());
    // Signature storage via custom hook
    const signatures = useSignature({
      initialSignatures: signatureData ? { [`sig-${Date.now()}`]: signatureData } : {},
    });
    // Ref to keep latest signatures for API access
    const signaturesRef = useRef(signatures.signatures);
    signaturesRef.current = signatures.signatures;
    // Stable ref for signature methods — keeps registerComponentApi effect dependency-free
    const signatureMethodsRef = useRef(signatures);
    signatureMethodsRef.current = signatures;
    // Ref to the loaded PDFDocumentProxy — used by document-level API methods
    const docProxyRef = useRef<any>(null);

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
      internalPage: 1,
      onAnnotationCreate,
      onAnnotationUpdate,
      onAnnotationDelete,
      onAnnotationSelect,
      onSignatureApply,
      onExportRequest,
      updateState,
      signatureData,
    });
    
    // Update refs on every render
    useEffect(() => {
      latestValues.current = {
        annotations,
        numPages,
        selectedAnnotationId,
        internalPage,
        onAnnotationCreate,
        onAnnotationUpdate,
        onAnnotationDelete,
        onAnnotationSelect,
        onSignatureApply,
        onExportRequest,
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

    function handleLoadSuccess(pdf: any) {
      const { numPages } = pdf;
      docProxyRef.current = pdf;
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

    // ---- annotation mutation helpers (keep internal state + notify parent) ----
    function handleAnnotationUpdate(id: string, updates: Partial<Annotation>) {
      const annotation = internalAnnotationsRef.current.find(a => a.id === id);
      if (!annotation) return;
      const updated: Annotation = { ...annotation, ...updates, modified: new Date() };
      const next = internalAnnotationsRef.current.map(a => a.id === id ? updated : a);
      setInternalAnnotations(next);
      latestValues.current.onAnnotationUpdate?.(updated);
      latestValues.current.updateState?.({ annotations: next });
    }

    async function handleAnnotationDelete(id: string) {
      // Use the always-current ref for the initial locked check
      const annotation = internalAnnotationsRef.current.find(a => a.id === id);
      // Respect the locked flag
      if (annotation?.properties.locked) return;
      // Allow the event handler to cancel deletion by returning false (mirrors onWillSubmit pattern)
      const result = await latestValues.current.onAnnotationDelete?.(id);
      if (result === false) return;
      const next = internalAnnotationsRef.current.filter(a => a.id !== id);
      setInternalAnnotations(next);
      latestValues.current.updateState?.({ annotations: next });
      if (selectedAnnotationId === id) setSelectedAnnotationId(undefined);
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
        previousPage: () => {
          const currentPage = latestValues.current.internalPage;
          if (currentPage > 1) {
            handlePageChange(currentPage - 1);
          }
        },
        nextPage: () => {
          const { internalPage, numPages } = latestValues.current;
          if (internalPage < (numPages ?? 1)) {
            handlePageChange(internalPage + 1);
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
        addAnnotation: (annotationData: any, scrollIntoView: boolean = false, scrollBehavior: "smooth" | "instant" = "smooth") => {
          const { onAnnotationCreate } = latestValues.current;
          const newAnnotation: Annotation = {
            ...annotationData,
            id: annotationData.id || `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            created: new Date(),
            modified: new Date(),
          };
          const next = [...internalAnnotationsRef.current, newAnnotation];
          setInternalAnnotations(next);
          latestValues.current.updateState?.({ annotations: next });
          onAnnotationCreate?.(newAnnotation);
          if (scrollIntoView && newAnnotation.page != null) {
            const viewport = viewportRef.current;
            if (viewport) {
              const pageEl = viewport.querySelector(
                `[data-page="${newAnnotation.page}"]`
              ) as HTMLElement | null;
              pageEl?.scrollIntoView({ behavior: scrollBehavior, block: "nearest" });
            }
          }
          return newAnnotation.id;
        },
        updateAnnotation: (id: string, updates: any) => {
          const { onAnnotationUpdate } = latestValues.current;
          const annotation = internalAnnotationsRef.current.find(a => a.id === id);
          if (!annotation) return;
          const updated = { ...annotation, ...updates, modified: new Date() };
          const next = internalAnnotationsRef.current.map(a => a.id === id ? updated : a);
          setInternalAnnotations(next);
          latestValues.current.updateState?.({ annotations: next });
          onAnnotationUpdate?.(updated);
        },
        deleteAnnotation: async (id: string) => {
          const { onAnnotationDelete } = latestValues.current;
          const annotation = internalAnnotationsRef.current.find(a => a.id === id);
          if (annotation?.properties.locked) return;
          const result = await onAnnotationDelete?.(id);
          if (result === false) return;
          const next = internalAnnotationsRef.current.filter(a => a.id !== id);
          setInternalAnnotations(next);
          latestValues.current.updateState?.({ annotations: next });
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
          setSignatureModalFieldId(fieldId);
        },
        applySignature: (fieldId: string, signature: SignatureData) => {
          latestValues.current.onSignatureApply?.(fieldId, signature);
        },
        getSignature: (fieldId?: string) => {
          if (fieldId) {
            return signaturesRef.current[fieldId] ?? null;
          }
          // Return all signatures
          return signaturesRef.current;
        },
        saveSignature: (fieldId: string, signature: SignatureData) => {
          signatureMethodsRef.current.saveSignature(fieldId, signature);
        },
        clearSignature: (fieldId: string) => {
          signatureMethodsRef.current.clearSignature(fieldId);
        },
        isSigned: (fieldId: string) => {
          return signatureMethodsRef.current.isSigned(fieldId);
        },
        exportToBackend: () => {
          const exportData: PdfExportData = {
            annotations: internalAnnotationsRef.current,
            signatures: signaturesRef.current,
            metadata: {
              exportedAt: new Date(),
              pageCount: latestValues.current.numPages ?? undefined,
            },
          };
          latestValues.current.onExportRequest?.(exportData);
        },
        // --- Document-level PDF.js APIs ---
        getMetadata: async () => {
          const proxy = docProxyRef.current;
          if (!proxy) return null;
          const { info, metadata } = await proxy.getMetadata();
          return {
            info,
            // Convert XMP metadata object to a plain key-value map when available
            xmp: metadata ? Object.fromEntries(
              (metadata as any)._metadataMap ?? []
            ) : null,
          };
        },
        getOutline: async () => {
          const proxy = docProxyRef.current;
          if (!proxy) return null;
          return proxy.getOutline();
        },
        getPageLabels: async () => {
          const proxy = docProxyRef.current;
          if (!proxy) return null;
          return proxy.getPageLabels();
        },
        getPermissions: async () => {
          const proxy = docProxyRef.current;
          if (!proxy) return null;
          return proxy.getPermissions();
        },
        getFieldObjects: async () => {
          const proxy = docProxyRef.current;
          if (!proxy) return null;
          return proxy.getFieldObjects();
        },
        getTextContent: async (pageNumber?: number) => {
          const proxy = docProxyRef.current;
          if (!proxy) return null;
          if (pageNumber != null) {
            // Single page
            const page = await proxy.getPage(pageNumber);
            const tc = await page.getTextContent();
            return tc.items.map((i: any) => i.str).join(" ");
          }
          // All pages — concatenate page-by-page
          const total = proxy.numPages as number;
          const parts: string[] = [];
          for (let p = 1; p <= total; p++) {
            const page = await proxy.getPage(p);
            const tc = await page.getTextContent();
            parts.push(tc.items.map((i: any) => i.str).join(" "));
          }
          return parts.join("\n");
        },
        getAttachments: async () => {
          const proxy = docProxyRef.current;
          if (!proxy) return null;
          return proxy.getAttachments();
        },
        getViewerPreferences: async () => {
          const proxy = docProxyRef.current;
          if (!proxy) return null;
          return proxy.getViewerPreferences();
        },
        getDestinations: async () => {
          const proxy = docProxyRef.current;
          if (!proxy) return null;
          return proxy.getDestinations();
        },
        getDestination: async (id: string) => {
          const proxy = docProxyRef.current;
          if (!proxy) return null;
          return proxy.getDestination(id);
        },
        hasJSActions: async () => {
          const proxy = docProxyRef.current;
          if (!proxy) return false;
          return proxy.hasJSActions();
        },
        getJSActions: async () => {
          const proxy = docProxyRef.current;
          if (!proxy) return null;
          return proxy.getJSActions();
        },
        getOptionalContentConfig: async () => {
          const proxy = docProxyRef.current;
          if (!proxy) return null;
          return proxy.getOptionalContentConfig();
        },
        getPageLayout: async () => {
          const proxy = docProxyRef.current;
          if (!proxy) return null;
          return proxy.getPageLayout();
        },
        getPageMode: async () => {
          const proxy = docProxyRef.current;
          if (!proxy) return null;
          return proxy.getPageMode();
        },
        getOpenAction: async () => {
          const proxy = docProxyRef.current;
          if (!proxy) return null;
          return proxy.getOpenAction();
        },
        getData: async () => {
          const proxy = docProxyRef.current;
          if (!proxy) return null;
          return proxy.getData();
        },
        getAnnotationsByType: async (types: Set<number>, pageIndexesToSkip?: Set<number>) => {
          const proxy = docProxyRef.current;
          if (!proxy) return null;
          return proxy.getAnnotationsByType(types, pageIndexesToSkip || new Set());
        },
        saveDocument: async () => {
          const proxy = docProxyRef.current;
          if (!proxy) return null;
          return proxy.saveDocument();
        },
        getMarkInfo: async () => {
          const proxy = docProxyRef.current;
          if (!proxy) return null;
          return proxy.getMarkInfo();
        },
        getDownloadInfo: async () => {
          const proxy = docProxyRef.current;
          if (!proxy) return null;
          return proxy.getDownloadInfo();
        },
      });
    }, [registerComponentApi]); // Only re-run if registerComponentApi function itself changes

    // Use data if provided, otherwise use src
    const fileSource = data || src;

    // Memoize options to prevent unnecessary reloads  
    const documentOptions = useMemo(() => ({
      verbosity: 1, // Enable warnings and errors
      wasmUrl: "/wasm/", // Location of WASM decoders for image processing
    }), []);

    // Handle signature capture from modal
    function handleSignatureCapture(fieldId: string, signature: SignatureData) {
      // Fire events
      onSignatureCapture?.(signature);
      onSignatureApply?.(fieldId, signature);
      // Store signature in signatures hook storage
      signatureMethodsRef.current.saveSignature(fieldId, signature);
      // Store signer metadata in a separate ref so it survives annotation prop re-syncs
      const now = createSignatureTimestamp();
      signatureMetaRef.current.set(fieldId, {
        signerName: signature.signerName ?? "",
        signerFontIndex: signature.signerFontIndex ?? 0,
      });
      // Apply signature image to the annotation value with metadata
      const next = internalAnnotationsRef.current.map(a =>
        a.id === fieldId
          ? {
              ...a,
              value: signature.data,
              properties: {
                ...(a.properties || {}),
                signerDate: now,
              },
              modified: new Date(),
            }
          : a
      );
      setInternalAnnotations(next);
      updateState?.({ annotations: next });
      setSignatureModalFieldId(null);
    }

      // Handle signature clear from annotation
    function handleSignatureClear(fieldId: string) {
      // Fire clear event (null signature indicates clearing)
      onSignatureApply?.(fieldId, null as any);
      
      signatureMethodsRef.current.clearSignature(fieldId);
      signatureMetaRef.current.delete(fieldId);
      const next = internalAnnotationsRef.current.map(a =>
        a.id === fieldId
          ? {
              ...a,
              value: undefined,
              properties: {
                ...(a.properties || {}),
                signerName: undefined,
                signerFontIndex: undefined,
                signerDate: undefined,
              },
              modified: new Date(),
            }
          : a
      );
      setInternalAnnotations(next);
      updateState?.({ annotations: next });
    }

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
        <div
          ref={viewportRef}
          className={styles.viewport}
          data-scroll-style={scrollStyle}
          data-scrolling={scrollStyle === "whenScrolling" ? "false" : undefined}
          onScroll={handleViewportScroll}
          style={{
            flex: 1,
            minHeight: 0,
            overflow: scrollStyle === "overlay" ? "scroll" : "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: horizontalAlignment,
            justifyContent: verticalAlignment,
          }}
        >
          <Document
          file={fileSource as any}
          onLoadSuccess={handleLoadSuccess}
          className={styles.document}
          options={documentOptions}
        >
          {Array.from(new Array(numPages), (_, index) => {
            const pageNumber = index + 1;
            // TODO: Get actual page dimensions from PDF
            // For now, use standard A4 dimensions (595 x 842 points)
            const pageWidth = 595;
            const pageHeight = 842;
            
            return (
              <div key={pageNumber} data-page={pageNumber} className={styles.pageContainer}>
                <Page
                  pageNumber={pageNumber}
                  loading=""
                  className={styles.page}
                  scale={internalScale}
                  renderMode="canvas"
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  canvasBackground="white"
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
                    onAnnotationRequestSign={(id) => setSignatureModalFieldId(id)}
                    onAnnotationClearSign={handleSignatureClear}
                  />
                )}
              </div>
            );
          })}
        </Document>
        </div>
        {/* Signature capture modal — rendered outside the scroll container so it
            overlays the entire PDF component */}
        {signatureModalFieldId !== null && (() => {
          const meta = signatureMetaRef.current.get(signatureModalFieldId);
          return (
            <SignatureCapture
              fieldId={signatureModalFieldId}
              initialName={meta?.signerName ?? ""}
              initialFontIndex={meta?.signerFontIndex ?? 0}
              onCapture={handleSignatureCapture}
              onClose={() => setSignatureModalFieldId(null)}
            />
          );
        })()}
      </div>
    );
  }
);

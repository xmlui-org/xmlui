import { createComponentRenderer, createMetadata, d, parseScssVar } from "xmlui";
import { LazyPdf } from "./LazyPdfNative";
import styles from "./Pdf.module.scss";
import type { Annotation } from "./types/annotation.types";

const COMP = "Pdf";

// Default prop values (duplicated from PdfNative to avoid static import)
const defaultProps = {
  mode: "view" as "view" | "edit",
  scale: 1.0,
  annotations: [] as Annotation[],
  showToolbar: false,
  showProperties: false,
};

export const PdfMd = createMetadata({
  description: `The \`${COMP}\` component provides a PDF viewer with annotation and signing capabilities.`,
  status: "experimental",
  props: {
    src: {
      description: `This property defines the source URL of the PDF document to display.`,
      valueType: "string",
    },
    data: d(
      `This property contains the binary data that represents the PDF document for in-memory display. ` +
      `Supports: ArrayBuffer, Uint8Array, Blob, File, or data URL string. ` +
      `Example: \`data={arrayBuffer}\` or \`data={blob}\` or \`data="data:application/pdf;base64,..."\`.`,
    ),
    mode: {
      description: `Display mode: "view" for read-only or "edit" for annotation editing. Default: "${defaultProps.mode}".`,
      valueType: "string",
    },
    scale: {
      description: `Zoom level for the PDF pages. Default: ${defaultProps.scale}.`,
      valueType: "number",
    },
    currentPage: {
      description: `Current page number (1-indexed). When provided, page navigation is controlled by parent.`,
      valueType: "number",
    },
    annotations: d(
      `Array of annotations to display on the PDF. Each annotation has id, type, position, size, and properties.`,
    ),
    signatureData: d(
      `Pre-loaded signature data to apply to signature fields.`,
    ),
    showToolbar: {
      description: `When true, shows the annotation toolbar for adding new annotation fields. Default: ${defaultProps.showToolbar}.`,
      valueType: "boolean",
    },
    showProperties: {
      description: `When true, shows the properties panel for editing the selected annotation. Default: ${defaultProps.showProperties}.`,
      valueType: "boolean",
    },
  },
  events: {
    onDocumentLoad: d(`Fired when the PDF document is loaded successfully.`),
    onPageChange: d(`Fired when the current page changes.`),
    onAnnotationCreate: d(`Fired when a new annotation is created.`),
    onAnnotationUpdate: d(`Fired when an annotation is modified.`),
    onAnnotationDelete: d(`Fired when an annotation is about to be deleted. Return false from the handler to cancel the deletion.`),
    onAnnotationSelect: d(`Fired when an annotation is selected.`),
    onSignatureCapture: d(`Fired when a signature is captured (Phase 2).`),
    onSignatureApply: d(`Fired when a signature is applied to a field (Phase 2).`),
  },
  apis: {
    goToPage: {
      description: `Navigate to a specific page.`,
      args: [{ name: "page", valueType: "number" }],
    },
    setScale: {
      description: `Set the zoom level to an exact value (clamped between 0.1 and 5).`,
      args: [{ name: "scale", valueType: "number" }],
    },
    zoomTo: {
      description: `Zoom to an exact scale value (clamped between 0.1 and 5). Alias for setScale.`,
      args: [{ name: "scale", valueType: "number" }],
    },
    zoomIn: {
      description: `Zoom in by a multiplicative factor (default 1.25).`,
      args: [{ name: "factor", valueType: "number" }],
    },
    zoomOut: {
      description: `Zoom out by a multiplicative factor (default 1.25).`,
      args: [{ name: "factor", valueType: "number" }],
    },
    actualSize: {
      description: `Reset zoom to 100% (scale = 1.0).`,
      args: [],
    },
    fitWidth: {
      description: `Scale the PDF so the page width fills the available viewport width.`,
      args: [],
    },
    fitPage: {
      description: `Scale the PDF so the full page fits within the visible viewport (both width and height).`,
      args: [],
    },
    getScale: {
      description: `Return the current scale value.`,
      args: [],
    },
    addAnnotation: {
      description: `Add a new annotation. Returns the annotation ID.`,
      args: [{ name: "annotationData", valueType: "object" }],
    },
    updateAnnotation: {
      description: `Update an existing annotation.`,
      args: [
        { name: "id", valueType: "string" },
        { name: "updates", valueType: "object" },
      ],
    },
    deleteAnnotation: {
      description: `Delete an annotation by ID.`,
      args: [{ name: "id", valueType: "string" }],
    },
    getAnnotations: {
      description: `Get all current annotations.`,
      args: [],
    },
    selectAnnotation: {
      description: `Select an annotation by ID, highlighting it in the PDF.`,
      args: [{ name: "id", valueType: "string" }],
    },
    deselectAnnotation: {
      description: `Deselect the currently selected annotation.`,
      args: [],
    },
    getSelectedAnnotationId: {
      description: `Return the ID of the currently selected annotation, or null if none.`,
      args: [],
    },
    getSelectedAnnotation: {
      description: `Return the full annotation object that is currently selected, or null if none.`,
      args: [],
    },
    openSignatureModal: {
      description: `Open signature capture modal for a field (Phase 2).`,
      args: [{ name: "fieldId", valueType: "string" }],
    },
    applySignature: {
      description: `Apply signature to a field (Phase 2).`,
      args: [
        { name: "fieldId", valueType: "string" },
        { name: "signature", valueType: "object" },
      ],
    },
    getSignature: {
      description: `Get the current signature data (Phase 2).`,
      args: [],
    },
  },
  contextVars: {
    $pageCount: d(`Total number of pages in the PDF.`),
    $currentPage: d(`Current page number (1-indexed).`),
    $annotations: d(`Array of all annotations.`),
    $mode: d(`Current display mode ("view" or "edit").`),
    $scale: d(`Current zoom scale (e.g. 1.0 = 100%).`),
    $hasSignature: d(`Whether a signature has been captured (Phase 2).`),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // Page styling
    "boxShadow-page-Pdf": "$boxShadow-md",
    "gap-pages-Pdf": "$space-4",
    
    // Annotation box styling
    "borderColor-annotationBox-Pdf": "transparent",
    "backgroundColor-annotationBox-Pdf": "rgba(255, 255, 255, 0.8)",
    "borderColor-selected-Pdf": "#007bff",
    "boxShadow-selected-Pdf": "0 0 0 2px rgba(0, 123, 255, 0.25)",
    
    // Type-specific background colors
    "backgroundColor-text-Pdf": "rgba(255, 255, 220, 0.8)",
    "backgroundColor-checkbox-Pdf": "rgba(220, 255, 220, 0.8)",
    "backgroundColor-signature-Pdf": "rgba(220, 220, 255, 0.8)",
    
    // Text styling
    "color-label-Pdf": "#333",
    "color-value-Pdf": "#666",
    
    // Delete button styling
    "backgroundColor-deleteButton-Pdf": "#dc3545",
    "backgroundColor-deleteButton-hover-Pdf": "#c82333",
    "color-deleteButton-Pdf": "white",
    
    // Resize handle styling
    "backgroundColor-resizeHandle-Pdf": "#007bff",
    "backgroundColor-resizeHandle-hover-Pdf": "#0056b3",
    
    // Toolbar styling
    "backgroundColor-toolbar-Pdf": "#f8f9fa",
    "borderColor-toolbar-Pdf": "#dee2e6",
    "color-toolbarTitle-Pdf": "#333",
    "backgroundColor-toolbarButton-Pdf": "#fff",
    "backgroundColor-toolbarButton-hover-Pdf": "#e9ecef",
    "borderColor-toolbarButton-Pdf": "#ced4da",
    "color-toolbarButton-Pdf": "#495057",
    "color-toolbarIcon-Pdf": "#007bff",
    
    // Properties panel styling
    "backgroundColor-propertiesPanel-Pdf": "#f8f9fa",
    "borderColor-propertiesPanel-Pdf": "#dee2e6",
    "color-propertiesTitle-Pdf": "#212529",
    "color-propertiesLabel-Pdf": "#495057",
    "backgroundColor-propertyInput-Pdf": "white",
    "borderColor-propertyInput-Pdf": "#ced4da",
    "borderColor-propertyInput-focus-Pdf": "#007bff",
  },
});

export const pdfComponentRenderer = createComponentRenderer(
  COMP,
  PdfMd,
  ({ node, extractValue, lookupEventHandler, registerComponentApi, updateState, state, uid, className }) => {
    const props = node.props as typeof PdfMd.props;
    
    return (
      <LazyPdf
        id={String(uid)}
        className={className}
        src={extractValue(props?.src)}
        data={extractValue(props?.data)}
        mode={extractValue.asOptionalString(props?.mode, defaultProps.mode) as "view" | "edit"}
        scale={extractValue.asOptionalNumber(props?.scale, defaultProps.scale)}
        currentPage={extractValue.asOptionalNumber(props?.currentPage)}
        annotations={extractValue(props?.annotations) || defaultProps.annotations}
        signatureData={extractValue(props?.signatureData)}
        showToolbar={extractValue.asOptionalBoolean(props?.showToolbar, defaultProps.showToolbar)}
        showProperties={extractValue.asOptionalBoolean(props?.showProperties, defaultProps.showProperties)}
        onDocumentLoad={lookupEventHandler("documentLoad")}
        onPageChange={lookupEventHandler("pageChange")}
        onAnnotationCreate={lookupEventHandler("annotationCreate")}
        onAnnotationUpdate={lookupEventHandler("annotationUpdate")}
        onAnnotationDelete={lookupEventHandler("annotationDelete")}
        onAnnotationSelect={lookupEventHandler("annotationSelect")}
        onSignatureCapture={lookupEventHandler("signatureCapture")}
        onSignatureApply={lookupEventHandler("signatureApply")}
        registerComponentApi={registerComponentApi}
        updateState={updateState}
      />
    );
  },
);

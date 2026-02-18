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
      `This property contains the binary data that represents the PDF document.`,
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
  },
  events: {
    onDocumentLoad: d(`Fired when the PDF document is loaded successfully.`),
    onPageChange: d(`Fired when the current page changes.`),
    onAnnotationCreate: d(`Fired when a new annotation is created.`),
    onAnnotationUpdate: d(`Fired when an annotation is modified.`),
    onAnnotationDelete: d(`Fired when an annotation is deleted.`),
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
      description: `Set the zoom level.`,
      args: [{ name: "scale", valueType: "number" }],
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
  ({ node, extractValue, lookupEventHandler, registerComponentApi, updateState, state, uid }) => {
    const props = node.props as typeof PdfMd.props;
    
    return (
      <LazyPdf
        id={uid}
        src={extractValue(props?.src)}
        data={extractValue(props?.data)}
        mode={extractValue.asOptionalString(props?.mode, defaultProps.mode) as "view" | "edit"}
        scale={extractValue.asOptionalNumber(props?.scale, defaultProps.scale)}
        currentPage={extractValue.asOptionalNumber(props?.currentPage)}
        annotations={extractValue(props?.annotations) || defaultProps.annotations}
        signatureData={extractValue(props?.signatureData)}
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

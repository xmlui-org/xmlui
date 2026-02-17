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
    "boxShadow-page-Pdf": "$boxShadow-md",
    "gap-pages-Pdf": "$space-4",
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

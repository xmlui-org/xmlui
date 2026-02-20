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
  horizontalAlignment: "start" as "start" | "center" | "end",
  verticalAlignment: "start" as "start" | "center" | "end",
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
    horizontalAlignment: {
      description: `Horizontal alignment of PDF pages within the viewer. Options: "start" (default), "center", "end".`,
      valueType: "string",
    },
    verticalAlignment: {
      description: `Vertical alignment of PDF pages within the viewer. Options: "start" (default), "center", "end".`,
      valueType: "string",
    },
  },
  events: {
    documentLoad: {
      description: `Fired when the PDF document is loaded successfully.`,
      signature: "documentLoad(pageCount: number): void",
      parameters: {
        pageCount: "The total number of pages in the loaded document.",
      },
    },
    pageChange: {
      description: `Fired when the current page changes.`,
      signature: "pageChange(page: number): void",
      parameters: {
        page: "The new current page number (1-indexed).",
      },
    },
    annotationCreate: {
      description: `Fired when a new annotation is created.`,
      signature: "annotationCreate(annotation: Annotation): void",
      parameters: {
        annotation: "The newly created annotation object.",
      },
    },
    annotationUpdate: {
      description: `Fired when an annotation is modified.`,
      signature: "annotationUpdate(annotation: Annotation): void",
      parameters: {
        annotation: "The updated annotation object.",
      },
    },
    annotationDelete: {
      description:
        `Fired when an annotation is about to be deleted. ` +
        `Return \`false\` from the handler to cancel the deletion.`,
      signature: "annotationDelete(id: string): false | void | Promise<false | void>",
      parameters: {
        id: "The ID of the annotation that is about to be deleted.",
      },
    },
    annotationSelect: {
      description: `Fired when an annotation is selected or deselected.`,
      signature: "annotationSelect(id: string | null): void",
      parameters: {
        id: "The ID of the selected annotation, or null when the selection is cleared.",
      },
    },
    signatureCapture: {
      description: `Fired when a signature is captured via the signature modal.`,
      signature: "signatureCapture(signature: object): void",
      parameters: {
        signature: "The captured signature data.",
      },
    },
    signatureApply: {
      description: `Fired when a captured signature is applied to a signature field.`,
      signature: "signatureApply(fieldId: string, signature: object): void",
      parameters: {
        fieldId: "The ID of the signature field the signature was applied to.",
        signature: "The signature data that was applied.",
      },
    },
    exportRequest: {
      description: `Fired when the user requests to export the PDF with annotations and signatures to the backend.`,
      signature: "exportRequest(data: PdfExportData): void",
      parameters: {
        data: "An object containing annotations, signatures, and metadata ready for backend export.",
      },
    },
  },
  apis: {
    goToPage: {
      description: `Navigate to a specific page.`,
      signature: "goToPage(page: number): void",
      parameters: {
        page: "The 1-indexed page number to navigate to.",
      },
    },
    setScale: {
      description: `Set the zoom level to an exact value (clamped between 0.1 and 5).`,
      signature: "setScale(scale: number): void",
      parameters: {
        scale: "The scale factor to apply (e.g. 1.0 for 100%, 1.5 for 150%).",
      },
    },
    zoomTo: {
      description: `Zoom to an exact scale value (clamped between 0.1 and 5). Alias for setScale.`,
      signature: "zoomTo(scale: number): void",
      parameters: {
        scale: "The scale factor to apply (e.g. 1.0 for 100%, 1.5 for 150%).",
      },
    },
    zoomIn: {
      description: `Zoom in by a multiplicative factor (default 1.25).`,
      signature: "zoomIn(factor?: number): void",
      parameters: {
        factor: "Multiplicative factor to zoom in by. Defaults to 1.25.",
      },
    },
    zoomOut: {
      description: `Zoom out by a multiplicative factor (default 1.25).`,
      signature: "zoomOut(factor?: number): void",
      parameters: {
        factor: "Multiplicative factor to zoom out by. Defaults to 1.25.",
      },
    },
    actualSize: {
      description: `Reset zoom to 100% (scale = 1.0).`,
      signature: "actualSize(): void",
    },
    fitWidth: {
      description: `Scale the PDF so the page width fills the available viewport width.`,
      signature: "fitWidth(): void",
    },
    fitPage: {
      description: `Scale the PDF so the full page fits within the visible viewport (both width and height).`,
      signature: "fitPage(): void",
    },
    getScale: {
      description: `Return the current scale value.`,
      signature: "getScale(): number",
      returns: "The current scale factor (e.g. 1.0 for 100%).",
    },
    addAnnotation: {
      description: `Add a new annotation. Returns the newly assigned annotation ID.`,
      signature: "addAnnotation(annotationData: object): string",
      parameters: {
        annotationData: "An object describing the annotation to add (type, page, position, size, properties).",
      },
      returns: "The unique ID assigned to the new annotation.",
    },
    updateAnnotation: {
      description: `Update an existing annotation by ID.`,
      signature: "updateAnnotation(id: string, updates: object): void",
      parameters: {
        id: "The ID of the annotation to update.",
        updates: "An object containing the fields to update on the annotation.",
      },
    },
    deleteAnnotation: {
      description: `Delete an annotation by ID.`,
      signature: "deleteAnnotation(id: string): void",
      parameters: {
        id: "The ID of the annotation to delete.",
      },
    },
    getAnnotations: {
      description: `Get all current annotations.`,
      signature: "getAnnotations(): Annotation[]",
      returns: "Array of all current annotations.",
    },
    selectAnnotation: {
      description: `Select an annotation by ID, highlighting it in the PDF.`,
      signature: "selectAnnotation(id: string): void",
      parameters: {
        id: "The ID of the annotation to select.",
      },
    },
    deselectAnnotation: {
      description: `Deselect the currently selected annotation.`,
      signature: "deselectAnnotation(): void",
    },
    getSelectedAnnotationId: {
      description: `Return the ID of the currently selected annotation, or null if none.`,
      signature: "getSelectedAnnotationId(): string | null",
      returns: "The ID of the currently selected annotation, or null if none is selected.",
    },
    getSelectedAnnotation: {
      description: `Return the full annotation object that is currently selected, or null if none.`,
      signature: "getSelectedAnnotation(): Annotation | null",
      returns: "The currently selected annotation object, or null if none is selected.",
    },
    openSignatureModal: {
      description: `Open the signature capture modal for a signature field. The user can type their name and choose a font style, then apply the signature to the field.`,
      signature: "openSignatureModal(fieldId: string): void",
      parameters: {
        fieldId: "The ID of the signature field to open the capture modal for.",
      },
    },
    applySignature: {
      description: `Apply a captured signature to a signature field.`,
      signature: "applySignature(fieldId: string, signature: object): void",
      parameters: {
        fieldId: "The ID of the signature field to apply the signature to.",
        signature: "The signature data object to apply.",
      },
    },
    getSignature: {
      description: `Retrieve stored signature data. Supports retrieving a specific signature by fieldId or all stored signatures.`,
      signature: "getSignature(fieldId?: string): object | object[] | null",
      parameters: {
        fieldId: "Optional. The ID of a specific signature field. If omitted, returns all stored signatures.",
      },
      returns: "The requested signature data, an object containing all signatures if no fieldId provided, or null if no signature exists.",
    },
    saveSignature: {
      description: `Save a signature to storage for later retrieval and reuse across fields.`,
      signature: "saveSignature(fieldId: string, signature: object): void",
      parameters: {
        fieldId: "The ID of the field to associate with this signature.",
        signature: "The signature data object to save.",
      },
    },
    clearSignature: {
      description: `Clear/remove a signature from storage.`,
      signature: "clearSignature(fieldId: string): void",
      parameters: {
        fieldId: "The ID of the field whose signature should be cleared.",
      },
    },
    isSigned: {
      description: `Check if a signature field has been signed.`,
      signature: "isSigned(fieldId: string): boolean",
      parameters: {
        fieldId: "The ID of the field to check.",
      },
      returns: "True if the field has a valid signature, false otherwise.",
    },
    exportToBackend: {
      description: `Collect all annotations and signatures and trigger the onExportRequest event. Use this to prepare data for backend processing to flatten annotations and save the PDF.`,
      signature: "exportToBackend(): void",
      returns: "Fires onExportRequest event with PdfExportData containing annotations, signatures, and metadata.",
    },
  },
  contextVars: {
    $pageCount: d(`Total number of pages in the PDF.`),
    $currentPage: d(`Current page number (1-indexed).`),
    $annotations: d(`Array of all annotations.`),
    $mode: d(`Current display mode ("view" or "edit").`),
    $scale: d(`Current zoom scale (e.g. 1.0 = 100%).`),
    $hasSignature: d(`Whether a signature has been captured (Phase 2).`),
    $formValues: d(`Object containing the current values of all AcroForm fields, keyed by field name.`),
    $formFields: d(`Array of { field, value, type } objects for all AcroForm fields, ready for use as Table data.`),
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
    "backgroundColor-deleteButton-Pdf": "#dc3545",
    "backgroundColor-deleteButton-hover-Pdf": "#c82333",
    "color-deleteButton-Pdf": "white",
    
    // Resize handle styling
    "backgroundColor-resizeHandle-Pdf": "#007bff",
    "backgroundColor-resizeHandle-hover-Pdf": "#0056b3",
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
        horizontalAlignment={extractValue.asOptionalString(props?.horizontalAlignment, defaultProps.horizontalAlignment) as "start" | "center" | "end"}
        verticalAlignment={extractValue.asOptionalString(props?.verticalAlignment, defaultProps.verticalAlignment) as "start" | "center" | "end"}
        onDocumentLoad={lookupEventHandler("documentLoad")}
        onPageChange={lookupEventHandler("pageChange")}
        onAnnotationCreate={lookupEventHandler("annotationCreate")}
        onAnnotationUpdate={lookupEventHandler("annotationUpdate")}
        onAnnotationDelete={lookupEventHandler("annotationDelete")}
        onAnnotationSelect={lookupEventHandler("annotationSelect")}
        onSignatureCapture={lookupEventHandler("signatureCapture")}
        onSignatureApply={lookupEventHandler("signatureApply")}
        onExportRequest={lookupEventHandler("exportRequest")}
        registerComponentApi={registerComponentApi}
        updateState={updateState}
      />
    );
  },
);

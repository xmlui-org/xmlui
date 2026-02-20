# Pdf [#pdf]

The `Pdf` component provides a PDF viewer with annotation and signing capabilities.

**Context variables available during execution:**

- `$annotations`: Array of all annotations.
- `$currentPage`: Current page number (1-indexed).
- `$hasSignature`: Whether a signature has been captured (Phase 2).
- `$mode`: Current display mode ("view" or "edit").
- `$pageCount`: Total number of pages in the PDF.
- `$scale`: Current zoom scale (e.g. 1.0 = 100%).

## Behaviors

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties

### `annotations`

Array of annotations to display on the PDF. Each annotation has id, type, position, size, and properties.

### `currentPage`

Current page number (1-indexed). When provided, page navigation is controlled by parent.

### `data`

This property contains the binary data that represents the PDF document for in-memory display. Supports: ArrayBuffer, Uint8Array, Blob, File, or data URL string. Example: `data={arrayBuffer}` or `data={blob}` or `data="data:application/pdf;base64,..."`.

### `horizontalAlignment`

Horizontal alignment of PDF pages within the viewer. Options: "start" (default), "center", "end".

### `mode`

Display mode: "view" for read-only or "edit" for annotation editing. Default: "view".

### `scale`

Zoom level for the PDF pages. Default: 1.

### `signatureData`

Pre-loaded signature data to apply to signature fields.

### `src`

This property defines the source URL of the PDF document to display.

### `verticalAlignment`

Vertical alignment of PDF pages within the viewer. Options: "start" (default), "center", "end".

## Events

### `annotationCreate`

Fired when a new annotation is created.

**Signature**: `annotationCreate(annotation: Annotation): void`

- `annotation`: The newly created annotation object.

### `annotationDelete`

Fired when an annotation is about to be deleted. Return `false` from the handler to cancel the deletion.

**Signature**: `annotationDelete(id: string): false | void | Promise<false | void>`

- `id`: The ID of the annotation that is about to be deleted.

### `annotationSelect`

Fired when an annotation is selected or deselected.

**Signature**: `annotationSelect(id: string | null): void`

- `id`: The ID of the selected annotation, or null when the selection is cleared.

### `annotationUpdate`

Fired when an annotation is modified.

**Signature**: `annotationUpdate(annotation: Annotation): void`

- `annotation`: The updated annotation object.

### `documentLoad`

Fired when the PDF document is loaded successfully.

**Signature**: `documentLoad(pageCount: number): void`

- `pageCount`: The total number of pages in the loaded document.

### `exportRequest`

Fired when the user requests to export the PDF with annotations and signatures to the backend.

**Signature**: `exportRequest(data: PdfExportData): void`

- `data`: An object containing annotations, signatures, and metadata ready for backend export.

### `pageChange`

Fired when the current page changes.

**Signature**: `pageChange(page: number): void`

- `page`: The new current page number (1-indexed).

### `signatureApply`

Fired when a captured signature is applied to a signature field.

**Signature**: `signatureApply(fieldId: string, signature: object): void`

- `fieldId`: The ID of the signature field the signature was applied to.
- `signature`: The signature data that was applied.

### `signatureCapture`

Fired when a signature is captured via the signature modal.

**Signature**: `signatureCapture(signature: object): void`

- `signature`: The captured signature data.

## Exposed Methods

### `actualSize`

Reset zoom to 100% (scale = 1.0).

**Signature**: `actualSize(): void`

### `addAnnotation`

Add a new annotation. Returns the newly assigned annotation ID.

**Signature**: `addAnnotation(annotationData: object): string`

- `annotationData`: An object describing the annotation to add (type, page, position, size, properties).

### `applySignature`

Apply a captured signature to a signature field.

**Signature**: `applySignature(fieldId: string, signature: object): void`

- `fieldId`: The ID of the signature field to apply the signature to.
- `signature`: The signature data object to apply.

### `clearSignature`

Clear/remove a signature from storage.

**Signature**: `clearSignature(fieldId: string): void`

- `fieldId`: The ID of the field whose signature should be cleared.

### `deleteAnnotation`

Delete an annotation by ID.

**Signature**: `deleteAnnotation(id: string): void`

- `id`: The ID of the annotation to delete.

### `deselectAnnotation`

Deselect the currently selected annotation.

**Signature**: `deselectAnnotation(): void`

### `exportToBackend`

Collect all annotations and signatures and trigger the onExportRequest event. Use this to prepare data for backend processing to flatten annotations and save the PDF.

**Signature**: `exportToBackend(): void`

### `fitPage`

Scale the PDF so the full page fits within the visible viewport (both width and height).

**Signature**: `fitPage(): void`

### `fitWidth`

Scale the PDF so the page width fills the available viewport width.

**Signature**: `fitWidth(): void`

### `getAnnotations`

Get all current annotations.

**Signature**: `getAnnotations(): Annotation[]`

### `getScale`

Return the current scale value.

**Signature**: `getScale(): number`

### `getSelectedAnnotation`

Return the full annotation object that is currently selected, or null if none.

**Signature**: `getSelectedAnnotation(): Annotation | null`

### `getSelectedAnnotationId`

Return the ID of the currently selected annotation, or null if none.

**Signature**: `getSelectedAnnotationId(): string | null`

### `getSignature`

Retrieve stored signature data. Supports retrieving a specific signature by fieldId or all stored signatures.

**Signature**: `getSignature(fieldId?: string): object | object[] | null`

- `fieldId`: Optional. The ID of a specific signature field. If omitted, returns all stored signatures.

### `goToPage`

Navigate to a specific page.

**Signature**: `goToPage(page: number): void`

- `page`: The 1-indexed page number to navigate to.

### `isSigned`

Check if a signature field has been signed.

**Signature**: `isSigned(fieldId: string): boolean`

- `fieldId`: The ID of the field to check.

### `openSignatureModal`

Open the signature capture modal for a signature field. The user can type their name and choose a font style, then apply the signature to the field.

**Signature**: `openSignatureModal(fieldId: string): void`

- `fieldId`: The ID of the signature field to open the capture modal for.

### `saveSignature`

Save a signature to storage for later retrieval and reuse across fields.

**Signature**: `saveSignature(fieldId: string, signature: object): void`

- `fieldId`: The ID of the field to associate with this signature.
- `signature`: The signature data object to save.

### `selectAnnotation`

Select an annotation by ID, highlighting it in the PDF.

**Signature**: `selectAnnotation(id: string): void`

- `id`: The ID of the annotation to select.

### `setScale`

Set the zoom level to an exact value (clamped between 0.1 and 5).

**Signature**: `setScale(scale: number): void`

- `scale`: The scale factor to apply (e.g. 1.0 for 100%, 1.5 for 150%).

### `updateAnnotation`

Update an existing annotation by ID.

**Signature**: `updateAnnotation(id: string, updates: object): void`

- `id`: The ID of the annotation to update.
- `updates`: An object containing the fields to update on the annotation.

### `zoomIn`

Zoom in by a multiplicative factor (default 1.25).

**Signature**: `zoomIn(factor?: number): void`

- `factor`: Multiplicative factor to zoom in by. Defaults to 1.25.

### `zoomOut`

Zoom out by a multiplicative factor (default 1.25).

**Signature**: `zoomOut(factor?: number): void`

- `factor`: Multiplicative factor to zoom out by. Defaults to 1.25.

### `zoomTo`

Zoom to an exact scale value (clamped between 0.1 and 5). Alias for setScale.

**Signature**: `zoomTo(scale: number): void`

- `scale`: The scale factor to apply (e.g. 1.0 for 100%, 1.5 for 150%).

## Styling

### Theme Variables

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-annotationBox-Pdf | rgba(255, 255, 255, 0.8) | rgba(255, 255, 255, 0.8) |
| [backgroundColor](../styles-and-themes/common-units/#color)-checkbox-Pdf | rgba(220, 255, 220, 0.8) | rgba(220, 255, 220, 0.8) |
| [backgroundColor](../styles-and-themes/common-units/#color)-deleteButton-hover-Pdf | #c82333 | #c82333 |
| [backgroundColor](../styles-and-themes/common-units/#color)-deleteButton-Pdf | #dc3545 | #dc3545 |
| [backgroundColor](../styles-and-themes/common-units/#color)-field-Pdf | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-resizeHandle-hover-Pdf | #0056b3 | #0056b3 |
| [backgroundColor](../styles-and-themes/common-units/#color)-resizeHandle-Pdf | #007bff | #007bff |
| [backgroundColor](../styles-and-themes/common-units/#color)-signature-Pdf | rgba(220, 220, 255, 0.8) | rgba(220, 220, 255, 0.8) |
| [backgroundColor](../styles-and-themes/common-units/#color)-text-Pdf | rgba(255, 255, 220, 0.8) | rgba(255, 255, 220, 0.8) |
| [backgroundColor](../styles-and-themes/common-units/#color)-toolbar-Pdf | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-annotationBox-Pdf | transparent | transparent |
| [borderColor](../styles-and-themes/common-units/#color)-field-Pdf | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-selected-Pdf | #007bff | #007bff |
| [borderColor](../styles-and-themes/common-units/#color)-toolbar-Pdf | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-page-Pdf | $boxShadow-md | $boxShadow-md |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-selected-Pdf | 0 0 0 2px rgba(0, 123, 255, 0.25) | 0 0 0 2px rgba(0, 123, 255, 0.25) |
| [color](../styles-and-themes/common-units/#color)-delete-Pdf | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-deleteButton-Pdf | white | white |
| [color](../styles-and-themes/common-units/#color)-label-Pdf | #333 | #333 |
| [color](../styles-and-themes/common-units/#color)-resizeHandle-Pdf | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-selected-Pdf | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-value-Pdf | #666 | #666 |
| [gap](../styles-and-themes/common-units/#size)-pages-Pdf | $space-4 | $space-4 |

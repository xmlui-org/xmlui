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

### `scrollStyle`

> [!DEF]  default: **"normal"**

This property controls the scrollbar display style of the PDF viewport. `normal` (default) shows scrollbars whenever content overflows. `overlay` always shows both scrollbars. `whenMouseOver` hides scrollbars until the pointer enters the viewer. `whenScrolling` hides scrollbars and reveals them briefly while the user is actively scrolling.

Available values: `normal` **(default)**, `overlay`, `whenMouseOver`, `whenScrolling`

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

Add a new annotation to a specific page. The `page` field in `annotationData` (1-based) determines which page the annotation appears on. When `scrollIntoView` is `true` the viewer automatically scrolls that page into view. Returns the newly assigned annotation ID.

**Signature**: `addAnnotation(annotationData: object, scrollIntoView?: boolean, scrollBehavior?: string): string`

- `annotationData`: An object describing the annotation to add. Include `page` (1-based) to place it on a specific page.
- `scrollIntoView`: When true, scrolls the annotation's page into view after adding. Defaults to false.
- `scrollBehavior`: Controls the scroll animation: `"smooth"` (default) animates the scroll, `"instant"` jumps immediately.

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

### `exportAnnotations`

Collect all annotations and signatures and trigger the onExportRequest event. Use this to prepare data for backend processing to flatten annotations and save the PDF.

**Signature**: `exportAnnotations(): void`

### `exportToPdf`

Export the PDF with all XMLUI annotations (signatures, text fields, checkboxes) embedded as real PDF content using pdf-lib. The returned `Uint8Array` can be downloaded or sent to a backend. Unlike `saveDocument()`, this output is fully readable in Acrobat Reader and any standard PDF viewer.

**Signature**: `exportToPdf(): Promise<Uint8Array | null>`

### `fitPage`

Scale the PDF so the full page fits within the visible viewport (both width and height).

**Signature**: `fitPage(): void`

### `fitWidth`

Scale the PDF so the page width fills the available viewport width.

**Signature**: `fitWidth(): void`

### `getAnnotations`

Get all current annotations.

**Signature**: `getAnnotations(): Annotation[]`

### `getAnnotationsByType`

Retrieve annotations filtered by type from across the entire document. More efficient than getAnnotations() when you only need specific annotation types.

**Signature**: `getAnnotationsByType(types: Set<number>, pageIndexesToSkip?: Set<number>): Promise<object[] | null>`

- `types`: A Set of PDF annotation type IDs to retrieve (e.g., annotation type constants from PDF.js)
- `pageIndexesToSkip`: Optional Set of 0-indexed page numbers to exclude from the search. Omit to search all pages.

### `getAttachments`

Retrieve embedded files (attachments) from the PDF. Returns a mapping of attachment names to attachment objects containing file data.

**Signature**: `getAttachments(): Promise<Record<string, object> | null>`

### `getData`

Retrieve the raw PDF file bytes. Useful for downloading the PDF file, exporting to a backend, or further processing.

**Signature**: `getData(): Promise<Uint8Array | null>`

### `getDestination`

Retrieve a specific named destination by ID. Useful for internal navigation within the PDF.

**Signature**: `getDestination(id: string): Promise<any[] | null>`

- `id`: The destination name/ID to retrieve.

### `getDestinations`

Retrieve all named destinations in the PDF. Destinations are used for internal links and bookmarks. Returns a mapping from destination name to destination data.

**Signature**: `getDestinations(): Promise<Record<string, any[]> | null>`

### `getDownloadInfo`

Retrieve download progress information for the PDF. Provides granular tracking of how much of the PDF file has been downloaded, useful for large remote PDFs.

**Signature**: `getDownloadInfo(): Promise<{ length: number } | null>`

### `getFieldObjects`

Retrieve AcroForm field objects from the PDF. Returns a map from field name to an array of field descriptors containing name, type, value, and position information.

**Signature**: `getFieldObjects(): Promise<Record<string, object[]> | null>`

### `getJSActions`

Retrieve JavaScript actions from the PDF. Includes document-level and field-level scripts used in forms.

**Signature**: `getJSActions(): Promise<object | null>`

### `getMarkInfo`

Retrieve accessibility mark info from the PDF. Indicates whether the PDF has been properly tagged for accessibility and contains structural information for screen readers.

**Signature**: `getMarkInfo(): Promise<object | null>`

### `getMetadata`

Retrieve document metadata from the PDF. Returns an object with an info dictionary (Title, Author, Subject, Keywords, Creator, Producer, CreationDate, ModDate) and an optional xmp key-value map from XMP metadata.

**Signature**: `getMetadata(): Promise<{ info: object, xmp: object | null } | null>`

### `getOpenAction`

Retrieve the PDF's open action destination. This is the page/location the PDF author intended to be displayed when the document is opened.

**Signature**: `getOpenAction(): Promise<any[] | null>`

### `getOptionalContentConfig`

Retrieve optional content (layers) configuration from the PDF. Useful for CAD drawings, technical documents, and PDFs with multiple content layers that can be toggled.

**Signature**: `getOptionalContentConfig(): Promise<object | null>`

### `getOutline`

Retrieve the document outline (table of contents / bookmarks). Each node has title, bold, italic, color, dest, url, and items (children).

**Signature**: `getOutline(): Promise<object[] | null>`

### `getPageLabels`

Retrieve custom page labels defined in the PDF (e.g. "i", "ii", "1", "A-1"). Returns one label per page in document order.

**Signature**: `getPageLabels(): Promise<string[] | null>`

### `getPageLayout`

Retrieve the page layout preference from the PDF. The layout indicates how pages should be displayed (single page, two-page spread, etc.).

**Signature**: `getPageLayout(): Promise<string | null>`

### `getPageMode`

Retrieve the page mode preference from the PDF. The mode indicates what to display when the PDF is opened (outlines, thumbnails, etc.).

**Signature**: `getPageMode(): Promise<string | null>`

### `getPermissions`

Retrieve the document permission flags. Permissions control whether the user may print, copy, modify, add/modify annotations, etc.

**Signature**: `getPermissions(): Promise<number[] | null>`

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

### `getTextContent`

Extract plain text from the PDF. When a page number is supplied, returns the text for that page only. When called without arguments, returns concatenated text for all pages separated by newlines.

**Signature**: `getTextContent(pageNumber?: number): Promise<string | null>`

- `pageNumber`: Optional 1-indexed page number. Omit to extract text from all pages.

### `getViewerPreferences`

Retrieve viewer preferences from the PDF. Preferences control how the PDF should be displayed (e.g., layout mode, fullscreen behavior, zoom settings).

**Signature**: `getViewerPreferences(): Promise<object | null>`

### `goToPage`

Navigate to a specific page.

**Signature**: `goToPage(page: number): void`

- `page`: The 1-indexed page number to navigate to.

### `hasJSActions`

Check whether the PDF contains JavaScript actions. Useful for detecting forms or documents with interactive behaviors.

**Signature**: `hasJSActions(): Promise<boolean>`

### `isSigned`

Check if a signature field has been signed.

**Signature**: `isSigned(fieldId: string): boolean`

- `fieldId`: The ID of the field to check.

### `nextPage`

Navigate to the next page. Does nothing if already on the last page.

**Signature**: `nextPage(): void`

### `openSignatureModal`

Open the signature capture modal for a signature field. The user can type their name and choose a font style, then apply the signature to the field.

**Signature**: `openSignatureModal(fieldId: string): void`

- `fieldId`: The ID of the signature field to open the capture modal for.

### `previousPage`

Navigate to the previous page. Does nothing if already on page 1.

**Signature**: `previousPage(): void`

### `saveDocument`

Save the PDF document with any modifications (filled form fields, annotations, etc.). Returns the modified PDF as raw bytes that can be downloaded or sent to a backend.

**Signature**: `saveDocument(): Promise<Uint8Array | null>`

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
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-annotationBox-Pdf | rgba(255, 255, 255, 0.8) | rgba(255, 255, 255, 0.8) |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checkbox-Pdf | rgba(220, 255, 220, 0.8) | rgba(220, 255, 220, 0.8) |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-deleteButton-hover-Pdf | #c82333 | #c82333 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-deleteButton-Pdf | #dc3545 | #dc3545 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-field-Pdf | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-handle-Scroller | $color-surface-200 | $color-surface-200 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-handle-Scroller--hover | $color-surface-400 | $color-surface-400 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-resizeHandle-hover-Pdf | #0056b3 | #0056b3 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-resizeHandle-Pdf | #007bff | #007bff |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-signature-Pdf | rgba(220, 220, 255, 0.8) | rgba(220, 220, 255, 0.8) |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-text-Pdf | rgba(255, 255, 220, 0.8) | rgba(255, 255, 220, 0.8) |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-toolbar-Pdf | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-track-Scroller | transparent | transparent |
| [borderColor](/docs/styles-and-themes/common-units/#color)-annotationBox-Pdf | transparent | transparent |
| [borderColor](/docs/styles-and-themes/common-units/#color)-field-Pdf | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-selected-Pdf | #007bff | #007bff |
| [borderColor](/docs/styles-and-themes/common-units/#color)-toolbar-Pdf | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-page-Pdf | $boxShadow-md | $boxShadow-md |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-selected-Pdf | 0 0 0 2px rgba(0, 123, 255, 0.25) | 0 0 0 2px rgba(0, 123, 255, 0.25) |
| [color](/docs/styles-and-themes/common-units/#color)-delete-Pdf | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-deleteButton-Pdf | white | white |
| [color](/docs/styles-and-themes/common-units/#color)-label-Pdf | #333 | #333 |
| [color](/docs/styles-and-themes/common-units/#color)-resizeHandle-Pdf | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-selected-Pdf | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-value-Pdf | #666 | #666 |
| [gap](/docs/styles-and-themes/common-units/#size)-pages-Pdf | $space-4 | $space-4 |
| [size](/docs/styles-and-themes/common-units/#size-values)-Scroller | 10px | 10px |

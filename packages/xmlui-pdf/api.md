# react-pdf and pdfjs-dist API Reference

This document describes the available APIs from **react-pdf** (v10.3.0) and **pdfjs-dist** (v5.4.296) that can be potentially implemented in the XMLUI PDF component.

**Packages:**
- `react-pdf`: React wrapper components for PDF.js
- `pdfjs-dist`: Mozilla's PDF.js library (core PDF rendering engine)

---

## Table of Contents

1. [React-PDF Components](#react-pdf-components)
2. [PDFDocumentProxy API](#pdfdocumentproxy-api)
3. [PDFPageProxy API](#pdfpageproxy-api)
4. [Text Content APIs](#text-content-apis)
5. [Annotations APIs](#annotations-apis)
6. [Rendering APIs](#rendering-apis)
7. [Metadata and Document Info](#metadata-and-document-info)
8. [Navigation and Structure](#navigation-and-structure)
9. [Optional Content and Layers](#optional-content-and-layers)
10. [Form Fields and JavaScript](#form-fields-and-javascript)

---

## React-PDF Components

### Document Component

Main component for loading and displaying PDF documents.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `file` | `string \| ArrayBuffer \| Blob \| Source \| null` | PDF source (URL, file, binary data, or parameter object) |
| `options` | `DocumentInitParameters` | PDF.js options (cMapUrl, httpHeaders, withCredentials, etc.) |
| `onLoadSuccess` | `(pdf: PDFDocumentProxy) => void` | Called when document loads successfully |
| `onLoadError` | `(error: Error) => void` | Called on load error |
| `onLoadProgress` | `({ loaded, total }) => void` | Progress callback during loading |
| `onPassword` | `(callback: (password: string \| null) => void) => void` | Password prompt for protected PDFs |
| `onItemClick` | `({ dest, pageIndex, pageNumber }) => void` | Clicked outline/thumbnail navigation |
| `loading` | `ReactNode \| () => ReactNode` | Loading indicator |
| `error` | `ReactNode \| () => ReactNode` | Error display |
| `noData` | `ReactNode \| () => ReactNode` | No data display |
| `className` | `string` | CSS class name |
| `externalLinkTarget` | `"_self" \| "_blank" \| "_parent" \| "_top"` | Target for external links |
| `externalLinkRel` | `string` | Rel attribute for external links |
| `renderMode` | `"canvas" \| "custom" \| "none"` | Rendering mode (default: "canvas") |
| `rotate` | `number` | Global rotation (90, 180, 270) |
| `scale` | `number` | Global scale factor (default: 1.0) |

**Example:**
```jsx
<Document
  file="/sample.pdf"
  onLoadSuccess={({ numPages }) => console.log(`Loaded ${numPages} pages`)}
  options={{ cMapUrl: '/cmaps/', cMapPacked: true }}
>
  <Page pageNumber={1} />
</Document>
```

### Page Component

Renders a single PDF page.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `pageNumber` | `number` | Page to display (1-indexed) |
| `pageIndex` | `number` | Alternative to pageNumber (0-indexed) |
| `scale` | `number` | Page scale (default: 1.0) |
| `rotate` | `number` | Page rotation (0, 90, 180, 270) |
| `width` | `number` | Desired page width |
| `height` | `number` | Desired page height |
| `onLoadSuccess` | `(page: PageCallback) => void` | Called when page loads |
| `onLoadError` | `(error: Error) => void` | Called on load error |
| `onRenderSuccess` | `() => void` | Called after successful render |
| `onRenderError` | `(error: Error) => void` | Called on render error |
| `onGetAnnotationsSuccess` | `(annotations: Annotation[]) => void` | Called when annotations loaded |
| `onGetTextSuccess` | `({ items, styles }) => void` | Called when text content loaded |
| `renderAnnotationLayer` | `boolean` | Render annotations (default: true) |
| `renderTextLayer` | `boolean` | Render text layer (default: true) |
| `renderForms` | `boolean` | Render form elements (default: false) |
| `customTextRenderer` | `({ str, itemIndex }) => string` | Customize text rendering |
| `filterAnnotations` | `({ annotations }) => Annotation[]` | Filter annotations before render |
| `canvasBackground` | `string` | Canvas background color |
| `className` | `string` | CSS class name |

**Example:**
```jsx
<Page
  pageNumber={1}
  scale={1.5}
  renderTextLayer={true}
  renderAnnotationLayer={true}
  onLoadSuccess={(page) => console.log(`Page ${page.pageNumber} loaded`)}
/>
```

### Outline Component

Displays document outline/table of contents.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `onItemClick` | `({ dest, pageIndex, pageNumber }) => void` | Outline item click handler |
| `onLoadSuccess` | `(outline: OutlineNode[]) => void` | Called when outline loads |
| `onLoadError` | `(error: Error) => void` | Called on load error |

### Thumbnail Component

Displays page thumbnail (no text/annotation layers).

**Props:** Same as Page component, minus text/annotation props, plus:

| Prop | Type | Description |
|------|------|-------------|
| `onItemClick` | `({ dest, pageIndex, pageNumber }) => void` | Thumbnail click handler |

---

## PDFDocumentProxy API

The document proxy provides access to document-level operations. Available via `onLoadSuccess` callback.

### Document Properties

| Property | Type | Description |
|----------|------|-------------|
| `numPages` | `number` | Total number of pages in the PDF |
| `fingerprints` | `[string, string \| null]` | Unique document identifier |
| `isPureXfa` | `boolean` | Whether document is XFA-only |
| `allXfaHtml` | `Object \| null` | HTML tree for XFA forms |
| `annotationStorage` | `AnnotationStorage` | Storage for annotation data in forms |

### Page Access

**`getPage(pageNumber: number): Promise<PDFPageProxy>`**  
Retrieves a specific page proxy.

- `pageNumber`: 1-indexed page number
- Returns: Promise resolving to PDFPageProxy

**`getPageIndex(ref: RefProxy): Promise<number>`**  
Gets page index from reference.

- `ref`: Page reference object
- Returns: Promise resolving to 0-indexed page number

### Navigation and Destinations

**`getDestinations(): Promise<{ [name: string]: any[] }>`**  
Gets all named destinations in document.

- Returns: Promise resolving to destination mapping
- **Note:** Can be slow for large documents; use `getDestination()` instead

**`getDestination(id: string): Promise<any[] | null>`**  
Gets specific named destination.

- `id`: Destination name
- Returns: Promise resolving to destination info or null

**`getPageLabels(): Promise<string[] | null>`**  
Gets page labels (custom page numbering).

- Returns: Promise resolving to label array or null

**`getPageLayout(): Promise<string>`**  
Gets page layout preference.

- Returns: Promise resolving to layout name ("SinglePage", "TwoPageLeft", etc.)

**`getPageMode(): Promise<string>`**  
Gets page mode.

- Returns: Promise resolving to mode name ("UseNone", "UseOutlines", "UseThumbs", etc.)

**`getViewerPreferences(): Promise<Object | null>`**  
Gets viewer preferences.

- Returns: Promise resolving to preferences object or null

**`getOpenAction(): Promise<any | null>`**  
Gets open action destination.

- Returns: Promise resolving to action or null

### Document Structure

**`getOutline(): Promise<OutlineNode[]>`**  
Gets document outline/table of contents.

- Returns: Promise resolving to outline tree

**Example OutlineNode:**
```typescript
{
  title: string,
  bold: boolean,
  italic: boolean,
  color: Uint8ClampedArray, // RGB
  dest: string | any[] | null,
  url: string | null,
  items: OutlineNode[]
}
```

**`getAttachments(): Promise<Object>`**  
Gets embedded attachments.

- Returns: Promise resolving to attachment mapping

**`getAnnotationsByType(types: Set<number>, pageIndexesToSkip: Set<number>): Promise<Object[]>`**  
Gets annotations by type across all pages.

- `types`: Set of annotation type IDs
- `pageIndexesToSkip`: Pages to exclude
- Returns: Promise resolving to annotation data array

### Metadata

**`getMetadata(): Promise<{ info: Object, metadata: Metadata }>`**  
Gets document metadata.

- Returns: Promise resolving to info dictionary and metadata

**`getMarkInfo(): Promise<MarkInfo | null>`**  
Gets accessibility mark info.

- Returns: Promise resolving to MarkInfo or null

**Example Metadata:**
```javascript
const { info, metadata } = await pdf.getMetadata();
// info: { Title, Author, Subject, Keywords, Creator, Producer, CreationDate, ModDate }
// metadata: Metadata object with XML metadata
```

### Data Access

**`getData(): Promise<Uint8Array>`**  
Gets raw PDF data.

- Returns: Promise resolving to byte array

**`saveDocument(): Promise<Uint8Array>`**  
Saves document with modifications.

- Returns: Promise resolving to modified PDF data

**`getDownloadInfo(): Promise<{ length: number }>`**  
Gets download progress info.

- Returns: Promise resolving to document length

### Optional Content (Layers)

**`getOptionalContentConfig({ intent?: string }): Promise<OptionalContentConfig>`**  
Gets optional content (layers) configuration.

- `intent`: "display", "print", or "any" (default: "display")
- Returns: Promise resolving to layer config

### Permissions

**`getPermissions(): Promise<number[] | null>`**  
Gets document permission flags.

- Returns: Promise resolving to permission array or null

### Lifecycle

**`cleanup(keepLoadedFonts?: boolean): Promise<void>`**  
Cleans up resources.

- `keepLoadedFonts`: Keep fonts in DOM (default: false)

**`destroy(): Promise<void>`**  
Destroys document and terminates worker.

### Example Usage

```javascript
function handleDocumentLoad(pdf) {
  console.log(`Pages: ${pdf.numPages}`);
  
  // Get page
  pdf.getPage(1).then(page => {
    console.log('Page 1:', page);
  });
  
  // Get metadata
  pdf.getMetadata().then(({ info, metadata }) => {
    console.log('Title:', info.Title);
    console.log('Author:', info.Author);
  });
  
  // Get outline
  pdf.getOutline().then(outline => {
    if (outline) {
      console.log('TOC:', outline);
    }
  });
}
```

---

## PDFPageProxy API

Page proxy provides access to page-level operations.

### Page Properties

| Property | Type | Description |
|----------|------|-------------|
| `pageNumber` | `number` | Page number (1-indexed) |
| `rotate` | `number` | Page rotation in degrees (0, 90, 180, 270) |
| `ref` | `RefProxy \| null` | Page reference |
| `userUnit` | `number` | Default unit size (1/72 inch) |
| `view` | `number[]` | Visible portion [x1, y1, x2, y2] in user units |
| `isPureXfa` | `boolean` | Whether page is XFA-only |

### Viewport

**`getViewport(params: GetViewportParameters): PageViewport`**  
Creates viewport for rendering.

**Parameters:**
```typescript
{
  scale: number,           // Scale factor (required)
  rotation?: number,       // Rotation override (default: page rotation)
  offsetX?: number,        // Horizontal offset (default: 0)
  offsetY?: number,        // Vertical offset (default: 0)
  dontFlip?: boolean      // Don't flip y-axis (default: false)
}
```

**Returns:** PageViewport with:
- `width`: number
- `height`: number
- `transform`: transformation matrix
- `clone()`: method to create a copy

**Example:**
```javascript
const viewport = page.getViewport({ scale: 1.5, rotation: 90 });
canvas.width = viewport.width;
canvas.height = viewport.height;
```

### Rendering

**`render(params: RenderParameters): RenderTask`**  
Renders page to canvas.

**Parameters:**
```typescript
{
  canvas: HTMLCanvasElement | null,
  viewport: PageViewport,                    // From getViewport()
  canvasContext?: CanvasRenderingContext2D,  // For backwards compatibility
  intent?: 'display' | 'print' | 'any',     // Default: 'display'
  annotationMode?: number,                   // AnnotationMode enum
  transform?: number[],                      // Additional transform
  background?: string | CanvasGradient | CanvasPattern,
  pageColors?: Object,                       // High contrast mode colors
  optionalContentConfigPromise?: Promise<OptionalContentConfig>,
  annotationCanvasMap?: Map<string, HTMLCanvasElement>,
  isEditing?: boolean,                       // Edit mode
  recordOperations?: boolean                 // Record operations
}
```

**Returns:** RenderTask with:
- `promise`: Promise<void> - Resolves when rendering completes
- `cancel(extraDelay?: number)`: Cancel rendering
- `onContinue`: Callback for incremental rendering

**Example:**
```javascript
const renderTask = page.render({
  canvas: canvasElement,
  viewport: viewport
});

renderTask.promise.then(() => {
  console.log('Page rendered');
}).catch(err => {
  console.error('Render error:', err);
});
```

**`getOperatorList(params?: GetOperatorListParameters): Promise<PDFOperatorList>`**  
Gets low-level drawing operations.

**Parameters:**
```typescript
{
  intent?: 'display' | 'print' | 'any',
  annotationMode?: number,
  isEditing?: boolean
}
```

**Returns:** Promise resolving to:
```typescript
{
  fnArray: number[],    // Operator function IDs
  argsArray: any[]      // Function arguments
}
```

---

## Text Content APIs

Extract and stream text from PDF pages.

**`page.getTextContent(params?: getTextContentParameters): Promise<TextContent>`**  
Gets page text content.

**Parameters:**
```typescript
{
  includeMarkedContent?: boolean,    // Include marked content (default: false)
  disableNormalization?: boolean     // Don't normalize text (default: false)
}
```

**Returns:** Promise resolving to:
```typescript
{
  items: Array<TextItem | TextMarkedContent>,
  styles: { [fontName: string]: TextStyle },
  lang: string | null
}
```

**TextItem:**
```typescript
{
  str: string,              // Text content
  dir: string,              // Direction: 'ltr', 'rtl', 'ttb'
  transform: number[],      // Transformation matrix
  width: number,            // Width in device space
  height: number,           // Height in device space
  fontName: string,         // Font name
  hasEOL: boolean          // Followed by line break
}
```

**TextStyle:**
```typescript
{
  ascent: number,
  descent: number,
  vertical: boolean,
  fontFamily: string
}
```

**Example:**
```javascript
page.getTextContent().then(textContent => {
  const text = textContent.items
    .map(item => item.str)
    .join(' ');
  console.log('Page text:', text);
});
```

**`page.streamTextContent(params?: getTextContentParameters): ReadableStream`**  
Streams text content (for large pages).

**Example:**
```javascript
const stream = page.streamTextContent();
const reader = stream.getReader();

reader.read().then(function processText({ done, value }) {
  if (done) return;
  console.log('Text chunk:', value);
  return reader.read().then(processText);
});
```

---

## Annotations APIs

**`page.getAnnotations(params?: GetAnnotationsParameters): Promise<Annotation[]>`**  
Gets page annotations.

**Parameters:**
```typescript
{
  intent?: 'display' | 'print' | 'any'  // Default: 'display'
}
```

**Returns:** Promise resolving to annotation array

**Annotation Types:**
- Link annotations (internal/external links)
- Text annotations (notes, highlights)
- Widget annotations (form fields)
- Stamp annotations
- Ink annotations (freehand drawings)
- And more...

**Example:**
```javascript
page.getAnnotations({ intent: 'display' }).then(annotations => {
  annotations.forEach(ann => {
    console.log('Type:', ann.subtype);
    console.log('Rect:', ann.rect);
    if (ann.url) console.log('Link:', ann.url);
  });
});
```

**Common Annotation Properties:**
- `id`: string - Unique identifier
- `subtype`: string - Annotation type ("Link", "Text", "Widget", etc.)
- `rect`: number[] - Bounding box [x1, y1, x2, y2]
- `url`: string - External link URL (for Link annotations)
- `dest`: any - Internal destination (for Link annotations)
- `contents`: string - Annotation content/note
- `fieldName`: string - Form field name (for Widget annotations)
- `fieldValue`: any - Form field value
- `fieldType`: string - Field type ("Tx", "Btn", "Ch")

---

## Rendering APIs

### Annotation Layer

Render clickable annotations over PDF page.

```javascript
import { AnnotationLayer } from 'pdfjs-dist';

const annotations = await page.getAnnotations();
AnnotationLayer.render({
  viewport,
  div: annotationLayerDiv,
  annotations,
  page,
  linkService,
  renderForms: true
});
```

### Text Layer

Render selectable/searchable text layer.

```javascript
import { TextLayer } from 'pdfjs-dist';

const textContent = await page.getTextContent();
const textLayerRender = TextLayer.render({
  viewport,
  container: textLayerDiv,
  textContentSource: textContent
});

await textLayerRender.promise;
```

### Custom Rendering

Implement custom renderer with `renderMode="custom"`:

```jsx
function CustomRenderer({ pageIndex, pageNumber, scale, rotate }) {
  // Custom rendering logic
  return <div>Custom page {pageNumber}</div>;
}

<Page
  pageNumber={1}
  renderMode="custom"
  customRenderer={CustomRenderer}
/>
```

---

## Metadata and Document Info

**`document.getMetadata(): Promise<{ info: Object, metadata: Metadata }>`**

**Info Dictionary Properties:**
- `Title`: string
- `Author`: string
- `Subject`: string
- `Keywords`: string
- `Creator`: string - Application that created the PDF
- `Producer`: string - PDF producer
- `CreationDate`: string - ISO date string
- `ModDate`: string - Modification date

**Metadata Object:**
- XML-based metadata (XMP)
- Access via `metadata.get(key)`

**Example:**
```javascript
const { info, metadata } = await pdf.getMetadata();
console.log('Title:', info.Title);
console.log('Pages:', pdf.numPages);
console.log('PDF Version:', info.PDFFormatVersion);
```

**`document.getPermissions(): Promise<number[] | null>`**  
Gets permission flags (print, copy, modify, etc.)

**`document.getMarkInfo(): Promise<MarkInfo | null>`**  
Gets accessibility tagging info

---

## Navigation and Structure

### Outline/Bookmarks

**`document.getOutline(): Promise<OutlineNode[]>`**

**OutlineNode Structure:**
```typescript
{
  title: string,
  bold: boolean,
  italic: boolean,
  color: Uint8ClampedArray,        // RGB color
  dest: string | any[] | null,     // Destination
  url: string | null,              // External URL
  items: OutlineNode[]             // Child items
}
```

**Example:**
```javascript
const outline = await pdf.getOutline();
function renderOutline(items, level = 0) {
  items.forEach(item => {
    console.log('  '.repeat(level) + item.title);
    if (item.items) renderOutline(item.items, level + 1);
  });
}
renderOutline(outline);
```

### Page Labels

**`document.getPageLabels(): Promise<string[] | null>`**

Custom page numbering (e.g., "i", "ii", "1", "2", "A-1").

### Attachments

**`document.getAttachments(): Promise<{ [filename: string]: Attachment }>`**

Embedded files in PDF.

---

## Optional Content and Layers

**`document.getOptionalContentConfig({ intent?: string }): Promise<OptionalContentConfig>`**

Manage layer visibility (e.g., show/hide layers in CAD drawings).

**Example:**
```javascript
const optionalContent = await pdf.getOptionalContentConfig();
// Use in render params to control layer visibility
```

---

## Form Fields and JavaScript

### Form Fields

**`document.getFieldObjects(): Promise<{ [fieldName: string]: FieldObject[] } | null>`**

Gets AcroForm field data.

**`document.hasJSActions(): Promise<boolean>`**

Checks if form has JavaScript actions.

**`document.getJSActions(): Promise<Object | null>`**

Gets JavaScript actions in document.

**`document.getCalculationOrderIds(): Promise<string[] | null>`**

Gets field calculation order.

**Example:**
```javascript
const fields = await pdf.getFieldObjects();
for (const [name, field] of Object.entries(fields)) {
  console.log('Field:', name, field);
}
```

### XFA Forms

**`document.isPureXfa: boolean`**  
Check if document uses XFA forms.

**`document.allXfaHtml: Object | null`**  
Get XFA HTML tree structure (for XFA rendering).

**`page.getXfa(): Promise<Object | null>`**  
Get page-level XFA data.

---

## Additional Utilities

### Structure Tree

**`page.getStructTree(): Promise<StructTreeNode>`**

Gets accessibility structure tree.

**StructTreeNode:**
```typescript
{
  role: string,                    // Element role
  children: Array<StructTreeNode | StructTreeContent>
}
```

### Worker Configuration

```javascript
import { pdfjs } from 'react-pdf';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// Or use CDN
pdfjs.GlobalWorkerOptions.workerSrc = 
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
```

### Document Loading

```javascript
import { getDocument } from 'pdfjs-dist';

const loadingTask = getDocument({
  url: '/sample.pdf',
  httpHeaders: { 'Authorization': 'Bearer token' },
  withCredentials: true,
  password: 'secret'
});

loadingTask.promise.then(pdf => {
  console.log('PDF loaded:', pdf);
});

// Progress tracking
loadingTask.onProgress = ({ loaded, total }) => {
  console.log(`Loading: ${(loaded / total * 100).toFixed(0)}%`);
};

// Password handling
loadingTask.onPassword = (callback, reason) => {
  const password = prompt('Enter PDF password:');
  callback(password);
};
```

---

## Summary of Implementation Opportunities

### High Priority (Commonly Needed)

1. **Text extraction** (`getTextContent`) - Search, copy, accessibility ✅ **IMPLEMENTED**
2. **Metadata** (`getMetadata`) - Display doc info, title, author ✅ **IMPLEMENTED**
3. **Outline/Bookmarks** (`getOutline`) - Navigation sidebar ✅ **IMPLEMENTED**
4. **Page labels** (`getPageLabels`) - Custom page numbering ✅ **IMPLEMENTED**
5. **Thumbnails** - Quick navigation ⏭️ **Deferred** (requires UI component, not just API)
6. **Form field detection** (`getFieldObjects`) - Identify fillable fields ✅ **IMPLEMENTED**
7. **Annotation reading** (`getAnnotations`) - Display existing annotations ✅ **IMPLEMENTED** (Phase 1)
8. **Permissions** (`getPermissions`) - Restrict features based on PDF permissions ✅ **IMPLEMENTED**

### Medium Priority

9. **Attachments** (`getAttachments`) - Extract embedded files ✅ **IMPLEMENTED**
10. **Optional content/layers** (`getOptionalContentConfig`) - CAD/technical drawings ✅ **IMPLEMENTED**
11. **Destinations** (`getDestinations`, `getDestination`) - Named navigation points ✅ **IMPLEMENTED**
12. **Viewer preferences** (`getViewerPreferences`) - Honor PDF preferences ✅ **IMPLEMENTED**
13. **Form JavaScript** (`hasJSActions`, `getJSActions`) - Enterprise forms ✅ **IMPLEMENTED**
14. **Page layout/mode** (`getPageLayout`, `getPageMode`) - Respect PDF settings ✅ **IMPLEMENTED**
15. **Open action** (`getOpenAction`) - Auto-navigate to starting location ✅ **IMPLEMENTED**
16. **Raw PDF data** (`getData`) - Export/download PDFs ✅ **IMPLEMENTED**
17. **Annotation filtering** (`getAnnotationsByType`) - Efficient filtering ✅ **IMPLEMENTED**
18. **Save document** (`saveDocument`) - Persist form changes ✅ **IMPLEMENTED**
19. **Accessibility mark info** (`getMarkInfo`) - Tagged content support ✅ **IMPLEMENTED**

### Low Priority / Advanced

20. **Download progress** (`getDownloadInfo`) - Granular progress tracking ✅ **IMPLEMENTED**
21. **Resource cleanup** (`cleanup`, `destroy`) - Memory management ⏳ **Not yet implemented**
22. **Text streaming** (`streamTextContent`) - Handle huge pages ⏳ **Not yet implemented**
23. **Structure tree** (`getStructTree`) - Accessibility parsing ⏳ **Not yet implemented**
24. **XFA forms** - XFA-specific APIs ⏳ **Not yet implemented** (deprecated in PDF 2.0)

---

## Implemented XMLUI PDF Component APIs (Phase 1 & Phase 2)

### Navigation & View Control
- ✅ `goToPage(page: number)` - Navigate to a specific page
- ✅ `previousPage()` - Navigate to previous page
- ✅ `nextPage()` - Navigate to next page
- ✅ `setScale(scale: number)` - Set zoom level (0.1-5 range)
- ✅ `zoomTo(scale: number)` - Zoom to exact scale (alias for setScale)
- ✅ `zoomIn(factor?: number)` - Zoom in by multiplicative factor (default 1.25)
- ✅ `zoomOut(factor?: number)` - Zoom out by multiplicative factor (default 1.25)
- ✅ `actualSize()` - Reset zoom to 100% (scale = 1.0)
- ✅ `fitWidth()` - Scale so page width fills viewport
- ✅ `fitPage()` - Scale so full page fits in viewport

### Scale Queries
- ✅ `getScale()` - Return current scale value

### Annotation Management
- ✅ `addAnnotation(annotationData: object)` - Add new annotation (returns ID)
- ✅ `updateAnnotation(id: string, updates: object)` - Update annotation
- ✅ `deleteAnnotation(id: string)` - Delete annotation by ID
- ✅ `getAnnotations()` - Get all annotations
- ✅ `selectAnnotation(id: string)` - Select and highlight annotation
- ✅ `deselectAnnotation()` - Clear annotation selection
- ✅ `getSelectedAnnotationId()` - Return selected annotation ID (or null)
- ✅ `getSelectedAnnotation()` - Return selected annotation object (or null)

### Signatures (Phase 2)
- ✅ `openSignatureModal(fieldId: string)` - Open signature capture modal
- ✅ `applySignature(fieldId: string, signature: object)` - Apply signature to field
- ✅ `getSignature(fieldId?: string)` - Get current signature data
- ✅ `saveSignature(fieldId: string, signature: object)` - Save signature to storage
- ✅ `clearSignature(fieldId: string)` - Clear signature from field
- ✅ `isSigned(fieldId: string)` - Check if field has signature
- ✅ `exportToBackend()` - Export all annotations and signatures

### Document-Level APIs (PDF Metadata & Structure)
- ✅ `getMetadata()` - Retrieve document metadata (title, author, subject, keywords, etc.)
- ✅ `getOutline()` - Retrieve document outline/table of contents (bookmarks)
- ✅ `getPageLabels()` - Retrieve custom page numbering labels
- ✅ `getPermissions()` - Retrieve document permission flags
- ✅ `getFieldObjects()` - Retrieve form field objects (AcroForm fields)
- ✅ `getTextContent(pageNumber?: number)` - Extract plain text from PDF (single page or all pages)
- ✅ `getAttachments()` - Retrieve embedded files from PDF
- ✅ `getViewerPreferences()` - Retrieve PDF viewer preferences
- ✅ `getDestinations()` - Retrieve all named destinations
- ✅ `getDestination(id: string)` - Retrieve specific named destination
- ✅ `hasJSActions()` - Check if document has JavaScript actions
- ✅ `getJSActions()` - Retrieve JavaScript actions from document
- ✅ `getOptionalContentConfig()` - Retrieve optional content/layers configuration
- ✅ `getPageLayout()` - Retrieve page layout preference (SinglePage, TwoPageLeft, etc.)
- ✅ `getPageMode()` - Retrieve page mode (UseNone, UseOutlines, UseThumbs, etc.)
- ✅ `getOpenAction()` - Retrieve the PDF's open action destination for auto-navigation
- ✅ `getData()` - Retrieve raw PDF file bytes for download/export
- ✅ `getAnnotationsByType()` - Retrieve annotations filtered by type across all pages
- ✅ `saveDocument()` - Save PDF with modifications (filled forms, annotations)
- ✅ `getMarkInfo()` - Retrieve accessibility mark info for tagged content support
- ✅ `getDownloadInfo()` - Retrieve download progress information

---

## Additional Relevant APIs from react-pdf/pdfjs-dist (Not Yet Implemented)

### Recently Implemented (High Priority)

These high-priority APIs were just completed:

1. **Page Layout & Mode** - Respect PDF viewer settings:
   - `getPageLayout()` - Retrieve page layout preference (SinglePage, TwoPageLeft, TwoPageRight, etc.) ✅ **IMPLEMENTED**
   - `getPageMode()` - Retrieve page mode (UseNone, UseOutlines, UseThumbs, etc.) ✅ **IMPLEMENTED**
   - **Benefit:** Honors PDF author's intended display mode; useful for auto-switching to two-page view for books

2. **Open Action Destination** - Navigate to PDF's intended starting location:
   - `getOpenAction()` - Retrieve the PDF's open action (navigation destination) ✅ **IMPLEMENTED**
   - **Benefit:** Auto-navigate to the page/location the PDF author intended when document loads

3. **Raw PDF Data** - Export and manipulate PDFs:
   - `getData()` - Retrieve the raw PDF file bytes ✅ **IMPLEMENTED**
   - **Benefit:** Enable PDF download, further processing, sending to backend, or storage

4. **Annotation Filtering** - Access annotations more efficiently:
   - `getAnnotationsByType(types: Set<number>, pageIndexesToSkip?: Set<number>)` - Retrieve annotations filtered by type across all pages ✅ **IMPLEMENTED**
   - **Benefit:** Faster than getAnnotations() + filtering in JavaScript for large PDFs with many annotations

### Medium Priority (Recently Implemented)

These APIs for specific workflows and enhancements were just completed:

5. **Save Modified Document** - Persist form changes:
   - `saveDocument()` - Save the PDF with any modifications (filled forms, annotations) ✅ **IMPLEMENTED**
   - **Benefit:** Essential for form-filling workflows; allows saving user entries to PDF

6. **Accessibility Support** - Improve accessibility features:
   - `getMarkInfo()` - Retrieve accessibility mark info, tagged content indicators ✅ **IMPLEMENTED**
   - **Benefit:** Support accessible PDF detection; flag high-quality accessible documents

7. **Download Progress** - Track file download during load:
   - `getDownloadInfo()` - Retrieve download progress { length: number } ✅ **IMPLEMENTED**
   - **Benefit:** More granular progress tracking than onLoadProgress; useful for large remote PDFs

### Low Priority (Niche Use Cases)

These APIs are useful in specific scenarios but not needed for most document viewers:

8. **Resource Cleanup** - Explicit resource management:
   - `cleanup(keepLoadedFonts?: boolean)` - Clean up document resources
   - `destroy()` - Terminate PDF worker and free memory
   - **Status:** ⏳ Not implemented
   - **Benefit:** Fine-grained control for memory-constrained environments; auto-cleanup usually sufficient

9. **Text Streaming** - Handle extremely large pages:
   - `page.streamTextContent()` - Stream text content as ReadableStream instead of waiting for full content
   - **Status:** ⏳ Not implemented
   - **Benefit:** Extract text from huge pages without memory overhead

10. **Accessibility Structure** - Parse document structure:
    - `page.getStructTree()` - Retrieve accessibility structure tree
    - **Status:** ⏳ Not implemented
    - **Benefit:** Support screen readers and accessibility features in detail

11. **XFA Forms** - Handle enterprise forms:
    - `isPureXfa` - Property indicating XFA-only document
    - `allXfaHtml` - Property with XFA HTML tree
    - `page.getXfa()` - Get page-level XFA data
    - `getCalculationOrderIds()` - Get field calculation order
    - **Status:** ⏳ Not implemented
    - **Benefit:** XFA is deprecated in PDF 2.0; use AcroForm-based forms instead (see getFieldObjects)

---

## References

- [react-pdf GitHub](https://github.com/wojtekmaj/react-pdf)
- [react-pdf Documentation](https://projects.wojtekmaj.pl/react-pdf/)
- [PDF.js API Documentation](https://mozilla.github.io/pdf.js/api/)
- [PDF.js GitHub](https://github.com/mozilla/pdf.js)

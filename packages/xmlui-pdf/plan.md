# PDF Component Enhancement: Document Signing Support

## Current State Analysis

### Current Structure
```
packages/xmlui-pdf/src/
├── index.tsx               # Extension registration
├── Pdf.tsx                  # Component metadata + renderer
├── LazyPdfNative.tsx       # Lazy loading wrapper
└── Pdf.module.scss         # Styling
```

### Current Capabilities
- Read-only PDF viewer using `react-pdf@10.3.0` + `pdfjs-dist@5.4.296`
- Display from URL (`src` prop) or binary data (`data` prop)
- Multi-page rendering, text selection layer
- Annotation layer CSS imported but not utilized
- Themeable (box shadows, gaps)

### Limitations
- No annotation creation/editing
- No signature capture
- No form field interaction

### PDF.js Built-in Support
- Form field rendering (text, checkbox, radio, dropdown)
- Annotation layer for display
- Editor modes: FreeText, Highlight, Ink, Stamp, Signature
- Annotation serialization

## Resources

Essential documentation:
- Component conventions: `xmlui/dev-docs/conv-create-components.md`
- E2E testing conventions: `xmlui/dev-docs/conv-e2e-testing.md`
- Rendering pipeline: `xmlui/dev-docs/standalone-app.md`

## Target Features

### Phase 1: Basic Annotations (Current Focus)
- Text field annotations
- Checkbox annotations  
- Signature field placeholders (visual only)
- Drag-and-drop positioning
- Resize handles
- Delete annotations
- Field properties: label, required, placeholder

### Phase 2: Signature Capture (Current Focus)
- Type signature (text input converted to styled signature)
- Apply signature to signature fields
- Clear signature functionality
- Date stamp with signature
- Upload signature (deferred to later)

### Phase 3: Multi-Signer Workflow (Not Current Focus)
- Multiple signers with field assignment
- Color-coded fields by signer
- Sequential/parallel signing modes
- Workflow state tracking

### Phase 4: Templates & Export (Not Current Focus)
- Save/load field templates
- Export PDF with flattened annotations
- Form data export (JSON/XML)
- Audit trail

## Type Definitions (Phase 1-2)

```typescript
// Annotation base
interface Annotation {
  id: string;
  type: "text" | "checkbox" | "signature";
  page: number;
  position: { x: number; y: number };        // PDF coordinates
  size: { width: number; height: number };
  value?: any;
  properties: AnnotationProperties;
  created: Date;
  modified: Date;
}

interface AnnotationProperties {
  label?: string;
  placeholder?: string;
  required: boolean;
  fontSize?: number;
  fontFamily?: string;
}

// Signature data
interface SignatureData {
  id: string;
  type: "typed" | "uploaded";
  data: string;                               // Base64 image or SVG
  timestamp: Date;
  signerName?: string;
}

// Component state
interface PdfState {
  numPages: number;
  currentPage: number;
  scale: number;
  annotations: Annotation[];
  selectedAnnotationId?: string;
  mode: "view" | "edit";
  signature?: SignatureData;
}
```

## Component API (Phase 1-2)

### Properties

```typescript
src?: string;                          // PDF URL
data?: ArrayBuffer | Blob;             // Binary PDF data
mode?: "view" | "edit";                // Display mode (default: "view")
annotations?: Annotation[];            // Initial annotations
scale?: number;                        // Zoom level (default: 1.0)
currentPage?: number;                  // Controlled page number
signatureData?: SignatureData;         // Pre-loaded signature (Phase 2)
```

### Events

```typescript
onDocumentLoad?: (numPages: number) => void;
onPageChange?: (page: number) => void;
onAnnotationCreate?: (annotation: Annotation) => void;
onAnnotationUpdate?: (annotation: Annotation) => void;
onAnnotationDelete?: (id: string) => void;
onAnnotationSelect?: (id: string) => void;
onSignatureCapture?: (signature: SignatureData) => void;         // Phase 2
onSignatureApply?: (fieldId: string, signature: SignatureData) => void;  // Phase 2
```

### API Methods

```typescript
// Navigation
goToPage: (page: number) => void;
setScale: (scale: number) => void;

// Annotation CRUD
addAnnotation: (data: Omit<Annotation, "id" | "created" | "modified">) => string;
updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
deleteAnnotation: (id: string) => void;
getAnnotations: () => Annotation[];

// Signature operations (Phase 2)
openSignatureModal: (fieldId: string) => void;
applySignature: (fieldId: string, signature: SignatureData) => void;
getSignature: () => SignatureData | undefined;
```

### Context Variables

```typescript
$pageCount: number;
$currentPage: number;
$annotations: Annotation[];
$mode: "view" | "edit";
$hasSignature: boolean;                // Phase 2
```

## Implementation Steps

### Step 1: Set Up Type Definitions and Utilities ✓

**Goal**: Create TypeScript types and coordinate mapping utility

**Tasks**:
1. Create `src/types/annotation.types.ts` - Annotation types
2. Create `src/types/signature.types.ts` - Signature types (Phase 2 prep)
3. Create `src/utils/coordinateMapping.ts` - PDF/screen coordinate mapping utility

**Tests**: Unit tests created in `tests/coordinateMapping.test.ts`

**Verification**: ✓ Build succeeds, no linting errors, types export correctly

---

### Step 2: Create PdfNative Component ⬜

**Goal**: Refactor to separate native component following XMLUI conventions

**Tasks**:
1. Create `src/PdfNative.tsx` - move Pdf.tsx logic here, add forwardRef
2. Update `src/LazyPdfNative.tsx` - import from PdfNative
3. Update `src/Pdf.tsx` - metadata and renderer only
4. Add props: `mode`, `annotations`, `scale` to PdfNative
5. Add state: `annotations`, `selectedAnnotationId`, `mode`

**Tests**: Existing E2E tests should pass

**Verification**: Component renders PDFs as before, compiles without errors

---

### Step 3: Update Component Metadata ⬜

**Goal**: Add new properties, events, and APIs to metadata

**Tasks**:
1. Update `PdfMd` with new props (mode, annotations, scale, currentPage)
2. Add event definitions (onAnnotationCreate/Update/Delete/Select)
3. Add API method definitions (addAnnotation, updateAnnotation, etc.)
4. Add context variables ($pageCount, $currentPage, $annotations, $mode)
5. Update renderer to wire up events and registerComponentApi

**Tests**: Build test to ensure metadata valid

**Verification**: No compilation errors

---

### Step 4: Implement Annotation State Hook ⬜

**Goal**: Create reusable hook for annotation state management

**Tasks**:
1. Create `src/hooks/useAnnotations.ts`
2. Implement CRUD operations: add, update, delete, clear
3. Handle annotation selection
4. Generate unique IDs for annotations
5. Manage immutable state updates

**Tests**: Unit tests for useAnnotations hook

**Verification**: Hook implements correct CRUD logic

---

### Step 5: Implement Annotation Overlay Layer ⬜

**Goal**: Create overlay system for displaying annotations on PDF pages

**Tasks**:
1. Create `src/components/AnnotationLayer/AnnotationLayer.tsx`
2. Create `src/components/AnnotationLayer/AnnotationLayer.module.scss`
3. Implement absolute positioning overlay per page
4. Use coordinate mapping to position annotations
5. Render annotation boxes (non-interactive yet)
6. Integrate into PdfNative

**Tests**: Unit tests for AnnotationLayer with mock annotations

**Verification**: Annotations display at correct positions

---

### Step 6: Implement Text Field Annotation ⬜

**Goal**: Create interactive text field annotation component

**Tasks**:
1. Create `src/components/AnnotationTools/TextAnnotation.tsx`
2. Create `src/components/AnnotationTools/AnnotationTools.module.scss`
3. Render text input with label, placeholder, required indicator
4. Add selection/focus states
5. Wire onChange to onAnnotationUpdate event
6. Integrate into AnnotationLayer

**Tests**: Unit tests for TextAnnotation

**Verification**: Text fields render, accept input, trigger events

---

### Step 7: Implement Checkbox Annotation ⬜

**Goal**: Create interactive checkbox annotation component

**Tasks**:
1. Create `src/components/AnnotationTools/CheckboxAnnotation.tsx`
2. Render checkbox with label
3. Handle checked/unchecked states
4. Wire onChange to onAnnotationUpdate event
5. Integrate into AnnotationLayer

**Tests**: Unit tests for CheckboxAnnotation

**Verification**: Checkboxes toggle, trigger events

---

### Step 8: Implement Signature Field Placeholder ⬜

**Goal**: Create visual signature field (interactive in Phase 2)

**Tasks**:
1. Create `src/components/AnnotationTools/SignatureAnnotation.tsx`
2. Render placeholder box with "Sign here" text
3. Add styling for signature field appearance
4. Prepare for signature image display (Phase 2)
5. Integrate into AnnotationLayer

**Tests**: Unit tests for SignatureAnnotation

**Verification**: Signature fields display as placeholders

---

### Step 9: Implement Field Toolbar ⬜

**Goal**: Create toolbar for adding annotations in edit mode

**Tasks**:
1. Create `src/components/FieldToolbar/FieldToolbar.tsx`
2. Create `src/components/FieldToolbar/FieldToolbar.module.scss`
3. Add buttons: "Add Text", "Add Checkbox", "Add Signature"
4. Wire buttons to addAnnotation API method
5. Position toolbar (top or side of PDF)
6. Show only in edit mode

**Tests**: Unit tests for toolbar buttons

**Verification**: Toolbar displays, buttons create annotations at default position

---

### Step 10: Implement Drag-and-Drop Positioning ⬜

**Goal**: Enable dragging annotations to reposition

**Tasks**:
1. Add mousedown/mousemove/mouseup handlers to annotation components
2. Implement drag logic with coordinate tracking
3. Update annotation position during drag
4. Visual feedback during drag (cursor, opacity)
5. Trigger onAnnotationUpdate on drag complete
6. Handle page boundaries

**Tests**: E2E test dragging annotation

**Verification**: Annotations reposition via drag-and-drop

---

### Step 11: Implement Resize Handles ⬜

**Goal**: Enable resizing annotations

**Tasks**:
1. Add resize handles to annotation components (4 corners)
2. Implement resize logic with mouse events
3. Update annotation size during resize
4. Set minimum sizes
5. Trigger onAnnotationUpdate on resize complete
6. Maintain aspect ratio for signature fields

**Tests**: E2E test resizing annotation

**Verification**: Annotations resize via handles

---

### Step 12: Implement Delete Functionality ⬜

**Goal**: Enable deleting annotations

**Tasks**:
1. Add delete button to selected annotations
2. Implement Delete/Backspace key handler
3. Call deleteAnnotation API method
4. Trigger onAnnotationDelete event
5. Handle deselection after delete

**Tests**: Unit test for delete

**Verification**: Annotations deleted via button or keyboard

---

### Step 13: Implement Field Properties Panel ⬜

**Goal**: Allow editing annotation properties

**Tasks**:
1. Create `src/components/FieldToolbar/FieldProperties.tsx`
2. Build properties panel UI (side panel)
3. Inputs for: label, placeholder, required, fontSize
4. Show when annotation selected
5. Update annotation properties onChange
6. Trigger onAnnotationUpdate event

**Tests**: Unit tests for properties panel

**Verification**: Properties can be edited and applied

---

### Step 14: Add Annotation Theme Variables ⬜

**Goal**: Make annotations themeable

**Tasks**:
1. Update `src/Pdf.module.scss` with theme variables
2. Add: borderColor-field, backgroundColor-field, color-selected, etc.
3. Update metadata with theme variable definitions  
4. Apply theme variables in annotation styles

**Tests**: Visual test with theme

**Verification**: Annotation colors follow theme

---

### Step 15: Create Phase 1 E2E Tests ⬜

**Goal**: Comprehensive Phase 1 test coverage

**Tasks**:
1. Update `src/Pdf.spec.ts`
2. Test: Load PDF in edit mode
3. Test: Add text field via toolbar
4. Test: Add checkbox via toolbar
5. Test: Drag annotation
6. Test: Resize annotation
7. Test: Delete annotation
8. Test: Edit field properties
9. Test: Switch view/edit modes

**Tests**: Run with `npm run test:e2e:dev`

**Verification**: All Phase 1 E2E tests pass

---

### Step 16: Implement Typed Signature Modal ⬜

**Goal**: Allow users to type name for signature

**Tasks**:
1. Create `src/components/SignatureCapture/SignatureCapture.tsx`
2. Create `src/components/SignatureCapture/SignatureCapture.module.scss`
3. Create `src/components/SignatureCapture/SignatureTypeInput.tsx`
4. Build modal dialog for signature capture
5. Add text input for name
6. Font selector (cursive/script fonts)
7. Preview rendered signature
8. "Apply" button triggers onSignatureCapture event
9. Wire openSignatureModal API to show modal

**Tests**: Unit tests for SignatureTypeInput

**Verification**: Modal opens, signature typed and styled

---

### Step 17: Implement Signature Storage ⬜

**Goal**: Store captured signature for reuse

**Tasks**:
1. Create `src/hooks/useSignature.ts`
2. Implement signature state management
3. Convert typed signature to base64 image/SVG
4. Create `src/utils/signatureUtils.ts` for conversion
5. Add signatureData prop for pre-loading
6. Expose getSignature API method

**Tests**: Unit tests for signature storage and conversion

**Verification**: Signature persists, can be retrieved

---

### Step 18: Apply Signature to Fields ⬜

**Goal**: Enable applying signature to signature fields

**Tasks**:
1. Update SignatureAnnotation to show signature image when applied
2. Add "Sign" button to unsigned signature fields
3. Open modal on "Sign" click
4. Apply signature to field on confirm
5. Add date stamp below signature
6. Make field read-only after signing
7. Trigger onSignatureApply event

**Tests**: E2E test for signature capture and application

**Verification**: Signature displays in field with date

---

### Step 19: Implement Clear Signature ⬜

**Goal**: Allow removing applied signature

**Tasks**:
1. Add "Clear" button to signed fields
2. Implement clear functionality
3. Reset field to unsigned state
4. Trigger onSignatureApply event with null

**Tests**: Unit test for clear signature

**Verification**: Signature can be cleared, field resets

---

### Step 20: Create Phase 2 E2E Tests ⬜

**Goal**: Comprehensive Phase 2 test coverage

**Tasks**:
1. Update `src/Pdf.spec.ts`
2. Test: Open signature modal
3. Test: Type signature with font selection
4. Test: Apply signature to field
5. Test: Verify date stamp
6. Test: Clear signature
7. Test: Apply same signature to multiple fields

**Tests**: Run with `npm run test:e2e:dev`

**Verification**: All Phase 2 E2E tests pass

---

### Step 21: Component Documentation ⬜

**Goal**: Document Phase 1-2 features

**Tasks**:
1. Create `src/Pdf.md` following XMLUI documentation conventions
2. Add component description with key features
3. Add examples for mode, annotations properties
4. Add examples for annotation events
5. Add use cases: basic document signing workflow
6. Run `npm run generate-docs-with-refresh`

**Tests**: Verify docs generate correctly

**Verification**: Documentation appears in docs site

---

## Testing Strategy

### Unit Tests
```bash
npm run test:unit src/utils/coordinateMapping.test.ts
npm run test:unit src/hooks/useAnnotations.test.ts
npm run test:unit src/hooks/useSignature.test.ts
```

### E2E Tests
From workspace root:
```bash
cd /Users/dotneteer/source/xmlui
playwright test packages/xmlui-pdf/src/Pdf.spec.ts --workers=1 --reporter=line
```

### Build Check
Infrequent use (~2 min):
```bash
npm run build:xmlui-standalone
```

## Dependencies

### Current
- `react-pdf@^10.3.0`
- `pdfjs-dist@^5.4.296`

### To Consider (After Prototype)
- Web fonts for signature styling (Dancing Script, Pacifico, etc.)
- `pdf-lib` - For export with flattened annotations (Phase 4)

---

**Status**: Ready for Implementation  
**Last Updated**: February 17, 2026

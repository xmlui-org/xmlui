# Loading PDFs from Memory

This guide explains how to display PDF documents directly from memory without requiring a file URL. The XMLUI PDF component supports multiple binary data formats for in-memory PDF display.

## Supported Data Formats

The `data` prop accepts the following formats:

| Format | Type | Use Case |
|--------|------|----------|
| **ArrayBuffer** | `ArrayBuffer` | From `fetch()`, `XMLHttpRequest`, or file readers |
| **Uint8Array** | `Uint8Array` | From PDF generation libraries (pdf-lib, jsPDF) |
| **Blob/File** | `Blob` | From file inputs, drag-and-drop, or API responses |
| **Data URL** | `string` | Base64-encoded PDF data |
| **URL** | `string` | Use `src` prop instead |

## Basic Usage

### From `src` (URL)

```xmlui
<Pdf src="/documents/sample.pdf" mode="view" />
```

### From `data` (Memory)

```xmlui
<Pdf data={pdfArrayBuffer} mode="view" />
```

---

## Examples by Data Source

### 1. From Fetch API

Load PDF from a REST API endpoint:

```xmlui
<Script>
  let pdfData = null;
  let loading = false;
  
  async function loadPdf() {
    loading = true;
    try {
      const response = await fetch('/api/generate-invoice');
      const arrayBuffer = await response.arrayBuffer();
      pdfData = arrayBuffer;
    } catch (error) {
      console.error('Failed to load PDF:', error);
    } finally {
      loading = false;
    }
  }
</Script>

{#if loading}
  <div>Loading PDF...</div>
{:else if pdfData}
  <Pdf data={pdfData} mode="view" scale={1.0} />
{:else}
  <Button onClick={loadPdf}>Load Invoice</Button>
{/if}
```

### 2. From File Input

Let users upload and view their own PDFs:

```xmlui
<Script>
  let pdfData = null;
  let error = null;
  
  function handleFileSelect(event) {
    const file = event.target.files[0];
    
    // Validate
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      error = 'Please select a PDF file';
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      error = 'File too large (max 10MB)';
      return;
    }
    
    error = null;
    pdfData = file; // File is a Blob subclass
  }
</Script>

<input 
  type="file" 
  accept="application/pdf,.pdf" 
  onChange={handleFileSelect} 
/>

{#if error}
  <div class="error">{error}</div>
{/if}

{#if pdfData}
  <Pdf data={pdfData} mode="view" />
{/if}
```

### 3. From Base64 String

Display PDF from base64-encoded data (e.g., from database):

```xmlui
<Script>
  // Base64 string from API
  const base64Pdf = "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0...";
  
  // Convert to data URL
  const pdfDataUrl = `data:application/pdf;base64,${base64Pdf}`;
</Script>

<Pdf data={pdfDataUrl} mode="view" />
```

### 4. From pdf-lib (Creating PDFs)

Generate a PDF in memory and display it immediately:

```xmlui
<Script>
  import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
  
  let pdfData = null;
  
  async function createPdf() {
    // Create new PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Add content
    page.drawText('Hello from XMLUI!', {
      x: 50,
      y: 350,
      size: 30,
      font: font,
      color: rgb(0, 0.53, 0.71),
    });
    
    page.drawText('This PDF was created in memory.', {
      x: 50,
      y: 300,
      size: 16,
      font: font,
    });
    
    // Save as Uint8Array
    const pdfBytes = await pdfDoc.save();
    pdfData = pdfBytes;
  }
</Script>

<Button onClick={createPdf}>Generate PDF</Button>

{#if pdfData}
  <Pdf data={pdfData} mode="edit" />
{/if}
```

### 5. From @react-pdf/renderer

Generate React-based PDFs:

```jsx
import { Document, Page, Text, pdf } from '@react-pdf/renderer';

async function generateAndDisplay() {
  // Define PDF structure
  const MyDocument = (
    <Document>
      <Page style={{ padding: 30 }}>
        <Text style={{ fontSize: 24 }}>Invoice #12345</Text>
        <Text style={{ fontSize: 14, marginTop: 20 }}>
          Customer: John Doe
        </Text>
        <Text>Total: $1,234.56</Text>
      </Page>
    </Document>
  );
  
  // Generate Blob
  const blob = await pdf(MyDocument).toBlob();
  
  // Display with XMLUI Pdf component
  return <Pdf data={blob} mode="view" />;
}
```

### 6. From IndexedDB

Store and retrieve PDFs from browser database:

```xmlui
<Script>
  let pdfData = null;
  
  // Store PDF
  async function savePdfToCache(arrayBuffer) {
    const db = await openDB('pdf-cache', 1, {
      upgrade(db) {
        db.createObjectStore('pdfs');
      },
    });
    await db.put('pdfs', arrayBuffer, 'document-1');
  }
  
  // Retrieve PDF
  async function loadFromCache() {
    const db = await openDB('pdf-cache', 1);
    const arrayBuffer = await db.get('pdfs', 'document-1');
    
    if (arrayBuffer) {
      pdfData = arrayBuffer;
    } else {
      console.log('No cached PDF found');
    }
  }
</Script>

<Button onClick={loadFromCache}>Load from Cache</Button>

{#if pdfData}
  <Pdf data={pdfData} mode="view" />
{/if}
```

### 7. From Drag and Drop

Accept PDF files via drag-and-drop:

```xmlui
<Script>
  let pdfData = null;
  let isDragging = false;
  
  function handleDragOver(event) {
    event.preventDefault();
    isDragging = true;
  }
  
  function handleDragLeave(event) {
    isDragging = false;
  }
  
  async function handleDrop(event) {
    event.preventDefault();
    isDragging = false;
    
    const files = Array.from(event.dataTransfer.files);
    const pdfFile = files.find(f => f.type === 'application/pdf');
    
    if (pdfFile) {
      pdfData = pdfFile;
    }
  }
</Script>

<div 
  style={`
    border: 2px dashed ${isDragging ? '#0066cc' : '#ccc'};
    padding: 40px;
    text-align: center;
    background: ${isDragging ? '#f0f8ff' : 'white'};
  `}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
>
  {#if pdfData}
    <Pdf data={pdfData} mode="view" />
  {:else}
    <p>Drag and drop a PDF file here</p>
  {/if}
</div>
```

---

## Data Format Conversions

Sometimes you need to convert between formats:

### ArrayBuffer ↔ Uint8Array

```javascript
// ArrayBuffer to Uint8Array
const arrayBuffer = await response.arrayBuffer();
const uint8Array = new Uint8Array(arrayBuffer);

// Uint8Array to ArrayBuffer
const arrayBuffer = uint8Array.buffer;
```

### Blob ↔ ArrayBuffer

```javascript
// Blob to ArrayBuffer
const blob = new Blob([pdfData], { type: 'application/pdf' });
const arrayBuffer = await blob.arrayBuffer();

// ArrayBuffer to Blob
const arrayBuffer = /* ... */;
const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
```

### Base64 ↔ Uint8Array

```javascript
// Base64 to Uint8Array
const base64 = "JVBERi0xLjQK...";
const binaryString = atob(base64);
const bytes = new Uint8Array(binaryString.length);
for (let i = 0; i < binaryString.length; i++) {
  bytes[i] = binaryString.charCodeAt(i);
}

// Uint8Array to Base64
const bytes = new Uint8Array([...]); 
const binaryString = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
const base64 = btoa(binaryString);
```

### Data URL to Blob

```javascript
async function dataUrlToBlob(dataUrl) {
  const response = await fetch(dataUrl);
  return response.blob();
}

// Usage
const dataUrl = "data:application/pdf;base64,...";
const blob = await dataUrlToBlob(dataUrl);
```

---

## Advanced Patterns

### Lazy Loading

Load PDFs only when needed:

```xmlui
<Script>
  let pdfData = null;
  let loading = false;
  
  async function loadPdf(documentId) {
    loading = true;
    const response = await fetch(`/api/documents/${documentId}`);
    const arrayBuffer = await response.arrayBuffer();
    pdfData = arrayBuffer;
    loading = false;
  }
</Script>

{#if !pdfData}
  <Button onClick={() => loadPdf(123)}>Load Document</Button>
{:else if loading}
  <Spinner />
{:else}
  <Pdf data={pdfData} mode="view" />
{/if}
```

### Progress Tracking

Show download progress for large PDFs:

```xmlui
<Script>
  let pdfData = null;
  let progress = 0;
  
  async function loadPdfWithProgress(url) {
    const response = await fetch(url);
    const contentLength = response.headers.get('content-length');
    const total = parseInt(contentLength, 10);
    let loaded = 0;
    
    const reader = response.body.getReader();
    const chunks = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      chunks.push(value);
      loaded += value.length;
      progress = (loaded / total) * 100;
    }
    
    // Combine chunks
    const chunksAll = new Uint8Array(loaded);
    let position = 0;
    for (const chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }
    
    pdfData = chunksAll;
  }
</Script>

{#if !pdfData}
  <Button onClick={() => loadPdfWithProgress('/large.pdf')}>
    Load Large PDF
  </Button>
  {#if progress > 0}
    <progress value={progress} max={100} />
    <span>{progress.toFixed(0)}%</span>
  {/if}
{:else}
  <Pdf data={pdfData} mode="view" />
{/if}
```

### Caching Strategy

Cache PDFs in browser for offline access:

```xmlui
<Script>
  async function loadPdfWithCache(documentId) {
    // Try cache first
    const cache = await caches.open('pdf-cache-v1');
    const cacheKey = `/api/pdfs/${documentId}`;
    
    let response = await cache.match(cacheKey);
    
    if (!response) {
      // Not in cache, fetch from network
      response = await fetch(cacheKey);
      
      // Store in cache for next time
      await cache.put(cacheKey, response.clone());
    }
    
    return response.arrayBuffer();
  }
  
  let pdfData = null;
  
  async function loadDocument() {
    pdfData = await loadPdfWithCache(456);
  }
</Script>

<Button onClick={loadDocument}>Load Document (Cached)</Button>

{#if pdfData}
  <Pdf data={pdfData} mode="view" />
{/if}
```

### Memory Management

For very large PDFs, clean up when component unmounts:

```xmlui
<Script>
  let pdfData = null;
  
  // Component cleanup (XMLUI lifecycle)
  onDestroy(() => {
    // Release reference to allow garbage collection
    pdfData = null;
  });
</Script>
```

---

## Best Practices

### ✅ DO

- **Validate file size** before loading (prevent memory issues)
- **Check file type** (`application/pdf`) before processing
- **Use Uint8Array or ArrayBuffer** for best performance
- **Cache frequently accessed PDFs** in IndexedDB or Cache API
- **Show loading indicators** for network requests
- **Handle errors gracefully** with try/catch

### ❌ DON'T

- **Don't load huge PDFs (>50MB)** without pagination/streaming
- **Don't keep multiple PDFs in memory** simultaneously
- **Don't use base64 strings** for large files (memory overhead)
- **Don't forget to clean up** when component unmounts

---

## Performance Tips

1. **Use ArrayBuffer over base64**: Base64 uses ~33% more memory
2. **Implement lazy loading**: Don't load until user requests
3. **Use pagination**: Load pages on-demand for large documents
4. **Enable caching**: Store in IndexedDB or Cache API
5. **Monitor memory usage**: Use Chrome DevTools Performance tab

---

## TypeScript Types

```typescript
import type { PdfSource } from 'xmlui-pdf';

// PdfSource accepts:
type PdfSource = 
  | string           // URL or data URL
  | ArrayBuffer      // Binary data
  | Uint8Array       // Typed array
  | Blob             // File or Blob
  | null;            // No document
```

---

## Troubleshooting

### PDF doesn't display

**Check:**
- Is the data actually a valid PDF? (Starts with `%PDF-`)
- Is the mime type correct? (`application/pdf`)
- Are there CORS issues? (Check browser console)
- Is the ArrayBuffer empty? (Check `.byteLength`)

### Out of memory errors

**Solutions:**
- Reduce PDF file size
- Implement pagination/streaming
- Clean up previous PDFs before loading new ones
- Use worker threads for processing

### Slow loading

**Optimize:**
- Compress PDFs before sending
- Use HTTP/2 or HTTP/3
- Implement progressive loading
- Cache aggressively

---

## Related Documentation

- [api.md](./api.md) - react-pdf and pdfjs-dist API reference
- [plan.md](./plan.md) - Component implementation plan
- [React-PDF Documentation](https://github.com/wojtekmaj/react-pdf)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)

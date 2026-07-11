/**
 * Tests and examples for loading PDF documents from various data sources
 */
import { describe, it, expect } from "vitest";
import type { PdfSource } from "./types/source.types";

describe("PDF Data Source Support", () => {
  describe("Type compatibility", () => {
    it("should accept string URL", () => {
      const source: PdfSource = "/documents/sample.pdf";
      expect(source).toBe("/documents/sample.pdf");
    });

    it("should accept data URL string", () => {
      const base64 = "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFsgMyAwIFIgXQovQ291bnQgMQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbIDAgMCA2MTIgNzkyIF0KL0NvbnRlbnRzIDQgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRkCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMDA5IDAwMDAwIG4NCjAwMDAwMDAwNTggMDAwMDAgbg0KMDAwMDAwMDExNSAwMDAwMCBuDQowMDAwMDAwMjE0IDAwMDAwIG4NCjAwMDAwMDAzMDcgMDAwMDAgbg0KdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgozODgKJSVFT0Y=";
      const source: PdfSource = `data:application/pdf;base64,${base64}`;
      expect(source.startsWith("data:application/pdf")).toBe(true);
    });

    it("should accept ArrayBuffer", () => {
      const buffer = new ArrayBuffer(1024);
      const source: PdfSource = buffer;
      expect(source instanceof ArrayBuffer).toBe(true);
    });

    it("should accept Uint8Array", () => {
      const bytes = new Uint8Array([37, 80, 68, 70, 45]); // %PDF-
      const source: PdfSource = bytes;
      expect(source instanceof Uint8Array).toBe(true);
    });

    it("should accept Blob", () => {
      const blob = new Blob(["fake pdf content"], { type: "application/pdf" });
      const source: PdfSource = blob;
      expect(source instanceof Blob).toBe(true);
    });

    it("should accept null", () => {
      const source: PdfSource = null;
      expect(source).toBeNull();
    });
  });

  describe("Usage examples", () => {
    it("example: from fetch API", async () => {
      // Example code (not executed):
      const exampleCode = `
        const response = await fetch('/api/generate-pdf');
        const arrayBuffer = await response.arrayBuffer();
        
        // Use with XMLUI Pdf component
        <Pdf data={arrayBuffer} mode="view" />
      `;
      expect(exampleCode).toContain("arrayBuffer");
    });

    it("example: from file input", () => {
      // Example code (not executed):
      const exampleCode = `
        function handleFileSelect(event) {
          const file = event.target.files[0];
          if (file && file.type === 'application/pdf') {
            setPdfData(file); // File is a Blob subclass
          }
        }
        
        <input type="file" accept="application/pdf" onChange={handleFileSelect} />
        <Pdf data={pdfData} />
      `;
      expect(exampleCode).toContain("File");
    });

    it("example: from base64 string", () => {
      // Example code (not executed):
      const exampleCode = `
        // From API that returns base64
        const base64String = "JVBERi0xLjQK..."; // base64 PDF data
        const dataUrl = \`data:application/pdf;base64,\${base64String}\`;
        
        <Pdf data={dataUrl} />
      `;
      expect(exampleCode).toContain("base64");
    });

    it("example: from pdf-lib (creating PDF in memory)", () => {
      // Example code (not executed):
      const exampleCode = `
        import { PDFDocument, rgb } from 'pdf-lib';
        
        async function createAndDisplayPdf() {
          // Create PDF
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage([600, 400]);
          page.drawText('Hello World!', { x: 50, y: 350 });
          
          // Get bytes
          const pdfBytes = await pdfDoc.save();
          
          // Display (pdfBytes is Uint8Array)
          setPdfData(pdfBytes);
        }
        
        <Pdf data={pdfData} />
      `;
      expect(exampleCode).toContain("PDFDocument");
    });

    it("example: from @react-pdf/renderer", () => {
      // Example code (not executed):
      const exampleCode = `
        import { Document, Page, Text, pdf } from '@react-pdf/renderer';
        
        async function generateAndDisplayPdf() {
          const MyDocument = (
            <Document>
              <Page><Text>Hello World!</Text></Page>
            </Document>
          );
          
          // Generate Blob
          const blob = await pdf(MyDocument).toBlob();
          
          // Display
          setPdfData(blob);
        }
        
        <Pdf data={pdfData} />
      `;
      expect(exampleCode).toContain("@react-pdf/renderer");
    });

    it("example: from IndexedDB or Cache", () => {
      // Example code (not executed):
      const exampleCode = `
        // Store PDF in IndexedDB
        async function storePdf(pdfArrayBuffer) {
          const db = await openDB('pdf-cache');
          await db.put('pdfs', pdfArrayBuffer, 'document-1');
        }
        
        // Retrieve and display
        async function loadCachedPdf() {
          const db = await openDB('pdf-cache');
          const arrayBuffer = await db.get('pdfs', 'document-1');
          setPdfData(arrayBuffer);
        }
        
        <Pdf data={pdfData} />
      `;
      expect(exampleCode).toContain("IndexedDB");
    });

    it("example: converting between formats", () => {
      // Example code (not executed):
      const exampleCode = `
        // ArrayBuffer to Uint8Array
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Uint8Array to Blob
        const blob = new Blob([uint8Array], { type: 'application/pdf' });
        
        // Blob to ArrayBuffer
        const blobArrayBuffer = await blob.arrayBuffer();
        
        // Base64 to Uint8Array
        const base64 = "JVBERi0xLjQK...";
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        
        // All formats work with Pdf component
        <Pdf data={uint8Array} />
        <Pdf data={blob} />
        <Pdf data={arrayBuffer} />
      `;
      expect(exampleCode).toContain("ArrayBuffer");
    });
  });

  describe("Integration patterns", () => {
    it("pattern: lazy loading on demand", () => {
      const exampleCode = `
        // Pattern: Lazy load PDF only when user requests it
        function PdfViewer({ documentId }) {
          const [pdfData, setPdfData] = useState(null);
          const [loading, setLoading] = useState(false);
          
          const loadPdf = async () => {
            setLoading(true);
            const response = await fetch(\`/api/documents/\${documentId}\`);
            const arrayBuffer = await response.arrayBuffer();
            setPdfData(arrayBuffer);
            setLoading(false);
          };
          
          return (
            <div>
              {!pdfData && <button onClick={loadPdf}>Load PDF</button>}
              {loading && <div>Loading...</div>}
              {pdfData && <Pdf data={pdfData} />}
            </div>
          );
        }
      `;
      expect(exampleCode).toContain("Lazy load");
    });

    it("pattern: caching with React Query", () => {
      const exampleCode = `
        // Pattern: Cache PDF data using TanStack React Query
        import { useQuery } from '@tanstack/react-query';
        
        function PdfViewer({ documentId }) {
          const { data: pdfData } = useQuery({
            queryKey: ['pdf', documentId],
            queryFn: async () => {
              const response = await fetch(\`/api/pdf/\${documentId}\`);
              return response.arrayBuffer();
            },
            staleTime: 5 * 60 * 1000, // Cache for 5 minutes
          });
          
          return pdfData ? <Pdf data={pdfData} /> : <div>Loading...</div>;
        }
      `;
      expect(exampleCode).toContain("TanStack");
    });

    it("pattern: handling upload errors", () => {
      const exampleCode = `
        function PdfUploadViewer() {
          const [pdfData, setPdfData] = useState(null);
          const [error, setError] = useState(null);
          
          const handleFileChange = async (event) => {
            const file = event.target.files[0];
            
            // Validate
            if (!file) return;
            if (file.type !== 'application/pdf') {
              setError('Please select a PDF file');
              return;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
              setError('File too large (max 10MB)');
              return;
            }
            
            setError(null);
            setPdfData(file);
          };
          
          return (
            <div>
              <input type="file" accept=".pdf" onChange={handleFileChange} />
              {error && <div className="error">{error}</div>}
              {pdfData && <Pdf data={pdfData} />}
            </div>
          );
        }
      `;
      expect(exampleCode).toContain("Validate");
    });
  });
});

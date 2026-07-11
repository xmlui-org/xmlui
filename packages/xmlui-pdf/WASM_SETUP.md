# PDF.js WASM Configuration

## Issue

When loading PDFs with JPEG2000 (JPX) encoded images, PDF.js shows a warning:
```
Warning: JpxImage#instantiateWasm: UnknownErrorException: Ensure that the `wasmUrl` API parameter is provided.
```

This happens because PDF.js needs WebAssembly decoders for optimal performance when processing certain image formats.

## Solution

The xmlui-pdf package now automatically handles WASM file setup:

### For Development

The `prestart` script automatically copies the required WASM files (`openjpeg.wasm` and `qcms_bg.wasm`) from `pdfjs-dist` to the `public/wasm` directory so they can be served by the development server.

### For Production

The Vite build plugin automatically copies these WASM files to `dist/wasm` during the build process.

### Setup

The setup happens automatically via package scripts:
- `postinstall`: Runs after `npm install` to ensure WASM files are available
- `prestart`: Runs before `npm start` to refresh WASM files if needed

## Files Modified

1. **scripts/setup-wasm.js** - Script to copy WASM files
2. **vite.config-overrides.ts** - Vite plugin to include WASM in builds  
3. **src/PdfNative.tsx** - Set PDF.js verbosity to suppress warnings
4. **package.json** - Added setup scripts
5. **.gitignore** - Exclude auto-generated WASM files

## Manual Setup

If needed, you can manually run the setup script:
```bash
npm run prestart
```

Or directly:
```bash
node scripts/setup-wasm.js
```

## Notes

- WASM files are auto-generated and should not be committed to Git
- The setup script works in monorepo structures by checking multiple node_modules locations
- PDF.js falls back to JavaScript decoding if WASM is unavailable (slower but functional)

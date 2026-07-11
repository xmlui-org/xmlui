#!/usr/bin/env node

/**
 * Setup script to copy PDF.js WASM and image decoder files to the public directory
 * This ensures the image decoders work properly in both dev and production
 */

import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, '..');

const wasmFiles = ['openjpeg.wasm', 'qcms_bg.wasm'];
const decoderFiles = ['pdf.image_decoders.min.mjs'];

try {
  const publicWasmDir = resolve(packageRoot, 'public', 'wasm');
  
  // Try both local node_modules and workspace root node_modules (for monorepos)
  const possibleWasmDirs = [
    resolve(packageRoot, 'node_modules', 'pdfjs-dist', 'wasm'),
    resolve(packageRoot, '../..', 'node_modules', 'pdfjs-dist', 'wasm'),
  ];
  
  const possibleDecoderDirs = [
    resolve(packageRoot, 'node_modules', 'pdfjs-dist', 'image_decoders'),
    resolve(packageRoot, '../..', 'node_modules', 'pdfjs-dist', 'image_decoders'),
  ];
  
  const sourceWasmDir = possibleWasmDirs.find(dir => existsSync(dir));
  const sourceDecoderDir = possibleDecoderDirs.find(dir => existsSync(dir));
  
  if (!sourceWasmDir) {
    console.error('❌ Error: Could not find pdfjs-dist/wasm directory');
    console.error('Tried:', possibleWasmDirs);
    process.exit(1);
  }

  // Create public/wasm directory if it doesn't exist
  if (!existsSync(publicWasmDir)) {
    mkdirSync(publicWasmDir, { recursive: true });
    console.log('✓ Created public/wasm directory');
  }

  // Copy each WASM file
  for (const file of wasmFiles) {
    const source = resolve(sourceWasmDir, file);
    const dest = resolve(publicWasmDir, file);
    
    if (existsSync(source)) {
      copyFileSync(source, dest);
      console.log(`✓ Copied ${file}`);
    } else {
      console.warn(`⚠ Warning: ${file} not found at ${source}`);
    }
  }
  
  // Copy image decoder JS modules if available
  if (sourceDecoderDir) {
    for (const file of decoderFiles) {
      const source = resolve(sourceDecoderDir, file);
      const dest = resolve(publicWasmDir, file);
      
      if (existsSync(source)) {
        copyFileSync(source, dest);
        console.log(`✓ Copied ${file}`);
      } else {
        console.warn(`⚠ Warning: ${file} not found at ${source}`);
      }
    }
  }

  console.log('✅ PDF.js WASM and decoder files setup complete');
} catch (error) {
  console.error('❌ Error setting up files:', error.message);
  process.exit(1);
}
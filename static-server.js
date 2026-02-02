#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// MIME types mapping
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.xml': 'application/xml',
  '.rss': 'application/rss+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.zip': 'application/zip'
};

// Resource file extensions that should return proper 404s instead of SPA fallback
const resourceExtensions = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
  '.json', '.xml', '.rss', '.js', '.css', '.woff', '.woff2',
  '.ttf', '.eot', '.md', '.mp4', '.mp3', '.zip', '.csv', '.pdf'
]);

function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Error: Missing static directory path');
    process.exit(1);
  }
  
  const staticDir = args[0];
  const portIndex = args.indexOf('--port');
  
  let port = null; // null means try 3000 then fallback to 0
  let explicitPort = false;
  
  if (portIndex !== -1) {
    const portValue = args[portIndex + 1];
    if (!portValue || isNaN(parseInt(portValue))) {
      console.error('Error: --port requires a valid number');
      process.exit(1);
    }
    port = parseInt(portValue);
    explicitPort = true;
  }
  
  return { staticDir, port, explicitPort };
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'text/plain';
}

function isResourceFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return resourceExtensions.has(ext);
}

function findFile(staticDir, pathname) {
  // Try exact file path first
  const exactPath = path.join(staticDir, pathname);
  if (fs.existsSync(exactPath) && fs.statSync(exactPath).isFile()) {
    return exactPath;
  }
  
  // For clean paths (no extension), try index.html first, then .html
  if (!path.extname(pathname) && pathname !== '') {
    // Try /path/index.html
    const indexPath = path.join(staticDir, pathname, 'index.html');
    if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
      return indexPath;
    }
    
    // Try /path.html
    const htmlPath = path.join(staticDir, pathname + '.html');
    if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
      return htmlPath;
    }
  }
  
  return null;
}

function createServer(staticDir) {
  return http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Normalize pathname (remove leading slash, ensure it doesn't start with ..)
    pathname = pathname.replace(/^\/+/, '');
    if (pathname.includes('..')) {
      res.writeHead(400);
      res.end('Bad Request');
      return;
    }
    
    // Special case for root
    if (pathname === '') {
      pathname = 'index.html';
    }
    
    let filePath = findFile(staticDir, pathname);
    
    if (!filePath) {
      // Check if this is a resource file request
      const isResource = isResourceFile(pathname) || 
                         pathname.startsWith('resources/') || 
                         pathname.startsWith('assets/');
      
      if (isResource) {
        // Return proper 404 for resource files
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      
      // For non-resource files, fallback to index.html (SPA behavior)
      const indexPath = path.join(staticDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        filePath = indexPath;
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
    }
    
    // Serve the file
    try {
      const stat = fs.statSync(filePath);
      const mimeType = getMimeType(filePath);
      
      // Set cache headers based on file type
      let headers = { 'Content-Type': mimeType };
      
      if (mimeType.startsWith('image/') || pathname.includes('.woff') || pathname.includes('.ttf')) {
        headers['Cache-Control'] = 'public, max-age=31536000, immutable';
      } else if (pathname.includes('.html') || pathname.includes('.js') || pathname.includes('.css')) {
        headers['Cache-Control'] = 'max-age=30, must-revalidate';
      } else {
        headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0';
      }
      
      res.writeHead(200, headers);
      
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
      
      readStream.on('error', (err) => {
        console.error('Error reading file:', err);
        if (!res.headersSent) {
          res.writeHead(500);
          res.end('Internal Server Error');
        }
      });
      
    } catch (err) {
      console.error('Error serving file:', err);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  });
}

function startServer(port, explicitPort, staticDir, server) {
  const tryStart = (portToTry) => {
    server.listen(portToTry, () => {
      const actualPort = server.address().port;
      console.log(`Static server running at http://localhost:${actualPort}`);
      console.log(`Serving files from: ${path.resolve(staticDir)}`);
      
      if (actualPort === 0) {
        console.log('Port was automatically assigned by the OS');
      }
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        if (explicitPort) {
          console.error(`Error: Port ${portToTry} is already in use`);
          process.exit(1);
        } else if (portToTry === 3000) {
          // Try port 0 (OS-assigned) as fallback
          console.log('Port 3000 is in use, trying OS-assigned port...');
          tryStart(0);
        } else {
          console.error('Error: Could not find an available port');
          process.exit(1);
        }
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  };
  
  // If no explicit port specified, try 3000 first, then fallback to 0
  if (port === null) {
    tryStart(3000);
  } else {
    tryStart(port);
  }
}

// Main execution
function main() {
  const { staticDir, port, explicitPort } = parseArgs();
  
  // Verify static directory exists
  if (!fs.existsSync(staticDir)) {
    console.error(`Error: Static directory '${staticDir}' does not exist`);
    process.exit(1);
  }
  
  const server = createServer(staticDir);
  startServer(port, explicitPort, staticDir, server);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});

if (require.main === module) {
  main();
}

module.exports = { createServer, startServer };
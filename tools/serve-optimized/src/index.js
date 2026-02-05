const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

// MIME types mapping
const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".xml": "application/xml",
  ".rss": "application/rss+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".zip": "application/zip",
};

// Resource file extensions that should return proper 404s instead of SPA fallback
const resourceExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".ico",
  ".json",
  ".xml",
  ".rss",
  ".js",
  ".css",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".md",
  ".mp4",
  ".mp3",
  ".zip",
  ".csv",
  ".pdf",
]);

class Server {
  constructor(staticDir, options = {}) {
    this.staticDir = staticDir;
    this.port = options.port || null;
    this.explicitPort = options.port != null;
    this.server = null;
    this.hasStarted = false; // Track if startup messages have been shown

    this._validateStaticDir();
  }

  _validateStaticDir() {
    if (!fs.existsSync(this.staticDir)) {
      throw new Error(`Static directory '${this.staticDir}' does not exist`);
    }

    const stats = fs.statSync(this.staticDir);
    if (!stats.isDirectory()) {
      throw new Error(`Path '${this.staticDir}' is not a directory`);
    }
  }

  _getTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");
    return `${hours}:${minutes}:${seconds}.${milliseconds.slice(0, 2)}`;
  }

  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || "text/plain";
  }

  isResourceFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return resourceExtensions.has(ext);
  }

  findFile(pathname) {
    // Try exact file path first
    const exactPath = path.join(this.staticDir, pathname);
    if (fs.existsSync(exactPath) && fs.statSync(exactPath).isFile()) {
      return exactPath;
    }

    // For clean paths (no extension), try index.html first, then .html
    if (!path.extname(pathname) && pathname !== "") {
      // Try /path/index.html
      const indexPath = path.join(this.staticDir, pathname, "index.html");
      if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
        return indexPath;
      }

      // Try /path.html
      const htmlPath = path.join(this.staticDir, pathname + ".html");
      if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
        return htmlPath;
      }
    }

    return null;
  }

  _createRequestHandler() {
    return (req, res) => {
      const parsedUrl = new URL(req.url);
      let pathname = parsedUrl.pathname;

      // Normalize pathname (remove leading slash, ensure it doesn't start with ..)
      pathname = pathname.replace(/^\/+/, "");
      if (pathname.includes("..")) {
        console.warn(`\x1b[33mWARN: Invalid path attempt\x1b[0m`);
        res.writeHead(400);
        res.end("Bad Request");
        return;
      }

      // Special case for root
      if (pathname === "") {
        pathname = "index.html";
      }

      let filePath = this.findFile(pathname);
      let statusCode = 200;

      if (!filePath) {
        // Check if this is a resource file request
        const isResource =
          this.isResourceFile(pathname) ||
          pathname.startsWith("resources/") ||
          pathname.startsWith("assets/");

        if (isResource) {
          // Return proper 404 for resource files
          const timestamp = this._getTimestamp();
          const msg = `${timestamp} \x1b[36m${req.method}\x1b[0m \x1b[33m${pathname}\x1b[0m -> \x1b[31m404\x1b[0m -`;
          console.log(msg);

          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("404 Not Found");
          return;
        }

        // For non-resource files, fallback to index.html (SPA behavior)
        const indexPath = path.join(this.staticDir, "index.html");
        if (fs.existsSync(indexPath)) {
          filePath = indexPath;
        } else {
          const timestamp = this._getTimestamp();
          const msg = `${timestamp} \x1b[36m${req.method}\x1b[0m \x1b[33m${pathname}\x1b[0m -> \x1b[31m404\x1b[0m -`;
          console.log(msg);

          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("404 Not Found");
          return;
        }
      }

      // Serve file
      try {
        const mimeType = this.getMimeType(filePath);

        // Set cache headers based on file type
        let headers = { "Content-Type": mimeType };
        headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0";

        res.writeHead(statusCode, headers);

        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);

        readStream.on("error", (err) => {
          console.error(`\x1b[31mERROR: Error reading file ${err.message}\x1b[0m`);
          if (!res.headersSent) {
            res.writeHead(500);
            res.end("Internal Server Error");
          }
        });

        readStream.on("end", () => {
          const timestamp = this._getTimestamp();
          const returnedFile = filePath.replace(this.staticDir + path.sep, "");

          let logOutput = `${timestamp} \x1b[36m${req.method}\x1b[0m \x1b[33m${pathname}\x1b[0m -> \x1b[32m${statusCode}\x1b[0m`;

          // Only show file path if it's different from requested path and wasn't directly requested HTML
          if (returnedFile !== pathname) {
            logOutput += ` \x1b[35m${returnedFile}\x1b[0m`;
          }

          console.log(logOutput);
        });
      } catch (err) {
        console.error(`\x1b[31mERROR: Error serving file ${err.message}\x1b[0m`);
        res.writeHead(500);
        res.end("Internal Server Error");
      }
    };
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer(this._createRequestHandler());

      const showStartupMessage = () => {
        const actualPort = this.server.address().port;
        const resolvedStaticDir = path.resolve(this.staticDir);

        console.log(
          `\x1b[34m   XMLUI static file server for previewing optimized outputs.\x1b[0m\n`,
        );
        console.log(`\x1b[34m📁 This is the Serving files from: ${resolvedStaticDir}\x1b[0m`);
        console.log(`\x1b[32m🚀 Static server running at http://localhost:${actualPort}\x1b[0m`);

        if (actualPort === 0) {
          console.log(`\x1b[33m🔢 Port was automatically assigned by the OS\x1b[0m`);
        }

        console.log(`\x1b[36m⏹️ Press Ctrl+C to stop the server\x1b[0m`);
        console.log();

        resolve({ port: actualPort, staticDir: resolvedStaticDir });
      };

      const tryStart = (portToTry) => {
        this.server.on("listening", () => {
          if (!this.hasStarted) {
            this.hasStarted = true;
            showStartupMessage();
          }
        });

        this.server.on("error", (err) => {
          if (err.code === "EADDRINUSE") {
            if (this.explicitPort) {
              console.error(`\x1b[31m❌ Error: Port ${portToTry} is already in use\x1b[0m`);
              reject(err);
            } else if (portToTry === 3000) {
              console.log(`\x1b[33m⚠️  Port 3000 is in use, trying OS-assigned port...\x1b[0m\n`);
              tryStart(0);
            } else {
              console.error(`\x1b[31m❌ Error: Could not find an available port\x1b[0m`);
              reject(err);
            }
          } else {
            console.error(`\x1b[31m❌ Server error: ${err.message}\x1b[0m`);
            reject(err);
          }
        });

        this.server.listen(portToTry);
      };

      // If no explicit port specified, try 3000 first, then fallback to 0
      if (this.port === null) {
        tryStart(3000);
      } else {
        tryStart(this.port);
      }
    });
  }

  stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log("\n🛑 Server stopped");
          resolve();
        });
      });
    }
  }
}

module.exports = { Server, mimeTypes, resourceExtensions };

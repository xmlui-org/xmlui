const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

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

  _log(level, message, extra = {}) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...extra,
    };

    if (level === "error") {
      console.error(`[${timestamp}] ERROR: ${message}`, extra);
    } else if (level === "warn") {
      console.warn(`[${timestamp}] WARN: ${message}`, extra);
    } else {
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, extra);
    }
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
      const startTime = Date.now();
      const parsedUrl = url.parse(req.url);
      let pathname = parsedUrl.pathname;

      // Normalize pathname (remove leading slash, ensure it doesn't start with ..)
      pathname = pathname.replace(/^\/+/, "");
      if (pathname.includes("..")) {
        this._log("warn", "Invalid path attempt", {
          pathname,
          userAgent: req.headers["user-agent"],
        });
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
          statusCode = 404;
          this._log("info", "Resource not found", {
            pathname,
            statusCode,
            userAgent: req.headers["user-agent"],
          });

          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("404 Not Found");
          return;
        }

        // For non-resource files, fallback to index.html (SPA behavior)
        const indexPath = path.join(this.staticDir, "index.html");
        if (fs.existsSync(indexPath)) {
          filePath = indexPath;
          this._log("info", "SPA fallback to index.html", {
            pathname,
            fallbackFile: "index.html",
            userAgent: req.headers["user-agent"],
          });
        } else {
          statusCode = 404;
          this._log("error", "No index.html for SPA fallback", {
            pathname,
            statusCode,
            userAgent: req.headers["user-agent"],
          });

          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("404 Not Found");
          return;
        }
      }

      // Serve the file
      try {
        const stat = fs.statSync(filePath);
        const mimeType = this.getMimeType(filePath);
        const responseTime = Date.now() - startTime;

        // Set cache headers based on file type
        let headers = { "Content-Type": mimeType };

        if (
          mimeType.startsWith("image/") ||
          pathname.includes(".woff") ||
          pathname.includes(".ttf")
        ) {
          headers["Cache-Control"] = "public, max-age=31536000, immutable";
        } else if (
          pathname.includes(".html") ||
          pathname.includes(".js") ||
          pathname.includes(".css")
        ) {
          headers["Cache-Control"] = "max-age=30, must-revalidate";
        } else {
          headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0";
        }

        res.writeHead(statusCode, headers);

        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);

        readStream.on("error", (err) => {
          this._log("error", "Error reading file", {
            filePath,
            error: err.message,
            userAgent: req.headers["user-agent"],
          });

          if (!res.headersSent) {
            res.writeHead(500);
            res.end("Internal Server Error");
          }
        });

        readStream.on("end", () => {
          this._log("info", "Request served", {
            method: req.method,
            pathname,
            statusCode,
            contentType: mimeType,
            fileSize: stat.size,
            responseTime: `${responseTime}ms`,
            userAgent: req.headers["user-agent"],
          });
        });
      } catch (err) {
        const responseTime = Date.now() - startTime;
        this._log("error", "Error serving file", {
          filePath,
          error: err.message,
          responseTime: `${responseTime}ms`,
          userAgent: req.headers["user-agent"],
        });

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

        console.log(`🚀 Static server running at http://localhost:${actualPort}`);
        console.log(`📁 Serving files from: ${resolvedStaticDir}`);

        if (actualPort === 0) {
          console.log(`🔢 Port was automatically assigned by the OS`);
        }

        console.log(`⏹️  Press Ctrl+C to stop the server`);
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
              console.error(`❌ Error: Port ${portToTry} is already in use`);
              reject(err);
            } else if (portToTry === 3000) {
              console.log(`⚠️  Port 3000 is in use, trying OS-assigned port...`);
              tryStart(0);
            } else {
              console.error(`❌ Error: Could not find an available port`);
              reject(err);
            }
          } else {
            console.error(`❌ Server error: ${err.message}`);
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

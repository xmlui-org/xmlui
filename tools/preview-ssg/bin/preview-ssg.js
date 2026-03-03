#!/usr/bin/env node

const { Server } = require("../src/index.js");

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Error: Missing static directory path");
    console.error("Usage: preview-ssg <directory> [--port <port>] [--fallback <file>]");
    process.exit(1);
  }

  const staticDir = args[0];
  const portIndex = args.indexOf("--port");
  const fallbackIndex = args.indexOf("--fallback");

  let port = null; // null means try 3000 then fallback to 0
  let fallbackFile = "200.html";

  if (portIndex !== -1) {
    const portValue = args[portIndex + 1];
    if (!portValue || isNaN(parseInt(portValue))) {
      console.error("Error: --port requires a valid number");
      process.exit(1);
    }
    port = parseInt(portValue);
  }

  if (fallbackIndex !== -1) {
    const fallbackValue = args[fallbackIndex + 1];
    if (!fallbackValue || fallbackValue.startsWith("--")) {
      console.error("Error: --fallback requires a file name");
      process.exit(1);
    }
    // Append .html if not already present
    fallbackFile = fallbackValue.endsWith(".html") ? fallbackValue : fallbackValue + ".html";
  }

  const server = new Server(staticDir, {
    port,
    fallbackFile,
  });

  server.start().catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });
}

if (require.main === module) {
  main();
}

module.exports = { main };

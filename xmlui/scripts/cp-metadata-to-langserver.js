const fs = require("fs");
const path = require("path");

// Define source and destination paths
const sourcePath = path.join(__dirname, "..", "dist", "xmlui-metadata.mjs");
const destPath = path.join(__dirname, "..", "src", "language-server", "xmlui-metadata.mjs");

// Ensure the destination directory exists
const destDir = path.dirname(destPath);
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy the file
try {
  fs.copyFileSync(sourcePath, destPath);
  console.log(`Copied metadata file to '${destPath}'`);
} catch (error) {
  console.error(`Error copying metadata file to '${destPath}':`, error);
}

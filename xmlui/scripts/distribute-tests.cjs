#!/usr/bin/env node

/**
 * Distributes E2E test files across N parallel batches
 * 
 * Usage:
 *   node xmlui/scripts/distribute-tests.js [numBatches]
 * 
 * Output:
 *   JSON array with batches, each containing { files: [], testCount: 0 }
 */

const fs = require("fs");
const path = require("path");

const numBatches = parseInt(process.argv[2] || "3", 10);
const rootDir = path.resolve(__dirname, "../..");

// Validate batch count
if (numBatches < 1) {
  console.error("ERROR: Number of batches must be at least 1");
  process.exit(1);
}
if (numBatches > 8) {
  console.error("ERROR: Number of batches cannot exceed 8");
  process.exit(1);
}

// Find all .spec.ts files in xmlui and packages directories
function findSpecFiles() {
  const specFiles = [];

  const directories = ["xmlui", "packages"];

  for (const dir of directories) {
    const fullPath = path.join(rootDir, dir);
    if (!fs.existsSync(fullPath)) continue;

    // Find all .spec.ts files recursively
    function walkDir(currentPath, relativePath = "") {
      const files = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const file of files) {
        const fullFilePath = path.join(currentPath, file.name);
        const relativeFilePath = relativePath
          ? path.join(relativePath, file.name)
          : file.name;

        if (file.isDirectory()) {
          // Skip common directories that don't contain tests
          if (
            ![
              "node_modules",
              "dist",
              "build",
              ".turbo",
              ".git",
              "__tests__",
            ].includes(file.name)
          ) {
            walkDir(fullFilePath, relativeFilePath);
          }
        } else if (file.name.endsWith(".spec.ts")) {
          specFiles.push({
            file: path.join(dir, relativeFilePath),
            dir: dir,
          });
        }
      }
    }

    walkDir(fullPath);
  }

  return specFiles;
}

// Get test count for a specific file by parsing the test file
function getTestCount(filePath) {
  try {
    const fullPath = path.join(rootDir, filePath);
    const content = fs.readFileSync(fullPath, "utf8");

    // Count test() declarations
    const testMatches = content.match(/^\s*test\s*\(\s*["']/gm) || [];
    const testCount = testMatches.length;

    // Count test.describe() blocks - these are test groups
    const describeMatches = content.match(/test\.describe\s*\(\s*["']/gm) || [];
    const describeCount = describeMatches.length;

    // Each describe block might contain multiple tests, so estimate conservatively
    // Count total blocks as a proxy for complexity
    const complexity = testCount + describeCount * 2; // Weight describe blocks higher

    return Math.max(complexity, 1); // At least 1
  } catch (error) {
    console.error(
      `Warning: Could not parse ${filePath}, assuming 1 test. Error: ${error.message}`
    );
    return 1;
  }
}

// Create batches with balanced test counts
function createBalancedBatches(filesWithCounts, numBatches) {
  // Sort files by test count in descending order (largest first)
  const sorted = filesWithCounts.sort((a, b) => b.count - a.count);

  // Initialize batches
  const batches = Array.from({ length: numBatches }, () => ({
    files: [],
    testCount: 0,
  }));

  // Distribute files using a greedy approach
  // Always add the next file to the batch with the fewest tests
  for (const { file, count } of sorted) {
    // Find the batch with the minimum test count
    let minIdx = 0;
    let minCount = batches[0].testCount;

    for (let i = 1; i < batches.length; i++) {
      if (batches[i].testCount < minCount) {
        minIdx = i;
        minCount = batches[i].testCount;
      }
    }

    batches[minIdx].files.push(file);
    batches[minIdx].testCount += count;
  }

  return batches;
}

console.error("Finding test files...");
const specFiles = findSpecFiles();
console.error(`Found ${specFiles.length} test files`);

if (specFiles.length === 0) {
  console.error("ERROR: No test files found");
  process.exit(1);
}

// Get test counts for each file
console.error("Counting test cases (this may take a moment)...");
const filesWithCounts = specFiles
  .map((spec) => {
    const count = getTestCount(spec.file);
    console.error(`  ${spec.file}: ${count} tests`);
    return {
      file: spec.file,
      count: count,
    };
  });

const totalTests = filesWithCounts.reduce((sum, f) => sum + f.count, 0);
console.error(`Total tests: ${totalTests}`);
console.error(`Creating ${numBatches} batches...`);

const batches = createBalancedBatches(filesWithCounts, numBatches);

// Log batch distribution
console.error("\nBatch distribution:");
batches.forEach((batch, idx) => {
  const percentage = ((batch.testCount / totalTests) * 100).toFixed(1);
  console.error(`  Batch ${idx}: ${batch.files.length} files, ${batch.testCount} tests (${percentage}%)`);
});
console.error("");

// Output batches as JSON
console.log(JSON.stringify(batches, null, 2));

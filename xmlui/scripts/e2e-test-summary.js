#!/usr/bin/env node

/**
 * XMLUI E2E Test Summary Generator
 * 
 * This script analyzes all XMLUI components and their corresponding end-to-end tests,
 * providing a comprehensive summary table showing test coverage and results.
 * 
 * Features:
 * - Extracts XMLUI components from collectedComponentMetadata.ts
 * - Maps components to their e2e test files
 * - Runs all e2e tests and collects results
 * - Displays a summary table with test statistics
 * - Shows test coverage percentage
 * 
 * Usage:
 *   npm run test:e2e-summary          # Run all tests and show results
 *   npm run test:e2e-summary -- --dry-run    # Show coverage without running tests
 * 
 * Options:
 *   --dry-run, --coverage-only    Show test coverage analysis without running tests
 *   --help                        Show this help message
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function showHelp() {
  console.log(`
XMLUI E2E Test Summary Generator

This script analyzes XMLUI components and their end-to-end test coverage.

Usage:
  node scripts/e2e-test-summary.js [options]

Options:
  --dry-run, --coverage-only    Show test coverage analysis without running tests
  --help                        Show this help message

Examples:
  npm run test:e2e-summary                     # Run all tests and show results
  npm run test:e2e-summary -- --dry-run       # Show coverage only
  node scripts/e2e-test-summary.js --help     # Show this help

The script will:
1. Extract all XMLUI components from metadata
2. Map components to their e2e test files
3. Run playwright e2e tests (unless --dry-run)
4. Display a comprehensive summary table
`);
}

/**
 * Extract component names from collectedComponentMetadata.ts
 */
function getXMLUIComponents() {
  const metadataPath = path.join(__dirname, '../src/components/collectedComponentMetadata.ts');
  const metadataContent = fs.readFileSync(metadataPath, 'utf8');
  
  // Extract the export object to get component names
  const exportMatch = metadataContent.match(/export const collectedComponentMetadata[^{]*{([^}]+)}/s);
  if (!exportMatch) {
    throw new Error('Could not parse collectedComponentMetadata.ts');
  }
  
  const exportContent = exportMatch[1];
  const componentNames = [];
  
  // Extract component names (keys from the export object)
  const lines = exportContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('//') && trimmed.includes(':')) {
      const match = trimmed.match(/^\s*([A-Za-z][A-Za-z0-9]*)\s*:/);
      if (match) {
        const componentName = match[1];
        // Filter out HTML components (lowercase names) and focus on XMLUI components
        if (componentName[0] === componentName[0].toUpperCase() && 
            !componentName.startsWith('Html') && 
            componentName !== 'CODE' && 
            componentName !== 'EM') {
          componentNames.push(componentName);
        }
      }
    }
  }
  
  return componentNames.sort();
}

/**
 * Get list of component test files in the xmlui/src/components directories
 */
function getE2ETestFiles() {
  const componentsDir = path.join(__dirname, '../src/components');
  
  if (!fs.existsSync(componentsDir)) {
    return [];
  }
  
  const testFiles = [];
  
  // Get all subdirectories in components
  const componentDirs = fs.readdirSync(componentsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  // Check each component directory for spec files
  for (const componentDir of componentDirs) {
    const componentPath = path.join(componentsDir, componentDir);
    const files = fs.readdirSync(componentPath);
    
    const specFiles = files.filter(file => file.endsWith('.spec.ts'));
    for (const specFile of specFiles) {
      testFiles.push({
        componentName: componentDir,
        fileName: path.basename(specFile, '.spec.ts'),
        fullPath: path.join(componentPath, specFile)
      });
    }
  }
  
  return testFiles;
}

/**
 * Map component names to their corresponding test files
 */
function mapComponentsToTestFiles(components, testFiles) {
  const componentTestMap = new Map();
  
  for (const component of components) {
    // Find test files for this component
    const matchingTests = testFiles.filter(testFile => {
      // Direct component directory match
      if (testFile.componentName === component) {
        return true;
      }
      
      // Check various naming patterns
      const componentLower = component.toLowerCase();
      const testComponentLower = testFile.componentName.toLowerCase();
      
      // Exact match (case insensitive)
      if (testComponentLower === componentLower) {
        return true;
      }
      
      // Check if test file name matches component
      const testFileNameLower = testFile.fileName.toLowerCase();
      if (testFileNameLower === componentLower) {
        return true;
      }
      
      // Handle compound components like CHStack, CVStack -> Stack
      if (componentLower.endsWith('stack') && testComponentLower === 'stack') {
        return true;
      }
      
      // Handle H1, H2, etc. -> Heading
      if (componentLower.match(/^h[1-6]$/) && testComponentLower === 'heading') {
        return true;
      }
      
      return false;
    });
    
    componentTestMap.set(component, matchingTests);
  }
  
  return componentTestMap;
}

/**
 * Run playwright tests and get JSON results
 */
function runPlaywrightTests() {
  const workingDir = __dirname; // xmlui directory
  
  try {
    console.log('Running e2e tests...');
    console.log(`Working directory: ${workingDir}`);
    
    // Run the npm script for e2e tests
    const result = execSync(
      `npm run test:e2e-non-smoke -- --reporter=json`,
      { 
        cwd: workingDir,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large output
      }
    );
    
    // Extract JSON from npm output (skip npm prefix lines)
    const lines = result.split('\n');
    const jsonStartIndex = lines.findIndex(line => line.trim().startsWith('{'));
    if (jsonStartIndex === -1) {
      throw new Error('No JSON output found in test results');
    }
    const jsonOutput = lines.slice(jsonStartIndex).join('\n');
    
    return JSON.parse(jsonOutput);
  } catch (error) {
    // Tests may fail, but we still want to process results if available
    console.log('Tests completed (some may have failed)');
    
    // Try to parse the output even if the command failed
    if (error.stdout) {
      try {
        // Extract JSON from npm output (skip npm prefix lines)
        const lines = error.stdout.split('\n');
        const jsonStartIndex = lines.findIndex(line => line.trim().startsWith('{'));
        if (jsonStartIndex === -1) {
          console.error('No JSON output found in error output');
          return null;
        }
        const jsonOutput = lines.slice(jsonStartIndex).join('\n');
        
        return JSON.parse(jsonOutput);
      } catch (parseError) {
        console.error('Could not parse test results JSON:', parseError.message);
      }
    }
    
    console.log('No test results available - showing component coverage only');
  }
  
  return null;
}

/**
 * Parse test results and group by component
 */
function parseTestResults(results) {
  if (!results || !results.suites) {
    return new Map();
  }
  
  const componentResults = new Map();
  
  function processSpec(spec, filePath) {
    if (!spec.tests) return;
    
    // Extract component name from file path
    const pathMatch = filePath.match(/\/src\/components\/([^\/]+)\//);
    const componentName = pathMatch ? pathMatch[1] : path.basename(path.dirname(filePath));
    
    if (!componentResults.has(componentName)) {
      componentResults.set(componentName, {
        passed: 0,
        failed: 0,
        skipped: 0,
        total: 0
      });
    }
    
    const componentResult = componentResults.get(componentName);
    
    for (const test of spec.tests) {
      for (const result of test.results || []) {
        componentResult.total++;
        
        switch (result.status) {
          case 'passed':
            componentResult.passed++;
            break;
          case 'failed':
            componentResult.failed++;
            break;
          case 'skipped':
            componentResult.skipped++;
            break;
          default:
            componentResult.skipped++;
        }
      }
    }
  }
  
  function processSuite(suite, inheritedFilePath = '') {
    const currentFilePath = suite.file || inheritedFilePath;
    
    if (suite.specs) {
      for (const spec of suite.specs) {
        processSpec(spec, currentFilePath);
      }
    }
    
    if (suite.suites) {
      for (const subSuite of suite.suites) {
        processSuite(subSuite, currentFilePath);
      }
    }
  }
  
  for (const suite of results.suites) {
    processSuite(suite);
  }
  
  return componentResults;
}

/**
 * Create and display the summary table
 */
function displaySummary(components, componentTestMap, testResults) {
  console.log('\n=== XMLUI Components E2E Test Summary ===\n');
  
  // Table header
  console.log('┌───────────────────────┬───────────┬────────┬────────┬─────────┬─────────────────┐');
  console.log('│ Component Name        │ Tests Run │ Passed │ Failed │ Skipped │ Status          │');
  console.log('├───────────────────────┼───────────┼────────┼────────┼─────────┼─────────────────┤');
  
  let totalComponents = 0;
  let componentsWithTests = 0;
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  
  for (const component of components) {
    totalComponents++;
    const testFiles = componentTestMap.get(component);
    
    if (!testFiles || testFiles.length === 0) {
      // No e2e tests
      console.log(`│ ${component.padEnd(21)} │ ${'-'.padStart(9)} │ ${'-'.padStart(6)} │ ${'-'.padStart(6)} │ ${'-'.padStart(7)} │ No E2E Tests    │`);
    } else {
      componentsWithTests++;
      const results = testResults ? testResults.get(component) : null;
      
      if (!results) {
        // Test files exist but no results (dry-run mode or test execution failed)
        const status = testResults === null ? 'Has E2E Tests' : 'Not Run/Failed';
        console.log(`│ ${component.padEnd(21)} │ ${'-'.padStart(9)} │ ${'-'.padStart(6)} │ ${'-'.padStart(6)} │ ${'-'.padStart(7)} │ ${status.padEnd(15)} │`);
      } else {
        totalTests += results.total;
        totalPassed += results.passed;
        totalFailed += results.failed;
        totalSkipped += results.skipped;
        
        const status = results.failed > 0 ? 'Some Failed' : 
                      results.total === 0 ? 'No Tests' : 'All Passed';
        
        console.log(`│ ${component.padEnd(21)} │ ${results.total.toString().padStart(9)} │ ${results.passed.toString().padStart(6)} │ ${results.failed.toString().padStart(6)} │ ${results.skipped.toString().padStart(7)} │ ${status.padEnd(15)} │`);
      }
    }
  }
  
  console.log('└───────────────────────┴───────────┴────────┴────────┴─────────┴─────────────────┘');
  
  // Summary statistics
  console.log('\n=== Summary Statistics ===');
  console.log(`Total XMLUI Components: ${totalComponents}`);
  console.log(`Components with E2E Tests: ${componentsWithTests}`);
  console.log(`Components without E2E Tests: ${totalComponents - componentsWithTests}`);
  
  if (testResults) {
    console.log(`Total E2E Tests Run: ${totalTests}`);
    console.log(`Total Passed: ${totalPassed}`);
    console.log(`Total Failed: ${totalFailed}`);
    console.log(`Total Skipped: ${totalSkipped}`);
    
    if (totalTests > 0) {
      const passRate = ((totalPassed / totalTests) * 100).toFixed(1);
      console.log(`Pass Rate: ${passRate}%`);
    }
  } else {
    console.log(`E2E tests were not run - showing test coverage only`);
  }
  
  console.log(`\nTest Coverage: ${((componentsWithTests / totalComponents) * 100).toFixed(1)}% of components have E2E tests`);
}

/**
 * Main execution function
 */
function main() {
  try {
    // Check for help option
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
      showHelp();
      return;
    }
    
    console.log('XMLUI E2E Test Summary Generator');
    console.log('=================================\n');
    
    // Check for dry-run option
    const dryRun = process.argv.includes('--dry-run') || process.argv.includes('--coverage-only');
    
    if (dryRun) {
      console.log('Running in dry-run mode (coverage analysis only)\n');
    }
    
    // Get XMLUI components from metadata
    console.log('1. Extracting XMLUI components from metadata...');
    const components = getXMLUIComponents();
    console.log(`   Found ${components.length} XMLUI components`);
    
    // Get available test files
    console.log('2. Scanning for e2e test files...');
    const testFiles = getE2ETestFiles();
    console.log(`   Found ${testFiles.length} e2e test files`);
    
    // Map components to test files
    console.log('3. Mapping components to test files...');
    const componentTestMap = mapComponentsToTestFiles(components, testFiles);
    
    let testResults = null;
    
    if (!dryRun) {
      // Run playwright tests
      console.log('4. Running playwright e2e tests...');
      testResults = runPlaywrightTests();
      
      // Parse results
      console.log('5. Parsing test results...');
      const parsedResults = parseTestResults(testResults);
      testResults = parsedResults;
    }
    
    // Display summary
    displaySummary(components, componentTestMap, testResults);
    
  } catch (error) {
    console.error('Error generating e2e test summary:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  getXMLUIComponents,
  getE2ETestFiles,
  mapComponentsToTestFiles,
  runPlaywrightTests,
  parseTestResults,
  displaySummary
};

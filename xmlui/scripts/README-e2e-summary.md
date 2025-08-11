# XMLUI E2E Test Summary Script

This script provides a comprehensive analysis of XMLUI components and their end-to-end test coverage.

## Features

- ✅ Extracts all XMLUI components from `collectedComponentMetadata.ts`
- ✅ Maps components to their corresponding e2e test files
- ✅ Runs all Playwright e2e tests and collects detailed results
- ✅ Displays a comprehensive summary table with test statistics
- ✅ Shows test coverage percentage and summary statistics
- ✅ Supports dry-run mode for coverage analysis only
- ✅ Alphabetically sorted component list

## Usage

### Via npm script (recommended)

```bash
# Run all e2e tests and show full summary
npm run test:e2e-summary

# Show coverage analysis without running tests
npm run test:e2e-summary -- --dry-run
```

### Direct execution

```bash
# Run all e2e tests and show full summary
node scripts/e2e-test-summary.js

# Show coverage analysis without running tests
node scripts/e2e-test-summary.js --dry-run

# Show help
node scripts/e2e-test-summary.js --help
```

## Output

The script generates a table with the following columns:

- **Component Name**: The XMLUI component name (alphabetically sorted)
- **Tests Run**: Number of e2e tests executed for this component
- **Passed**: Number of tests that passed
- **Failed**: Number of tests that failed
- **Skipped**: Number of tests that were skipped
- **Status**: Overall status for the component's tests

### Status Values

- `All Passed` - All tests for this component passed
- `Some Failed` - Some tests failed
- `No E2E Tests` - No e2e test file found for this component
- `Not Run/Failed` - Test file exists but tests weren't run or execution failed

## Summary Statistics

The script also provides:

- Total number of XMLUI components
- Number of components with e2e tests
- Number of components without e2e tests
- Total e2e tests run
- Overall pass/fail/skip counts
- Test pass rate percentage
- Test coverage percentage

## Component Detection

The script:

1. Extracts component names from `xmlui/src/components/collectedComponentMetadata.ts`
2. Filters to include only XMLUI components (excludes HTML tags and React native components)
3. Scans `xmlui/src/components/*/` directories for `*.spec.ts` files
4. Maps component names to test files using intelligent matching:
   - Direct component directory matches
   - Compound component handling (CHStack, CVStack → Stack)
   - Heading component variants (H1, H2, H3, etc. → Heading)

## Test File Location

E2E test files are located in the component directories: `xmlui/src/components/{ComponentName}/{ComponentName}.spec.ts`

The script uses the `test:e2e-non-smoke` npm command to run tests, which executes `playwright test --project non-smoke`.

## Examples

### Full test run output
```
=== XMLUI Components E2E Test Summary ===

┌───────────────────────┬───────────┬────────┬────────┬─────────┬─────────────────┐
│ Component Name        │ Tests Run │ Passed │ Failed │ Skipped │ Status          │
├───────────────────────┼───────────┼────────┼────────┼─────────┼─────────────────┤
│ Avatar                │        12 │     12 │      0 │       0 │ All Passed      │
│ Badge                 │         5 │      5 │      0 │       0 │ All Passed      │
│ Button                │        15 │     14 │      1 │       0 │ Some Failed     │
│ Card                  │         8 │      8 │      0 │       0 │ All Passed      │
│ Checkbox              │         6 │      6 │      0 │       0 │ All Passed      │
│ ...                   │       ... │    ... │    ... │     ... │ ...             │
└───────────────────────┴───────────┴────────┴────────┴─────────┴─────────────────┘

=== Summary Statistics ===
Total XMLUI Components: 100
Components with E2E Tests: 62
Components without E2E Tests: 38
Total E2E Tests Run: 156
Total Passed: 152
Total Failed: 4
Total Skipped: 0
Pass Rate: 97.4%

Test Coverage: 62.0% of components have E2E tests
```

### Coverage-only output
```
=== Summary Statistics ===
Total XMLUI Components: 100
Components with E2E Tests: 62
Components without E2E Tests: 38
E2E tests were not run - showing test coverage only

Test Coverage: 62.0% of components have E2E tests
```

## Integration

This script has been added to the XMLUI project's `package.json` as:

```json
{
  "scripts": {
    "test:e2e-summary": "node scripts/e2e-test-summary.js"
  }
}
```

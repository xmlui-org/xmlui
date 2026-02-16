# Parallel E2E Testing Setup

This document describes the parallel testing infrastructure for XMLUI's 6700+ E2E test cases.

## Overview

The XMLUI project contains **146 test files** with approximately **6,750 test cases**. Running all tests sequentially on a single 8-core machine takes about 15 minutes. To reduce this time, tests are now distributed across multiple parallel GitHub Actions runners.

## Architecture

### Three Components:

1. **Distribution Script** (`xmlui/scripts/distribute-tests.cjs`)
   - Identifies all `.spec.ts` test files in the project
   - Counts test cases in each file (by parsing test declarations)
   - Distributes test files across N batches using a greedy load-balancing algorithm
   - Ensures approximately equal test counts per batch

2. **Parallel Workflow** (`.github/workflows/all-tests-parallel.yml`)
   - Runs 3 parallel jobs on separate 16-core runners
   - Each job runs approximately 2,250 tests (1/3 of total)
   - Expected runtime: ~5-7 minutes per batch (3x faster than sequential)
   - Collects and reports results from all batches

3. **Sequential Workflow** (`.github/workflows/run-all-tests-fast.yml`) - *for comparison*
   - Original single-machine approach
   - Runs all tests on one 16-core runner
   - Total runtime: ~15 minutes

## Usage

### Running Parallel Tests

**From GitHub UI:**
1. Go to `.github/workflows/all-tests-parallel.yml`
2. Click "Run workflow"
3. Enter the number of parallel batches (default: 3)
4. Click "Run workflow"

**From CLI:**
```bash
gh workflow run all-tests-parallel.yml -r main --field num_batches=3
```

### Local Testing

To test the distribution script locally:

```bash
# Run with default 3 batches
node xmlui/scripts/distribute-tests.cjs

# Run with custom number of batches
node xmlui/scripts/distribute-tests.cjs 5

# View the distribution
node xmlui/scripts/distribute-tests.cjs 3 2>/dev/null | jq '.[] | "\(.files | length) files: \(.testCount) tests"'
```

### Output Example

```
Finding test files...
Found 146 test files
Counting test cases...
...
Batch distribution:
  Batch 0: 48 files, 2250 tests (33.3%)
  Batch 1: 49 files, 2250 tests (33.3%)
  Batch 2: 49 files, 2250 tests (33.3%)
```

## How to Customize

### Changing the Number of Parallel Batches

To run with 4 batches instead of 3:

1. **Edit `all-tests-parallel.yml`:**
   - Update the `num_batches` input default:
     ```yaml
     num_batches:
       default: "4"  # Changed from "3"
     ```
   - Update the matrix strategy `batch-index` values:
     ```yaml
     strategy:
       matrix:
         batch-index: [0, 1, 2, 3]  # Added 3
     ```

2. **Run the workflow:**
   ```bash
   gh workflow run all-tests-parallel.yml -r main --field num_batches=4
   ```

### Performance Metrics

Based on 146 test files and 6,750 tests:

| Batches | Est. Runtime | Files per Batch | Tests per Batch |
|---------|---|---|---|
| 1 (sequential) | ~15 min | 146 | 6,750 |
| 2 | ~8 min | 73 | 3,375 |
| 3 | ~5-7 min | 49 | 2,250 |
| 4 | ~5 min | 37 | 1,687 |
| 5 | ~4 min | 29 | 1,350 |

*Note: Times are estimates based on CI environment. GitHub Actions runners may experience CPU throttling during heavy parallel execution.*

## Batch Distribution Algorithm

The distribution script uses a **greedy load-balancing algorithm**:

1. **Sort** test files by test count (largest first)
2. **Initialize** N empty batches
3. **For each file** (in descending order):
   - Add it to the batch with the **fewest tests** currently
   - Update that batch's test count

This approach ensures:
- ✅ Balanced test counts across batches
- ✅ O(n log n) complexity (fast)
- ✅ Deterministic results (reproducible distribution)

**Example distribution for 3 batches:**
- File A (200 tests) → Batch 0
- File B (180 tests) → Batch 1
- File C (170 tests) → Batch 2
- File D (150 tests) → Batch 0 (has fewest now)
- ... and so on

## GitHub Actions Configuration

### Resource Requirements

- **Machine:** `ubuntu-latest-16-core` (16-core runner in GitHub Actions)
- **Memory:** 8GB (configured via `NODE_OPTIONS`)
- **Timeout:** 45 minutes per batch
- **Retries:** 2 (inherited from Playwright config)

### Parallelization Settings

The Playwright config (`playwright.config.ts`) is configured for CI:
```typescript
workers: CI ? "100%" : "75%",  // Use all available CPU cores in CI
retries: CI ? 2 : 1,            // Retry flaky tests
```

## Artifacts and Reporting

### Test Reports

Each batch produces a Playwright HTML report:
- **Location:** `xmlui/playwright-report/`
- **Artifact:** `playwright-report-batch-{N}`
- **Retention:** 30 days

### Workflow Summary

The workflow generates a summary in GitHub Actions that includes:
- Total tests run
- Number of batches
- Tests per batch
- Links to batch reports

## Troubleshooting

### Tests Timing Out

If a batch consistently times out:
1. Check if one file has disproportionately more tests
2. Run `node xmlui/scripts/distribute-tests.cjs 3` to see current distribution
3. Consider increasing `timeout-minutes` in the workflow

### Inconsistent Test Results

If tests pass locally but fail in parallel:
1. Run with `--workers=10` locally: `npx playwright test --workers=10`
2. Check for race conditions or timing issues
3. Add explicit `toBeVisible()` or `toBeFocused()` checks before interactions

### Memory Issues

If jobs fail with "out of memory":
1. The `NODE_OPTIONS: "--max-old-space-size=8192"` is already optimized
2. Consider reducing the number of batches (use fewer, larger runners)
3. Check for test files with extreme memory usage

## Migration from Sequential to Parallel

### When Original Workflow Was Faster

**Old workflow** (`run-all-tests-fast.yml`):
```yaml
name: All Tests (Fast)
# Ran all 6,750 tests on single 16-core machine
# Runtime: ~15 minutes
```

### New Parallel Workflow

**New workflow** (`all-tests-parallel.yml`):
```yaml
name: All Tests (Parallel)
# Distributes 6,750 tests across 3 machines
# Runtime: ~5-7 minutes (3x faster)
```

### Both Workflows Coexist

- **Parallel workflow:** Default for frequent testing (fast feedback)
- **Sequential workflow:** Available for reference/debugging

## Development Tips

### Testing Distribution Script

```bash
# Get test count statistics
node xmlui/scripts/distribute-tests.cjs 3 2>&1 | grep "total tests:" -i

# Check distribution balance
node xmlui/scripts/distribute-tests.cjs 3 2>/dev/null | jq '.[] | .testCount'

# Validate JSON output
node xmlui/scripts/distribute-tests.cjs 3 2>/dev/null | jq . > /dev/null && echo "Valid"
```

### Running Specific Batch Locally

If you want to replicate CI behavior:

```bash
# Get the files for batch 0
BATCHES=$(node xmlui/scripts/distribute-tests.cjs 3)
FILES=$(echo "$BATCHES" | jq -r '.[0].files[]')

# Run those specific test files
npx playwright test $FILES
```

### Debugging Test Distribution

The distribution script outputs detailed logs to stderr while JSON to stdout:

```bash
# See distribution details
node xmlui/scripts/distribute-tests.cjs 3

# Just get JSON (for scripting)
node xmlui/scripts/distribute-tests.cjs 3 2>/dev/null
```

## Future Improvements

Potential enhancements:

- [ ] **Dynamic matrix:** Support variable number of batches without editing YAML
- [ ] **Cost analysis:** Track cost implications of parallel vs sequential testing
- [ ] **Smart batching:** Consider test execution time (not just count)
- [ ] **Flaky test detection:** Identify and distribute flaky tests separately
- [ ] **Historical trending:** Track test count changes and distribution effectiveness

## References

- [Playwright Configuration](../../playwright.config.ts)
- [Distribution Script](./distribute-tests.cjs)
- [E2E Testing Conventions](../dev-docs/conv-e2e-testing.md)
- [GitHub Actions - Matrix Strategy](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs)

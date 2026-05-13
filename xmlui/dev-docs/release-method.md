**Overall Philosophy:**

*   **`main` branch:** The source of truth for all development.
*   **Changesets:** Used for managing versioning and changelogs.
    *   Can be added manually (`npx changeset add`).
    *   Or, ideally, auto-generated from Conventional Commits on PRs (see `add-changeset.yml` below).
*   **Beta Releases:** Fully automated on every merge to `main` that includes new changesets. Published to npm with a `beta` tag.
*   **Stable Releases:** A manually triggered process that:
    1.  Creates a "Version Packages" Pull Request for review.
    2.  Upon merging this PR, publishes packages to npm (with the `latest` tag) and creates GitHub Releases.
*   **Handling Race Conditions for Stable Release:** If `main` changes significantly after the "Version Packages" PR is created, the safest approach is to close that PR and re-trigger the stable release process to generate a new, up-to-date "Version Packages" PR.

---

**The Process Steps:**

1.  **Development:**
    *   Developers create feature branches from `main`.
    *   They make code changes and write **Conventional Commit messages**.
    *   **(Automation Option):** When a PR is opened/updated, the `add-changeset.yml` workflow runs, analyzes conventional commits, and automatically adds/updates `.changeset/*.md` files to the PR branch.
    *   **(Manual Option):** Developer runs `npx changeset add` before committing changes that require a version bump, and commits the generated changeset file.
    *   Developer opens/updates a Pull Request to `main`.

2.  **Pull Request Merged to `main`:**
    *   The `beta-release.yml` workflow triggers.
    *   It consumes any `.changeset` files merged from the PR.
    *   It versions affected packages with a beta suffix (e.g., `1.0.1-beta.shortsha`).
    *   It publishes these beta versions to npm under the `beta` dist-tag.
    *   It commits and pushes these snapshot version changes back to `main`.

3.  **Preparing for a Stable Release (Manual Trigger):**
    *   A designated person (release manager) decides it's time for a stable release.
    *   **Pre-check:** Briefly check if `main` is relatively stable or communicate a short "quiet period" for merges to `main` to minimize conflicts with the version PR.
    *   Go to GitHub Actions -> "Stable Release Process" workflow -> Run workflow.
    *   The `stable-release.yml` workflow's `create_version_pr` job runs:
        *   It uses `changesets/action` to consume all current `.changeset` files on `main`.
        *   It generates version bumps, updates `CHANGELOG.md` files.
        *   It commits these changes to a new branch (e.g., `changeset-release/main`).
        *   It opens a "Version Packages for Release" Pull Request to `main`.

4.  **Reviewing and Merging the "Version Packages" PR:**
    *   The team reviews this PR. It shows exactly which packages will be versioned and what their changelogs will contain for the stable release.
    *   **Critical Check:** Before merging, verify if `main` has received significant new changes (especially new changesets that have triggered new beta releases) *since this "Version Packages" PR was created*.
        *   **If `main` has changed significantly:** Close the current "Version Packages" PR and its branch. Go back to Step 3 and re-trigger the "Stable Release Process" workflow to generate a fresh "Version Packages" PR based on the latest `main`.
        *   **If `main` is stable or changes are minor/unrelated:** Proceed to merge the "Version Packages" PR.

5.  **"Version Packages" PR is Merged to `main`:**
    *   The `stable-release.yml` workflow's `publish_and_release` job triggers.
    *   It uses `changesets/action` to:
        *   Publish the versioned packages (now merged into `main`) to npm, this time to the `latest` dist-tag.
        *   Create Git tags for each published package version.
        *   Create corresponding GitHub Releases, populating them with content from the `CHANGELOG.md` files.

--- 


**1. `.github/workflows/add-changeset.yml`**
*Automates creation of changeset files from Conventional Commits in PRs.*

```yaml
name: Add Changeset from Conventional Commits (NPM)

on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

permissions:
  contents: write
  pull-requests: read

jobs:
  add_changeset:
    if: github.event.pull_request.draft == false && github.actor != 'dependabot[bot]' && github.actor != 'renovate[bot]'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18' # Or your Node.js version
          cache: 'npm' # Use npm cache

      - name: Install Dependencies
        run: npm ci # Uses package-lock.json

      - name: Create Changeset File
        uses: tripsit/conventional-changesets-action@v4
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: "chore: add generated changeset(s) [skip ci]"
          skip-ci: "true"
          # Configure type mappings if needed
```

---

## Support branch strategy (`support` → patch releases)

### Branch model

The `support` branch tracks the current stable patch line (e.g. `0.12.x`). Bug fixes should land on `main` first (trunk-first), then be backported to `support` via the label-triggered bot. This guarantees `main` always has every fix.

Exception: fixes specific to `support` (e.g. reverting a `0.12.x` regression that was refactored away in `main`) go directly to `support` with no backport needed.

### Day-to-day workflow

**Standard bug fix (exists in both branches):**
1. Open PR to `main` with a `fix:` title — the reminder bot posts a comment asking if a backport is needed.
2. Reviewer adds the `backport` label if yes; merges (squash).
3. Bot opens a cherry-pick PR to `support` — review and merge.
4. When ready to release the patch, trigger `prepare-versions.yml` → branch: support.
5. Review and merge the patch version PR → publishes to the `backport` npm tag automatically.

**Support-only fix:**
1. PR directly to `support`, no label needed.
2. CI Level 1 enforcement runs; reviewer approves; merge.
3. Same release path as above (step 4–5).

### Enforcement

**Level 1 — PR CI (`run-all-tests-fast.yml`):** Runs on every PR to `support`. Rejects any changeset that is not a patch bump before the PR merges.

**Level 2 — `prepare-versions.yml`:** When `branch: support` is selected, validates changesets a second time before creating the version PR. Stops the release if a non-patch changeset slipped through review.

### npm dist-tags

When `release-packages.yml` runs after a `support` version PR merges, it publishes to the `backport` dist-tag instead of `latest`:

- `npm install xmlui` → latest stable (e.g. `0.13.x`)
- `npm install xmlui@backport` → latest patch release from `support` (e.g. `0.12.28`)

This is controlled by `NPM_DIST_TAG` set in `release-packages.yml` based on `github.base_ref`, and consumed by `changeset publish --tag ${NPM_DIST_TAG:-latest}` in the root `package.json`.

**Why this is urgent:** Without the dist-tag fix, publishing a `0.12.x` patch after `0.13.0` ships would overwrite `latest` with the older version, regressing all users who rely on `npm install xmlui`.

### Files involved

| File | Role |
|------|------|
| `.github/workflows/remind-backport.yml` | Comments on `fix:` PRs to `main` that lack the `backport` label |
| `.github/workflows/backport.yml` | Cherry-picks merged `main` PRs with `backport` label to `support` |
| `.github/workflows/prepare-versions.yml` | Extended with `branch` input; Level 2 enforcement when `branch: support` |
| `.github/workflows/release-packages.yml` | Triggers on `support` PRs; sets `NPM_DIST_TAG=backport` for support releases |
| `.github/workflows/run-all-tests-fast.yml` | Level 1 enforcement: rejects non-patch changesets on PRs to `support` |
| `package.json` | `changeset:publish` uses `--tag ${NPM_DIST_TAG:-latest}` |

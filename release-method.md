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

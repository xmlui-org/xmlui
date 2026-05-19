# Release process

## Problem description

We want these kinds of releases:

- **latest**: The default `npm install` target. Used for the newest stable release, whether it's a patch or minor bump on `main`. Sets the `latest` npm dist-tag.
- **support**: Patch releases for older minor versions. Published under the `support` npm dist-tag. Not the default `npm install` target, but resolvable via caret/tilde ranges (e.g. `~0.11.0` → resolves to `0.11.2`). Needed because we can only release from `main` otherwise, and patch fixes wouldn't reach users stuck on an older minor.
- **canary**: Exploratory pre-releases under the `canary` dist-tag. The version gets a `{tag}-{datetime}-{commit}` suffix, making it a semver pre-release that range resolution ignores. Accessible via `npm install pkg@canary` or by exact version. Does not consume changesets or modify committed package versions.

## Branching strategy

**support branches**: For any given minor version (e.g. `0.11`), if we need to patch it, we create a `support/0.11.x` branch from its git tag. Patches are committed there. If the fix also applies to `main` (or other support branches), it is cherry-picked forward with `git cherry-pick -x`.

**main branch**: New features and breaking changes are developed on `main`. Both result in new minor versions (we are pre v1.0.0 at the moment, so breaking changes are minor bumps).

Patches should land on at least both `main` and the active `support/0.x.y` branch. The developer decides where to commit the fix first. Recomendation: land on the support branch, then cherry-pick forward to `main` (and other support branches if needed) with `git cherry-pick -x`.

## Github workflows

### `guard-branches.yml`

PRs targeting `support/**` branches fail if any `.changeset/*.md` contains a minor or major bump. This is the first layer of protection — only patch changesets are allowed on support branches.

### `prepare-versions.yml`

Manual `workflow_dispatch`. Used **only** for `latest` and `support` releases. It consumes changesets, bumps package versions, and opens a Version PR back into the dispatching branch.

| Input | Type   | Values              | Description                               |
| ----- | ------ | ------------------- | ----------------------------------------- |
| `tag` | choice | `latest`, `support` | The npm dist-tag this release will target |

When dispatching on a `support/**` branch, an extra check enforces patch-only changesets (second layer of protection after `guard-branches.yml`).

The PR title follows the pattern `"Version Packages for [<tag>] release"`. This title encodes the tag and is used by `release-packages.yml` to determine the npm dist-tag on merge.

### `release-packages.yml`

Two triggers:

1. **`workflow_dispatch`** with a `tag` input (`latest`, `support`, `canary`) — for manual releases. Canary releases use this path directly since they skip changesets.
2. **`pull_request.closed`** on `main`, `support/**` — auto-triggered when a version PR (created by `prepare-versions.yml`) is merged.

Tag resolution:

- From `workflow_dispatch`: uses the `tag` input directly.
- From PR merge: parses the PR title for the pattern `"Version Packages for [<tag>] release"`. Errors out if the title doesn't match.

Sets `NPM_DIST_TAG` to the resolved tag value.

Behaviour by tag:

| Tag       | Publishes via                                                                         | Consumes changesets? | GitHub release? |
| --------- | ------------------------------------------------------------------------------------- | -------------------- | --------------- |
| `latest`  | `changesets/action@v1`                                                                | Yes                  | Yes             |
| `support` | `changesets/action@v1`                                                                | Yes                  | Yes             |
| `canary`  | `changeset version --snapshot canary` + `changeset publish --tag canary --no-git-tag` | No                   | No              |

For canary, the version changes are not reflected in the repository and the changelog won't be modified.

The full test suite runs before every `latest` and `support` publish.

## Release flow

### Stable release (latest or support)

1. Dispatch **`prepare-versions.yml`** on the target branch, choosing the `tag`.
2. A Version PR is created (e.g. `"Version Packages for [latest] release"`). Review and merge it.
3. Merging triggers **`release-packages.yml`**, which tests, publishes to npm under the correct dist-tag, and creates a GitHub release with the standalone JS file and VS Code extension.

### Canary release

1. Dispatch **`release-packages.yml`** on the target branch with `tag: canary`.
2. The workflow snapshots the current state (without consuming changesets), builds, and publishes to npm under the `canary` dist-tag. No version PR, no GitHub release.

## Examples

(Notation: `o` = commit, `(vX.Y.Z)` = tag, lines = parent relations)

### Example 1: Bugfix on the latest stable release

Starting state (`0.11.0` is latest, there are other commits on `main`):

```
main:  ...---(v0.11.0)---o(some feature)---o(breaking change)
```

Final state (fix committed, cherry-picked, released):

```
main:  ...---(v0.11.0)---o(some feature)---o(breaking change)---o(same fix commit cherry-picked)
                 |
support/0.11.x:  o (fix)---(v0.11.1)
                 ↑
          fix-the-bug
```

1. `0.11.0` is latest. Bug reported. Create `support/0.11.x` from tag `xmlui@0.11.0`, push to GitHub.
2. Branch `myname/fix-the-bug` from `support/0.11.x`. Fix → open PR → squash & merge.
3. Cherry-pick the fix to `main`:
   ```bash
   git fetch
   git switch -c myname/backport-bugfix main
   git cherry-pick -x support/0.11.x
   git push
   ```
   Open PR → rebase & merge (single cherry-pick commit shouldn't be squashed).
4. Dispatch `prepare-versions.yml` on `support/0.11.x` with `tag: latest`. Merges changesets, bumps version, creates a Version PR.
5. Review & merge the Version PR → triggers `release-packages.yml`. `0.11.1` is now latest on npm, fix is in both branches.

### Example 2: Bugfix on an older minor version

Starting state (`0.12.0` is latest, `support/0.11.x` exists with previous patches):

```
main:            ...---(v0.11.0)---...---(v0.12.0)---o
                         |
support/0.11.x:           o---(v0.11.1)
```

Final state (fix committed to `0.11.x`, cherry-picked forward to `0.12.x` and `main`):

```
main:  ...---(v0.11.0)---...---(v0.12.0)---o---o(fix cherry-picked)
               |                  |
               |  support/0.12.x: o(fix cherry-picked)---(v0.12.1)
               |
               |
               |
support/0.11.x:o---(v0.11.1)---o(fix)---(v0.11.2)
                                 ↑
                           fix-old-bug
```

1. `0.12.0` is latest. A user of `0.11.x` reports a bug. Use existing `support/0.11.x` branch.
2. Branch `myname/fix-old-bug` from `support/0.11.x`. Fix → open PR → squash & merge.
3. Cherry-pick forward through active release lines:
   ```bash
   git fetch
   git switch -c myname/cherry-fix-12x support/0.12.x
   git cherry-pick -x support/0.11.x
   git push
   git switch -c myname/cherry-fix-main main
   git cherry-pick -x support/0.11.x
   git push
   ```
   Open PRs → rebase & merge.
4. Dispatch `prepare-versions.yml` on `support/0.11.x` with `tag: support` (not `latest` — `0.12.x` is the current latest). Merge PR → triggers `release-packages.yml` with the `support` dist-tag.
5. (Optional) Dispatch `prepare-versions.yml` on `support/0.12.x` with `tag: latest` to release `0.12.1` with the fix too.

### Example 3: New feature release on `main`

Starting state (`0.12.0` is latest, feature work about to begin):

```
main:  ...---(v0.12.0)---o---o
```

Final state (feature merged, released as minor bump):

```
new-feature:  o(work in progress)---o(wip2)---o(feature)
               \                               \
main:  ...---(v0.12.0)---o---o------------------o(squashed into 1 commit)---(v0.13.0)
```

1. `0.12.0` is latest. Branch `myname/new-feature` from `main`. Implement the feature.
2. Open PR into `main` ← `myname/new-feature`. Squash & merge.
3. Dispatch `prepare-versions.yml` on `main` with `tag: latest`. A minor changeset bumps the version to `0.13.0` and creates a Version PR.
4. Review & merge the Version PR → triggers `release-packages.yml`. `0.13.0` is now latest on npm.

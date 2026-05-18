# Release process plan

## Problem description

We want these kinds of releases:

- **support**: How do we support older minor releases with patches? Currently we don't as we can't release such patches, the only release branch is `main`.
- **latest**: Currently we don't distinguish fixes and features these things. When we release from main with patch and minor changesets, the patch fixes won't apply to the previous minor version, but rather be presen on the next minor version. But that new minor version also has a new feature (or just breaking change), which is more likely to have a bug, so the user is stuck in an endless loop, where we always recommed the latest version to be the most bug-free. In reality, we only know of the least amount of bugs on latest. We should be able to release **latest** patch releases (different to **support** due to npm tagging) and **latest** minor versions.
- **canary**: We want to release versions tagged with `canary`, which are exploratory, not meant for every day consumption.

## Branching strategy

**support branches**: For any given minor version (eg. 0.11), if we need to fix something, we'll have a `support/0.11.x` branch, where we branch off of its git tag initially. There we commit the patches, and if needed, we manually take those changes and apply them to the mainline as well (eg. via `git cherry-pick -x`).

**main branch**: We keep `main` as the branch we develop new features on.

- New features result in new minor version, never patch
- Breaking changes also land in minor versions, because we're pre v1.0.0. => we'll have more minor releases, even weekly.

Patches need to be applied to at least both `main` and the last `support/0.x.y` branch. The developer shall decide where he lands their fixes initially. Recomendation is to chery-pick the commit into the other branch (or branches if the fix needs to be backported to an older release, due to a user's request) with `git chery-pick -x` (see `git chery-pick --help`).

## Release process / github workflows

PRs for `support/<anything>` branches fail if they have a _minor_ or _major_ changeset. flagging these branches on github as protected would be good, but not essential.

There'll be 1 github workflow to start a release manually. This may be limiting later, but should be ok for now. Need to change the concurrency rules to allow multiple releases at a time (latest patch release and the patch release backported to the previous minor version)

The workflow asks for a branch. `support/<anything>` named branches fail if they have a _minor_ or _major_ changeset in them (2nd layer of protection after PR guard). The workflow will create a changeset PR into the branch that it was started from, with the changelog and package versions updated.

The workflow asks for a release tag:

- **latest**: same as what we've used so far. Sets the target of `npm install` to this new release. Apply this even for patch releases if they are the latest stable version.
- **support**: regular release to npm with anything but the **latest** tag. Use when there is a newer minor release already out. Dynamic version range resolution like `~0.12.0` can resolve to it, but the target for `npm install` won't change to it. Could be `support`, Next.js uses `backport`, some use `legacy`.
- **canary**: releases under the `canary` npm tag and also appends the "-canary-<git-hash-here>" text to the package.json's `version` field, which makes it a pre-release tag, so dynamic version range resolution will ignore it. People can only try it with specifying the exact package version name, or using `npm install xmlui@canary`. Could also be `beta`, `alpha`, `experimental`. Requires changes to the release process, as it should mostly not touch changesets or package version numbers in the github repository, only in the CI machine before release.

The workflow create a PR, which uppon merging will trigger the release workflow

## Example

we have just released 0.11.0 as the latest stable version. On `main`, we start implementing a new feature. We get a bug report on latest. We branch off of tag `xmlui@0.11.1` to a branch named `support/0.11.x`. We push that branch to github.

We branch off of `support/0.11.x` to a temporary branch named `myname/fix-the-bug`.
We implement a fix. Open a PR into `support/0.11.x` <- `myname/fix-the-bug`.
Squash & merge on github.

```bash
git fetch
git switch -c myname/backport-bugfix main
git chery-pick -x support/0.11.x # chery-picks the last commit from that branch
git push ...
```

Open a PR for main with the fix ported over. In this case, becaues there's 1 commit, you'd rebase and merge.

Start a Prepare Versions for Release workflow on `support/0.11.x` with the `tag` select input being `latest`. This merges the changesets into the changelog and bumps the version number.

Review the PR created by the workflow.

If all looks ok, allow the merge of the PR into `support/0.11.x`. This will kick off the Release Packages workflow, with the tag information needed for the release embedded in the PR name.

You are done with the fix, you can continue working on features on `main` while the fix is present there and in the release.

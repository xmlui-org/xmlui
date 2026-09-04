---
---

ci: stop the auto-generated "Version Packages" release PR's checks (`Guard certain branches from changes`, `Release Guard (API Diff)`, `All Tests (Fast)`) from occasionally failing with a spurious "This run likely failed because of a workflow file issue" error.

Those checks are triggered by `pull_request` events against the ephemeral `changeset-release/**` branch that the release tooling creates. If that branch is deleted (e.g. by manually clicking "Delete branch" right after merging the release PR) before a runner has picked up the still-queued check, GitHub can no longer resolve the workflow file for the now-missing ref and aborts the run — even though the workflow definitions themselves are valid.

`release-packages.yml` now deletes the merged release branch itself, as the very last step of its own job, well after its build/test/publish steps have already run for several minutes. This keeps the branch alive long enough for the PR checks to be dispatched, removing the race instead of relying on a human not to delete the branch too quickly.

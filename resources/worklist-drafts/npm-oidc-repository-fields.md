# Before

Release run [38694604781](https://github.com/xmlui-org/xmlui/actions/runs/38694604781) published
`xmlui@0.14.28` and `create-xmlui-app@0.14.28`, but these failed with `E404 Not Found - PUT`:

- `xmlui-docs-blocks@0.0.14`
- `xmlui-pdf@0.1.14`
- `xmlui-website-blocks@0.1.7`

Root cause: commit `af34198f0` (2026-08-26) switched `.github/workflows/release-packages.yml`
from `NODE_AUTH_TOKEN: secrets.PUBLISH_NPM_TOKEN` to npm **trusted publishing (OIDC)**
(`id-token: write`, Node 24). With no token, npm accepts a publish only if:

1. the package has a trusted publisher configured on npmjs.com
   (repo `xmlui-org/xmlui`, workflow `release-packages.yml`), and
2. the package's `package.json` `repository.url` matches the GitHub repo
   (npm checks it against the provenance statement).

Both succeeding packages declare `repository.url = https://github.com/xmlui-org/xmlui.git`.
That same commit fixed `create-xmlui-app`'s URL (from `xmlui-com` to `xmlui-org`) for exactly
this reason. **No** package under `packages/`, and not `tools/create-xmlui-hello-world`, has a
`repository` field. No extension package has published since the switch: `xmlui-pdf`'s last
release was 0.1.13 on 2026-05-08, which used the token. When npm gets an unauthorized PUT it
answers 404, not 403.

# After

Add to every publishable `package.json` listed in `files`:

```json
"repository": {
  "type": "git",
  "url": "https://github.com/xmlui-org/xmlui.git",
  "directory": "packages/<name>"
}
```

`directory` is the package's monorepo path. No version bumps and no changeset are needed,
because the failed versions (0.0.14 / 0.1.14 / 0.1.7) are already versioned on `main` and the
next release run picks them up as unpublished.

**Also required, outside the repo (npmjs.com settings, done by a package owner):** configure
a trusted publisher for each failing package (and, ahead of time, for the other extension
packages):
Package → Settings → Trusted Publisher → GitHub Actions, organization `xmlui-org`,
repository `xmlui`, workflow `release-packages.yml`. `xmlui-docs-blocks`'s only npm maintainer
is `illesg`, so he must do it or add another maintainer first.

Alternatives considered:

- Restore `NODE_AUTH_TOKEN: secrets.PUBLISH_NPM_TOKEN` — rejected: it undoes the OIDC move,
  and npm is restricting 2FA-bypass tokens (the log warns about this).
- **[chosen]** Add the `repository` fields and configure trusted publishers.

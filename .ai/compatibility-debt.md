# XMLUI Compatibility Debt

Status: seeded by Experiment 15  
Original baseline: `/Users/dotneteer/source/xmlui`

Each row represents an incompatibility, blocked compatibility check, or
intentional deferral. Use stable IDs in code comments, test names, and sweep
reports when possible.

Classifications:

- `known-gap`: incompatible and needs implementation;
- `intentional-deviation`: incompatible by deliberate documented decision;
- `obsolete-old-test`: old test no longer represents a public contract;
- `blocked`: cannot run yet because infrastructure is missing;
- `needs-investigation`: observed failure without known root cause.

| ID | Surface | Old Anchor | Rewrite Anchor | Expected Old Behavior | Observed Rewrite Behavior | Classification | Severity | Rebuild Phase | Verification Needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| COMP-0001 | Components | `/Users/dotneteer/source/xmlui/xmlui/src/components` | `xmlui/src/runtime/rendering/builtins.tsx` | All documented built-ins preserve props, events, APIs, styling, context variables, slots, and docs examples. | Only the experiment subset is implemented. | known-gap | blocker | Phase 5 | Component closure notes and ported tests for each component. |
| COMP-0002 | Public package exports | `/Users/dotneteer/source/xmlui/xmlui/package.json` | `xmlui/package.json`, `xmlui/src/index.ts` | Published package exposes parser, language-server, syntax, testing, nodejs, CSS, SCSS, and clean-package exports. | Rewrite currently exposes the root entry only. | known-gap | high | Phase 1 | Package export artifact comparison passes. |
| COMP-0003 | Create app utility | `/Users/dotneteer/source/xmlui/tools/create-app` | missing | Users can create projects with the old command and generated layout. | No rewrite implementation yet. | blocked | high | Phase 7 | Generated app can install, run, test, and build. |
| COMP-0004 | Preview SSG tool | `/Users/dotneteer/source/xmlui/tools/preview-ssg` | `xmlui/scripts/preview-ssg.mjs` | Public preview-ssg tool behavior and package shape are preserved. | Local preview script exists, package/tool compatibility is incomplete. | known-gap | medium | Phase 7 | Tool package smoke test and artifact comparison. |
| COMP-0005 | Website | `/Users/dotneteer/source/xmlui/website` | missing | Documentation website builds and examples execute against XMLUI. | No rewrite website package yet. | blocked | high | Phase 7 | Docs website build and example smoke tests. |
| COMP-0006 | Playground | `/Users/dotneteer/source/xmlui/playground` | missing | Playground starts, runs templates/examples, reports diagnostics, and supports sharing. | No rewrite playground package yet. | blocked | high | Phase 7 | Playground smoke tests. |
| COMP-0007 | Integration tests | `/Users/dotneteer/source/xmlui/integration-tests` | missing | Integration test apps validate create-app, extensions, builds, and workflows. | No equivalent rewrite integration package yet. | blocked | high | Phase 1 | `test-integration` equivalent passes. |
| COMP-0008 | Release workflows | `/Users/dotneteer/source/xmlui/.github/workflows` | missing | CI/release checks build, test, package, and publish the old artifact set. | No rewrite workflow parity yet. | blocked | medium | Phase 9 | Release readiness checklist and workflow smoke. |
| COMP-0009 | Extension packages | `/Users/dotneteer/source/xmlui/packages/*` | `packages/xmlui-counter-badge` | First-party extension packages build, publish metadata, register functions/components/themes, and run in all app modes. | One fixture package exists; original packages are not ported. | known-gap | high | Phase 6 | Each package has package build, metadata, and runtime tests. |
| COMP-0010 | Theme and visual parity | component `.defaults.ts`, `.module.scss`, theming core | runtime theme/style slice | Old theme variables, parts, defaults, variants, responsive props, and CSS hooks are preserved. | Experimental theme/layout subset only. | known-gap | high | Phase 3 | Visual/theme artifact and E2E checks pass. |
| COMP-0011 | Forms | `/Users/dotneteer/source/xmlui/xmlui/src/components/Form*` | minimal input support only | Form context, validation, binding, submit/reset, dirty/touched, server errors, and accessibility match old XMLUI. | Form infrastructure not implemented. | known-gap | high | Phase 4 / Wave E | Form unit and E2E compatibility tests pass. |
| COMP-0012 | AI tool integrations | `/Users/dotneteer/source/xmlui/tools/xmlui-claude`, `/Users/dotneteer/source/xmlui/tools/xmlui-codex` | missing | AI workflow tooling remains compatible for developer workflows. | No rewrite tooling yet. | blocked | low | Phase 7 | Tooling smoke tests and documentation. |

## Closure Rule

Do not delete closed rows. Mark them closed in a future `Status` or notes column
once verification exists, so the historical sweep remains useful.

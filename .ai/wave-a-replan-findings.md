# Wave A Replan Findings

Date: 2026-06-20

## Decision

Phase 5 Wave 4 / Wave A is too broad to execute as one batch. It is now split
into smaller subwaves in `.plans/rebuild-plan.md`.

## Why

The first Wave A slice showed that component migration is more than creating a
renderer. Each component must carry:

- original behavior inspection;
- old-compatible metadata/defaults/theme variables/docs;
- runtime renderer and component API behavior;
- colocated unit tests;
- transferred original E2E tests;
- visual examples runnable from the dev server;
- compatibility sweep verification.

This closure loop is too large for the original Wave A component list as a
single batch.

## New Shape

Wave A is now split as:

- A1: `Text`, `Heading`, `H1`-`H6`;
- A2: `HtmlTags`, `Br`, `Fragment`;
- A3: `Image`, `Icon`, `Logo`, `IFrame`;
- A4: `Markdown`, `CodeBlock`;
- A5: `QRCode`, `PageMetaTitle`;
- A6: `ContentSeparator`, `SpaceFiller`;
- A7: `NoResult`, `Fallback`.

Future component work must transfer original component E2E tests or explicitly
record why they are blocked before claiming the component migration complete.

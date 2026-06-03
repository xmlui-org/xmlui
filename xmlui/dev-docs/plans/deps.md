# Managed React Plan Dependencies

This file inventories the new and updated files related to each Managed React
plan. Directory entries mean all files currently under that directory are part
of that plan's implementation or tests. Shared files appear in more than one
plan when multiple features touch the same integration surface.

## Shared Plan Documents

- `xmlui/dev-docs/plans/00-master-plan.md`
- `xmlui/dev-docs/plans/STATUS.md`
- `xmlui/dev-docs/plans/managed-react.md`
- `AGENTS.md`

## 01 - Verified Type Contracts

Plan file:

- `xmlui/dev-docs/plans/01-verified-type-contracts.md`

Implementation:

- `xmlui/src/components-core/type-contracts/`
- `xmlui/src/abstractions/ComponentDefs.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/rendering/ContainerWrapper.tsx`
- `xmlui/src/components-core/rendering/valueExtractor.ts`
- `xmlui/src/language-server/services/diagnostic.ts`
- `xmlui/src/nodejs/vite-xmlui-plugin.ts`
- `xmlui/src/parsers/xmlui-parser/transform.ts`
- `xmlui/scripts/check-metadata-drift.ts`

Tests:

- `xmlui/tests/components-core/type-contracts/`

Docs:

- `.ai/xmlui/type-contracts.md`
- `xmlui/dev-docs/guide/27-type-contracts.md`
- `website/content/docs/pages/managed-react/verified-type-contracts.md`

## 02 - Themevars Namespace

Plan file:

- `xmlui/dev-docs/plans/02-themevars-namespace.md`

Implementation:

- `xmlui/src/components-core/themevars/`
- `xmlui/src/abstractions/ExtensionDefs.ts`
- `xmlui/src/components/ComponentProvider.tsx`
- `xmlui/src/components/ComponentRegistryContext.tsx`
- `xmlui/src/components-core/analyzer/rules/theming-missing-prefix.ts`
- `packages/xmlui-ai-blocks/src/index.tsx`

Tests:

- `xmlui/tests/components-core/analyzer/rules/theming-missing-prefix.test.ts`

Docs and config:

- `xmlui/dev-docs/guide/07-theming-styling.md`
- `xmlui/dev-docs/guide/14-extension-packages.md`
- `website/content/docs/pages/managed-react/themevars-namespace.md`
- `tools/create-app/templates/default/ts/xmlui.config.json`
- `tools/create-app/templates/docs/ts/xmlui.config.json`
- `tools/create-app/templates/minimal/ts/xmlui.config.json`
- `tools/create-app/templates/blog/ts/xmlui.config.json`
- `tools/create-app/dist/default/ts/xmlui.config.json`
- `tools/create-app/dist/docs/ts/xmlui.config.json`
- `tools/create-app/dist/minimal/ts/xmlui.config.json`
- `tools/create-app/dist/blog/ts/xmlui.config.json`

## 03 - Reactive Cycle Detection

Plan file:

- `xmlui/dev-docs/plans/03-reactive-cycle-detection.md`

Implementation:

- `xmlui/src/components-core/reactive-graph/`
- `xmlui/src/components-core/abstractions/standalone.ts`
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/rendering/AppContent.tsx`
- `xmlui/src/components-core/rendering/collectFnVarDeps.ts`
- `xmlui/src/components-core/script-runner/visitors.ts`
- `xmlui/src/components-core/state/variable-resolution.ts`
- `xmlui/src/components-core/ud-metadata.ts`
- `xmlui/src/components-core/udcCycleDetection.ts`
- `xmlui/src/components/Inspector/Inspector.tsx`
- `xmlui/src/language-server/services/diagnostic.ts`
- `xmlui/src/nodejs/vite-xmlui-plugin.ts`
- `xmlui/src/parsers/scripting/CircularDependencyDetector.ts`
- `xmlui/src/parsers/xmlui-parser/transform.ts`

Tests:

- `xmlui/tests/components-core/reactive-graph/`

Docs:

- `.ai/xmlui/expression-eval.md`
- `.ai/xmlui/inspector-debugging.md`
- `xmlui/dev-docs/guide/06-expression-eval.md`
- `xmlui/dev-docs/guide/19-inspector-debugging.md`
- `website/content/docs/pages/managed-react/reactive-cycle-detection.md`

## 04 - Managed Lifecycle Vocabulary

Plan file:

- `xmlui/dev-docs/plans/04-managed-lifecycle-vocabulary.md`

Implementation:

- `xmlui/src/components-core/lifecycle/`
- `xmlui/src/components/Lifecycle/`
- `xmlui/src/components-core/LoaderComponent.tsx`
- `xmlui/src/components-core/RestApiProxy.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`
- `xmlui/src/components-core/component-hooks.ts`
- `xmlui/src/components-core/rendering/Container.tsx`
- `xmlui/src/components-core/container/event-handler-cache.ts`
- `xmlui/src/components-core/container/event-handlers.ts`
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/rendering/ComponentAdapter.tsx`
- `xmlui/src/components-core/rendering/ComponentWrapper.tsx`
- `xmlui/src/components/EventSource/EventSourceReact.tsx`
- `xmlui/src/components/Timer/TimerReact.tsx`
- `xmlui/src/components/WebSocket/WebSocketReact.tsx`

Tests:

- `xmlui/tests/components-core/lifecycle/`
- `xmlui/tests-e2e/lifecycle/`

Docs:

- `.ai/xmlui/lifecycle.md`
- `xmlui/dev-docs/guide/28-lifecycle.md`
- `website/content/docs/pages/managed-react/managed-lifecycle-vocabulary.md`

## 05 - Enforced Accessibility

Plan file:

- `xmlui/dev-docs/plans/05-enforced-accessibility.md`

Implementation:

- `xmlui/src/components-core/accessibility/`
- `xmlui/src/components/FocusScope/`
- `xmlui/src/components/LiveRegion/`
- `xmlui/src/components/SkipLink/`
- `xmlui/src/components-core/abstractions/standalone.ts`
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/theming/StyleContext.tsx`
- `xmlui/src/components/Toast/`
- `xmlui/src/components/ModalDialog/`
- `xmlui/src/language-server/services/diagnostic.ts`
- `xmlui/src/nodejs/vite-xmlui-plugin.ts`
- `xmlui/src/parsers/xmlui-parser/transform.ts`

Tests:

- `xmlui/tests/components-core/accessibility/`
- `xmlui/tests-e2e/accessibility/`

Docs:

- `.ai/xmlui/accessibility.md`
- `xmlui/dev-docs/accessibility.md`
- `xmlui/dev-docs/guide/24-accessibility.md`
- `website/content/docs/pages/managed-react/enforced-accessibility.md`

## 06 - Cooperative Concurrency

Plan file:

- `xmlui/dev-docs/plans/06-cooperative-concurrency.md`

Implementation:

- `xmlui/src/components-core/concurrency/`
- `xmlui/src/components-core/abstractions/standalone.ts`
- `xmlui/src/components-core/appContext/app-utils.ts`
- `xmlui/src/components-core/container/event-handlers.ts`
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/script-runner/process-statement-async.ts`

Tests:

- `xmlui/tests/components-core/concurrency/`

Docs:

- `.ai/xmlui/concurrency.md`
- `xmlui/dev-docs/guide/29-concurrency.md`
- `website/content/docs/pages/managed-react/cooperative-concurrency.md`

## 07 - Structured Exception Model

Plan file:

- `xmlui/dev-docs/plans/07-structured-exception-model.md`

Implementation:

- `xmlui/src/components-core/errors/`
- `xmlui/src/components/Fallback/`
- `xmlui/src/components/RetryPolicy/`
- `xmlui/src/components-core/RestApiProxy.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`
- `xmlui/src/components-core/container/event-handlers.ts`
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/rendering/AppContent.tsx`
- `xmlui/src/components-core/rendering/ErrorBoundary.tsx`
- `xmlui/src/components-core/rendering/containers.ts`

Tests:

- `xmlui/tests/components-core/errors/`

Docs:

- `.ai/xmlui/errors.md`
- `.ai/xmlui/data.md`
- `xmlui/dev-docs/guide/30-errors.md`
- `website/content/docs/pages/managed-react/structured-exception-model.md`

## 08 - Sealed Theming Sandbox

Plan file:

- `xmlui/dev-docs/plans/08-sealed-theming-sandbox.md`

Implementation:

- `xmlui/src/components-core/theming/validator/`
- `xmlui/src/components-core/abstractions/standalone.ts`
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/rendering/valueExtractor.ts`
- `xmlui/src/components-core/theming/StyleContext.tsx`

Tests:

- `xmlui/tests/components-core/theming/validator.test.ts`

Docs:

- `.ai/xmlui/theming-styling.md`
- `xmlui/dev-docs/guide/07-theming-styling.md`
- `website/content/docs/pages/managed-react/sealed-theming-sandbox.md`

## 09 - Forms Validation Discipline

Plan file:

- `xmlui/dev-docs/plans/09-forms-validation-discipline.md`

Implementation:

- `xmlui/src/components-core/forms/`
- `xmlui/src/components/Form/`
- `xmlui/src/components/FormItem/`
- `xmlui/src/components-core/RestApiProxy.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components/APICall/APICall.tsx`

Tests:

- `xmlui/tests/components-core/forms/`
- `xmlui/tests-e2e/pages/forms.spec.ts`

Docs:

- `.ai/xmlui/form-infrastructure.md`
- `xmlui/dev-docs/guide/12-form-infrastructure.md`
- `website/content/docs/pages/managed-react/forms-validation-discipline.md`

## 10 - Defended Routing

Plan file:

- `xmlui/dev-docs/plans/10-defended-routing.md`

Implementation:

- `xmlui/src/components-core/routing/`
- `xmlui/src/components-core/abstractions/standalone.ts`
- `xmlui/src/components-core/action/NavigateAction.tsx`
- `xmlui/src/components/Pages/PagesReact.tsx`

Tests:

- `xmlui/tests/components-core/routing/`
- `xmlui/tests-e2e/routing-regression.spec.ts`
- `xmlui/tests-e2e/pages/routing-and-links.spec.ts`

Docs:

- `.ai/xmlui/routing.md`
- `xmlui/dev-docs/guide/13-routing.md`
- `website/content/docs/pages/managed-react/defended-routing.md`

## 11 - I18n Foundations

Plan file:

- `xmlui/dev-docs/plans/11-i18n-foundations.md`

Implementation:

- `xmlui/src/components-core/i18n/`
- `xmlui/src/components/I18n/`
- `xmlui/src/components-core/AppContext.tsx`
- `xmlui/src/components-core/abstractions/standalone.ts`
- `xmlui/src/components-core/appContext/app-utils.ts`
- `xmlui/src/components-core/appContext/date-functions.ts`
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/rendering/AppContent.tsx`
- `xmlui/src/components-core/utils/date-utils.ts`
- `xmlui/src/components-core/utils/misc.ts`
- `xmlui/scripts/lint-physical-css.ts`

Tests:

- `xmlui/tests/components-core/i18n/`
- `xmlui/tests-e2e/i18n/`

Docs:

- `.ai/xmlui/i18n.md`
- `xmlui/dev-docs/guide/26-i18n.md`
- `website/content/docs/pages/managed-react/i18n-foundations.md`

## 12 - Enforced Versioning

Plan file:

- `xmlui/dev-docs/plans/12-enforced-versioning.md`

Implementation:

- `xmlui/src/components-core/versioning/`
- `xmlui/src/components-core/analyzer/rules/versioning.ts`
- `xmlui/src/abstractions/ComponentDefs.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/language-server/services/versioning-diagnostic.ts`
- `xmlui/src/language-server/services/diagnostic.ts`
- `xmlui/src/components-core/rendering/AppContent.tsx`
- `xmlui/scripts/api-diff/`
- `xmlui/scripts/generate-docs/MetadataProcessor.mjs`
- `.github/workflows/release-guard.yml`

Tests:

- `xmlui/tests/components-core/versioning/`
- `xmlui/tests/components-core/analyzer/rules/versioning.test.ts`
- `xmlui/tests/scripts/api-diff/`

Docs:

- `.ai/xmlui/versioning.md`
- `.ai/xmlui/doc-generation.md`
- `.ai/xmlui/language-server.md`
- `xmlui/dev-docs/guide/36-versioning.md`
- `website/content/docs/pages/managed-react/enforced-versioning.md`

## 13 - Build Validation Analyzers

Plan file:

- `xmlui/dev-docs/plans/13-build-validation-analyzers.md`

Implementation:

- `xmlui/src/components-core/analyzer/`
- `xmlui/scripts/cli/check.ts`
- `xmlui/src/abstractions/ComponentDefs.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`
- `xmlui/src/components/ComponentProvider.tsx`
- `xmlui/src/components/ComponentRegistryContext.tsx`
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/language-server/services/diagnostic.ts`
- `xmlui/src/nodejs/vite-xmlui-plugin.ts`
- `xmlui/src/parsers/scripting/`
- `xmlui/src/parsers/xmlui-parser/`
- `xmlui/vite.config.ts`

Tests:

- `xmlui/tests/components-core/analyzer/`

Docs and templates:

- `.ai/xmlui/container-state.md`
- `.ai/xmlui/expression-eval.md`
- `.ai/xmlui/language-server.md`
- `website/content/docs/pages/managed-react/build-validation-analyzers.md`
- `tools/create-app/templates/default/ts/xmlui.config.json`
- `tools/create-app/templates/docs/ts/xmlui.config.json`
- `tools/create-app/templates/minimal/ts/xmlui.config.json`
- `tools/create-app/templates/blog/ts/xmlui.config.json`
- `tools/create-app/templates/default/ts/.github/workflows/check.yml`
- `tools/create-app/templates/docs/ts/.github/workflows/check.yml`
- `tools/create-app/templates/minimal/ts/.github/workflows/check.yml`
- `tools/create-app/templates/blog/ts/.github/workflows/check.yml`
- `tools/create-app/dist/default/ts/xmlui.config.json`
- `tools/create-app/dist/docs/ts/xmlui.config.json`
- `tools/create-app/dist/minimal/ts/xmlui.config.json`
- `tools/create-app/dist/blog/ts/xmlui.config.json`
- `tools/create-app/dist/default/ts/.github/workflows/check.yml`
- `tools/create-app/dist/docs/ts/.github/workflows/check.yml`
- `tools/create-app/dist/minimal/ts/.github/workflows/check.yml`
- `tools/create-app/dist/blog/ts/.github/workflows/check.yml`

## 14 - UDC Sandbox

Plan file:

- `xmlui/dev-docs/plans/14-udc-sandbox.md`

Implementation:

- `xmlui/src/components-core/udc-sandbox/`
- `xmlui/src/components-core/CompoundComponent.tsx`
- `xmlui/src/components-core/abstractions/standalone.ts`
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/rendering/Container.tsx`
- `xmlui/src/components-core/rendering/StateContainer.tsx`
- `xmlui/src/components-core/script-runner/bannedMembers.ts`
- `xmlui/src/components-core/script-runner/eval-tree-common.ts`
- `xmlui/src/components-core/analyzer/rules/udc-slot-undeclared.ts`
- `xmlui/scripts/cli/udc-audit.ts`
- `xmlui/scripts/cli/udc-declare.ts`

Tests:

- `xmlui/tests/components-core/udc-sandbox/`
- `xmlui/tests/components-core/analyzer/rules/udc-slot-undeclared.test.ts`

Docs:

- `.ai/xmlui/udc-sandbox.md`
- `.ai/xmlui/user-defined-components.md`
- `xmlui/dev-docs/guide/35-udc-sandbox.md`
- `website/content/docs/pages/managed-react/udc-sandbox.md`

## 15 - Audit-Grade Observability

Plan file:

- `xmlui/dev-docs/plans/15-audit-grade-observability.md`

Implementation:

- `xmlui/src/components-core/audit/`
- `xmlui/src/abstractions/AppContextDefs.ts`
- `xmlui/src/abstractions/ComponentDefs.ts`
- `xmlui/src/components/App/App.tsx`
- `xmlui/src/components/App/AppReact.tsx`
- `xmlui/src/components-core/abstractions/standalone.ts`
- `xmlui/src/components-core/loader/`
- `xmlui/src/components-core/inspector/`
- `xmlui/src/components-core/rendering/AppContent.tsx`

Tests:

- `xmlui/tests/components-core/audit/`

Docs:

- `.ai/xmlui/action-execution.md`
- `.ai/xmlui/data-operations.md`
- `.ai/xmlui/inspector-debugging.md`
- `website/content/docs/pages/managed-react/audit-grade-observability.md`

## 16 - Concurrent State Determinism

Plan file:

- `xmlui/dev-docs/plans/16-concurrent-determinism.md`

Implementation:

- `xmlui/src/components-core/scheduler/`
- `xmlui/src/components-core/utils/orderedKeys.ts`
- `xmlui/src/components-core/utils/serializeSpacing.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`
- `xmlui/src/components-core/container/event-handlers.ts`
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/rendering/ComponentAdapter.tsx`
- `xmlui/src/components-core/rendering/Container.tsx`
- `xmlui/src/components/Items/Items.tsx`
- `xmlui/src/components-core/analyzer/rules/determinism-floating-point-token.ts`
- `xmlui/src/components-core/analyzer/rules/determinism-iteration-order-symbol.ts`
- `xmlui/scripts/cli/replay.ts`
- `website/public/xmlui/xs-diff.html`

Tests:

- `xmlui/tests/components-core/scheduler/`
- `xmlui/tests/components-core/analyzer/rules/determinism-rules.test.ts`

Docs:

- `.ai/xmlui/determinism.md`
- `.ai/xmlui/action-execution.md`
- `.ai/xmlui/container-state.md`
- `.ai/xmlui/expression-eval.md`
- `xmlui/dev-docs/guide/39-determinism.md`
- `website/content/docs/pages/managed-react/concurrent-state-determinism.md`

## 17 - DOM API Hardening

Plan file:

- `xmlui/dev-docs/plans/17-dom-api-hardening.md`

Implementation:

- `xmlui/src/components-core/StandaloneApp.tsx`
- `xmlui/src/components-core/abstractions/standalone.ts`
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/script-runner/bannedFunctions.ts`
- `xmlui/src/components-core/script-runner/bannedMembers.ts`
- `xmlui/src/components-core/script-runner/eval-tree-common.ts`
- `xmlui/src/components-core/script-runner/eval-tree-sync.ts`
- `xmlui/src/parsers/scripting/Parser.ts`
- `xmlui/src/components/EventSource/`
- `xmlui/src/components/WebSocket/`

Tests:

- `xmlui/tests/components-core/scripts-runner/`

Docs:

- `website/content/docs/pages/managed-react/code-injection-prevention.md`
- `website/content/docs/pages/managed-react/dom-api-isolation.md`
- `website/content/docs/pages/managed-react/http-centralization.md`
- `website/content/docs/pages/managed-react/observability-substrate.md`
- `website/content/docs/pages/managed-react/xss-protection.md`

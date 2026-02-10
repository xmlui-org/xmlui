# Refactor $subject$

I want to refactor $subject$ to make its source code more straightforward and easier to read and understand. The refactoring should result in code that 
- contains less code lines than the original code if possible
- does not disturb its reader to hop among numerous files
- can be read linearly
- contains the right amount of comments (not too verbose, not too few)

## Resources

These resources are essential for refactoring:
- Component conventions: xmlui/dev-docs/conv-create-components.md
- E2E testing conventions: xmlui/dev-docs/conv-e2e-testing.md
- Rendering pipeline: xmlui/dev-docs/standalone-app.md
- $additional_resources$

## Planning

First, analyze the current source code. Dive deeply into the code if needed for better understanding. Collect all your findings and compact them to produce a brief report that contains enough information for a human or AI assistant to carry out the refactoring.

Break down the entire refactoring into a sequence of steps that can be executed one by one. Each step should provide an opportunity to create new unit/e2e tests that verify the result of the particular refactoring step.

Record your findings and plan in a plan.md file beside the subject of the refactoring (in the same folder). Omit unnecessary content (like executive summaries, estimations, etc.) from the plan; strive for conciseness.

## Refactor Flow

You can assume that all unit tests and E2E tests run successfully at the beginning of the refactoring activity.

Execute the refactoring step by step. When a step completes successfully, ask for approval to proceed with the next step. Follow this flow:

1. Implement the feature described by the step.
2. Ensure there are no linting issues in the modified files (in VS Code, you can check the Problems pane).
3. Create new unit/e2e tests for the feature.
4. Ensure all newly created tests run successfully.
5. If applicable, run all unit/e2e tests for the component related to the subject of refactoring.
6. When all of these are successful, update the step's status in the plan document.

## Tools

You can use these commands in xmlui/package.json:

- "build:xmlui-standalone": Check if the xmlui code builds successfully. This command takes about 2 minutes, so use it infrequently, only when you have no other way to verify that the code compiles successfully.
- "test:unit": Run unit tests. Since this command runs vitest, you can use it with arguments to run only particular unit test files. If needed, you can run all unit tests, which takes about 40 seconds.

## Constraints

When you run e2e tests with Playwright, you must start Playwright from the workspace root. Running all e2e tests takes about 10 minutes, so never run all of them without user confirmation. See the xmlui/dev-docs/conv-e2e-testing.md document for E2E testing conventions.

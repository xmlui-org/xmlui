# Running Playwright Tests

## Run from CLI with Options

Running a test file:
```
npx playwright test chat-smoke-tets.spec.ts
```

Running a test files with "landing" and "login" in the filename:
```
npx playwright test landing login
```

Run the test with title:
```
npx playwright test -g "remove reaction"
```

Debug test:
```
npx playwright test --debug
```

Run tests X amount of time ([note that repeating can be done in config](https://playwright.dev/docs/api/class-testconfig#test-config-repeat-each)):
```
npx playwright test --repeat-each=X
```

Example of combining different options:
```
npx playwright test -g "remove reaction" --repeat-each=5
```

[CLI command options reference](https://playwright.dev/docs/test-cli#reference)
[CLI command options examples](https://playwright.dev/docs/running-tests)

## Best Practices

- Tests should **always** use test-specific mock data
- Refrain from waiting X ms in tests. We should be waiting for changes on the UI or responses from the backend.
- Prefer `getByTestId` instead of other locators where appropriate.
- Try to specify locators by traversing the DOM,
  e.g. `page.getByTestId("messageRow_1").getByTestId("messageActionsPopup").getByRole("button").filter({ hasText: reaction })`.

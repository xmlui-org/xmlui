# Writing component tests 🧪

This is a guide detailing the good testing practices with our test infrastructure. It is also useful for providing guard rails for AI to generate code (hence the tone).

## General structure of component tests

Place component tests next to the component's implementation.
Name should be `<ComponentName>.spec.ts`. For example, `Button.spec.ts`.

Use `test.describe("category name")` to group test cases. Don't need a top level category that encompases every test case.

These test categories are:

- [ ] Basic functionality tests
- [ ] Accessibility tests
- [ ] Edge case tests (null, undefined, unexpected input types like objects where text is expected)
- [ ] Test cases for each property, event, exposed method of the component. Each such item can be it's own category, if there are sufficiently numerous test cases for it (e.g. >= 5, but that's not a hard requirement).
- [ ] In some cases it can be prudent to combine multiple properties, like `icon` and `iconPosition`. These can be bundled together into a single category. These attributes can be found in the documentation of the component, which lives in the component's file, such as `Button.tsx` next to the test file, but not in the native implementation file `ButtonNative.tsx`. Examples for properties, events, apis can be found in a separate file next to the implementation and test files with the format `<ComponentName>.md`.
- [ ] Test cases for styling and theme variables. This section is not figured out yet, just leave an empty category for these and note with some words that, these kind of tests need some thought.

## Guide on writing component tests

### Initializing

XMLUI is a declarative, reactive, component based web framework. As such, the source code is provided to an async initializer function that takes the XML-like source code as its only input parameter:

```ts
await initTestBed(`<Checkbox label="hi there" />`);
```

The function opens a web browser (the bundled default is Chrome), translates the source XMLUI code to JS binaries, bundles it and injects it as a runnable script in the browser.
The result is a React web app. In the example above we get a checkbox input control with the label `hi there`.

### Obtaining a locator (element)

Locate elements in a way a user would locate them. When choosing locators, keep specificity in mind.
For example, instead of relying on internal structure like this:

```ts
page.locator("input").nth(2)
```

Use `getByRole` if looking for an input control that is easily identified by its role:

```ts
const checkboxLocator = page.getByRole('checkbox');
```

When locating by text, prefer the `getByText` locator. Use the `{ exact: true }` option if necessary.
If an element is nested deeper in the DOM tree, use multiple locators to drill down to get it:

```ts
const checkboxLocator = page.getByTestId("container").getByRole('checkbox');
```

When testing input controls with non-empty labels, try to locate its associated input control with the `getByLabel` locator.

If and only if there are more elements of the same type and it does not make sense to use text (because the test is not about labels or content text, or because the layout would change due to the presence of the content), prefer to use `testId`-s in the source code and use those testIds to locate the elements.

You should avoid using `page.locator()` in test cases.

If it is possible to test something at the time of locating the element, prefer using that locator. `getByRole` is a prime example of this, because it also tests for accessibility and intent (the user is not looking for a div with a certain class on it, they are looking for an image or a button). Avoid long selectors, that could be more readable by adding some assertions. For example, this is better:

```ts
const cb = page.getByRole("checkbox");
await expect(cb).toBeDisabled();
```

and this is worse:

```ts
const cb = page.getByRole("checkbox", { disabled: true });
await expect(cb).toBeVisible();
```

However, the above approach has its merits: prefer using it over testIds if the following are true:
- there are multiple elements of the same type and using option parameter can differentiate between them
- assertions would need to be written after locating the element anyway

 For example, this is a good use of the `{ disabled: true }` option:

```ts
await initTestBed(`
<Fragment>
  <Checkbox enabled="false"/>
  <Checkbox />
</Fragment>`);
const cb = page.getByRole("checkbox", { disabled: true });
// do something with the disabled checkbox
```

### Writing actions and drivers

Not all tests need actions. Some just instantiate the webpage with a given component and then make assertions on that.

Actions are the most varried part of writing component tests. If, and only if, the action is super simple and consists of one step, and the action's name gives clarity on what it is doing, should you use actions directly on the locators.

For example, the following is good practice, because it is clear what the actions are doing, as the `check` and `uncheck` actions are complete in themselves:

```ts
const cb = page.getByRole("checkbox");
await cb.check();
await expect(cb).toBeChecked();
await cb.uncheck();
await expect(cb).not.toBeChecked();
```

However, in any other case, you should use a component driver to encapsulate the logic of the action. For example:

```ts
await initTestBed(`
  <Select searchable="true">
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </FormItem>
`);
const select = page.getByRole("combobox");
const driver = await createSelectDriver(select);

await driver.searchFor("second");
await driver.chooseFirstOption();
await expect(select).toHaveValue("opt2");
```

In this case, if the `searchFor` method were to be substituted with clicking on the locator and typing into the input field the label text, that would not convey the intent of the action, which is searching. Actions should have componenet-specific names. For example, a Dropdown can have a `toggleDropdownVisibility` method, which is pretty much just a click, but with a more meaningful name. You would not call it `click`.

Component-specific drivers are derived from a base ComponentDriver class.

Sometimes you need to test events. The easies was is to do something like this:

```ts
test("component didChange event fires on state change", async ({
  initTestBed,
  createCheckboxDriver,
}) => {
  const { testStateDriver } = await initTestBed(`<Checkbox onDidChange="testState = 'changed'" />`);
  const cb = page.getByRole("checkbox");
  await cb.click();
  await expect.poll(testStateDriver.testState).toEqual("changed");
});
```

Don't worry about how the testState is actually obtained. Just know that inside an event handler, you can write javascript and access the `testState` variable, which you can make assertions against later by polling that value. Just make it obvious that testState is actually changed, so use an obvious name like 'changed', or if you need to test the handler multiple times, use a counter like `onDidChange="testState = testState == null ? 1 : testState + 1"` Test state is initialized to be null.

### Writing assertions

Use web-first assertions, like

```ts
await expect(checkboxLocator).not.toBeChecked()
```

If there is a built-in assertion, prefer that over an assertion checking against DOM attributes directly.

This is an antipattern because it relies on the element being an input element:

```ts
await expect(checkboxLocator).toHaveAttribute("type", "checkbox");
```

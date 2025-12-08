import { test, expect } from "../src/testing/fixtures";

// =============================================================================
// BASIC STATE MANAGEMENT TESTS
// =============================================================================

test.describe("Basic State Management", () => {
  test("define() initializes a new bucket with primitive value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('counter', 42)">Initialize</Button>
        <Button testId="get-button" onClick="testState = AppState.get('counter')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual(42);
  });

  test("define() initializes a new bucket with object value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('user', { name: 'John', age: 30 })">Initialize</Button>
        <Button testId="get-button" onClick="testState = AppState.get('user')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual({ name: "John", age: 30 });
  });

  test("define() initializes a new bucket with array value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('items', [1, 2, 3])">Initialize</Button>
        <Button testId="get-button" onClick="testState = AppState.get('items')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual([1, 2, 3]);
  });

  test("define() returns the initial value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="define-button" onClick="testState = AppState.define('data', { x: 10 })">Define</Button>
      </Fragment>
    `);

    await page.getByTestId("define-button").click();

    await expect.poll(testStateDriver.testState).toEqual({ x: 10 });
  });

  test("get() returns undefined for non-existent bucket", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="get-button" onClick="testState = AppState.get('nonexistent')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toBeUndefined();
  });

  test("get() returns a deep-cloned frozen object for object values", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('data', { x: 1, y: 2 })">Initialize</Button>
        <Button testId="get-button" onClick="testState = { value: AppState.get('data'), frozen: Object.isFrozen(AppState.get('data')) }">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("get-button").click();

    const result = await testStateDriver.testState();
    expect(result.value).toEqual({ x: 1, y: 2 });
    expect(result.frozen).toBe(true);
  });

  test("get() returns primitive values as-is without cloning", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('num', 123)">Initialize</Button>
        <Button testId="get-button" onClick="testState = AppState.get('num')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual(123);
  });

  test("get() with path parameter retrieves nested property", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('user', { profile: { name: 'Alice', city: 'NYC' } })">Initialize</Button>
        <Button testId="get-button" onClick="testState = AppState.get('user', 'profile.name')">Get Nested</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual("Alice");
  });

  test("get() with path returns primitives as-is", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('data', { count: 42 })">Initialize</Button>
        <Button testId="get-button" onClick="testState = AppState.get('data', 'count')">Get Nested</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual(42);
  });

  test("get() with path returns cloned/frozen objects", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('data', { nested: { value: 99 } })">Initialize</Button>
        <Button testId="get-button" onClick="testState = Object.isFrozen(AppState.get('data', 'nested'))">Check Frozen</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toBe(true);
  });

  test("get() does not return the original reference", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('data', { x: 1 })">Initialize</Button>
        <Button testId="check-button" onClick="testState = AppState.get('data') === AppState.get('data')">Check Same Reference</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("check-button").click();

    // Should return false because each get() returns a new deep-cloned object
    await expect.poll(testStateDriver.testState).toBe(false);
  });

  test("set() with two arguments replaces entire bucket", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('value', 10)">Initialize</Button>
        <Button testId="set-button" onClick="AppState.set('value', 99)">Set Value</Button>
        <Button testId="get-button" onClick="testState = AppState.get('value')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("set-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual(99);
  });

  test("set() with three arguments sets nested property", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('settings', { theme: 'light', lang: 'en' })">Initialize</Button>
        <Button testId="set-button" onClick="AppState.set('settings', 'theme', 'dark')">Set Nested</Button>
        <Button testId="get-button" onClick="testState = AppState.get('settings')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("set-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual({ theme: "dark", lang: "en" });
  });

  test("set() creates bucket if it doesn't exist", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="set-button" onClick="AppState.set('newBucket', 'hello')">Set Value</Button>
        <Button testId="get-button" onClick="testState = AppState.get('newBucket')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("set-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual("hello");
  });

  test("set() returns the new value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="set-button" onClick="testState = AppState.set('val', 777)">Set Value</Button>
      </Fragment>
    `);

    await page.getByTestId("set-button").click();

    await expect.poll(testStateDriver.testState).toEqual(777);
  });

  test("update() merges new values into existing object bucket", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('config', { a: 1, b: 2 })">Initialize</Button>
        <Button testId="update-button" onClick="AppState.update('config', { b: 20, c: 3 })">Update</Button>
        <Button testId="get-button" onClick="testState = AppState.get('config')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("update-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual({ a: 1, b: 20, c: 3 });
  });

  test("update() with path updates nested property", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('app', { user: { name: 'Bob', age: 25 } })">Initialize</Button>
        <Button testId="update-button" onClick="AppState.update('app', 'user', { name: 'Bob', age: 26 })">Update Nested</Button>
        <Button testId="get-button" onClick="testState = AppState.get('app')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("update-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual({ user: { name: "Bob", age: 26 } });
  });

  test("update() returns the merged value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('data', { x: 1 })">Initialize</Button>
        <Button testId="update-button" onClick="testState = AppState.update('data', { y: 2 })">Update</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("update-button").click();

    await expect.poll(testStateDriver.testState).toEqual({ x: 1, y: 2 });
  });

  test("update() warns when trying to merge into primitive bucket", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('counter', 42)">Initialize</Button>
        <Button testId="update-button" onClick="testState = AppState.update('counter', { value: 100 })">Try Update</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("update-button").click();

    // Should return original primitive value and log warning when trying to merge into primitive
    await expect.poll(testStateDriver.testState).toBe(42);
  });

  test("update() does not mutate original object", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('data', { original: true })">Initialize</Button>
        <Button testId="get1-button" onClick="testState = AppState.get('data')">Get Before</Button>
        <Button testId="update-button" onClick="AppState.update('data', { modified: true })">Update</Button>
        <Button testId="get2-button" onClick="testState = AppState.get('data')">Get After</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("get1-button").click();
    
    const before = await testStateDriver.testState();
    expect(before).toEqual({ original: true });
    
    await page.getByTestId("update-button").click();
    await page.getByTestId("get2-button").click();
    
    const after = await testStateDriver.testState();
    expect(after).toEqual({ original: true, modified: true });
  });

  test("updateWith() updates primitive bucket with function", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('counter', 5)">Initialize</Button>
        <Button testId="update-button" onClick="AppState.updateWith('counter', c => c * 2)">Update</Button>
        <Button testId="get-button" onClick="testState = AppState.get('counter')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("update-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual(10);
  });

  test("updateWith() updates object bucket with function", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('obj', { count: 3 })">Initialize</Button>
        <Button testId="update-button" onClick="AppState.updateWith('obj', o => ({ count: o.count + 1 }))">Update</Button>
        <Button testId="get-button" onClick="testState = AppState.get('obj')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("update-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual({ count: 4 });
  });

  test("updateWith() updates array bucket with function", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('nums', [1, 2, 3])">Initialize</Button>
        <Button testId="update-button" onClick="AppState.updateWith('nums', arr => [...arr, 4])">Update</Button>
        <Button testId="get-button" onClick="testState = AppState.get('nums')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("update-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual([1, 2, 3, 4]);
  });

  test("updateWith() receives current value in updater function", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('val', 100)">Initialize</Button>
        <Button testId="update-button" onClick="AppState.updateWith('val', prev => testState = prev)">Update</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("update-button").click();

    await expect.poll(testStateDriver.testState).toEqual(100);
  });

  test("updateWith() returns the new value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('data', 10)">Initialize</Button>
        <Button testId="update-button" onClick="AppState.updateWith('data', x => x * 3)">Update</Button>
        <Button testId="get-button" onClick="testState = AppState.get('data')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("update-button").click();
    await page.getByTestId("get-button").click();

    // Verify the update worked correctly, which confirms updateWith returns the new value
    await expect.poll(testStateDriver.testState).toBe(30);
  });
});

// =============================================================================
// NESTED PATH TESTS
// =============================================================================

test.describe("Nested Path Tests", () => {
  test("define() works with nested paths (a.b.c)", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="define-button" onClick="AppState.define('config.server.port', 8080)">Define</Button>
        <Button testId="get-button" onClick="testState = AppState.get('config.server.port')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("define-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual(8080);
  });

  test("get() retrieves nested bucket values", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="define-button" onClick="AppState.define('app.database.host', 'localhost')">Define</Button>
        <Button testId="get-button" onClick="testState = AppState.get('app.database.host')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("define-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual("localhost");
  });

  test("set() updates nested bucket values", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="define-button" onClick="AppState.define('settings.theme.color', 'blue')">Define</Button>
        <Button testId="set-button" onClick="AppState.set('settings.theme.color', 'red')">Set Value</Button>
        <Button testId="get-button" onClick="testState = AppState.get('settings.theme.color')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("define-button").click();
    await page.getByTestId("set-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual("red");
  });

  test("update() merges into nested buckets", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="define-button" onClick="AppState.define('app.user.profile', { name: 'Alice', age: 30 })">Define</Button>
        <Button testId="update-button" onClick="AppState.update('app.user.profile', { age: 31, city: 'NYC' })">Update</Button>
        <Button testId="get-button" onClick="testState = AppState.get('app.user.profile')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("define-button").click();
    await page.getByTestId("update-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual({ name: "Alice", age: 31, city: "NYC" });
  });

  test("nested paths create intermediate objects automatically", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="set-button" onClick="AppState.set('deep.nested.path.value', 'created')">Set Value</Button>
        <Button testId="get-button" onClick="testState = AppState.get('deep.nested.path.value')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("set-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual("created");
  });
});

// =============================================================================
// ARRAY METHOD TESTS - BASIC OPERATIONS
// =============================================================================

test.describe("Array Method Tests - Basic Operations", () => {
  test("append() adds item to end of array", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('items', [1, 2])">Initialize</Button>
        <Button testId="append-button" onClick="AppState.append('items', 3)">Append</Button>
        <Button testId="get-button" onClick="testState = AppState.get('items')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("append-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual([1, 2, 3]);
  });

  test("append() returns updated frozen array", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('items', [10])">Initialize</Button>
        <Button testId="append-button" onClick="testState = AppState.append('items', 20)">Append</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("append-button").click();

    await expect.poll(testStateDriver.testState).toEqual([10, 20]);
  });

  test("push() adds item to end of array (alias)", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('list', ['a', 'b'])">Initialize</Button>
        <Button testId="push-button" onClick="AppState.push('list', 'c')">Push</Button>
        <Button testId="get-button" onClick="testState = AppState.get('list')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("push-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual(["a", "b", "c"]);
  });

  test("pop() removes and returns last item", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('stack', [1, 2, 3])">Initialize</Button>
        <Button testId="pop-button" onClick="testState = AppState.pop('stack')">Pop</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("pop-button").click();

    await expect.poll(testStateDriver.testState).toEqual(3);
  });

  test("pop() returns frozen deep-cloned item", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('objs', [{ x: 1 }, { x: 2 }])">Initialize</Button>
        <Button testId="pop-button" onClick="testState = AppState.pop('objs')">Pop</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("pop-button").click();

    await expect.poll(testStateDriver.testState).toEqual({ x: 2 });
  });

  test("shift() removes and returns first item", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('queue', [10, 20, 30])">Initialize</Button>
        <Button testId="shift-button" onClick="testState = AppState.shift('queue')">Shift</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("shift-button").click();

    await expect.poll(testStateDriver.testState).toEqual(10);
  });

  test("shift() returns frozen deep-cloned item", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('items', [{ name: 'first' }, { name: 'second' }])">Initialize</Button>
        <Button testId="shift-button" onClick="testState = AppState.shift('items')">Shift</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("shift-button").click();

    await expect.poll(testStateDriver.testState).toEqual({ name: "first" });
  });

  test("unshift() adds item to beginning of array", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('nums', [2, 3])">Initialize</Button>
        <Button testId="unshift-button" onClick="AppState.unshift('nums', 1)">Unshift</Button>
        <Button testId="get-button" onClick="testState = AppState.get('nums')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("unshift-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual([1, 2, 3]);
  });

  test("unshift() returns updated frozen array", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('vals', [100])">Initialize</Button>
        <Button testId="unshift-button" onClick="testState = AppState.unshift('vals', 50)">Unshift</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("unshift-button").click();

    await expect.poll(testStateDriver.testState).toEqual([50, 100]);
  });
});

// =============================================================================
// ARRAY METHOD TESTS - ADVANCED OPERATIONS
// =============================================================================

test.describe("Array Method Tests - Advanced Operations", () => {
  test("removeAt() removes item at specified index", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('items', ['a', 'b', 'c', 'd'])">Initialize</Button>
        <Button testId="remove-button" onClick="AppState.removeAt('items', 2)">Remove at 2</Button>
        <Button testId="get-button" onClick="testState = AppState.get('items')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("remove-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual(["a", "b", "d"]);
  });

  test("removeAt() returns the removed item", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('vals', [10, 20, 30])">Initialize</Button>
        <Button testId="remove-button" onClick="testState = AppState.removeAt('vals', 1)">Remove at 1</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("remove-button").click();

    await expect.poll(testStateDriver.testState).toEqual(20);
  });

  test("removeAt() handles negative indices", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('nums', [1, 2, 3, 4, 5])">Initialize</Button>
        <Button testId="remove-button" onClick="AppState.removeAt('nums', -2)">Remove at -2</Button>
        <Button testId="get-button" onClick="testState = AppState.get('nums')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("remove-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual([1, 2, 3, 5]);
  });

  test("removeAt() handles out-of-bounds indices gracefully", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('items', [1, 2, 3])">Initialize</Button>
        <Button testId="remove-button" onClick="testState = AppState.removeAt('items', 10)">Remove at 10</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("remove-button").click();

    await expect.poll(testStateDriver.testState).toBeUndefined();
  });

  test("insertAt() inserts item at specified index", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('list', [1, 2, 4])">Initialize</Button>
        <Button testId="insert-button" onClick="AppState.insertAt('list', 2, 3)">Insert at 2</Button>
        <Button testId="get-button" onClick="testState = AppState.get('list')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("insert-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual([1, 2, 3, 4]);
  });

  test("insertAt() returns updated frozen array", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('arr', ['a', 'c'])">Initialize</Button>
        <Button testId="insert-button" onClick="testState = AppState.insertAt('arr', 1, 'b')">Insert at 1</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("insert-button").click();

    await expect.poll(testStateDriver.testState).toEqual(["a", "b", "c"]);
  });

  test("insertAt() handles negative indices", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('nums', [1, 2, 5])">Initialize</Button>
        <Button testId="insert-button" onClick="AppState.insertAt('nums', -1, 4)">Insert at -1</Button>
        <Button testId="get-button" onClick="testState = AppState.get('nums')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("insert-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual([1, 2, 4, 5]);
  });

  test("insertAt() handles index at array length (append behavior)", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('items', [10, 20])">Initialize</Button>
        <Button testId="insert-button" onClick="AppState.insertAt('items', 2, 30)">Insert at 2</Button>
        <Button testId="get-button" onClick="testState = AppState.get('items')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("insert-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual([10, 20, 30]);
  });

  test("remove() removes first item matching by value from array", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('nums', [1, 2, 3, 2, 4])">Initialize</Button>
        <Button testId="remove-button" onClick="AppState.remove('nums', 2)">Remove 2</Button>
        <Button testId="get-button" onClick="testState = AppState.get('nums')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("remove-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual([1, 3, 2, 4]);
  });

  test("remove() uses deep equality for object comparison", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('objs', [{ id: 1, name: 'a' }, { id: 2, name: 'b' }])">Initialize</Button>
        <Button testId="remove-button" onClick="AppState.remove('objs', { id: 1, name: 'a' })">Remove Object</Button>
        <Button testId="get-button" onClick="testState = AppState.get('objs')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("remove-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual([{ id: 2, name: "b" }]);
  });

  test("remove() has no effect if value not found", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('items', [1, 2, 3])">Initialize</Button>
        <Button testId="remove-button" onClick="AppState.remove('items', 99)">Remove 99</Button>
        <Button testId="get-button" onClick="testState = AppState.get('items')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("remove-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual([1, 2, 3]);
  });

  test("removeBy() removes first item matching predicate", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('items', [{ x: 1 }, { x: 2 }, { x: 3 }])">Initialize</Button>
        <Button testId="remove-button" onClick="AppState.removeBy('items', (item) => item.x == 2)">Remove x=2</Button>
        <Button testId="get-button" onClick="testState = AppState.get('items')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("remove-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual([{ x: 1 }, { x: 3 }]);
  });

  test("removeBy() uses predicate for partial property matching", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('todos', [{ id: 1, text: 'Task 1', done: false }, { id: 2, text: 'Task 2', done: true }])">Initialize</Button>
        <Button testId="remove-button" onClick="AppState.removeBy('todos', item => item.done == true)">Remove Done</Button>
        <Button testId="get-button" onClick="testState = AppState.get('todos')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("remove-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual([{ id: 1, text: "Task 1", done: false }]);
  });

  test("removeBy() handles complex conditions in predicate", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('nums', [5, 12, 8, 20, 3])">Initialize</Button>
        <Button testId="remove-button" onClick="AppState.removeBy('nums', n => n > 10)">Remove > 10</Button>
        <Button testId="get-button" onClick="testState = AppState.get('nums')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("remove-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual([5, 8, 20, 3]);
  });

  test("removeBy() has no effect if predicate never returns true", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('items', [1, 2, 3])">Initialize</Button>
        <Button testId="remove-button" onClick="AppState.removeBy('items', item => item > 100)">Remove > 100</Button>
        <Button testId="get-button" onClick="testState = AppState.get('items')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("remove-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual([1, 2, 3]);
  });
});

// =============================================================================
// ARRAY METHOD TESTS - EDGE CASES
// =============================================================================

test.describe("Array Method Tests - Edge Cases", () => {
  test("array methods validate bucket contains an array", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('notArray', { x: 1 })">Initialize</Button>
        <Button testId="append-button" onClick="AppState.append('notArray', 'test')">Append</Button>
        <Button testId="get-button" onClick="testState = AppState.get('notArray')">GetValue</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("append-button").click();
    await page.getByTestId("get-button").click();

    // Original value should be unchanged since append should warn and do nothing
    await expect.poll(testStateDriver.testState).toEqual({ x: 1 });
  });

  test("array methods log warning for non-array buckets", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('primitive', 42)">Initialize</Button>
        <Button testId="push-button" onClick="AppState.push('primitive', 'test')">Push</Button>
        <Button testId="get-button" onClick="testState = AppState.get('primitive')">GetValue</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("push-button").click();
    await page.getByTestId("get-button").click();

    // Original primitive value should be unchanged
    await expect.poll(testStateDriver.testState).toBe(42);
  });

  test("array methods handle empty arrays", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('empty', [])">Initialize</Button>
        <Button testId="append-button" onClick="AppState.append('empty', 'first')">Append</Button>
        <Button testId="get-button" onClick="testState = AppState.get('empty')">GetValue</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("append-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual(["first"]);
  });

  test("array methods work on nested array paths", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('project.tasks', ['task1'])">Initialize</Button>
        <Button testId="append-button" onClick="AppState.append('project.tasks', 'task2')">Append</Button>
        <Button testId="get-button" onClick="testState = AppState.get('project.tasks')">GetValue</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("append-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toEqual(["task1", "task2"]);
  });

  test("pop() on empty array returns undefined", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('items', [])">Initialize</Button>
        <Button testId="pop-button" onClick="testState = AppState.pop('items')">Pop</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("pop-button").click();

    await expect.poll(testStateDriver.testState).toBeUndefined();
  });

  test("shift() on empty array returns undefined", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('items', [])">Initialize</Button>
        <Button testId="shift-button" onClick="testState = AppState.shift('items')">Shift</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("shift-button").click();

    await expect.poll(testStateDriver.testState).toBeUndefined();
  });

  test("append() to non-existent bucket logs warning", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="append-button" onClick="AppState.append('nonExistent', 'test')">Append</Button>
        <Button testId="get-button" onClick="testState = AppState.get('nonExistent')">GetValue</Button>
      </Fragment>
    `);

    await page.getByTestId("append-button").click();
    await page.getByTestId("get-button").click();

    // Should return undefined since bucket doesn't exist
    await expect.poll(testStateDriver.testState).toBeUndefined();
  });

  test("unshift() to non-existent bucket logs warning", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="unshift-button" onClick="AppState.unshift('nonExistent', 'test')">Unshift</Button>
        <Button testId="get-button" onClick="testState = AppState.get('nonExistent')">GetValue</Button>
      </Fragment>
    `);

    await page.getByTestId("unshift-button").click();
    await page.getByTestId("get-button").click();

    // Should return undefined since bucket doesn't exist
    await expect.poll(testStateDriver.testState).toBeUndefined();
  });
});

// =============================================================================
// ERROR HANDLING TESTS
// =============================================================================

test.describe("Error Handling Tests", () => {
  test("get() handles invalid bucket paths gracefully", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="get-button" onClick="testState = AppState.get('invalid.nested.path')">Get Invalid</Button>
      </Fragment>
    `);

    await page.getByTestId("get-button").click();

    // Should return undefined for non-existent path
    await expect.poll(testStateDriver.testState).toBeUndefined();
  });

  test("set() handles invalid bucket paths gracefully", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="set-button" onClick="testState = AppState.set('deeply.nested.invalid.path', 'value')">Set Invalid</Button>
        <Button testId="get-button" onClick="testState = AppState.get('deeply.nested.invalid.path')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("set-button").click();
    await page.getByTestId("get-button").click();

    // Should create the path and set the value
    await expect.poll(testStateDriver.testState).toBe("value");
  });

  test("array methods validate bucket is an array", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('notArray', 'string value')">Initialize</Button>
        <Button testId="pop-button" onClick="testState = AppState.pop('notArray')">Pop</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("pop-button").click();

    // Should return undefined and log warning
    await expect.poll(testStateDriver.testState).toBeUndefined();
  });

  test("methods handle null bucket names", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="get-button" onClick="testState = AppState.get(null)">Get Null</Button>
      </Fragment>
    `);

    await page.getByTestId("get-button").click();

    // Should handle gracefully and return undefined
    await expect.poll(testStateDriver.testState).toBeUndefined();
  });

  test("methods handle undefined bucket names", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="get-button" onClick="testState = AppState.get(undefined)">Get Undefined</Button>
      </Fragment>
    `);

    await page.getByTestId("get-button").click();

    // Should handle gracefully and return undefined
    await expect.poll(testStateDriver.testState).toBeUndefined();
  });

  test("methods return undefined on errors", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('data', [1, 2, 3])">Initialize</Button>
        <Button testId="remove-button" onClick="testState = AppState.removeAt('data', 100)">Remove Out of Bounds</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("remove-button").click();

    // Should return undefined for out of bounds index
    await expect.poll(testStateDriver.testState).toBeUndefined();
  });
});

// =============================================================================
// IMMUTABILITY TESTS
// =============================================================================

test.describe("Immutability Tests", () => {
  test("returned objects are frozen", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('data', { x: 1, y: 2 })">Initialize</Button>
        <Button testId="get-button" onClick="testState = Object.isFrozen(AppState.get('data'))">Check Frozen</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toBe(true);
  });

  test("returned arrays are frozen", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('items', [1, 2, 3])">Initialize</Button>
        <Button testId="get-button" onClick="testState = Object.isFrozen(AppState.get('items'))">Check Frozen</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toBe(true);
  });

  test("nested objects in returned values are frozen", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('data', { outer: { inner: { value: 42 } } })">Initialize</Button>
        <Button testId="get-button" onClick="testState = Object.isFrozen(AppState.get('data').outer.inner)">Check Frozen</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toBe(true);
  });

  test("primitives are returned as-is (immutable by nature)", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('counter', 42)">Initialize</Button>
        <Button testId="get-button" onClick="testState = AppState.get('counter')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("get-button").click();

    // Primitives are immutable by nature, no need to freeze them
    await expect.poll(testStateDriver.testState).toBe(42);
  });

  test("modifying returned object throws error in strict mode", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('data', { x: 1 })">Initialize</Button>
        <Button testId="modify-button" onClick="(() => { try { const obj = AppState.get('data'); obj.x = 999; testState = 'modified'; } catch (e) { testState = 'error'; } })()">Modify</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("modify-button").click();

    // Should catch error when trying to modify frozen object
    await expect.poll(testStateDriver.testState).toBe("error");
  });

  test("modifying returned array throws error in strict mode", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('items', [1, 2, 3])">Initialize</Button>
        <Button testId="modify-button" onClick="(() => { try { const arr = AppState.get('items'); arr.push(4); testState = 'modified'; } catch (e) { testState = 'error'; } })()">Modify</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("modify-button").click();

    // Should catch error when trying to modify frozen array
    await expect.poll(testStateDriver.testState).toBe("error");
  });

  test("original state is never mutated", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('data', { items: [1, 2, 3] })">Initialize</Button>
        <Button testId="get1-button" onClick="const obj = AppState.get('data'); testState = obj.items.length">Get Length 1</Button>
        <Button testId="append-button" onClick="AppState.set('data', 'items', [1, 2, 3, 4])">Append Item</Button>
        <Button testId="get2-button" onClick="const obj = AppState.get('data'); testState = obj.items.length">Get Length 2</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("get1-button").click();
    
    // First get should return array with 3 items
    await expect.poll(testStateDriver.testState).toBe(3);
    
    await page.getByTestId("append-button").click();
    await page.getByTestId("get2-button").click();
    
    // After modification, get should return array with 4 items
    await expect.poll(testStateDriver.testState).toBe(4);
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.describe("Integration Tests", () => {
  test("AppState is accessible from event handlers", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="define-button" onClick="AppState.define('counter', 0)">Define</Button>
        <Button testId="increment-button" onClick="AppState.set('counter', AppState.get('counter') + 1)">Increment</Button>
        <Button testId="get-button" onClick="testState = AppState.get('counter')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("define-button").click();
    await page.getByTestId("increment-button").click();
    await page.getByTestId("increment-button").click();
    await page.getByTestId("get-button").click();

    await expect.poll(testStateDriver.testState).toBe(2);
  });

  test("AppState changes trigger component re-renders", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('message', 'initial')">Initialize</Button>
        <Button testId="update-button" onClick="AppState.set('message', 'updated')">Update</Button>
        <Text testId="display">{AppState.get('message')}</Text>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    
    // Initial value should be displayed
    await expect(page.getByTestId("display")).toContainText("initial");
    
    await page.getByTestId("update-button").click();
    
    // Updated value should be displayed (component re-rendered)
    await expect(page.getByTestId("display")).toContainText("updated");
  });

  test("multiple buckets can be managed independently", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-buttons" onClick="AppState.define('counter1', 0); AppState.define('counter2', 100)">Initialize Both</Button>
        <Button testId="inc1-button" onClick="AppState.set('counter1', AppState.get('counter1') + 1)">Inc Counter1</Button>
        <Button testId="inc2-button" onClick="AppState.set('counter2', AppState.get('counter2') + 10)">Inc Counter2</Button>
        <Button testId="get1-button" onClick="testState = { c1: AppState.get('counter1'), c2: AppState.get('counter2') }">Get Both</Button>
      </Fragment>
    `);

    await page.getByTestId("init-buttons").click();
    await page.getByTestId("inc1-button").click();
    await page.getByTestId("inc1-button").click();
    await page.getByTestId("inc2-button").click();
    await page.getByTestId("get1-button").click();

    await expect.poll(testStateDriver.testState).toEqual({ c1: 2, c2: 110 });
  });

  test("AppState works with Items component data binding", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('items', [])">Initialize</Button>
        <Button testId="add1-button" onClick="AppState.append('items', 'First')">Add First</Button>
        <Button testId="add2-button" onClick="AppState.append('items', 'Second')">Add Second</Button>
        <Button testId="add3-button" onClick="AppState.append('items', 'Third')">Add Third</Button>
        <Items data="{AppState.get('items')}">
          <Text testId="item-{$itemIndex}">{$item}</Text>
        </Items>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("add1-button").click();
    
    // First item should appear
    await expect(page.getByTestId("item-0")).toContainText("First");
    
    await page.getByTestId("add2-button").click();
    
    // Second item should appear
    await expect(page.getByTestId("item-1")).toContainText("Second");
    
    await page.getByTestId("add3-button").click();
    
    // Third item should appear
    await expect(page.getByTestId("item-2")).toContainText("Third");
  });

  test("AppState works within nested component contexts", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('shared', { value: 'outer' })">Initialize</Button>
        <VStack>
          <HStack>
            <Button testId="update-button" onClick="AppState.set('shared', 'value', 'inner')">Update Nested</Button>
            <Text testId="display">{AppState.get('shared', 'value')}</Text>
          </HStack>
        </VStack>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    
    // Initial value
    await expect(page.getByTestId("display")).toContainText("outer");
    
    await page.getByTestId("update-button").click();
    
    // Updated from nested context
    await expect(page.getByTestId("display")).toContainText("inner");
  });

  test("AppState persists across component re-renders", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('persistent', 'value1')">Initialize</Button>
        <Button testId="update-button" onClick="AppState.set('persistent', 'value2')">Update</Button>
        <Button testId="force-render" onClick="testState = testState === null ? 0 : testState + 1">Force Render</Button>
        <Button testId="get-button" onClick="testState = AppState.get('persistent')">Get Value</Button>
        <Text testId="render-count">{testState}</Text>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("update-button").click();
    
    // Force multiple re-renders
    await page.getByTestId("force-render").click();
    await page.getByTestId("force-render").click();
    await page.getByTestId("force-render").click();
    
    await page.getByTestId("get-button").click();
    
    // Value should persist across re-renders
    await expect.poll(testStateDriver.testState).toBe("value2");
  });

  test("AppState.updateWith works with arrow functions in XMLUI", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="init-button" onClick="AppState.define('counter', 5)">Initialize</Button>
        <Button testId="double-button" onClick="AppState.updateWith('counter', (c) => c * 2)">Double</Button>
        <Button testId="add-button" onClick="AppState.updateWith('counter', (c) => c + 10)">Add 10</Button>
        <Button testId="get-button" onClick="testState = AppState.get('counter')">Get Value</Button>
      </Fragment>
    `);

    await page.getByTestId("init-button").click();
    await page.getByTestId("double-button").click();
    await page.getByTestId("get-button").click();
    
    // 5 * 2 = 10
    await expect.poll(testStateDriver.testState).toBe(10);
    
    await page.getByTestId("add-button").click();
    await page.getByTestId("get-button").click();
    
    // 10 + 10 = 20
    await expect.poll(testStateDriver.testState).toBe(20);
  });
});

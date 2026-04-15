import { test, expect } from "../src/testing/fixtures";

test("var object destructuring extracts properties", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App>
      <script>
        var source = {name: "Alice", age: 30};
        var {name, age} = source;
      </script>
      <Text testId="name">{name}</Text>
      <Text testId="age">{age}</Text>
    </App>
  `);

  await expect(page.getByTestId("name")).toHaveText("Alice");
  await expect(page.getByTestId("age")).toHaveText("30");
});

test("var object destructuring with alias", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App>
      <script>
        var source = {firstName: "Bob", lastName: "Smith"};
        var {firstName: first, lastName: last} = source;
      </script>
      <Text testId="first">{first}</Text>
      <Text testId="last">{last}</Text>
    </App>
  `);

  await expect(page.getByTestId("first")).toHaveText("Bob");
  await expect(page.getByTestId("last")).toHaveText("Smith");
});

test("var array destructuring extracts elements", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App>
      <script>
        var source = ["red", "green", "blue"];
        var [first, second, third] = source;
      </script>
      <Text testId="first">{first}</Text>
      <Text testId="second">{second}</Text>
      <Text testId="third">{third}</Text>
    </App>
  `);

  await expect(page.getByTestId("first")).toHaveText("red");
  await expect(page.getByTestId("second")).toHaveText("green");
  await expect(page.getByTestId("third")).toHaveText("blue");
});

test("var array destructuring with holes", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App>
      <script>
        var source = ["a", "b", "c", "d"];
        var [first, , third] = source;
      </script>
      <Text testId="first">{first}</Text>
      <Text testId="third">{third}</Text>
    </App>
  `);

  await expect(page.getByTestId("first")).toHaveText("a");
  await expect(page.getByTestId("third")).toHaveText("c");
});

test("var destructuring from function return value", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App>
      <script>
        function getUser() {
          return {name: "Charlie", role: "admin"};
        }
        var {name, role} = getUser();
      </script>
      <Text testId="name">{name}</Text>
      <Text testId="role">{role}</Text>
    </App>
  `);

  await expect(page.getByTestId("name")).toHaveText("Charlie");
  await expect(page.getByTestId("role")).toHaveText("admin");
});

test("var destructuring is reactive", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App>
      <script>
        var source = {count: 0, label: "clicks"};
        var {count, label} = source;
      </script>
      <Text testId="count">{count}</Text>
      <Text testId="label">{label}</Text>
      <Button testId="increment" onClick="source = {count: source.count + 1, label: source.label}">
        Increment
      </Button>
    </App>
  `);

  await expect(page.getByTestId("count")).toHaveText("0");
  await expect(page.getByTestId("label")).toHaveText("clicks");

  await page.getByTestId("increment").click();
  await expect(page.getByTestId("count")).toHaveText("1");
  await expect(page.getByTestId("label")).toHaveText("clicks");
});

test("var object destructuring in custom component", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App>
      <TestComp/>
    </App>
  `, {
    components: [
      `
      <Component name="TestComp">
        <script>
          var data = {x: 10, y: 20};
          var {x, y} = data;
        </script>
        <Text testId="x">{x}</Text>
        <Text testId="y">{y}</Text>
      </Component>
      `
    ]
  });

  await expect(page.getByTestId("x")).toHaveText("10");
  await expect(page.getByTestId("y")).toHaveText("20");
});

test("var nested object destructuring", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App>
      <script>
        var source = {user: {name: "Dave", age: 25}};
        var {user: {name, age}} = source;
      </script>
      <Text testId="name">{name}</Text>
      <Text testId="age">{age}</Text>
    </App>
  `);

  await expect(page.getByTestId("name")).toHaveText("Dave");
  await expect(page.getByTestId("age")).toHaveText("25");
});

import { expect, test } from "../src/testing/fixtures";

test("modify simple array item", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Fragment var.fruits="{[{ name: 'apple', size: 'large' }]}" >
      <Button id="modifyButton" onClick="fruits[0].size = 'small'">Convert to small</Button>
      <Text id="fruits_text">{JSON.stringify(fruits)}</Text>
    </Fragment>
  `);
  await expect(page.getByTestId("fruits_text")).toHaveText(
    JSON.stringify([{ name: "apple", size: "large" }]),
  );
  await page.getByTestId("modifyButton").click();
  await expect(page.getByTestId("fruits_text")).toHaveText(
    JSON.stringify([{ name: "apple", size: "small" }]),
  );
});

test("modify simple array item 2", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Fragment var.fruits="{[{ name: 'apple', size: 'large' }, {name: 'pear', size: 'somethingelse'}]}">
      <Button id="modifyButton" onClick="fruits[1].size = 'small'">fruits[1].size = 'small'</Button>
      <Text id="fruits_text">{JSON.stringify(fruits)}</Text>
    </Fragment>
  `);
  await expect(page.getByTestId("fruits_text")).toHaveText(
    JSON.stringify([
      { name: "apple", size: "large" },
      { name: "pear", size: "somethingelse" },
    ]),
  );
  await page.getByTestId("modifyButton").click();
  await expect(page.getByTestId("fruits_text")).toHaveText(
    JSON.stringify([
      { name: "apple", size: "large" },
      { name: "pear", size: "small" },
    ]),
  );
});

test("modify simple array item 3", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Fragment var.fruits="{
      [{ name: 'apple', size: 'large', seeds: [{name: 'seed1', size: 'large'}] }, {name: 'pear', size: 'somethingelse'}]
    }">
      <Button id="modifyButton" onClick="fruits[0].seeds[0].size = 'small'">
        fruits[0].seeds[0].size = 'small'
      </Button>
      <Text id="fruits_text">{JSON.stringify(fruits)}</Text>
    </Fragment>
  `);
  await expect(page.getByTestId("fruits_text")).toHaveText(
    JSON.stringify([
      { name: "apple", size: "large", seeds: [{ name: "seed1", size: "large" }] },
      { name: "pear", size: "somethingelse" },
    ]),
  );
  await page.getByTestId("modifyButton").click();
  await expect(page.getByTestId("fruits_text")).toHaveText(
    JSON.stringify([
      { name: "apple", size: "large", seeds: [{ name: "seed1", size: "small" }] },
      { name: "pear", size: "somethingelse" },
    ]),
  );
});

test("push and filter", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Fragment
      var.initialProject="{ {id: 1, name: 'Project 2'} }"
      var.projects="{ [{id: 1, name: 'Project 2'}]}"
    >
      <Button testId="modifyButton" onClick="()=> {
        let projId = projects[0].id; 
        projects = projects.filter(project => (project.id + '') !== (projId + ''));
      }">
        Play the scenario
      </Button>
      <Text testId="array_text">{JSON.stringify(projects)}</Text>
    </Fragment>
  `);
  await expect(page.getByTestId("array_text")).toHaveText(
    JSON.stringify([{ id: 1, name: "Project 2" }]),
  );
  await page.getByTestId("modifyButton").click();
  await expect(page.getByTestId("array_text")).toHaveText(JSON.stringify([]));
});

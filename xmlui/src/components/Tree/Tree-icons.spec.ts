import { expect, test } from "../../testing/fixtures";
import { flatTreeData, flatTreeDataWithIcons1, flatTreeDataWithIcons2, flatTreeDataWithIconsAndAlias1 } from "./testData";

test("default collapsed icon appears", async ({ initTestBed, createTreeDriver }) => {
  await initTestBed(`
      <VStack height="400px">
        <Tree testId="tree" data='{${JSON.stringify(flatTreeData)}}' />
      </VStack>
    `);

  const tree = await createTreeDriver("tree");
  await expect(tree.getIconByName("chevronright")).toBeVisible();
  await expect(tree.getIconByName("chevrondown")).not.toBeVisible();
});

test("custom iconCollapsed appears", async ({ initTestBed, createTreeDriver }) => {
  await initTestBed(`
      <VStack height="400px">
        <Tree 
          testId="tree"
          data='{${JSON.stringify(flatTreeData)}}'
          iconCollapsed="phone"
          iconExpanded="email"
        />
      </VStack>
    `);

  const tree = await createTreeDriver("tree");
  await expect(tree.getIconByName("phone")).toBeVisible();
  await expect(tree.getIconByName("email")).not.toBeVisible();
});

test("default expanded icon appears", async ({ initTestBed, createTreeDriver }) => {
  await initTestBed(`
      <VStack height="400px">
        <Tree 
          testId="tree"
          defaultExpanded="all"
          data='{${JSON.stringify(flatTreeData)}}'
        />
      </VStack>
    `);

  const tree = await createTreeDriver("tree");
  await expect(tree.getIconByName("chevrondown")).toBeVisible();
});

test("custom iconExpanded appears", async ({ initTestBed, createTreeDriver }) => {
  await initTestBed(`
      <VStack height="400px">
        <Tree 
          testId="tree"
          defaultExpanded="all"
          data='{${JSON.stringify(flatTreeData)}}'
          iconCollapsed="phone"
          iconExpanded="email"
        />
      </VStack>
    `);

  const tree = await createTreeDriver("tree");
  await expect(tree.getIconByName("phone")).not.toBeVisible();
  await expect(tree.getIconsByName("email")).toHaveCount(2);
});

test("both custom icons work together", async ({ initTestBed, createTreeDriver, page }) => {
  await initTestBed(`
      <VStack height="400px">
        <Tree 
          id="tree"
          data='{${JSON.stringify(flatTreeData)}}'
          iconCollapsed="phone"
          iconExpanded="email"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}" verticalAlignment="center">
              <Icon name="folder" />
              <Text value="{$item.name}" />
            </HStack>
          </property>
        </Tree>
        <Button testId="expand1" onClick="tree.expandNode(1)">Expand Node 1</Button>
        <Button testId="expand2" onClick="tree.collapseNode(1)">Collapse Node 2</Button>
      </VStack>

    `);

  const tree = await createTreeDriver("tree");
  await expect(tree.component).toBeVisible();

  // Initially should show collapsed icon
  await expect(tree.getIconsByName("phone")).toBeVisible();
  await expect(tree.getIconsByName("email")).not.toBeVisible();

  // Expand the first node
  await page.getByTestId("expand1").click();

  // Should now show expanded icon and hide collapsed icon
  await expect(tree.getIconsByName("email")).toBeVisible();
  await expect(tree.getIconsByName("phone")).toBeVisible();

  // Collapse again
  await page.getByTestId("expand2").click();

  // Should show collapsed icon again
  await expect(tree.getIconsByName("phone")).toBeVisible();
  await expect(tree.getIconsByName("email")).not.toBeVisible();
});

test("iconExpanded fields are used", async ({ initTestBed, page, createTreeDriver }) => {
  await initTestBed(`
      <VStack height="400px">
        <Tree 
          testId="tree" 
          id="tree"
          defaultExpanded="first-level"
          data='{${JSON.stringify(flatTreeDataWithIcons1)}}' />
        <Button testId="expand1" onClick="tree.expandNode(2)">Expand Node 2</Button>
      </VStack>
    `);

  const tree = await createTreeDriver("tree");

  // --- Initila state
  await expect(tree.getIconByName("phone")).toBeVisible();
  await expect(tree.getIconByName("email")).not.toBeVisible();
  await expect(tree.getIconsByName("chevronright")).toHaveCount(1);

  await page.getByTestId("expand1").click();

  // --- After expanding node 2
  await expect(tree.getIconByName("phone")).toBeVisible();
  await expect(tree.getIconByName("email")).toBeVisible();
  await expect(tree.getIconsByName("chevronright")).toHaveCount(0);
});

test("iconExpanded fields (with alias) are used", async ({
  initTestBed,
  page,
  createTreeDriver,
}) => {
  await initTestBed(`
      <VStack height="400px">
        <Tree 
          testId="tree" 
          id="tree"
          iconExpandedField="iconExp"
          defaultExpanded="first-level"
          data='{${JSON.stringify(flatTreeDataWithIconsAndAlias1)}}' />
        <Button testId="expand1" onClick="tree.expandNode(2)">Expand Node 2</Button>
      </VStack>
    `);

  const tree = await createTreeDriver("tree");

  // --- Initila state
  await expect(tree.getIconByName("phone")).toBeVisible();
  await expect(tree.getIconByName("email")).not.toBeVisible();
  await expect(tree.getIconsByName("chevronright")).toHaveCount(1);

  await page.getByTestId("expand1").click();

  // --- After expanding node 2
  await expect(tree.getIconByName("phone")).toBeVisible();
  await expect(tree.getIconByName("email")).toBeVisible();
  await expect(tree.getIconsByName("chevronright")).toHaveCount(0);
});

test("iconCollapsed fields are used", async ({ initTestBed, page, createTreeDriver }) => {
  await initTestBed(`
      <VStack height="400px">
        <Tree 
          testId="tree" 
          id="tree"
          defaultExpanded="none"
          data='{${JSON.stringify(flatTreeDataWithIcons2)}}' />
        <Button testId="expand1" onClick="tree.expandNode(1)">Expand Node 1</Button>
        <Button testId="expand2" onClick="tree.expandNode(2)">Expand Node 2</Button>
      </VStack>
    `);

  const tree = await createTreeDriver("tree");

  // --- Initila state
  await expect(tree.getIconByName("phone")).toBeVisible();
  await expect(tree.getIconByName("email")).not.toBeVisible();
  await expect(tree.getIconsByName("chevronright")).toHaveCount(0);

  await page.getByTestId("expand1").click();

  // --- After expanding node 1
  await expect(tree.getIconByName("phone")).not.toBeVisible();
  await expect(tree.getIconByName("email")).toBeVisible();
  await expect(tree.getIconsByName("chevrondown")).toHaveCount(1);

  await page.getByTestId("expand2").click();

  // --- After expanding node 2
  await expect(tree.getIconByName("phone")).not.toBeVisible();
  await expect(tree.getIconByName("email")).not.toBeVisible();
  await expect(tree.getIconsByName("chevrondown")).toHaveCount(2);
});

test("iconCollapsed fields (with alias) are used", async ({ initTestBed, page, createTreeDriver }) => {
  await initTestBed(`
      <VStack height="400px">
        <Tree 
          testId="tree" 
          id="tree"
          iconCollapsedField="iconColl"
          defaultExpanded="none"
          data='{${JSON.stringify(flatTreeDataWithIcons2)}}' />
        <Button testId="expand1" onClick="tree.expandNode(1)">Expand Node 1</Button>
        <Button testId="expand2" onClick="tree.expandNode(2)">Expand Node 2</Button>
      </VStack>
    `);

  const tree = await createTreeDriver("tree");

  // --- Initila state
  await expect(tree.getIconByName("phone")).toBeVisible();
  await expect(tree.getIconByName("email")).not.toBeVisible();
  await expect(tree.getIconsByName("chevronright")).toHaveCount(0);

  await page.getByTestId("expand1").click();

  // --- After expanding node 1
  await expect(tree.getIconByName("phone")).not.toBeVisible();
  await expect(tree.getIconByName("email")).toBeVisible();
  await expect(tree.getIconsByName("chevrondown")).toHaveCount(1);

  await page.getByTestId("expand2").click();

  // --- After expanding node 2
  await expect(tree.getIconByName("phone")).not.toBeVisible();
  await expect(tree.getIconByName("email")).not.toBeVisible();
  await expect(tree.getIconsByName("chevrondown")).toHaveCount(2);
});

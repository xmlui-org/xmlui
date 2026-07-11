import { expect } from "@playwright/test";
import { test } from "../../../xmlui/src/testing";

const EXT = { extensionIds: "xmlui-react-flow" };

const BASIC_FLOW = `
  var nodes = [
    { id: 'start', position: { x: 0, y: 0 }, data: { label: 'Start' }, width: 180, height: 80 },
    { id: 'end', position: { x: 260, y: 0 }, data: { label: 'End' }, width: 180, height: 80 }
  ];
  var edges = [
    { id: 'start-end', source: 'start', target: 'end', data: { label: 'Start to End' } }
  ];
`;

test.describe("ReactFlowCanvas", () => {
  test("renders and attaches React Flow elements to the DOM", async ({ initTestBed, page }) => {
    await initTestBed(
      `<ReactFlowCanvas
        testId="flow"
        nodes="{nodes}"
        edges="{edges}"
        fitView="{false}"
        showControls="{false}"
        showBackground="{false}"
      />`,
      { ...EXT, mainXs: BASIC_FLOW },
    );

    await expect(page.getByTestId("flow")).toBeAttached();
    await expect(page.locator(".react-flow")).toHaveCount(1);
    await expect(page.locator(".react-flow__node")).toHaveCount(2);
    await expect(page.locator("g[aria-label='Start to End']")).toBeAttached();
  });

  test("renders xmlui children as node content", async ({ initTestBed, page }) => {
    await initTestBed(
      `<ReactFlowCanvas
        testId="flow"
        nodes="{nodes}"
        edges="{edges}"
        fitView="{false}"
        showControls="{false}"
        showBackground="{false}"
      >
        <Text testId="start-content">Start content</Text>
        <Text testId="end-content">End content</Text>
      </ReactFlowCanvas>`,
      { ...EXT, mainXs: BASIC_FLOW },
    );

    await expect(page.getByTestId("start-content")).toHaveText("Start content");
    await expect(page.getByTestId("end-content")).toHaveText("End content");
  });

  test("state updates rerender node template content", async ({ initTestBed, page }) => {
    await initTestBed(
      `<ReactFlowCanvas
        testId="flow"
        nodes="{[{ id: 'dynamic', position: { x: 0, y: 0 }, data: { label: 'Dynamic' }, width: 220, height: 120 }]}"
        edges="{[]}"
        fitView="{false}"
        showControls="{false}"
        showBackground="{false}"
      >
        <VStack>
          <Button testId="update" label="Update" onClick="nodeLabel = 'Updated node'" />
          <Text testId="dynamic-node">{nodeLabel}</Text>
        </VStack>
      </ReactFlowCanvas>`,
      { ...EXT, mainXs: `var nodeLabel = 'Initial node';` },
    );

    await expect(page.getByTestId("dynamic-node")).toHaveText("Initial node");
    await page.getByTestId("update").click();
    await expect(page.getByTestId("dynamic-node")).toHaveText("Updated node");
  });
});

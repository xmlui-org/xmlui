import { test } from "../src/testing/fixtures";
import { expect } from "../src/testing/assertions";

test("assign to object with number key", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Fragment>
      <script>
        var rolesByIds = {};
      </script>
      <Button
        testId="button"
        onClick="rolesByIds[5] = 'EDITOR'"
      />
      <Text testId='result'>{JSON.stringify(rolesByIds)}</Text>
    </Fragment>  
  `);
  await page.getByTestId("button").click();
  await expect(page.getByTestId("result")).toHaveText("{\"5\":\"EDITOR\"}");
});

test("assign to array with number key", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Fragment>
      <script>
        var userIds = [1, 2, 3, 4];
      </script>
      <Button
        testId="button"
        onClick="userIds[1] = 'MODIFIED'"
      />
      <Text testId='result'>{JSON.stringify(userIds)}</Text>
    </Fragment>  
  `);
  await page.getByTestId("button").click();
  await expect(page.getByTestId("result")).toHaveText("[1,\"MODIFIED\",3,4]");
});
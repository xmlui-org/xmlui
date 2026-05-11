import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The "Click on a team member to edit details" example has a multiline
// initialize string in its ---api section that isn't parseable by
// extractXmluiExample. We construct the pieces manually.
const app = `<App>\n  <Test />\n</App>`;

const teamMemberComponent = `<Component name="Test">

  <DataSource
    id="team_members"
    url="/api/team_members"
  />

  <ModalDialog id="memberDetailsDialog" title="Team Member Details">
    <Theme backgroundColor-overlay="$color-surface-900">
      <VStack gap="1rem" padding="1rem">
      <HStack gap="1rem" alignItems="center">
        <Avatar
          url="{$param.avatar}"
          size="lg"
          name="{$param.name}"
        />
        <VStack gap="0.25rem" alignItems="start">
          <Text variant="strong" fontSize="1.2rem">{$param.name}</Text>
          <Text variant="caption">{$param.role}</Text>
          <Text variant="caption" color="blue">{$param.email}</Text>
        </VStack>
      </HStack>
      <Card padding="1rem">
        <VStack gap="0.5rem">
          <HStack>
            <Text variant="strong">Department:</Text>
            <Text>{$param.department}</Text>
          </HStack>
          <HStack>
            <Text variant="strong">Start Date:</Text>
            <Text>{$param.startDate}</Text>
          </HStack>
        </VStack>
      </Card>
    </VStack>
    </Theme>
  </ModalDialog>

  <Text variant="strong" marginBottom="1rem">Team Directory</Text>

  <VStack gap="0.5rem">
    <Items data="{team_members}">
      <Card
        padding="1rem"
        cursor="pointer"
        onClick="{
          memberDetailsDialog.open({
            id: $item.id,
            name: $item.name,
            role: $item.role,
            email: $item.email,
            avatar: $item.avatar,
            department: $item.department,
            startDate: $item.startDate
          })
        }"
      >
        <HStack gap="1rem" alignItems="center">
          <Avatar
            url="{$item.avatar}"
            size="sm"
            name="{$item.name}"
          />
          <VStack gap="0.25rem" alignItems="start">
            <Text variant="strong">{$item.name}</Text>
            <Text variant="caption">{$item.role} - {$item.department}</Text>
          </VStack>
        </HStack>
      </Card>
    </Items>
  </VStack>

</Component>`;

const apiInterceptor = {
  apiUrl: "/api",
  initialize:
    "$state.team_members = [{ id: 1, name: 'Sarah Chen', role: 'Product Manager', email: 'sarah@company.com', avatar: 'https://i.pravatar.cc/100?u=sarah', department: 'Product', startDate: '2022-03-15' }, { id: 2, name: 'Marcus Johnson', role: 'Senior Developer', email: 'marcus@company.com', avatar: 'https://i.pravatar.cc/100?u=marcus', department: 'Engineering', startDate: '2021-08-20' }, { id: 3, name: 'Elena Rodriguez', role: 'UX Designer', email: 'elena@company.com', avatar: 'https://i.pravatar.cc/100?u=elena', department: 'Design', startDate: '2023-01-10' }]",
  operations: {
    get_team_members: {
      url: "/team_members",
      method: "get" as const,
      handler: "return $state.team_members",
    },
  },
};

test.describe("Click on a team member to edit details", { tag: "@website" }, () => {
  test("initial state shows team directory with all three members", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components: [teamMemberComponent], apiInterceptor });
    await expect(page.getByText("Team Directory")).toBeVisible();
    await expect(page.getByText("Sarah Chen")).toBeVisible();
    await expect(page.getByText("Marcus Johnson")).toBeVisible();
    await expect(page.getByText("Elena Rodriguez")).toBeVisible();
  });

  test("clicking a team member card opens the details modal dialog", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components: [teamMemberComponent], apiInterceptor });
    await page.getByText("Sarah Chen").first().click();
    const dialog = page.getByRole("dialog", { name: "Team Member Details" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("sarah@company.com")).toBeVisible();
    await expect(dialog.getByText("Product", { exact: true })).toBeVisible();
  });

  test("modal shows correct details for a different team member", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components: [teamMemberComponent], apiInterceptor });
    await page.getByText("Marcus Johnson").first().click();
    const dialog = page.getByRole("dialog", { name: "Team Member Details" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("marcus@company.com")).toBeVisible();
    await expect(dialog.getByText("Engineering", { exact: true })).toBeVisible();
  });
});

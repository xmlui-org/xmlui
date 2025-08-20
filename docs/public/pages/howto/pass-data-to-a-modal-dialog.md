# Pass data to a Modal Dialog

```xmlui-pg name="Click on a team member to edit details"
---app
<App>
  <Test />
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.team_members = [
    { id: 1, name: 'Sarah Chen', role: 'Product Manager', email: 'sarah@company.com', avatar: 'https://i.pravatar.cc/100?u=sarah', department: 'Product', startDate: '2022-03-15' },
    { id: 2, name: 'Marcus Johnson', role: 'Senior Developer', email: 'marcus@company.com', avatar: 'https://i.pravatar.cc/100?u=marcus', department: 'Engineering', startDate: '2021-08-20' },
    { id: 3, name: 'Elena Rodriguez', role: 'UX Designer', email: 'elena@company.com', avatar: 'https://i.pravatar.cc/100?u=elena', department: 'Design', startDate: '2023-01-10' }
  ]",
  "operations": {
    "get_team_members": {
      "url": "/team_members",
      "method": "get",
      "handler": "return $state.team_members"
    }
  }
}
---comp display
<Component name="Test">

  <DataSource
    id="team_members"
    url="/api/team_members"
  />

  <ModalDialog id="memberDetailsDialog" title="Team Member Details">
    <Theme backgroundColor-overlay="$color-surface-900">
      <VStack gap="1rem" padding="1rem">
      <!-- Avatar and Basic Info -->
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

      <!-- Details Card -->
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
          <HStack>
            <Text variant="strong">Employee ID:</Text>
            <Text>#{$param.id}</Text>
          </HStack>
        </VStack>
      </Card>

      <!-- Actions -->
      <HStack gap="0.5rem">
        <Button
          label="Send Email"
          size="sm"
          onClick="console.log('Email to:', $param.email)"
        />
        <Button
          label="View Calendar"
          size="sm"
          variant="secondary"
          onClick="console.log('Calendar for:', $param.name)"
        />
      </HStack>
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

</Component>
```

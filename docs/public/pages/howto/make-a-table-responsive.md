# Make a Table responsive

```xmlui-pg noHeader
---app
<App>
  <ResponsiveTable />
</App>
---comp display
<Component name="ResponsiveTable" var.people="{[
  { name: 'Alice Johnson', email: 'alice@company.com', department: 'Engineering', status: 'active', salary: '95k' },
  { name: 'Bob Smith', email: 'bob@company.com', department: 'Marketing', status: 'active', salary: '88k' },
  { name: 'Carol Davis', email: 'carol@company.com', department: 'Sales', status: 'inactive', salary: '110k' },
  { name: 'David Wilson', email: 'david@company.com', department: 'Engineering', status: 'active', salary: '105k' },
  { name: 'Eva Brown', email: 'eva@company.com', department: 'HR', status: 'active', salary: '75k' }
]}">
  <VStack>
    <HStack>
      <Text size="lg">Responsive People Table</Text>
      <Badge value="Current: {mediaSize.size}" color="blue" />
    </HStack>
    <Text size="sm" color="gray">Resize your browser window to see columns progressively hide</Text>

    <Table data="{people}">
      <!-- Essential: Avatar - always show -->
      <Column header="" width="50px">
        <Avatar
          name="{$item.name}"
          size="xs"
          color="blue"
        />
      </Column>

      <!-- Essential: Name - always show -->
      <Column header="Name" bindTo="name" width="150px">
        <Text>{$item.name}</Text>
      </Column>

      <!-- Priority: Email - hide on xs screens -->
      <Column header="Email" bindTo="email" when="{mediaSize.size !== 'xs'}" width="200px">
        <Text size="sm" color="gray">{$item.email}</Text>
      </Column>

      <!-- Secondary: Department - hide on xs/sm screens -->
      <Column header="Department" bindTo="department" when="{mediaSize.size !== 'xs' && mediaSize.size !== 'sm'}" width="120px" />

      <!-- Tertiary: Status - only show on md+ screens -->
      <Column header="Status" bindTo="status" when="{mediaSize.size === 'md' || mediaSize.size === 'lg' || mediaSize.size === 'xl' || mediaSize.size === 'xxl'}" width="80px">
        <Badge
          value="{$item.status}"
          color="{status === 'active' ? 'green' : 'gray'}"
          variant="pill"
        />
      </Column>

      <!-- Low Priority: Salary - only show on lg+ screens -->
      <Column header="Salary" bindTo="salary" when="{mediaSize.size === 'lg' || mediaSize.size === 'xl' || mediaSize.size === 'xxl'}" width="100px">
        <Text size="sm" weight="medium">${$item.salary}</Text>
      </Column>
    </Table>

    <VStack gap="sm" margin="md">
      <Text size="sm" weight="bold">Column Visibility by Screen Size:</Text>
      <Text size="xs" color="gray">xs: Avatar + Name only</Text>
      <Text size="xs" color="gray">sm: + Email</Text>
      <Text size="xs" color="gray">md: + Department + Status</Text>
      <Text size="xs" color="gray">lg+: + Salary</Text>
    </VStack>
  </VStack>
</Component>
```


# How To

These examples answer common questions of the form "How do I do SOMETHING with XMLUI?" The [XMLUI MCP server](https://github.com/xmlui-org/xmlui-mcp) provides two related tools. Agents can call `xmlui-list-howto` to list the entries here and `xmlui-search-howto` to search them.

## Filter and transform data from an API

```xmlui-pg noHeader
---app
<App>
  <Test />
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.people = [
    { id: 1, name: 'Alice', active: true,  group: 'A' },
    { id: 2, name: 'Bob',   active: false, group: 'B' },
    { id: 3, name: 'Carol', active: true,  group: 'A' },
    { id: 4, name: 'Dave',  active: true,  group: 'B' }
  ]",
  "operations": {
    "get-people": {
      "url": "/people",
      "method": "get",
      "handler": "return { status: 'ok', data: { items: $state.people } }"
    }
  }
}
---comp display
<Component name="Test">

  <!--
  {
    items:
      [
        { id: 1, name: 'Alice', active: true,  group: 'A' },
        { id: 2, name: 'Bob',   active: false, group: 'B' },
        { id: 3, name: 'Carol', active: true,  group: 'A' },
        { id: 4, name: 'Dave',  active: true,  group: 'B' }
      ]
  }
  -->

  <!-- Use resultSelector to select the items array -->
  <DataSource
    id="allPeople"
    url="/api/people"
    resultSelector="data.items"
  />

  <!-- Use resultSelector to filter the items array -->
  <DataSource
    id="activePeople"
    url="/api/people"
    resultSelector="data.items.filter(p => p.active)"
  />

  <!-- Use transformResult -->

  <!--
  window.transformPeople = function(data) {
    console.log(data);
    const items = data.data.items;
    const itemMap = {
      A: 'Austin',
      B: 'Boston'
    };
    return items.map(item => ({
      ...item,
      city: itemMap[item.group]
    }));
  };
  -->

  <DataSource
    id="transformedPeople"
    url="/api/people"
    transformResult="{window.transformPeople}"
  />

  <Text>All people:</Text>
  <List data="{allPeople}">
    <Text>{$item.name} ({$item.group})</Text>
  </List>

  <Text>Active people:</Text>
  <List data="{activePeople}">
    <Text>{$item.name} ({$item.group})</Text>
  </List>

  <Text>Transformed people:</Text>
  <List data="{transformedPeople}">
    <Text>{$item.name} ({$item.city})</Text>
  </List>


</Component>
```

## Group items in List by a property

```xmlui-pg noHeader
---app
<App>
  <Test />
</App>
---api display
{
  "apiUrl": "/api",
  "initialize": "$state.people_groupby = [
    { id: 1, name: 'Alice', active: true,  group: 'A' },
    { id: 2, name: 'Bob',   active: false, group: 'B' },
    { id: 3, name: 'Carol', active: true,  group: 'A' },
    { id: 4, name: 'Dave',  active: true,  group: 'B' }
  ]",
  "operations": {
    "get-people-groupby": {
      "url": "/people_groupby",
      "method": "get",
      "handler": "return { status: 'ok', data: { items: $state.people_groupby } }"
    }
  }
}
---comp display
<Component name="Test">

  <!--
  {
    items:
      [
        { id: 1, name: 'Alice', active: true,  group: 'A' },
        { id: 2, name: 'Bob',   active: false, group: 'B' },
        { id: 3, name: 'Carol', active: true,  group: 'A' },
        { id: 4, name: 'Dave',  active: true,  group: 'B' }
      ]
  }
  -->

  <DataSource
    id="allPeopleGroupBy"
    url="/api/people_groupby"
    resultSelector="data.items"
  />
  <List data="{allPeopleGroupBy}" groupBy="group">
    <property name="groupHeaderTemplate">
      <Text variant="subtitle">Group {$group.key}</Text>
    </property>
    <Text>{$item.name}</Text>
  </List>
</Component>
```

## Delay a DataSource until another DataSource is ready

```xmlui-pg  noHeader
---app
<App>
  <Test />
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.users_for_ds_dependency =
    [
      { id: 1, name: 'Alice', departmentId: 1 },
      { id: 2, name: 'Bob', departmentId: 2 }
      ];
    $state.departments_with_ds_dependency = [
      { id: 1, name: 'Engineering' },
      { id: 2, name: 'Marketing' }
    ]",
  "operations": {
    "get_users_for_ds_dependency": {
      "url": "/users_for_ds_dependency",
      "method": "get",
      "handler": "delay(1000); return $state.users_for_ds_dependency"
    },
    "get_departments_with_ds_dependency": {
      "url": "/departments_with_ds_dependency",
      "method": "get",
      "handler": "delay(1000); return $state.departments_with_ds_dependency"
    }
  }
}
---comp display
<Component name="Test" var.selectedId="" var.nonce="{0}">

  <DataSource
    id="users_for_ds_dependency"
    url="/api/users_for_ds_dependency?nonce"
    inProgressNotificationMessage="Loading users..."
    when="{ nonce > 0 }"
    />

  <DataSource
    id="departments_with_ds_dependency"
    url="/api/departments_with_ds_dependency"
    when="{ users_for_ds_dependency.loaded }"
    inProgressNotificationMessage="Loading departments..."
  />

  <Select
    id="usersForDsDepencency"
    data="{users_for_ds_dependency}"
    when="{departments_with_ds_dependency.loaded}"
    onDidChange="(newVal) => selectedId = newVal"
  >
    <Items data="{users_for_ds_dependency}">
      <Option
        value="{$item.id}"
        label="{$item.name} ({departments_with_ds_dependency.value.find(d => d.id === $item.departmentId)?.name})"
     />
    </Items>
  </Select>

  <Button
    label="Run"
    onClick="{nonce++}"
  />


</Component>
```

## Hide an element until its DataSource is ready

```xmlui-pg  noHeader
---app
<App>
  <Test />
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.fruits = [
    { id: 1, name: 'Orange' },
    { id: 2, name: 'Apple' },
    { id: 3, name: 'Pear' },
  ]",
  "operations": {
    "get-fruits": {
      "url": "/fruits",
      "method": "get",
      "handler": "delay(3000); return $state.fruits;"
    }
  }
}
---comp display
<Component name="Test" var.nonce="{0}">

<DataSource
  id="fruits"
  url="/api/fruits?{nonce}"
  inProgressNotificationMessage="Loading fruits"
  when="{nonce > 0}"
  />

<Button
  label="Run"
  onClick="{nonce++}"
/>

<Fragment when="{fruits.loaded}">
  <Text>Fruits: {fruits.value.length} found</Text>
</Fragment>

</Component>
```


## Use built-in form validation

```xmlui-pg noHeader
---app
<App>
  <Test />
</App>
---api
{}
---comp display
<Component name="Test">

<Form
  data="{{ password: '' }}"
  onSubmit="(data) => console.log('Submitted:', data)"
>
  <FormItem
    label="Password"
    bindTo="password"
    type="password"
    minLength="8"
    lengthInvalidMessage="Password must be at least 8 characters"
  />
</Form>

</Component>
```


## Do custom form validation

```xmlui-pg noHeader
---app
<App>
  <Test />
</App>
---api
{}
---comp display
<Component name="Test" var.limit="{100}">

<Form
  data="{{ spending: 0 }}"
  onSubmit="(data) => console.log('Submitted:', data)"
>

  <FormItem
    label="Requested Amount (limit {limit})"
    bindTo="total"
    type="integer"
    onValidate="{ (value) => value > 0 && value <= limit }"
  />
</Form>

</Component>
```

## Assign a complex JSON literal to a component variable

```xmlui-pg noHeader
---app
<App>
  <Test />
</App>
---api
{}
---comp display
<Component name="Test"
  <!-- double curly braces inside double quote -->
  var.appConfig="{{
    name: 'Photo Gallery',
    version: '1.2.0',
    isPublic: true,
    photos: [
      { id: 1, title: 'Sunset Beach', likes: 42 },
      { id: 2, title: 'Mountain View', likes: 38 },
      { id: 3, title: 'City Lights', likes: 55 }
    ],
    authors: [
      { name: 'Alice Johnson', role: 'Photographer' },
      { name: 'Bob Smith', role: 'Editor' }
    ]
  }}">
  <!-- double curly braces inside double quote -->

  <Text>{appConfig.name} v{appConfig.version}</Text>

  <Text>Photos ({appConfig.photos.length})</Text>
  <Items data="{appConfig.photos}">
    <Text>{$item.title} - {$item.likes} likes</Text>
  </Items>

  <Text>Team</Text>
  <Items data="{appConfig.authors}">
    <Text>{$item.name} ({$item.role})</Text>
  </Items>

</Component>
```




## Make a set of equal-width cards

```xmlui-pg noHeader
---app
<App>
  <Test />
</App>
---api
{
  "apiUrl": "/api",
"initialize": "$state.dashboard_stats = {
      \"draft_invoices\":6,
      \"outstanding\":3502.9,
      \"paid_invoices\":79,
      \"paid_this_year\":1745.18,
      \"sent_invoices\":43,
      \"total_clients\":30,
      \"total_invoices\":91
  }",
  "operations": {
    "get-dashboard-stats": {
      "url": "/dashboard_stats",
      "method": "get",
      "handler": "$state.dashboard_stats"
    }
  }
}
---comp display
<Component name="Test" >

<DataSource id="dashboard_stats" url="/api/dashboard_stats" method="GET" />

  <FlowLayout>
    <InfoCard
      width="*"               <!-- use star sizing -->
      title="Outstanding"
      value="{ dashboard_stats.value.outstanding }"
    />
    <InfoCard
    width="*"
      title="Paid This Year"
      value="{ dashboard_stats.value.paid_this_year }"
    />
    <InfoCard
      width="*"
      title="Draft"
      value="{ dashboard_stats.value.draft_invoices }"

    />
    <InfoCard
      width="*"
      title="Sent"
      value="{ dashboard_stats.value.sent_invoices }"
    />
  </FlowLayout>

</Component>
---comp display
<Component name="InfoCard">

    <Card width="{$props.width}" borderRadius="8px" boxShadow="$boxShadow-spread">

        <Text>{$props.title}</Text>

        <Text fontWeight="$fontWeight-extra-bold" fontSize="larger">
            { $props.value }
        </Text>
    </Card>

</Component>
```


## Set the initial value of a Select from fetched data

```xmlui-pg noHeader
---app
<App>
  <Test />
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.users_initial_value = [
        {
          id: 1,
          username: 'Coder Gal',
        },
        {
          id: 2,
          username: 'Tech Ninja',
        },
        {
          id: 3,
          username: 'Design Diva',
        },
      ]",
  "operations": {
    "get_users_initial_value": {
      "url": "/users_initial_value",
      "method": "get",
      "handler": "$state.users_initial_value"
    }
  }
}
---comp display
<Component name="Test" var.selectedValue="">

<DataSource
  id="myData"
  url="/api/users_initial_value"
  onLoaded="(data) => { selectedValue = data[0].id }"
/>

<Select initialValue="{selectedValue}">
  <Items data="{myData}">
    <Option value="{$item.id}" label="{$item.username}" />
  </Items>
</Select>

</Component>
```

## Pass data to a Modal Dialog

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

## Debug a component

```xmlui-pg noHeader
---app
<App>
  <Test />
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.user_data = {
      id: 42,
      name: 'John Doe',
      preferences: { theme: 'dark', notifications: true },
      recentItems: ['item1', 'item2', 'item3']
    }",
  "operations": {
    "get_user_data": {
      "url": "/user_data",
      "method": "get",
      "handler": "console.log('API called:', $state.user_data); return $state.user_data"
    }
  }
}
---comp display
<Component name="Test"
  var.localState="{{
    currentStep: 2,
    errors: ['Invalid email', 'Password too short'],
    formData: { email: 'test@example.com', age: 25 }
  }}">

  <DataSource
    id="userData"
    url="/api/user_data"
  />

  <Text>User Debug Info</Text>

  <!-- Method 1: JSON.stringify with preserveLinebreaks -->
  <Text preserveLinebreaks="true">
    {JSON.stringify(userData.value, null, 2)}
  </Text>

  <!-- Method 2: Console.log in handler -->
  <Button
    label="Log to Console"
    onClick="console.log('Button clicked, userData:', userData.value)"
  />

  <!-- Method 3: Window function for component variables -->
  <Button
  label="Debug Local State"
  onClick="window.debugLog(localState, 'Local component state')"
  />

  <!-- Method 4: Unwrapping Proxy objects -->
  <Button
    label="Debug Unwrapped Data"
    onClick="console.log('Unwrapped userData:', JSON.parse(JSON.stringify(userData.value)))"
  />

</Component>
```

![](/resources/devdocs/debug-proxy-object.png)

![](/resources/devdocs/debug-proxy-object-2.png)


# Search

The `Search` component uses [Tabs](/components/Tabs) to enable switching between two different search experiences.

```xmlui-pg display  noHeader
---app display
<App>
  <Search />
</App>
---comp display
<Component name="Search">

  <Tabs>
    <TabItem label="Find invoices issued after date">
      <SearchInvoicesAfter />
    </TabItem>
    <TabItem label="Search clients, products, and invoices">
      <SearchEverything />
    </TabItem>
  </Tabs>

</Component>
---comp display
<Component name="SearchInvoicesAfter">
This is SearchInvoicesAfter.
</Component>
---comp display
<Component name="SearchEverything">
This is SearchEverything.
</Component>
---desc
Try switching between the two tabs.
```

## Search invoices after date

Here is `SearchInvoicesAfter`. Try changing the date.


```xmlui-pg  noHeader
---app display
<App>
  <SearchInvoicesAfter />
</App>
---comp
<Component
    name="StatusBadge"
    var.statusColors="{{
        draft: { background: '#f59e0b', label: 'white' },
        sent: { background: '#3b82f6', label: 'white' },
        paid: { background: '#10b981', label: 'white' }
    }}"
>
    <Badge
        value="{$props.status}"
        colorMap="{statusColors}"
        variant="pill"
    />
</Component>
---comp
<Component name="SearchInvoicesAfter">

    <VStack marginTop="1rem">
        <DatePicker
            id="dateAfter"
            width="20rem"
            initialValue="2025-01-01"
            dateFormat="yyyy-MM-dd"
            onDidChange="(val) => console.log('Date selected:', val)"
        />

        <DataSource
            id="invoicesAfter"
            url="/resources/files/invoices.json"
            when="{dateAfter.value}"
            transformResult="{(data) => window.filterInvoicesAfter(data || [], dateAfter.value)}"
        />

        <ChangeListener
            listenTo="{dateAfter.value}"
            onDidChange="invoicesAfter.reload()"
        />

        <Fragment when="{invoicesAfter}">
          <Card>
              <VStack>
                  <Table data="{ invoicesAfter }">
                      <Column  bindTo="client" header="Client" />
                      <Column  bindTo="issue_date" header="Issue Date">
                          { window.formatDate($item.issue_date) }
                      </Column>
                      <Column  header="Status">
                          <StatusBadge status="{$item.status}" />
                      </Column>
                      <Column  bindTo="total" header="Total" >
                          ${$item.total}
                      </Column>
                  </Table>
              </VStack>
          </Card>
        </Fragment>
    </VStack>

</Component>
```


```xmlui /when/
<Component name="SearchInvoicesAfter">
    <VStack paddingTop="$space-4">
        <DatePicker
          id="dateAfter"
          width="20rem"
          initialValue="2025-01-01"
          dateFormat="yyyy-MM-dd"
          onDidChange="(val) => console.log('Date selected:', val)"
        />
        <Card when="{dateAfter.value}">
            <Table data="/api/invoices/after/{dateAfter.value}">
                <Column bindTo="name" header="Client"/>
                <Column bindTo="issue_date" header="Issue Date">
                    { window.formatDate($item.issue_date) }
                </Column>
                <Column header="Status">
                    <StatusBadge status="{$item.status}"/>
                </Column>
                <Column bindTo="total" header="Total">
                    ${$item.total}
                </Column>
            </Table>
        </Card>
    </VStack>
</Component>
```

The `when` guards the [DatePicker](/components/DatePicker)'s `dateAfter`, so the `Table`
s `data` URL won't fire until its dependent variable is ready.

> [!INFO]
> You can use the `when` property on *any* XMLUI component to prevent it from rendering until some condition is true.


## Search everything

Here is `SearchEverything`. Try typing `a`, then `c`, then `m`, and watch the results converge dynamically on `Acme`.

```xmlui-pg height="400px"  noHeader
---app
<App>
  <SearchEverything />
</App>
---comp
<Component name="SearchEverything">

    <VStack marginTop="1rem">
        <TextBox
            placeholder="Enter search term..."
            width="25rem"
            id="searchTerm"
        />

        <DataSource id="clients" url="/resources/files/clients.json" />
        <DataSource id="products" url="/resources/files/products.json" />
        <DataSource id="allInvoices" url="/resources/files/invoices.json" />

        <Fragment when="{searchTerm.value}">
            <Card>
                <VStack>
                    <Text>Found {window.filterSearchResults(clients, products, allInvoices, searchTerm.value).length} results for
                        "{searchTerm.value}":</Text>
                    <Table data="{window.filterSearchResults(clients, products, allInvoices, searchTerm.value)}">
                        <Column  bindTo="table_name" header="Type" width="100px" />
                        <Column  bindTo="title" header="Title" width="*" />
                        <Column  bindTo="snippet" header="Match Details" width="3*" />
                    </Table>
                </VStack>
            </Card>
        </Fragment>
    </VStack>

</Component>
```

It's similar to `SearchInvoicesAfter`.

```xmlui /when=/
<Component name="SearchEverything">

    <VStack paddingTop="$space-4">
        <TextBox
            placeholder="Enter search term..."
            width="25rem"
            id="searchTerm"
        />

        <Card when="{searchTerm.value}">
            <DataSource
              id="search"
              url="/api/search/{searchTerm.value}"
            />
            <Text>Found {search.value ? search.value.length : 0} results for
                "{searchTerm.value}":</Text>
            <Table data="{search}">
                <Column  bindTo="table_name" header="Type" width="100px" />
                <Column  bindTo="title" header="Title" width="*" />
                <Column  bindTo="snippet" header="Match Details" width="3*" />
            </Table>
        </Card>
    </VStack>

</Component>
```
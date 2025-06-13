# Search

The `Search` component uses [Tabs](/components/Tabs) to enable switching between two different search experiences.

```xmlui-pg display
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


```xmlui-pg
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
    <VStack marginTop="1rem">

        <DatePicker
          id="dateAfter"
          width="20rem"
          initialValue="2025-01-01"
          dateFormat="yyyy-MM-dd"
        />

        <DataSource
          id="invoicesAfter"
          url="/api/invoices/after/{dateAfter.value}"
          when="{dateAfter.value}"
        />

        <Fragment when="{invoicesAfter}">
            <Card>
                <VStack>
                    <Table data="{ invoicesAfter }">
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
                </VStack>
            </Card>
        </Fragment>

    </VStack>
</Component>
```

The first `when` guards the [DatePicker](/components/DatePicker)'s `dateAfter`, so the [DataSource](/components/DataSource) won't fire until its dependent variable is ready.

The second `when` guards a [Fragment](/component/Fragment) so the results won't display until the `DataSource` has fetched them.

## Search everything
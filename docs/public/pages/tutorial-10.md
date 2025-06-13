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

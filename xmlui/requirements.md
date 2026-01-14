inside ComponentDef.ts a CompoundComponentDef has a codeBehind property, while that is not needed, since ProjectCompilation has that as well for each CompoundComponentDef.

initially, a component's vars are stored as string - string pairs

`<variable name="count" value="{0}" />` will result in
`{ 
  vars: {
    name: "{0}"
  }
}`
props as well

events are pre-parsed.

%-DESC-START 

```xmlui-pg copy display name="Example: using TreeDisplay"
<App>
  <TreeDisplay content="components
 ClientDetails.xmlui
 Clients.xmlui
 MonthlyRevenue.xmlui
  WeeklyRevenue.xmlui" />
</App>
```

```xmlui-pg copy display name="Example: using TreeDisplay with deeper hierarchy"
<App>
  <TreeDisplay>
components
 frontend
  pages
   home.xmlui
   about.xmlui
   contact.xmlui
  components
   Header.xmlui
   Footer.xmlui
 backend
  api
   users.js
   products.js
  </TreeDisplay>
</App>
```

```xmlui-pg copy display name="Example: file structure with custom theme color"
<App>
  <TreeDisplay 
    content="project
 src
  components
   TreeDisplay.tsx
  utils
   helpers.ts
 package.json">
    <property name="style">
      {
        "--color-connect-TreeDisplay": "var(--accentColor)"
      }
    </property>
  </TreeDisplay>
</App>
```

**Note:** TreeDisplay interprets indentation (spaces at the beginning of lines) to determine the hierarchy level. Each indentation level represents a level in the tree structure. The component uses SVG lines to create clean, modern connecting lines between tree nodes.

%-DESC-END

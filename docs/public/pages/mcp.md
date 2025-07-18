# xmlui-mcp: Model Context Protocol server for XMLUI

The Model Context Procotol (MCP) enables AI agents to use third-party tools. If you are using an agent like Claude or Cursor, you can equip them with a set of XMLUI-specific tools so they can:

- list available XMLUI components
- review documentation for a component
- search XMLUI source code and apps
- list and search XMLUI How To docs
- help you build your own XMLUI app

The xmlui-mcp tookit is available [here](https://github.com/xmlui-org/xmlui-mcp). To use it, clone that repo and also the [XMLUI repo](https://github.com/xmlui-org/xmlui) to create this layout.

```xmlui-tree
<root>
  xmlui
  xmlui-mcp
```

This is an example of a conversation with Claude in which it uses some of the xmlui-mcp tools.

<img width="737" alt="image" src="https://github.com/user-attachments/assets/1f87519c-1338-4eca-a730-9f2e0c1a64a9" />

<img width="788" alt="image" src="https://github.com/user-attachments/assets/4793a475-46d1-418e-ad6a-0760af53ddca" />

See the [README](https://github.com/xmlui-org/xmlui-mcp?tab=readme-ov-file#configure) for details on configuring and using the MCP toolkit.






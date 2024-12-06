import type { ApiInterceptorDefinition } from "xmlui";

const mock: ApiInterceptorDefinition = {
  type: "db",
  apiUrl: "/api",
  config: {
    database: "landing-page-2",
  },
  initialize: `
    $state.entities = [
      {
        id: 0,
        name: "John Doe",
        status: "Prospect",
        priority: "High",
        avatarUrl: "https://i.pravatar.cc/100?u=JohnDoe-100",
      },
      {
        id: 1,
        name: "Jane Doe",
        status: "Lead",
        priority: "Low",
        avatarUrl: "https://i.pravatar.cc/100?u=JaneDoe-101",
      },
      {
        id: 2,
        name: "Arnold Cartwright",
        status: "Lead",
        priority: "Medium",
        avatarUrl: "https://i.pravatar.cc/100?u=104",
      },
      {
        id: 3,
        name: "Jasmine Gold",
        status: "Customer",
        priority: "High",
        avatarUrl: "https://i.pravatar.cc/100?u=102",
      },
      {
        id: 4,
        name: "Howard Jones",
        status: "Lead",
        priority: "Low",
        avatarUrl: "https://i.pravatar.cc/100?u=109",
      },
      {
        id: 6,
        name: "Ellen Keys",
        status: "Prospect",
        priority: "High",
        avatarUrl: "https://i.pravatar.cc/100?u=128",
      },
      {
        id: 7,
        name: "Mike Mullins",
        status: "Customer",
        priority: "Medium",
        avatarUrl: "https://i.pravatar.cc/100?u=08",
      },
    ];
    $state.lastId = 10;
  `,
  operations: {
    "entity-list": {
      url: "/entities",
      method: "get",
      handler: `return $state.entities`,
    },
    "entity-update": {
      url: "/entities/:entityId",
      method: "put",
      pathParamTypes: {
        entityId: "integer",
      },
      handler: `
        const id = $pathParams.entityId;
        const { name, status, priority } = $requestBody;
        
        const foundIdx = $state.entities.findIndex(entity => entity.id === id);
        if (foundIdx === -1) {
          throw Errors.NotFound404("Entity id:" + id + " not found");
        };

        const updated = {
          ...$state.entities[foundIdx],
          name,
          status: status || "Prospect",
          priority: priority || "Medium",
        };

        $state.entities[foundIdx] = updated;
        return updated;
      `,
    },
    "entity-create": {
      url: "/entities",
      method: "post",
      handler: `
        const { name, status, priority } = $requestBody;
        if(!name){
          return;
        }

        const created = {
          id:  $state.lastId++,
          name,
          status: status || "Prospect",
          priority: priority || "Medium",
        };

        $state.entities.push(created);
        return created;
      `,
    },
    "entity-delete": {
      url: "/entities/:id",
      method: "delete",
      pathParamTypes: {
        id: "integer",
      },
      handler: `
        $state.entities = $state.entities.filter(entity => entity.id !== $pathParams.id);
      `,
    },
  },
};

export default mock;

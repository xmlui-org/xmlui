import type { ApiInterceptorDefinition } from "xmlui";

const mock: ApiInterceptorDefinition = {
  type: "db",
  apiUrl: "/api",
  config: {
    database: "landing-page-1",
  },
  initialize: `
    $state.servers = [
      {
        id: 0,
        name: "Server #1",
        description: "Main web server",
        state: "online",
      },
      {
        id: 1,
        name: "Server #2",
        description: "Backup web server",
        state: "offline",
      },
      {
        id: 2,
        name: "Server #3",
        description: "Database server",
        state: "offline",
      },
      {
        id: 3,
        name: "Server #4",
        description: "Backup database server",
        state: "offline",
      },
    ];
  `,
  operations: {
    "list-data": {
      url: "/servers",
      method: "get",
      handler: `return $state.servers;`,
    },
    "data-fetch": {
      url: "/servers/:id",
      method: "get",
      pathParamTypes: {
        id: "integer",
      },
      handler: `
        const serverFound = $state.servers.find(server => server.id === $pathParams.id);
        if (!serverFound) {
          throw Errors.NotFound404("Server id:" + $pathParams.id + " not found");
        };
        return serverFound;
      `,
    },
    "data-start": {
      url: "/servers/:id/start",
      method: "post",
      pathParamTypes: {
        id: "integer",
      },
      handler: `
        const serverFoundIdx = $state.servers.findIndex(server => server.id === $pathParams.id);
        if (serverFoundIdx === -1) {
          throw Errors.NotFound404("Server id:" + $pathParams.id + " not found");
        }; 

        if ($state.servers[serverFoundIdx].state === "offline") {
          $state.servers[serverFoundIdx] = {
            ...$state.servers[serverFoundIdx],
            state: "online",
          };
        }
        return true;
      `,
    },
    "data-stop": {
      url: "/servers/:id/stop",
      method: "post",
      pathParamTypes: {
        id: "integer",
      },
      handler: `
        const serverFoundIdx = $state.servers.findIndex(server => server.id === $pathParams.id);
        if (serverFoundIdx === -1) {
          throw Errors.NotFound404("Server id:" + $pathParams.id + " not found");
        }; 

        if ($state.servers[serverFoundIdx].state === "online") {
          $state.servers[serverFoundIdx] = {
            ...$state.servers[serverFoundIdx],
            state: "offline",
          };
        }
        return true;
      `,
    },
    "data-update": {
      url: "/servers/:id",
      method: "put",
      pathParamTypes: {
        id: "integer",
      },
      handler: `
        const serverFoundIdx = $state.servers.findIndex(server => server.id === $pathParams.id);
        if (serverFoundIdx === -1) {
          throw Errors.NotFound404("Server id:" + $pathParams.id + " not found");
        }; 

        return $state.servers[serverFoundIdx] = {
          ...$state.servers[serverFoundIdx],
          ...$requestBody,
        };
      `,
    },
  },
};

export default mock;

import { ApiInterceptorDefinition } from "xmlui";

const mock: ApiInterceptorDefinition = {
  type: "db",
  config: {
    database: "xmluiDataManipuliationTutorial",
    version: 1
  },
  apiUrl: "/api",
  helpers: {
    Assertions: {
      getIfPresent: `(itemId) => {
        const found = $db.$shoppingItems.byId(itemId);
        if (!found) {
          throw Errors.NotFound404("Item id:" + itemId + " not found");
        }
        return found;
      }`
    },
  },
  auth: {
    defaultLoggedInUser: {
      id: 1
    }
  },
  schemaDescriptor: {
    tables: [
      {
        name: "shoppingItems",
        fields: {
          id: "bigint",
          name: "varchar(64)",
          quantity: "integer",
          unit: "varchar(64)",
          category: "varchar(64)",
          inPantry: "boolean",
        },
        pk: ["++id"],
      },
      {
        name: "polledItems",
        fields: {
          id: "bigint",
          name: "varchar(64)",
          quantity: "integer",
          unit: "varchar(64)",
          category: "varchar(64)",
          inPantry: "boolean",
        },
        pk: ["++id"],
      },
      {
        name: "recipes",
        fields: {
          id: "bigint",
          name: "varchar(64)",
        },
        pk: ["++id"],
      }
    ],
    dtos: {
      recipe: {
        id: "number",
        name: "string",
        ingredients: "{shoppingItems[]}",
      },
    },
  },
  initialData: {
    shoppingItems: [
      {
        id: 1,
        name: "Carrots",
        quantity: 100,
        unit: "grams",
        category: "vegetables",
        inPantry: true,
      },
      {
        id: 2,
        name: "Bananas",
        quantity: 6,
        unit: "pieces",
        category: "fruits",
        inPantry: false,
      },
      {
        id: 3,
        name: "Apples",
        quantity: 5,
        unit: "pieces",
        category: "fruits",
        inPantry: true,
      },
      {
        id: 4,
        name: "Spinach",
        quantity: 1,
        unit: "bunch",
        category: "vegetables",
        inPantry: true,
      },
      {
        id: 5,
        name: "Milk",
        quantity: 10,
        unit: "liter",
        category: "dairy",
        inPantry: false,
      },
      {
        id: 6,
        name: "Cheese",
        quantity: 200,
        unit: "grams",
        category: "dairy",
        inPantry: false,
      },
      {
        id: 7,
        name: "Tomatoes",
        quantity: 3,
        unit: "pieces",
        category: "vegetables",
        inPantry: false,
      },
      {
        id: 8,
        name: "Oranges",
        quantity: 4,
        unit: "pieces",
        category: "fruits",
        inPantry: true,
      },
      {
        id: 9,
        name: "Broccoli",
        quantity: 2,
        unit: "heads",
        category: "vegetables",
        inPantry: true,
      },
      {
        id: 10,
        name: "Eggs",
        quantity: 12,
        unit: "pieces",
        category: "dairy",
        inPantry: false,
      },
      {
        id: 11,
        name: "Potatoes",
        quantity: 1,
        unit: "kg",
        category: "vegetables",
        inPantry: true,
      },
      {
        id: 12,
        name: "Grapes",
        quantity: 500,
        unit: "grams",
        category: "fruits",
        inPantry: false,
      },
      {
        id: 13,
        name: "Chicken",
        quantity: 2,
        unit: "kg",
        category: "meat",
        inPantry: false,
      },
      {
        id: 14,
        name: "Bread",
        quantity: 1,
        unit: "loaf",
        category: "bakery",
        inPantry: true,
      },
      {
        id: 15,
        name: "Yogurt",
        quantity: 500,
        unit: "grams",
        category: "dairy",
        inPantry: true,
      },
      {
        id: 16,
        name: "Olive Oil",
        quantity: 1,
        unit: "liter",
        category: "cooking oils",
        inPantry: true,
      },
    ],
    polledItems: [],
    recipes: [
      {
        id: 1,
        name: "Salad",
        ingredients: [
          {
            id: 1,
            name: "Carrots",
            quantity: 100,
            unit: "grams",
            category: "vegetables",
            inPantry: true,
          },
          {
            id: 7,
            name: "Tomatoes",
            quantity: 3,
            unit: "pieces",
            category: "vegetables",
            inPantry: false,
          },
          {
            id: 9,
            name: "Broccoli",
            quantity: 2,
            unit: "heads",
            category: "vegetables",
            inPantry: true,
          },
        ]
      },
      {
        id: 2,
        name: "Orange Banana Smoothie",
        ingredients: [
          {
            id: 2,
            name: "Bananas",
            quantity: 6,
            unit: "pieces",
            category: "fruits",
            inPantry: false,
          },
          {
            id: 5,
            name: "Milk",
            quantity: 10,
            unit: "liter",
            category: "dairy",
            inPantry: false,
          },
          {
            id: 8,
            name: "Oranges",
            quantity: 4,
            unit: "pieces",
            category: "fruits",
            inPantry: true,
          },
        ]
      },
      {
        id: 3,
        name: "Carrot Soup",
        ingredients: [
          {
            id: 1,
            name: "Carrots",
            quantity: 100,
            unit: "grams",
            category: "vegetables",
            inPantry: true,
          },
          {
            id: 16,
            name: "Olive Oil",
            quantity: 1,
            unit: "liter",
            category: "cooking oils",
            inPantry: true,
          },
        ]
      },
    ],
  },
  operations: {
    login: {
      url: "/login",
      method: "post",
      queryParamTypes: {
        userId: "integer"
      },
      handler: "$authService.login({id: $queryParams.userId})"
    },

    loadMe: {
      url: "/users/me",
      method: "get",
      handler: "$db.$users.byId($loggedInUser.id)"
    },

    test: {
      url: "/test",
      method: "get",
      handler: "return { message: 'Hello from the Server!' }",
    },

    "shopping-list": {
      url: "/shopping-list",
      method: "get",
      responseShape: "shoppingItem[]",
      handler: `$db.$shoppingItems.toArray()`
    },

    "shopping-list-slow": {
      url: "/shopping-list-slow",
      method: "get",
      responseShape: "shoppingItem[]",
      handler: `
        delay(8000);
        return $db.$shoppingItems.toArray();`
    },

    "shopping-list-create": {
      url: "/shopping-list",
      method: "post",
      queryParamTypes: {
        highlight: "boolean",
      },
      responseShape: "shoppingItem?",
      handler: `{
        if ($queryParams.highlight) {
          $requestBody.name = $requestBody.name.toUpperCase() + "!!!";
        }
        return $db.$shoppingItems.insert($requestBody);
      }`
    },

    "shopping-list-create-query": {
      url: "/shopping-list-query",
      method: "post",
      queryParamTypes: {
        addIfInPantry: "boolean",
      },
      responseShape: "shoppingItem?",
      handler: `return $db.$shoppingItems.insert($requestBody);`
    },

    "shopping-list-delete": {
      url: "/shopping-list/:itemId",
      method: "delete",
      pathParamTypes: {
        itemId: "integer",
      },
      responseShape: "boolean",
      handler: `$db.$shoppingItems.native().where("id").equals($pathParams.itemId).delete();`
    },

    "shopping-list-update": {
      url: "/shopping-list/:itemId",
      method: "put",
      pathParamTypes: {
        itemId: "integer",
      },
      responseShape: "shoppingItem",
      handler: `
        const item = $db.$shoppingItems.byId($pathParams.itemId);
        $db.$shoppingItems.update({...item, ...$requestBody});`
    },

    "shopping-list-update-slow": {
      url: "/shopping-list-slow/:itemId",
      method: "put",
      pathParamTypes: {
        itemId: "integer",
      },
      responseShape: "shoppingItem",
      handler: `{
        delay(5000);
        if ($requestBody.name.toLowerCase() === "error") {
          throw Errors.HttpError(400, { message: "Error!" });
        }
        const item = $db.$shoppingItems.byId($pathParams.itemId);
        $db.$shoppingItems.update({...item, ...$requestBody});
      }`
    },

    "shopping-list-meta": {
      url: "/shopping-list-meta",
      method: "get",
      responseShape: "shoppingItem[]",
      handler: `
        const shoppingList = $db.$shoppingItems.toArray();
        return {
          items: shoppingList,
          meta: {
            totalItems: shoppingList.length,
          },
        };`
    },

    "shopping-list-query": {
      url: "/shopping-list-query",
      method: "get",
      responseShape: "shoppingItem[]",
      handler: `
        let items = $db.$shoppingItems.toArray();
        const { inPantry, limit } = $queryParams;

        items = inPantry !== undefined ? items.filter(item => item.inPantry): items;
        items = limit !== undefined ? items.slice(0, limit) : items;

        return items;`
    },

    "shopping-list-refetch": {
      url: "/shopping-list-refetch",
      method: "get",
      responseShape: "shoppingItem[]",
      handler: `        
        $db.$shoppingItems.insert({
          name: "Carrots",
          quantity: 100,
          unit: "grams",
          category: "vegetables",
          inPantry: true,
        })`
    },

    "shopping-list-headers": {
      url: "/shopping-list-headers",
      method: "get",
      responseShape: "shoppingItem[]",
      handler: `
        const token = $requestHeaders['x-api-key'];
        if (token) {
          console.log("Token #" + token + " accepted!");
          return $db.$shoppingItems.toArray();
        }
        throw Errors.HttpError(400, { message: "No API key provided in header!" });`,
    },

    "shopping-list-headers-post": {
      url: "/shopping-list-headers",
      method: "post",
      responseShape: "shoppingItem[]",
      handler: `
        const token = $requestHeaders['x-api-key'];
        if (token === "1111") {
          console.log("Token #" + token + " accepted!");
          return $db.$shoppingItems.insert($requestBody);
        }
        throw Errors.HttpError(400, { message: "No valid API key provided in header!" });`,
    },

    "shopping-list-polled": {
      url: "/shopping-list-polled",
      method: "get",
      responseShape: "shoppingItem[]",
      handler: `
        if ($db.$polledItems.native().count() >= 5) {
          $db.$polledItems.native().clear();
        }

        const groceriesLength = $db.$shoppingItems.native().count();
        const randomIdx = Math.floor(Math.random() * (groceriesLength + 1));

        const newItem = $db.$shoppingItems.byId(randomIdx);
        if (newItem) {
          newItem.id = undefined;
          $db.$polledItems.insert({
            ...newItem,
          });
        }
        
        return $db.$polledItems.toArray();`
    },

    "shopping-list-pagination": {
      url: "/shopping-list-pagination",
      method: "get",
      responseShape: "shoppingItems[]",
      handler: `
        const items = $db.$shoppingItems.toArray();
        const { size, nextPageParam } = $queryParams;
        const _size = parseInt(size);
        let startIndex = 0;
        let endIndex = items.length < _size ? items.length : _size;
        
        if (nextPageParam !== undefined) {
          const startId = parseInt(nextPageParam);
          const temp = items.findIndex(item => item.id === startId);
          if (temp === -1) {
            throw Errors.HttpError(404, "No such item");
          }

          startIndex = temp + 1;
          endIndex = startIndex + _size < items.length ? startIndex + _size : items.length;
        }

        return items.slice(startIndex, endIndex);`
    },

    "shopping-item-unconventional": {
      url: "/shopping-item-unconventional",
      method: "post",
      responseShape: "shoppingItem",
      handler: "Assertions.getIfPresent($requestBody.id)"
    },

    "shopping-item": {
      url: "/shopping-list/:itemId",
      method: "get",
      pathParamTypes: {
        itemId: "integer"
      },
      responseShape: "shoppingItem",
      handler: "Assertions.getIfPresent($pathParams.itemId)"
    },

    "shopping-item-recipes": {
      url: "/shopping-item-recipes/:itemId",
      method: "get",
      pathParamTypes: {
        itemId: "integer"
      },
      responseShape: "recipe[]",
      handler: `
        const item = Assertions.getIfPresent($pathParams.itemId);
        const recipes = $db.$recipes.toArray().filter(recipe => recipe.ingredients.find(ingredient => ingredient.name === item.name));
        return recipes;`
    }
  }
};

export default mock;

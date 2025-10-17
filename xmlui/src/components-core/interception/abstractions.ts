import type { DelayMode } from "msw";

export type AuthDefinition = {
  defaultLoggedInUser?: any
};

export type TableDescriptor = {
  name: string,
  fields?: Record<string, any>,
  pk: Array<string>;
  indexes?: Array<string>;
}

export type SchemaDescriptor = {
  tables: Array<TableDescriptor>,
  relationships?: any;
  dtos?: any;
}

// Represents an interceptor between API consumers (UI in the browser) and their backend
export type ApiInterceptorDefinition = {
  // Type of backend interceptor
  type?: string;
  
  // Interceptor configuration
  config?: Record<string, any>;

  artificialDelay?: number | DelayMode;
  
  // Information for code generators
  schemaDescriptor?: SchemaDescriptor

  // URL to particular interceptor is bound to
  apiUrl?: string;

  // Initial data to set up (initialize) the interceptor
  initialData?: Record<string, any[]> | (() => Promise<Record<string, any[]>>);

  helpers?: Record<string, any>;
  initialize?: string;

  // Available operations
  operations?: Record<string, InterceptorOperationDef>;
  
  auth?: AuthDefinition;

  useWorker?: boolean;
};

// Represents a single operation of the interceptor
export type InterceptorOperationDef = {
  // Operation method (can be extended in the future)
  method: "get" | "post" | "put" | "delete" | "patch" | "head" | "options";

  // Operation URL(s)
  url: string | Array<string>;

  // The source code of the operation's handler. This code is parsed and executed
  handler: string;

  // Shape of the request this operation expects
  requestShape?: any;
  
  // Shape of the response this operation returns
  responseShape?: any;
  
  // Type mappings of path parameters
  pathParamTypes?: Record<string, string>
  
  // Type mappings of query parameters
  queryParamTypes?: Record<string, string>;

  successStatusCode?: number;
};

// Describes the backend environment (change it for mocked tests)
export type BackendEnvironment = {
  getDate: () => Date;
};

// Represents the persistence service (database) of the backend
// TODO: Review this interface
export interface IDatabase {
  [key: string]: unknown;
  getItems(collectionName: string): Promise<Array<any>>;
  getItem(collectionName: string, predicate: (item: any) => Promise<boolean>): Promise<any>;
  getItemById(collectionName: string, id: any): Promise<any>;
  deleteItems(collectionName: string, predicate: (item: any) => Promise<boolean>): Promise<void>;
  insertItem(collectionName: string, item: any): Promise<any>;
  updateItem(collectionName: string, item: any): Promise<any>;
  updateItem(collectionName: string, item: any): Promise<any>;
}

// Represents the request parameters the backed translates to operations
export type RequestParams = {
  // URL path parameters
  pathParams: Record<string, any>;

  // URL query parameters
  queryParams: Record<string, any>;

  // The body of a request
  requestBody: any; 
  
  cookies: any;
  
  requestHeaders: Record<string, string>;
};

// Represents the definition of a particular backed
export type BackendDefinition = {
  initialData?: Record<string, any[]>;
  initialize?: string;
  helpers?: Record<string, any>;
  operations: Record<string, string>;
};

export type ApiOperationDef = {
  method?: string;
  url?: string;
  body?: unknown;
  rawBody?: string;
  queryParams?: unknown;
  headers?: unknown;
  credentials?: RequestCredentials;
};

export type ApiActionOptions = Record<string, unknown>;

export function getLastApiStatus(): number | undefined {
  return undefined;
}

export default class RestApiProxy {}

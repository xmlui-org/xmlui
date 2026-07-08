export type ManagedHttpMethod = "get" | "post" | "put" | "patch" | "delete";

export type ManagedRequestInput = {
  url?: string;
  method?: string;
  body?: unknown;
  rawBody?: string;
  queryParams?: unknown;
  headers?: unknown;
  credentials?: RequestCredentials;
  dataType?: "json" | "text" | "csv" | "sql";
};

export type ManagedRequest = {
  url: string;
  method: ManagedHttpMethod;
  body?: unknown;
  rawBody?: string;
  queryParams?: Record<string, unknown>;
  headers: Record<string, string>;
  credentials?: RequestCredentials;
  dataType: "json" | "text" | "csv" | "sql";
};

export type ManagedResponse = {
  data: unknown;
  headers?: Record<string, string>;
};

export type ManagedFetchAdapter = (
  request: ManagedRequest,
  signal: AbortSignal,
) => Promise<ManagedResponse>;

export type ManagedCacheEntry = {
  key: string;
  value: unknown;
  error: unknown;
  loaded: boolean;
  inProgress: boolean;
  isRefetching: boolean;
  responseHeaders?: Record<string, string>;
  revision: number;
};

export class ManagedFetchError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
    readonly response?: unknown,
  ) {
    super(message);
    this.name = "ManagedFetchError";
  }
}

type InFlightRequest = {
  controller: AbortController;
  promise: Promise<ManagedResponse>;
  sequence: number;
};

export class ManagedFetchService {
  private readonly cache = new Map<string, ManagedCacheEntry>();
  private readonly inFlight = new Map<string, InFlightRequest>();
  private adapter: ManagedFetchAdapter = defaultFetchAdapter;
  private revision = 0;

  setAdapter(adapter: ManagedFetchAdapter): void {
    this.adapter = adapter;
  }

  buildRequest(input: ManagedRequestInput): ManagedRequest {
    const method = normalizeMethod(input.method);
    return {
      url: input.url ?? "",
      method,
      body: input.body,
      rawBody: input.rawBody,
      queryParams: normalizeRecord(input.queryParams),
      headers: normalizeHeaders(input.headers),
      credentials: input.credentials,
      dataType: input.dataType ?? "json",
    };
  }

  requestKey(request: ManagedRequest): string {
    const normalized = normalizeUrlForKey(request.url, request.queryParams);
    return stableJson({
      method: request.method,
      url: normalized.url,
      queryParams: normalized.queryParams,
      body: request.rawBody ?? request.body,
      headers: request.headers,
      credentials: request.credentials,
      dataType: request.dataType,
    });
  }

  read(key: string): ManagedCacheEntry {
    return this.ensureEntry(key);
  }

  async load(request: ManagedRequest, options: { force?: boolean } = {}): Promise<ManagedCacheEntry> {
    const key = this.requestKey(request);
    const entry = this.ensureEntry(key);
    if (entry.loaded && !options.force) {
      return entry;
    }

    const existing = this.inFlight.get(key);
    if (existing && !options.force) {
      await existing.promise;
      return this.ensureEntry(key);
    }
    if (existing && options.force) {
      existing.controller.abort();
    }

    const controller = new AbortController();
    const sequence = ++this.revision;
    this.updateEntry(key, {
      inProgress: !entry.loaded,
      isRefetching: entry.loaded,
      error: undefined,
    });

    const promise = this.adapter(request, controller.signal);
    this.inFlight.set(key, { controller, promise, sequence });
    try {
      const response = await promise;
      if (this.inFlight.get(key)?.sequence !== sequence) {
        return this.ensureEntry(key);
      }
      this.updateEntry(key, {
        value: response.data,
        responseHeaders: response.headers,
        loaded: true,
        inProgress: false,
        isRefetching: false,
        error: undefined,
      });
      return this.ensureEntry(key);
    } catch (error) {
      if ((error as { name?: string })?.name === "AbortError") {
        this.updateEntry(key, {
          inProgress: false,
          isRefetching: false,
        });
        return this.ensureEntry(key);
      }
      this.updateEntry(key, {
        error,
        inProgress: false,
        isRefetching: false,
      });
      throw error;
    } finally {
      if (this.inFlight.get(key)?.sequence === sequence) {
        this.inFlight.delete(key);
      }
    }
  }

  async execute(request: ManagedRequest): Promise<ManagedResponse> {
    const controller = new AbortController();
    return this.adapter(request, controller.signal);
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    const existing = this.inFlight.get(key);
    if (existing) {
      existing.controller.abort();
      this.inFlight.delete(key);
    }
  }

  clear(): void {
    for (const existing of this.inFlight.values()) {
      existing.controller.abort();
    }
    this.inFlight.clear();
    this.cache.clear();
  }

  private ensureEntry(key: string): ManagedCacheEntry {
    const existing = this.cache.get(key);
    if (existing) {
      return existing;
    }
    const created: ManagedCacheEntry = {
      key,
      value: undefined,
      error: undefined,
      loaded: false,
      inProgress: false,
      isRefetching: false,
      revision: 0,
    };
    this.cache.set(key, created);
    return created;
  }

  private updateEntry(key: string, patch: Partial<ManagedCacheEntry>): void {
    const existing = this.ensureEntry(key);
    this.cache.set(key, {
      ...existing,
      ...patch,
      revision: ++this.revision,
    });
  }
}

export const managedFetchService = new ManagedFetchService();

export function applyResultSelector(value: unknown, selector: string | undefined): unknown {
  if (!selector) {
    return value;
  }
  return selector.split(".").reduce((current, key) => {
    if (current == null) {
      return undefined;
    }
    return (current as Record<string, unknown>)[key];
  }, value);
}

export function appendQueryParams(url: string, queryParams: Record<string, unknown> | undefined): string {
  if (!queryParams || Object.keys(queryParams).length === 0) {
    return url;
  }
  const origin = typeof window === "undefined" ? "http://xmlui.local" : window.location.origin;
  const base = new URL(url, origin);
  for (const [key, value] of Object.entries(queryParams)) {
    if (value === undefined || value === null) {
      continue;
    }
    base.searchParams.set(key, String(value));
  }
  return base.pathname + base.search + base.hash;
}

function normalizeUrlForKey(
  url: string,
  queryParams: Record<string, unknown> | undefined,
): { url: string; queryParams?: Record<string, unknown> } {
  const origin = typeof window === "undefined" ? "http://xmlui.local" : window.location.origin;
  const base = new URL(url || "/", origin);
  const combined: Record<string, unknown> = {};
  for (const [key, value] of base.searchParams.entries()) {
    combined[key] = value;
  }
  for (const [key, value] of Object.entries(queryParams ?? {})) {
    if (value === undefined || value === null) {
      continue;
    }
    combined[key] = String(value);
  }
  return {
    url: base.pathname + base.hash,
    queryParams: Object.keys(combined).length > 0 ? combined : undefined,
  };
}

async function defaultFetchAdapter(request: ManagedRequest, signal: AbortSignal): Promise<ManagedResponse> {
  const response = await fetch(appendQueryParams(request.url, request.queryParams), {
    method: request.method.toUpperCase(),
    headers: request.headers,
    credentials: request.credentials,
    body: request.method === "get" ? undefined : request.rawBody ?? serializeBody(request.body),
    signal,
  });
  const headers = Object.fromEntries(response.headers.entries());
  const data = await parseResponseData(response, request.dataType);
  if (!response.ok) {
    throw new ManagedFetchError(response.statusText || `HTTP ${response.status}`, response.status, data);
  }
  return { data, headers };
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function parseResponseData(
  response: Response,
  dataType: ManagedRequest["dataType"],
): Promise<unknown> {
  if (dataType === "text" || dataType === "sql") {
    return response.text();
  }
  if (dataType === "csv") {
    return parseCsv(await response.text());
  }
  return parseJsonResponse(response);
}

function parseCsv(text: string): Record<string, string>[] {
  const rows = parseCsvRows(text.trim());
  if (rows.length === 0) {
    return [];
  }
  const [headers, ...records] = rows;
  return records.map((record) => Object.fromEntries(
    headers.map((header, index) => [header, record[index] ?? ""]),
  ));
}

function parseCsvRows(text: string): string[][] {
  if (!text) {
    return [];
  }
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  rows.push(row);
  return rows;
}

function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }
  return typeof body === "string" ? body : JSON.stringify(body);
}

function normalizeMethod(method: string | undefined): ManagedHttpMethod {
  const normalized = (method ?? "get").toLowerCase();
  if (["get", "post", "put", "patch", "delete"].includes(normalized)) {
    return normalized as ManagedHttpMethod;
  }
  throw new ManagedFetchError(`Unsupported HTTP method: ${method}`, 0);
}

function normalizeRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  return value as Record<string, unknown>;
}

function normalizeHeaders(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, headerValue]) => [
      key,
      String(headerValue),
    ]),
  );
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableJson(entryValue)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

import { delay, HttpResponse, matchRequestUrl } from "msw";
import type { PathParams, StrictRequest } from "msw";
import { isObject } from "lodash-es";

import { Backend, CookieService, HeaderService } from "../interception/Backend";
import { IndexedDb } from "../interception/IndexedDb";
import { convertRequestParamPart } from "../utils/request-params";
import { HttpError, HttpStatusCode } from "../interception/Errors";
import { ThrowStatementError } from "../EngineError";
import { InMemoryDb } from "../interception/InMemoryDb";
import type {
  ApiInterceptorDefinition,
  AuthDefinition,
  IDatabase,
  InterceptorOperationDef,
  RequestParams,
} from "./abstractions";

function mergeHeaders(...sources: HeadersInit[]) {
  const result: Record<string, string> = {};

  for (const source of sources) {
    if (!isObject(source)) {
      throw new TypeError("All arguments must be of type object");
    }

    const headers: Headers = new Headers(source);

    for (const [key, value] of headers.entries()) {
      if (value === undefined || value === "undefined") {
        delete result[key];
      } else {
        result[key] = value;
      }
    }
  }

  return new Headers(result);
}

// Represents the authentication service used within an API interceptor
export class AuthService {
  private loggedInUser: any;

  constructor(auth?: AuthDefinition) {
    const cachedLoggedInUser = JSON.parse(sessionStorage.getItem("session-logged-in-user") as any);
    this.loggedInUser = cachedLoggedInUser || auth?.defaultLoggedInUser;
  }

  login(newLoggedInUser: any) {
    this.loggedInUser = newLoggedInUser;
    sessionStorage.setItem("session-logged-in-user", JSON.stringify(newLoggedInUser));
  }

  logout() {
    this.loggedInUser = null;
    sessionStorage.removeItem("session-logged-in-user");
  }

  getCookieToken() {
    return sessionStorage.getItem("session-anonymous-token");
  }

  setCookieToken(token: string) {
    sessionStorage.setItem("session-anonymous-token", token);
  }

  getLoggedInUser() {
    return this.loggedInUser;
  }
}

async function initDb(apiDef: ApiInterceptorDefinition) {
  switch (apiDef.type) {
    case "in-memory":
      return new InMemoryDb(apiDef.schemaDescriptor?.tables, apiDef.initialData, apiDef.config);
    default:
      const indexedDb = new IndexedDb(
        apiDef.schemaDescriptor?.tables,
        apiDef.initialData,
        apiDef.config,
      );
      await indexedDb.initialize();
      return indexedDb;
  }
}

// An API interceptor implementation
export class ApiInterceptor {
  private backend: Backend | null = null;
  // public id = crypto.randomUUID();

  constructor(private readonly apiDef: ApiInterceptorDefinition) {
  }

  public async initialize() {
    // --- Transfer the handlers of API operations to the backend implementation
    const backendOperations: Record<string, string> = {};
    Object.entries(this.apiDef.operations || {}).forEach(([key, value]) => {
      backendOperations[key] = value.handler;
    });
    const db: IDatabase = await initDb(this.apiDef);
    const authService = new AuthService(this.apiDef.auth);
    const definition = {
      operations: backendOperations,
      initialize: this.apiDef.initialize,
      helpers: this.apiDef.helpers,
    };
    this.backend = new Backend(definition, db, authService);
  }

  public getOperations() {
    return this.apiDef.operations || {};
  }

  public getApiUrl() {
    return this.apiDef.apiUrl || "";
  }

  // Use the "msw" package to execute the interceptor operation
  async executeOperation(
    operationId: string,
    req: StrictRequest<any> | null,
    cookies: Record<string, string | Array<string>>,
    params: PathParams<string>,
  ) {
    if (this.backend === null) {
      throw new Error("Interceptor not initialized");
    }
    const operation = this.apiDef.operations?.[operationId];
    if (!operation) {
      throw new Error(`Unknown API interceptor operation: ${operationId}`);
    }
    let reqBody;
    try {
      if (operation.requestShape === "formData") {
        const formData = await req.formData();
        const obj: any = {};
        for (const key of formData.keys()) {
          const all = formData.getAll(key);
          if (all.length === 1) {
            obj[key] = all[0];
          } else {
            obj[key] = all;
          }
        }
        reqBody = obj;
      } else if (operation.requestShape === "blob") {
        reqBody = await req.blob();
      } else {
        reqBody = await req.json();
      }
    } catch (e) {}
    // --- Map path parameters
    const mappedParams = this.convertRequestParams(
      {
        pathParams: params,
        queryParams: Object.fromEntries(new URL(req.url).searchParams),
        requestBody: reqBody,
        cookies: cookies,
        requestHeaders: Object.fromEntries(req.headers.entries()) || {},
      },
      operation,
    );

    //artificial delay for http requests
    if (this.apiDef.artificialDelay === undefined) {
      await delay("real");
    } else if (this.apiDef.artificialDelay !== 0) {
      await delay(this.apiDef.artificialDelay);
    }
    const cookieService = new CookieService();
    const headerService = new HeaderService();
    try {
      const ret = await this.backend.executeOperation(
        operationId,
        mappedParams,
        cookieService,
        headerService,
      );
      const emptyBody = ret === undefined || ret === null;
      const successStatusCode =
        operation.successStatusCode ?? (emptyBody ? HttpStatusCode.NoContent : HttpStatusCode.Ok);

      const headers = mergeHeaders(cookieService.getCookieHeader(), headerService.getHeaders());
      if (ret instanceof File) {
        headers.append("Content-type", ret.type);
        headers.append("Content-Length", ret.size + "");
        
        // Properly encode filename for Content-Disposition header
        // Use percent-encoding for non-ASCII characters in filename*
        const encodedFilename = encodeURIComponent(ret.name);
        headers.append(
          "Content-Disposition",
          `attachment; filename*=UTF-8''${encodedFilename}`,
        );
        return HttpResponse.arrayBuffer(await ret.arrayBuffer(), {
          headers: headers,
          status: successStatusCode,
        });
      }
      if (emptyBody) {
        return new HttpResponse(null, {
          headers: headers,
          status: successStatusCode,
        });
      }
      // console.log(operationId, ret)
      return HttpResponse.json(ret, {
        headers: headers,
        status: successStatusCode,
      });
    } catch (e) {
      console.error(e);
      if (e instanceof ThrowStatementError && e.errorObject instanceof HttpError) {
        return HttpResponse.json(e.errorObject.details, {
          headers: cookieService.getCookieHeader(),
          status: e.errorObject.status,
        });
      }
      return HttpResponse.json(
        { message: (e as Error)?.message },
        {
          headers: cookieService.getCookieHeader(),
          status: HttpStatusCode.InternalServerError,
        },
      );
    }
  }

  // Ensures that type path and query params are converted according to the operation definition
  private convertRequestParams(
    params: RequestParams,
    operation: InterceptorOperationDef,
  ): RequestParams {
    return {
      ...params,
      pathParams: convertRequestParamPart(params.pathParams, operation.pathParamTypes),
      queryParams: convertRequestParamPart(params.queryParams, operation.queryParamTypes),
    };
  }

  hasMockForRequest(url: string, options: RequestInit) {
    return this.getMockForRequest(url, options) !== undefined;
  }

  private getMockForRequest(url: string, options: RequestInit) {
    return Object.entries(this.getOperations()).find(([operationId, operationDef]) => {
      if (
        matchRequestUrl(new URL(url, window.location.href), `${this.getApiUrl()}${operationDef.url}`, `${window.location.href}`).matches &&
        (options.method || "get").toLowerCase() === operationDef.method.toLowerCase()
      ) {
        return true;
      }
      return false;
    });
  }

  async executeMockedFetch(url: string, options: RequestInit) {
    const mockForRequest = this.getMockForRequest(url, options);
    if(!mockForRequest) {
      throw new Error(`No mock found for request: ${url} with options: ${JSON.stringify(options)}`);
    }
    const [operationId, operationDef] = mockForRequest;
    const match = matchRequestUrl(new URL(url, window.location.href), `${this.getApiUrl()}${operationDef.url}`, `${window.location.href}`);
    return this.executeOperation(operationId, new Request(url, options), getCookiesAsObject(), match.params as PathParams);
  }
}

function getCookiesAsObject() {
  // 1. Get the cookie string
  const cookieString = document.cookie;

  // 2. Handle the case of no cookies
  if (cookieString === "") {
    return {};
  }

  // 3. Split into individual "key=value" pairs
  const cookiePairs = cookieString.split('; ');

  // 4. Use reduce to build the final object
  const cookieObject = cookiePairs.reduce((acc, currentPair) => {
    const [key, value] = currentPair.split('=');
    // Decode the key and value to handle special characters
    acc[decodeURIComponent(key)] = decodeURIComponent(value);
    return acc;
  }, {});

  return cookieObject;
}
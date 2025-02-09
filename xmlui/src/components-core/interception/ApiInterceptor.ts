import { delay, HttpResponse } from "msw";
import type { PathParams, StrictRequest } from "msw";
import { isObject } from "lodash-es";

import type {
  ApiInterceptorDefinition,
  AuthDefinition,
  IDatabase,
  InterceptorOperationDef,
  RequestParams
} from "./abstractions";
import { Backend, CookieService, HeaderService } from "../interception/Backend";
import { IndexedDb } from "../interception/IndexedDb";
import { convertRequestParamPart } from "../utils/request-params";
import { HttpError, HttpStatusCode } from "../interception/Errors";
import { ThrowStatementError } from "../EngineError";
import {InMemoryDb} from "../interception/InMemoryDb";

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

async function initDb(apiDef: ApiInterceptorDefinition){
  switch (apiDef.type) {
    case "in-memory":
      return new InMemoryDb(apiDef.schemaDescriptor?.tables, apiDef.initialData, apiDef.config);
    default:
      const indexedDb = new IndexedDb(apiDef.schemaDescriptor?.tables, apiDef.initialData, apiDef.config);
      await indexedDb.initialize();
      return indexedDb;
  }
}

// An API interceptor implementation
export class ApiInterceptor {
  private backend: Backend | null = null;

  constructor(private readonly apiDef: ApiInterceptorDefinition) {}

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
    req: StrictRequest<any>,
    cookies: Record<string, string | Array<string>>,
    params: PathParams<string>
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
          if(all.length === 1){
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
      operation
    );

    //artificial delay for http requests
    await delay();
    const cookieService = new CookieService();
    const headerService = new HeaderService();
    try {
      const ret = await this.backend.executeOperation(operationId, mappedParams, cookieService, headerService);
      const emptyBody = ret === undefined || ret === null;
      const successStatusCode =
        operation.successStatusCode ?? (emptyBody ? HttpStatusCode.NoContent : HttpStatusCode.Ok);

      const headers = mergeHeaders(cookieService.getCookieHeader(), headerService.getHeaders());
      if (ret instanceof File) {
        headers.append("Content-type", ret.type);
        headers.append("Content-Length", ret.size + "");
        headers.append("Content-Disposition", `attachment; filename="${ret.name}"; filename*=utf-8''${ret.name}`);
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
        }
      );
    }
  }

  // Ensures that type path and query params are converted according to the operation definition
  private convertRequestParams(params: RequestParams, operation: InterceptorOperationDef): RequestParams {
    return {
      ...params,
      pathParams: convertRequestParamPart(params.pathParams, operation.pathParamTypes),
      queryParams: convertRequestParamPart(params.queryParams, operation.queryParamTypes),
    };
  }
}

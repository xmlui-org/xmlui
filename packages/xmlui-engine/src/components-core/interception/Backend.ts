import { isArray, isObject, mapValues } from "lodash-es";

import type {
  BackendDefinition,
  BackendEnvironment,
  IDatabase,
  RequestParams,
} from "./abstractions";
import type { BindingTreeEvaluationContext } from "@components-core/script-runner/BindingTreeEvaluationContext";
import type { AuthService } from "@components-core/interception/ApiInterceptor";

import { delay } from "@components-core/utils/misc";
import { runEventHandlerCode } from "@components-core/utils/statementUtils";
import Errors from "@components-core/interception/Errors";
import { dateFunctions } from "@components-core/appContext/date-functions";
import { miscellaneousUtils } from "@components-core/appContext/misc-utils";
import { getDate } from "@components-core/utils/date-utils";

// Use this backend environment as the default
export const defaultBackendEnvironment: BackendEnvironment = {
  getDate: (date?: string | number | Date) => date ? new Date(date) : new Date(),
};

const mapValuesDeep = (obj: any, cb: (o: any) => any): any => {
  if (isArray(obj)) {
    return obj.map((innerObj) => mapValuesDeep(innerObj, cb));
  } else if (isObject(obj)) {
    return mapValues(obj, (val) => mapValuesDeep(val, cb));
  } else {
    return cb(obj);
  }
};

export class CookieService{
  private cookies: Record<string, string | Array<string>> = {};
  public setCookie(key: string, value: string | Array<string>){
    this.cookies[key] = value;
  }

  public getCookieHeader(){
    const cookieArrays: Array<[string, string]> = [];

    Object.entries(this.cookies).forEach(([key, value])=>{
      if(Array.isArray(value)){
        value.forEach(val => cookieArrays.push(['Set-Cookie', `${key}=${val}`]))
      } else {
        cookieArrays.push(['Set-Cookie', `${key}=${value}`]);
      }
    })

    return new Headers(cookieArrays);
  }
}

export class HeaderService{
  private headers: Record<string, string> = {};
  public setHeader(key: string, value: string){
    this.headers[key] = value;
  }

  public getHeaders(){
    const headersArray: Array<[string, string]> = [];

    Object.entries(this.headers).forEach(([key, value])=>{
      headersArray.push([key, value]);
    })

    return new Headers(headersArray);
  }
}

export class Backend {
  private readonly resolvedHelpers?: Record<string, any>;
  private readonly apiStateHash: Record<string, any> = {};

  constructor(
    public readonly definition: BackendDefinition,
    public readonly db: IDatabase,
    public readonly authService: AuthService
  ) {
    this.resolvedHelpers = mapValuesDeep(definition.helpers, (helper) => {
      if (typeof helper === "string") {
        return (...params: any[]) => this.runFn(helper, ...params);
      }
      return helper;
    });
  }

  async executeOperation(operationId: string, requestParams: RequestParams, cookieService: CookieService, headerService: HeaderService) {
    const handler = this.definition.operations?.[operationId];
    if (!handler) {
      throw new Error(`Unknown backend operation: ${operationId}`);
    }
    return await this.runFn(handler, requestParams, cookieService, headerService);
  }

  private async runFn(src: string, ...args: any[]) {
    let localContext = {
      ...this.resolvedHelpers,
      "$db": this.db,
      "$state": this.apiStateHash,
      "$authService": this.authService,
      "$env": defaultBackendEnvironment,
      "$loggedInUser": this.authService.getLoggedInUser(),
      "$pathParams": args[0]?.pathParams,
      "$queryParams": args[0]?.queryParams,
      "$requestBody": args[0]?.requestBody,
      "$cookies": args[0]?.cookies,
      "$requestHeaders": args[0]?.requestHeaders,
      "$cookieService": args[1],       //TODO really ugly, temporary solution
      "$headerService": args[2]       //TODO really ugly, temporary solution
    };
    const evalContext = createEvalContext({
      localContext: localContext,
      eventArgs: args,
      appContext: {
        ...dateFunctions,
        ...miscellaneousUtils,
        delay,
        Errors,
        createFile: (...args: any[])=> new File(args[0], args[1], args[2]),
        getDate
      },
    });

    await runEventHandlerCode(src, evalContext);

    return evalContext.mainThread?.blocks?.length
      ? evalContext.mainThread.blocks[evalContext.mainThread.blocks.length - 1].returnValue
      : undefined;
  }
}

function createEvalContext(parts: Partial<BindingTreeEvaluationContext>): BindingTreeEvaluationContext {
  return {
    ...{
      mainThread: {
        childThreads: [],
        blocks: [{ vars: {} }],
        loops: [],
        breakLabelValue: -1,
      },
    },
    ...parts,
  };
}

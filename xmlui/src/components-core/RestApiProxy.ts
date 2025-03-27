import type { AxiosResponse } from "axios";
import {isPlainObject, isUndefined, omitBy} from "lodash-es";

import type { AppContextObject } from "../abstractions/AppContextDefs";
import type { BindingTreeEvaluationContext } from "./script-runner-exp/BindingTreeEvaluationContext";
import { T_ARROW_EXPRESSION_STATEMENT, type ArrowExpressionStatement } from "../abstractions/scripting/ScriptingSourceTreeExp";

import { extractParam } from "./utils/extractParam";
import { randomUUID } from "./utils/misc";
import { GenericBackendError } from "./EngineError";
import { processStatementQueue } from "./script-runner-exp/process-statement-sync";

type OnProgressFn = (progressEvent: { loaded: number; total?: number; progress?: number }) => void;

interface FileChunk {
  blob: Blob;
  chunkStart: number;
  chunkEnd: number;
}

export type ApiOperationDef = {
  method: "get" | "post" | "put" | "delete" | "patch" | "head" | "options" | "trace" | "connect";
  url: string;
  rawBody?: any;
  body?: any;
  queryParams?: Record<string, any>;
  headers?: Record<string, any>;
  payloadType?: string;
};

export type UploadOperationDef = ApiOperationDef & {
  file: File;
  formParams?: Record<string, any>;
  asForm?: boolean;
};

export type DownloadOperationDef = ApiOperationDef & {
  fileName: string;
};

export type ApiActionOptions = {
  resolveBindingExpressions?: boolean;
};

interface RestAPIAdapterPropsV2 {
  apiUrl: string;
  headers?: Record<string, string>;
  errorResponseTransform?: string;
}

function isAxiosResponse(response: AxiosResponse | Response): response is AxiosResponse {
  return "data" in response;
}

async function parseResponseJson(response: AxiosResponse | Response) {
  let resp: any;
  if (isAxiosResponse(response)) {
    resp = response.data;
  } else {
    try {
      resp = await response.clone().json();
    } catch (e: any) {
      try {
        resp = await response.clone().text();
      } catch (e) {
        console.error("Failed to parse response as text or JSON", response.body);
      }      
    }
  }
  return resp;
}

//TODO illesg unit test.....
function appendFormFieldValue({ key, value }: { key: string; value: any }, formData: FormData, prevKey: string = key) {
  if (value === undefined || value === null) {
    return;
  }
  if (value instanceof File || value instanceof Blob) {
    formData.append(key, value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((val) => {
      appendFormFieldValue({ key, value: val }, formData, prevKey);
    });
  } else if (isPlainObject(value)) {
    Object.entries(value).forEach(([objKey, objVal]) => {
      const concatenatedObjectKey = `${prevKey}.${objKey}`;
      appendFormFieldValue(
        {
          key: concatenatedObjectKey,
          value: objVal,
        },
        formData,
        concatenatedObjectKey
      );
    });
  } else {
    formData.append(key, value.toString());
  }
}

export default class RestApiProxy {
  private config: RestAPIAdapterPropsV2;
  private appContext?: AppContextObject;

  constructor(appContext?: AppContextObject) {
    const conf = appContext?.appGlobals || { apiUrl: "" };
    const { apiUrl, errorResponseTransform } = conf;
    this.appContext = appContext;
    this.config = {
      apiUrl,
      errorResponseTransform,
      headers: {
        ...appContext?.appGlobals?.headers,
      }
    };
  }

  public execute = async ({
    abortSignal,
    operation,
    params,
    parseOptions,
    resolveBindingExpressions = false,
    transactionId = randomUUID(),
    onProgress,
  }: {
    abortSignal?: AbortSignal;
    operation: ApiOperationDef;
    params?: any;
    parseOptions?: {
      asBlob?: boolean;
      asFile?: boolean;
    };
    transactionId?: string;
    resolveBindingExpressions?: boolean;
    onProgress?: OnProgressFn;
  }): Promise<any> => {
    return await this.executeOperation({
      operation,
      abortSignal,
      contextParams: params,
      resolveBindingExpressions,
      parseResponse: parseOptions?.asFile
        ? async (response) => {
            //we can't access content-disposition header if it's a CORS request: The suggested workaround was adding Access-Control-Expose-Headers:Content-Disposition to the response header on the server.
            // more info here: https://github.com/matthew-andrews/isomorphic-fetch/issues/67
            let fileName = (operation as DownloadOperationDef).fileName || "unknown";
            if (response.headers && response.headers.get && typeof response.headers.get === "function") {
              const contentDisposition = response.headers.get("Content-Disposition")?.toString();
              if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
                if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1];
              }
            }
            return isAxiosResponse(response) ? response.data : new File([await response.clone().blob()], fileName);
          }
        : undefined,
      transactionId,
      onUploadProgress: onProgress,
    });
  };

  public upload = async ({
    operation,
    params = {},
    chunk,
    onUploadProgress,
    abortSignal,
    transactionId = randomUUID(),
    resolveBindingExpressions = false,
  }: {
    abortSignal?: AbortSignal;
    operation: UploadOperationDef;
    params?: any;
    chunk?: FileChunk;
    onUploadProgress?: OnProgressFn;
    transactionId?: string;
    resolveBindingExpressions?: boolean;
  }) => {
    const { file, asForm, formParams } = this.extractParam(resolveBindingExpressions, operation, params);

    const uploadParams = {
      chunkStart: chunk?.chunkStart,
      chunkEnd: chunk ? chunk?.chunkEnd - 1 : undefined,
      chunkLength: chunk ? chunk?.chunkEnd - chunk?.chunkStart : undefined,
      fileSize: file.size,
      urlSafeName: encodeURIComponent(file.name),
      fileName: file.name,
    };

    const contextParams = { ...params, $uploadParams: uploadParams };

    if (asForm) {
      const data = new FormData();
      data.append(file.name, chunk?.blob || file);
      if (formParams) {
        Object.entries(this.extractParam(resolveBindingExpressions, formParams, params)).forEach(([key, value]) => {
          data.append(key, value as string);
        });
      }

      return await this.executeOperation({
        operation,
        contextParams,
        resolveBindingExpressions,
        rawBody: data,
        headers: {
          ...this.extractParam(resolveBindingExpressions, operation.headers || {}, contextParams),
          // https://muffinman.io/blog/uploading-files-using-fetch-multipart-form-data/
          // the browser sets the content-type in this case
          "Content-Type": undefined,
        },
        onUploadProgress,
        abortSignal,
        transactionId,
      });
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(chunk?.blob || file);
      reader.onload = async (evt) => {
        try {
          if (evt.target === null) {
            reject();
            return;
          }
          resolve(
            await this.executeOperation({
              operation,
              contextParams,
              resolveBindingExpressions,
              rawBody: evt.target.result,
              headers: {
                ...this.extractParam(resolveBindingExpressions, operation.headers || {}, contextParams),
                "Content-Type": file.type,
              },
              onUploadProgress,
              abortSignal,
              transactionId,
            })
          );
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = () => {
        reject();
      };
    });
  };

  public resolveUrl = ({
    operation,
    params = {},
    resolveBindingExpressions = false,
  }: {
    operation: ApiOperationDef;
    params?: any;
    resolveBindingExpressions?: boolean;
  }) => {
    return this.generateFullApiUrl(
      this.extractParam(resolveBindingExpressions, operation.url, params),
      this.extractParam(resolveBindingExpressions, operation.queryParams, params)
    );
  };

  private extractParam = (resolveAsBindingExpression: boolean, value: any, params = {}, strict?: boolean) => {
    const localContext = { $adapterConfig: this.config, ...params };
    if (resolveAsBindingExpression) {
      return extractParam(localContext, value, this.appContext, strict);
    }
    if (value?._ARROW_EXPR_) {
      //TODO illesg review, this whole processstatement is because of the chunked uploads (headers as function)
      const evalContext: BindingTreeEvaluationContext = {
        eventArgs: [localContext],
      };
      try {
        const arrowStmt = {
          type: T_ARROW_EXPRESSION_STATEMENT,
          expr: value,
        } as ArrowExpressionStatement;

        processStatementQueue([arrowStmt], evalContext);

        if (evalContext.mainThread?.blocks?.length) {
          return evalContext.mainThread.blocks[evalContext.mainThread.blocks.length - 1].returnValue;
        }
        return undefined;
      } catch (e) {
        console.error(e);
        return undefined;
      }
    }
    return value;
  };

  private executeOperation = async ({
    operation,
    contextParams,
    abortSignal,
    resolveBindingExpressions,
    relativePath = this.extractParam(resolveBindingExpressions, operation.url, contextParams),
    method = this.extractParam(resolveBindingExpressions, operation.method, contextParams),
    queryParams = this.extractParam(resolveBindingExpressions, operation.queryParams, contextParams),
    body = this.extractParam(resolveBindingExpressions, operation.body, contextParams, true),
    rawBody = this.extractParam(resolveBindingExpressions, operation.rawBody, contextParams),
    headers = this.extractParam(resolveBindingExpressions, operation.headers, contextParams),
    payloadType = this.extractParam(resolveBindingExpressions, operation.payloadType, contextParams) || "json",
    onUploadProgress,
    parseResponse = this.tryParseResponse,
    transactionId,
  }: {
    operation: ApiOperationDef;
    abortSignal?: AbortSignal;
    relativePath?: string;
    method?: string;
    queryParams?: Record<string, any>;
    contextParams?: Record<string, any>;
    body?: any;
    rawBody?: any;
    headers?: Record<string, string>;
    payloadType?: "form" | "multipart-form" | "json";
    onUploadProgress?: OnProgressFn;
    parseResponse?: (response: Response | AxiosResponse) => any;
    transactionId: string;
    resolveBindingExpressions: boolean;
  }) => {
    const includeClientTxId = method && method !== "get" && !!transactionId;
    const headersWithoutContentType = {...this.getHeaders(), ["Content-Type"]: undefined};
    const aggregatedHeaders = omitBy({ ...(body ? this.getHeaders() : headersWithoutContentType), ...headers }, isUndefined) as Record<string, string>;
    if (includeClientTxId) {
      aggregatedHeaders["x-ue-client-tx-id"] = transactionId;
    }

    let requestBody;
    if (rawBody) {
      requestBody = rawBody;
    } else {
      if (payloadType === "multipart-form" || payloadType === "form") {
        const formData = new FormData();
        Object.entries(body).forEach(([key, value]) => {
          appendFormFieldValue({ key, value }, formData);
        });
        if (payloadType === "multipart-form") {
          requestBody = formData;
          // https://muffinman.io/blog/uploading-files-using-fetch-multipart-form-data/
          // the browser sets the content-type in this case
          delete aggregatedHeaders["Content-Type"];
        } else {
          requestBody = new URLSearchParams(formData as any).toString();
          aggregatedHeaders["Content-Type"] = "application/x-www-form-urlencoded";
        }
      } else {
        requestBody = body ? JSON.stringify(body) : undefined;
      }
    }

    const options: RequestInit = {
      method: method,
      headers: aggregatedHeaders,
      signal: abortSignal,
      body: requestBody
    };
    if (onUploadProgress) {
      console.log("Falling back to axios. Reason: onUploadProgress specified");
      const axios = (await import("axios")).default;
      try {
        const response = await axios.request({
          url: this.generateFullApiUrl(relativePath, queryParams),
          method: options.method,
          headers: aggregatedHeaders,
          data: options.body,
          onUploadProgress,
        });
        return await parseResponse(response);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw await this.raiseError(error.response);
        } else {
          throw error;
        }
      }
    } else {
      const response = await fetch(this.generateFullApiUrl(relativePath, queryParams), options);
      if (!response.clone().ok) {
        throw await this.raiseError(response);
      }
      return await parseResponse(response.clone());
    }
  };

  private tryParseResponse = async (response: Response | AxiosResponse) => {
    return await parseResponseJson(response);
  };

  private generateFullApiUrl(relativePath: string, queryParams: Record<string, any> | undefined) {
    let queryString = "";
    if (queryParams) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            params.append(key, item);
          });
        } else if (value !== undefined) {
          params.append(key, value);
        }
      });
      queryString = `?${params}`;
    }
    if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
      return `${relativePath}${queryString}`;
    }
    //TODO check if autoEncode is enabled
    return `${this.config.apiUrl || ""}${relativePath}${queryString}`;
  }

  private raiseError = async (response: Response | AxiosResponse) => {
    if ("config" in response) {
      //poor man's axios response type guard
      try {
        return new GenericBackendError(
          this.config.errorResponseTransform
            ? this.extractParam(true, this.config.errorResponseTransform, { $response: response.data })
            : response.data,
            response.status
        );
      } catch {}
    } else {
      try {
        const respObject = await response.json();
        return new GenericBackendError(
          this.config.errorResponseTransform
            ? this.extractParam(true, this.config.errorResponseTransform, { $response: respObject })
            : respObject,
            response.status
        );
      } catch {}
    }

    return new Error(`[!] Server responded with an error: ${response.status} - ${response.statusText}`);
  };

  private getHeaders = (): Record<string, string> => {
    return {
      ["Content-Type" as string]: "application/json; charset=UTF-8",
      ...(this.config.headers ?? {}),
    };
  };
}

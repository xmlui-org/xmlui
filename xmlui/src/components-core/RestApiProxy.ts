import { isPlainObject, isUndefined, omitBy } from "lodash-es";

import type { AppContextObject } from "../abstractions/AppContextDefs";
import { isArrowExpressionObject } from "../abstractions/InternalMarkers";
import type { BindingTreeEvaluationContext } from "./script-runner/BindingTreeEvaluationContext";
import {
  T_ARROW_EXPRESSION_STATEMENT,
  type ArrowExpressionStatement,
} from "./script-runner/ScriptingSourceTree";

import { extractParam } from "./utils/extractParam";
import { normalizeUrlAndParams } from "./utils/DataLoaderQueryKeyGenerator";
import { randomUUID, readCookie } from "./utils/misc";
import { GenericBackendError } from "./EngineError";
import { processStatementQueue } from "./script-runner/process-statement-sync";
import type { IApiInterceptor } from "./interception/abstractions";

type OnProgressFn = (progressEvent: { loaded: number; total?: number; progress?: number }) => void;

// Store last API response status for tracing
function setLastApiStatus(transactionId: string, status: number) {
  if (typeof window !== "undefined") {
    const w = window as any;
    w._xsLastApiStatus = w._xsLastApiStatus || {};
    w._xsLastApiStatus[transactionId] = status;
  }
}

export function getLastApiStatus(transactionId: string): number | undefined {
  if (typeof window !== "undefined") {
    const w = window as any;
    return w._xsLastApiStatus?.[transactionId];
  }
  return undefined;
}

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
  credentials?: "omit" | "same-origin" | "include";
};

export type UploadOperationDef = ApiOperationDef & {
  file: File;
  formParams?: Record<string, any>;
  asForm?: boolean;
  fieldName?: string;
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

function getContentType(response: Response): string {
  return response.headers.get("content-type") || "";
}

// --- Tests for the most common binary types
function isBinaryContentType(contentType: string): boolean {
  const binaryTypes = [
    // Images
    "image/",
    // Audio
    "audio/",
    // Video
    "video/",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.",
    "application/vnd.ms-excel",
    "application/vnd.ms-powerpoint",
    // Archives
    "application/zip",
    "application/x-rar-compressed",
    "application/x-tar",
    "application/gzip",
    "application/x-7z-compressed",
    // Other binary
    "application/octet-stream",
    "application/x-binary",
  ];

  return binaryTypes.some((type) => contentType.toLowerCase().includes(type.toLowerCase()));
}

// --- Tests if a particular content type returns an ArrayBuffer
function shouldReturnAsArrayBuffer(contentType: string): boolean {
  const arrayBufferTypes = [
    "application/zip",
    "application/x-rar-compressed",
    "application/x-tar",
    "application/gzip",
    "application/x-7z-compressed",
    "application/x-binary",
  ];

  return arrayBufferTypes.some((type) => contentType.toLowerCase().includes(type.toLowerCase()));
}

async function parseResponseBody(response: Response, logError = false) {
  let resp: any;
  const contentType = getContentType(response);

  // Handle binary content types
  if (isBinaryContentType(contentType)) {
    try {
      if (shouldReturnAsArrayBuffer(contentType)) {
        resp = await response.clone().arrayBuffer();
      } else {
        resp = await response.clone().blob();
      }
    } catch (e) {
      if (logError) {
        console.error("Failed to parse binary response", e, contentType);
      }
      // Fallback to text if binary parsing fails
      try {
        resp = await response.clone().text();
      } catch (textError) {
        if (logError) {
          console.error("Failed to parse response as text after binary parsing failed", textError);
        }
      }
    }
  } else {
    // Handle text-based content types (JSON, text, etc.)
    try {
      resp = await response.clone().json();
    } catch (e: any) {
      try {
        resp = await response.clone().text();
      } catch (e) {
        if (logError) {
          console.error("Failed to parse response as text or JSON", response.body);
        }
      }
    }
  }
  return resp;
}

//TODO illesg unit test.....
function appendFormFieldValue(
  { key, value }: { key: string; value: any },
  formData: FormData,
  prevKey: string = key,
) {
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
        concatenatedObjectKey,
      );
    });
  } else {
    formData.append(key, value.toString());
  }
}

const origin = (typeof window !== "undefined" && window.location?.href) || "http://localhost";
const originUrl = new URL(origin);
function isURLSameOrigin(url: string): boolean {
  const urlObj = new URL(url, origin);

  return (
    originUrl.protocol === urlObj.protocol &&
    originUrl.host === urlObj.host &&
    originUrl.port === urlObj.port
  );
}

export default class RestApiProxy {
  private config: RestAPIAdapterPropsV2;
  private appContext?: AppContextObject;
  public apiInstance?: IApiInterceptor;

  private createAbortError() {
    return new DOMException("The operation was aborted.", "AbortError");
  }

  private parseXhrHeaders(rawHeaders: string): Headers {
    const headers = new Headers();
    rawHeaders
      .trim()
      .split(/\r?\n/)
      .forEach((line) => {
        if (!line) {
          return;
        }
        const colonIndex = line.indexOf(":");
        if (colonIndex <= 0) {
          return;
        }
        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();
        headers.append(key, value);
      });
    return headers;
  }

  private executeWithUploadProgress = async ({
    url,
    options,
    onUploadProgress,
  }: {
    url: string;
    options: RequestInit;
    onUploadProgress: OnProgressFn;
  }): Promise<Response> => {
    return await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const method = options.method || "GET";
      const headers = options.headers ? new Headers(options.headers) : new Headers();
      const abortSignal = options.signal;

      const abortHandler = () => {
        xhr.abort();
      };

      const cleanup = () => {
        abortSignal?.removeEventListener("abort", abortHandler);
      };

      if (abortSignal?.aborted) {
        reject(this.createAbortError());
        return;
      }

      xhr.open(method, url, true);
      xhr.responseType = "blob";
      xhr.withCredentials = options.credentials === "include";
      headers.forEach((value, key) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.upload.addEventListener("progress", (event) => {
        const total = event.lengthComputable ? event.total : undefined;
        onUploadProgress({
          loaded: event.loaded,
          total,
          progress: total && total > 0 ? event.loaded / total : undefined,
        });
      });

      xhr.onload = () => {
        cleanup();
        const responseHeaders = this.parseXhrHeaders(xhr.getAllResponseHeaders());
        const responseBody = xhr.response ?? xhr.responseText ?? "";
        resolve(
          new Response(responseBody, {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: responseHeaders,
          }),
        );
      };

      xhr.onerror = () => {
        cleanup();
        reject(new Error("Network request failed"));
      };

      xhr.onabort = () => {
        cleanup();
        reject(this.createAbortError());
      };

      abortSignal?.addEventListener("abort", abortHandler, { once: true });
      xhr.send((options.body as XMLHttpRequestBodyInit | null) ?? null);
    });
  };

  constructor(appContext?: AppContextObject, apiInstance?: IApiInterceptor) {
    const conf = appContext?.appGlobals || { apiUrl: "" };
    const { apiUrl, errorResponseTransform } = conf;
    this.appContext = appContext;
    this.apiInstance = apiInstance;

    this.config = {
      apiUrl,
      errorResponseTransform,
      headers: {
        ...appContext?.appGlobals?.headers,
      },
    };
  }

  public execute = async ({
    abortSignal,
    operation,
    params,
    parseOptions,
    resolveBindingExpressions = false,
    transactionId = randomUUID(),
    omitTransactionId = false,
    onProgress,
    onResponseHeaders,
  }: {
    abortSignal?: AbortSignal;
    operation: ApiOperationDef;
    params?: any;
    parseOptions?: {
      asBlob?: boolean;
      asFile?: boolean;
    };
    transactionId?: string;
    omitTransactionId?: boolean;
    resolveBindingExpressions?: boolean;
    onProgress?: OnProgressFn;
    onResponseHeaders?: (headers: Record<string, string>) => void;
  }): Promise<any> => {
    return await this.executeOperation({
      operation,
      abortSignal,
      contextParams: params,
      resolveBindingExpressions,
      onResponseHeaders,
      parseResponse: parseOptions?.asFile
        ? async (response) => {
            //we can't access content-disposition header if it's a CORS request: The suggested workaround was adding Access-Control-Expose-Headers:Content-Disposition to the response header on the server.
            // more info here: https://github.com/matthew-andrews/isomorphic-fetch/issues/67
            let fileName = (operation as DownloadOperationDef).fileName || "unknown";
            if (
              response.headers &&
              response.headers.get &&
              typeof response.headers.get === "function"
            ) {
              const contentDisposition = response.headers.get("Content-Disposition")?.toString();
              if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
                if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1];
              }
            }
            return new File([await response.clone().blob()], fileName);
          }
        : undefined,
      transactionId,
      omitTransactionId,
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
    omitTransactionId = false,
    resolveBindingExpressions = false,
  }: {
    abortSignal?: AbortSignal;
    operation: UploadOperationDef;
    params?: any;
    chunk?: FileChunk;
    onUploadProgress?: OnProgressFn;
    transactionId?: string;
    omitTransactionId?: boolean;
    resolveBindingExpressions?: boolean;
  }) => {
    const { file, asForm, formParams, fieldName } = this.extractParam(
      resolveBindingExpressions,
      operation,
      params,
    );

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
      // Use fieldName if provided, otherwise default to "file"
      const formFieldName = fieldName || "file";
      data.append(formFieldName, chunk?.blob || file);
      if (formParams) {
        Object.entries(this.extractParam(resolveBindingExpressions, formParams, params)).forEach(
          ([key, value]) => {
            data.append(key, value as string);
          },
        );
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
        omitTransactionId,
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
                ...this.extractParam(
                  resolveBindingExpressions,
                  operation.headers || {},
                  contextParams,
                ),
                "Content-Type": file.type,
              },
              onUploadProgress,
              abortSignal,
              transactionId,
              omitTransactionId,
            }),
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
      this.extractParam(resolveBindingExpressions, operation.queryParams, params),
    );
  };

  private extractParam = (
    resolveAsBindingExpression: boolean,
    value: any,
    params = {},
    strict?: boolean,
  ) => {
    const localContext = { $adapterConfig: this.config, ...params };
    if (resolveAsBindingExpression) {
      return extractParam(localContext, value, this.appContext, strict);
    }
    if (isArrowExpressionObject(value)) {
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
          return evalContext.mainThread.blocks[evalContext.mainThread.blocks.length - 1]
            .returnValue;
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
    queryParams = this.extractParam(
      resolveBindingExpressions,
      operation.queryParams,
      contextParams,
    ),
    body = this.extractParam(resolveBindingExpressions, operation.body, contextParams, true),
    rawBody = this.extractParam(resolveBindingExpressions, operation.rawBody, contextParams),
    headers = this.extractParam(resolveBindingExpressions, operation.headers, contextParams),
    payloadType = this.extractParam(
      resolveBindingExpressions,
      operation.payloadType,
      contextParams,
    ) || "json",
    credentials = this.extractParam(
      resolveBindingExpressions,
      operation.credentials,
      contextParams,
    ),
    onUploadProgress,
    parseResponse = this.tryParseResponse,
    transactionId,
    omitTransactionId = false,
    onResponseHeaders,
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
    credentials?: "omit" | "same-origin" | "include";
    onUploadProgress?: OnProgressFn;
    parseResponse?: (response: Response, logError: boolean) => any;
    transactionId: string;
    omitTransactionId?: boolean;
    resolveBindingExpressions: boolean;
    onResponseHeaders?: (headers: Record<string, string>) => void;
  }) => {
    const includeClientTxId =
      method &&
      method !== "get" &&
      !!transactionId &&
      this.appContext?.appGlobals?.enableTransactionIds !== false &&
      !omitTransactionId;
    const headersWithoutContentType = { ...this.getHeaders(), ["Content-Type"]: undefined };
    let url = this.generateFullApiUrl(relativePath, queryParams);
    const hasBody = body !== undefined;

    const aggregatedHeaders = omitBy(
      { ...(hasBody ? this.getHeaders() : headersWithoutContentType), ...headers },
      isUndefined,
    ) as Record<string, string>;
    if (includeClientTxId) {
      aggregatedHeaders["x-ue-client-tx-id"] = transactionId;
    }

    if (this.appContext.appGlobals?.withXSRFToken !== false && isURLSameOrigin(url)) {
      const xsrfToken = readCookie("XSRF-TOKEN");
      if (xsrfToken) {
        aggregatedHeaders["X-XSRF-TOKEN"] = xsrfToken;
      }
    }

    let requestBody;
    if (rawBody !== undefined) {
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
        requestBody = hasBody ? JSON.stringify(body) : undefined;
      }
    }

    const options: RequestInit = {
      method: method,
      headers: aggregatedHeaders,
      signal: abortSignal,
      body: requestBody,
      ...(credentials && { credentials }),
    };
    if (onUploadProgress) {
      const response = await this.executeWithUploadProgress({
        url,
        options,
        onUploadProgress,
      });
      setLastApiStatus(transactionId, response?.status);
      if (!response.ok) {
        throw await this.raiseError(response);
      }
      if (onResponseHeaders) {
        const xhrHeaders: Record<string, string> = {};
        response.headers.forEach((value: string, key: string) => {
          xhrHeaders[key] = value;
        });
        onResponseHeaders(xhrHeaders);
      }
      return await parseResponse(response, this.appContext?.appGlobals?.logRestApiErrors ?? false);
    } else {
      let response: any;
      if (this.apiInstance && this.apiInstance.hasMockForRequest(url, options)) {
        response = await this.apiInstance.executeMockedFetch(url, options);
      } else {
        response = await fetch(url, options);
      }
      if (!response.clone().ok) {
        throw await this.raiseError(response);
      }
      setLastApiStatus(transactionId, response.status);
      if (onResponseHeaders) {
        const fetchHeaders: Record<string, string> = {};
        response.headers.forEach((value: string, key: string) => {
          fetchHeaders[key] = value;
        });
        onResponseHeaders(fetchHeaders);
      }
      const parsedResponse = await parseResponse(
        response.clone(),
        this.appContext?.appGlobals?.logRestApiErrors ?? false,
      );
      return parsedResponse;
    }
  };

  private tryParseResponse = async (response: Response, logError = false) => {
    return await parseResponseBody(response, logError);
  };

  private generateFullApiUrl(relativePath: string, queryParams: Record<string, any> | undefined) {
    const { baseUrl: basePath, mergedParams } = normalizeUrlAndParams(relativePath, queryParams);

    let queryString = "";
    if (mergedParams && Object.keys(mergedParams).length > 0) {
      const params = new URLSearchParams();
      const appendParam = (key: string, value: any) => {
        if (value === undefined || value === null) {
          return;
        }
        if (isPlainObject(value)) {
          params.append(key, JSON.stringify(value));
          return;
        }
        params.append(key, String(value));
      };
      Object.entries(mergedParams).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            appendParam(key, item);
          });
        } else {
          appendParam(key, value);
        }
      });
      // Only add query string if there are actually params after filtering
      const paramsString = params.toString();
      if (paramsString) {
        queryString = `?${paramsString}`;
      }
    }

    if (basePath.startsWith("http://") || basePath.startsWith("https://")) {
      return `${basePath}${queryString}`;
    }
    //TODO check if autoEncode is enabled
    return `${this.config.apiUrl || ""}${basePath}${queryString}`;
  }

  private raiseError = async (response: Response) => {
    try {
      const parsedResponse = await parseResponseBody(response.clone());
      const hasParsedBody =
        parsedResponse !== undefined &&
        parsedResponse !== null &&
        !(typeof parsedResponse === "string" && parsedResponse.trim().length === 0);

      if (hasParsedBody) {
        return new GenericBackendError(
          this.config.errorResponseTransform
            ? this.extractParam(true, this.config.errorResponseTransform, {
                $response: parsedResponse,
              })
            : parsedResponse,
          response.status,
        );
      }
    } catch {}

    if (response?.statusText || response?.status) {
      return new GenericBackendError(response.statusText, response.status);
    }

    return new Error(`[!] Server responded with an error: ${response}`);
  };

  private getHeaders = (): Record<string, string> => {
    return {
      ["Content-Type" as string]: "application/json; charset=UTF-8",
      ...this.config.headers,
    };
  };
}

//stolen from axios
export enum HttpStatusCode {
  Continue = 100,
  SwitchingProtocols = 101,
  Processing = 102,
  EarlyHints = 103,
  Ok = 200,
  Created = 201,
  Accepted = 202,
  NonAuthoritativeInformation = 203,
  NoContent = 204,
  ResetContent = 205,
  PartialContent = 206,
  MultiStatus = 207,
  AlreadyReported = 208,
  ImUsed = 226,
  MultipleChoices = 300,
  MovedPermanently = 301,
  Found = 302,
  SeeOther = 303,
  NotModified = 304,
  UseProxy = 305,
  Unused = 306,
  TemporaryRedirect = 307,
  PermanentRedirect = 308,
  BadRequest = 400,
  Unauthorized = 401,
  PaymentRequired = 402,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  NotAcceptable = 406,
  ProxyAuthenticationRequired = 407,
  RequestTimeout = 408,
  Conflict = 409,
  Gone = 410,
  LengthRequired = 411,
  PreconditionFailed = 412,
  PayloadTooLarge = 413,
  UriTooLong = 414,
  UnsupportedMediaType = 415,
  RangeNotSatisfiable = 416,
  ExpectationFailed = 417,
  ImATeapot = 418,
  MisdirectedRequest = 421,
  UnprocessableEntity = 422,
  Locked = 423,
  FailedDependency = 424,
  TooEarly = 425,
  UpgradeRequired = 426,
  PreconditionRequired = 428,
  TooManyRequests = 429,
  RequestHeaderFieldsTooLarge = 431,
  UnavailableForLegalReasons = 451,
  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
  HttpVersionNotSupported = 505,
  VariantAlsoNegotiates = 506,
  InsufficientStorage = 507,
  LoopDetected = 508,
  NotExtended = 510,
  NetworkAuthenticationRequired = 511,
}

export class HttpError extends Error {
  status: number;
  details: Record<string, any> | undefined;

  constructor(status: number, details?: Record<string, any>) {
    super(details?.message || "Not found");
    this.details = details;
    this.status = status;

    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export class NotFoundError extends HttpError {
  constructor(details?: Record<string, any>) {
    super(HttpStatusCode.NotFound, details);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(details?: Record<string, any>) {
    super(HttpStatusCode.Unauthorized, details);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ConflictError extends HttpError {
  constructor(details?: Record<string, any>) {
    super(HttpStatusCode.Conflict, details);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

function convertErrorDetails(messageOrDetails: string | Record<string, any>) {
  let details : Record<string, any> | undefined = undefined;
  if (messageOrDetails) {
    if (typeof messageOrDetails === "string") {
      details = {
        message: messageOrDetails,
      };
    } else {
      details = messageOrDetails;
    }
  }
  return details;
}

const Errors = {
  NotFound404: (messageOrDetails: string | Record<string, any>) => {
    return new NotFoundError(convertErrorDetails(messageOrDetails));
  },
  Unauthorized401: (messageOrDetails: string | Record<string, any>) => {
    return new UnauthorizedError(convertErrorDetails(messageOrDetails));
  },
  HttpError: (errorCode: number, messageOrDetails: string | Record<string, any>) => {
    return new HttpError(errorCode, convertErrorDetails(messageOrDetails));
  },
  Conflict409: (messageOrDetails: string | Record<string, any>) => {
    return new ConflictError(convertErrorDetails(messageOrDetails));
  }
};

export default Errors;

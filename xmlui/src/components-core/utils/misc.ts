import { useCallback, useInsertionEffect, useRef } from "react";
import type { ThrottleSettings } from "lodash-es";
import { get, throttle } from "lodash-es";
import { formatDistanceToNow } from "date-fns";

import type { ComponentDef } from "../../abstractions/ComponentDefs";

/**
 * Slice a single array into two based on a discriminator function.
 * @param array Input array
 * @param discriminator Does the separation of data
 * @returns An array containing the two disjunct arrays
 */
export function partition<T>(array: Array<T>, discriminator: (v: T) => boolean) {
  return array.reduce(
    ([pass, fail], elem) => {
      return discriminator(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
    },
    [[] as T[], [] as T[]],
  );
}

/**
 * The value used last time for ID generation
 */
let lastIdValue = 1;

/**
 * We use a generated value for all components that do not have an explicitly set ID.
 */
export function generatedId(): string {
  return `$qid_${lastIdValue++}`;
}

export function randomUUID() {
  if (crypto?.randomUUID) {
    return crypto?.randomUUID();
  }

  // @ts-ignore
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16),
  );
}

export function readCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

/**
 * Wait for a set duration asynchronously.
 * @param ms Time in ms to wait before continuing execution
 * @returns An empty promise
 */
export const asyncWait = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * Capitalizes the first letter of a string.
 * @param str Input string to capitalize
 */
export function capitalizeFirstLetter(str: string) {
  return str[0].toUpperCase() + str.substring(1);
}

/**
 * Removes "null" properties from the specified object
 * @param obj Object to remove nulls from
 */
export function removeNullProperties(obj: any): void {
  if (typeof obj !== "object") return;

  for (const key in obj) {
    if (obj[key] === null || obj[key] === undefined) {
      delete obj[key];
    } else {
      removeNullProperties(obj[key]);
    }
  }
}

//// from react rfc: https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md
// (!) Approximate behavior
// ts typings from here: https://stackoverflow.com/questions/73101114/react-hock-useevent-typescript
type callbackType = (...args: Array<any>) => any;

export interface UseEventOverload {
  <TF extends callbackType>(callback: TF): TF;

  <TF extends callbackType>(callback: TF): any;
}

// from here: https://github.com/bluesky-social/social-app/blob/587c0c625752964d8ce64faf1d329dce3c834a5c/src/lib/hooks/useNonReactiveCallback.ts
// This should be used sparingly. It erases reactivity, i.e. when the inputs
// change, the function itself will remain the same. This means that if you
// use this at a higher level of your tree, and then some state you read in it
// changes, there is no mechanism for anything below in the tree to "react"
// to this change (e.g. by knowing to call your function again).
//
// Also, you should avoid calling the returned function during rendering
// since the values captured by it are going to lag behind.
export const useEvent: UseEventOverload = (callback) => {
  const callbackRef = useRef(callback);

  useInsertionEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: any) => {
    const latestFn = callbackRef.current
    return latestFn?.(...args);
  }, [callbackRef]);
};

/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
export function humanFileSize(bytes: number, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(dp) + " " + units[u];
}

/**
 * Returns whether a string is a locale ID according to specific ISO standards.
 * See link for details:
 * https://stackoverflow.com/questions/8758340/is-there-a-regex-to-test-if-a-string-is-for-a-locale
 * @param value to test
 * @returns whether the given value is a locale ID
 */
export function isLocale(value: string): boolean {
  return /^[A-Za-z]{2,4}([_-][A-Za-z]{4})?([_-]([A-Za-z]{2}|[0-9]{3}))?$/.test(value);
}

/**
 * Get certain keys from an object. This function preserves the original order of elements.
 * @param object The target object
 * @param keys a list of possible keys to find among the object keys
 * @returns List of keys that are in the object, if no relevant keys found return an empty list
 */
export function filterKeysInObject(object: Record<string, any>, keys: string[]): string[] {
  let objKeys: string[] = [];
  if (keys && keys.length > 0) {
    const relevantKeys = Object.keys(object).filter((key) => keys.find((fkey) => fkey === key));
    objKeys = relevantKeys.length > 0 ? relevantKeys : objKeys;
  }
  return objKeys;
}

export function subStringsPresentInString(original: string, toCheck: string[]) {
  return toCheck.some((item) => original.includes(item));
}

export function ensureTrailingSlashForUrl(url?: string): string | undefined {
  if (!url) {
    return undefined;
  }
  if (url.endsWith("/")) {
    return url;
  }
  return `${url}/`;
}

export function ensureLeadingSlashForUrl(url?: string): string | undefined {
  if (!url) {
    return undefined;
  }
  if (url.startsWith("/")) {
    return url;
  }
  return `/${url}`;
}

export function humanReadableDateTimeTillNow(
  dateTime: number | string | Date,
  nowLabel?: string,
  time?: string,
) {
  // WARNING: does not handle locales, consider doing Date arithmetic instead of parsing human-readable date time
  const dateTimeStr = formatDistanceToNow(new Date(dateTime), {
    includeSeconds: true /* TODO: , locale  */,
  });
  const _nowLabel = nowLabel || dateTimeStr;
  return time && dateTimeStr.includes(time) ? _nowLabel : dateTimeStr;
}

export function checkFileType(fileName: string, mimeType?: string): string | undefined {
  const ext = fileName?.includes(".") ? fileName?.split(".").pop()?.toLowerCase() : undefined;
  if (!mimeType) return ext;
  const type = MIME_TYPES.get(mimeType.split(";")[0] || "");
  if (!ext && type) return type;
  // This last check may be unnecessary
  return ext === type ? ext : undefined;
}

export const MIME_TYPES: Map<string, string> = new Map([
  ["text/html", "html"], // htm shtml
  ["text/css", "css"],
  ["text/xml", "xml"],
  ["image/gif", "gif"],
  ["image/jpeg", "jpg"], // jpeg
  ["application/x-javascript", "js"],
  ["application/atom+xml", "atom"],
  ["application/rss+xml", "rss"],

  ["text/mathml", "mml"],
  ["text/plain", "txt"],
  ["text/vnd.sun.j2me.app-descriptor", "jad"],
  ["text/vnd.wap.wml", "wml"],
  ["text/x-component", "htc"],

  ["image/png", "png"],
  ["image/tiff", "tif"], // tiff
  ["image/vnd.wap.wbmp", "wbmp"],
  ["image/x-icon", "ico"],
  ["image/x-jng", "jng"],
  ["image/x-ms-bmp", "bmp"],
  ["image/svg+xml", "svg"],
  ["image/webp", "webp"],

  ["application/java-archive", "jar"], // war ear
  ["application/mac-binhex40", "hqx"],
  ["application/msword", "doc"],
  ["application/pdf", "pdf"],
  ["application/postscript", "ps"], // eps ai
  ["application/rtf", "rtf"],
  ["application/vnd.ms-excel", "xls"],
  ["application/vnd.ms-powerpoint", "ppt"],
  ["application/vnd.wap.wmlc", "wmlc"],
  ["application/vnd.google-earth.kml+xml", "kml"],
  ["application/vnd.google-earth.kmz", "kmz"],
  ["application/x-7z-compressed", "7z"],
  ["application/x-cocoa", "cco"],
  ["application/x-java-archive-diff", "jardiff"],
  ["application/x-java-jnlp-file", "jnlp"],
  ["application/x-makeself", "run"],
  ["application/x-perl", "pl"], // pm
  ["application/x-pilot", "prc"], // pdb
  ["application/x-rar-compressed", "rar"],
  ["application/x-redhat-package-manager", "rpm"],
  ["application/x-sea", "sea"],
  ["application/x-shockwave-flash", "swf"],
  ["application/x-stuffit", "sit"],
  ["application/x-tcl", "tcl"], // tk
  ["application/x-x509-ca-cert", "pem"], // der crt
  ["application/x-xpinstall", "xpi"],
  ["application/xhtml+xml", "xhtml"],
  ["application/zip", "zip"],

  ["application/octet-stream", "exe"], // bin dll
  /*
                application/octet-stream              "deb",
                application/octet-stream              "dmg",
                application/octet-stream              "eot",
                application/octet-stream              "iso", // img
                application/octet-stream              "msi", // msp msm
                */

  ["audio/midi", "mid"], // midi kar
  ["audio/mpeg", "mp3"],
  ["audio/ogg", "ogg"],
  ["audio/x-realaudio", "ra"],

  ["video/3gpp", "3gpp"], // 3gp
  ["video/mpeg", "mpeg"], // mpg
  ["video/quicktime", "mov"],
  ["video/x-flv", "flv"],
  ["video/x-mng", "mng"],
  ["video/x-ms-asf", "asf"], // asx
  ["video/x-ms-wmv", "wmv"],
  ["video/x-msvideo", "avi"],
  ["video/mp4", "mp4"], // m4v
]);

export function delay(timeInMs: number, callback?: any): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(async () => {
      await callback?.();
      resolve?.();
    }, timeInMs),
  );
}

export function normalizePath(url?: string): string | undefined {
  if (!url) {
    return undefined;
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (typeof window === "undefined") {
    return url;
  }
  // @ts-ignore
  const prefix = window.__PUBLIC_PATH || "";
  if (!prefix) {
    return url;
  }
  const prefixWithoutTrailingSlash = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
  const urlWithoutLeadingSlash = url.startsWith("/") ? url.slice(1) : url;

  return `${prefixWithoutTrailingSlash}/${urlWithoutLeadingSlash}`;
}

export function isComponentDefChildren(
  children?: ComponentDef | ComponentDef[] | string,
): children is ComponentDef | ComponentDef[] {
  return typeof children !== "string";
}

type SortSegmentInfo = {
  mapperFn: (item: any) => any;
  desc?: boolean;
};

export async function orderBy(array: any[], ...mappers: any[]): Promise<any[]> {
  if (!mappers.length) return array;

  // --- Create sort segment information
  let count = 0;
  const segments: SortSegmentInfo[] = [];
  while (count < mappers.length) {
    const mapper = mappers[count];
    let segmentInfo: SortSegmentInfo;
    if (typeof mapper === "string") {
      segmentInfo = {
        mapperFn: (item) => item[mapper],
      };
    } else if (typeof mapper === "function") {
      segmentInfo = {
        mapperFn: (item) => mapper(item),
      };
    } else {
      // --- Skip invalid sort parameter
      count++;
      continue;
    }

    // --- Check if next mapper is a sort order specification
    count++;
    if (count < mappers.length && typeof mappers[count] === "boolean") {
      segmentInfo.desc = true;
      count++;
    }

    // --- Add the new segment
    segments.push(segmentInfo);
  }

  // --- Create maps
  const mappedValues: Map<any, any>[] = [];
  for (const segment of segments) {
    const mappedValue = new Map<any, any>();
    for (let i = 0; i < array.length; i++) {
      mappedValue.set(array[i], await segment.mapperFn(array[i]));
    }
    mappedValues.push(mappedValue);
  }

  return array.sort((a, b) => {
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const fieldA = mappedValues[i].get(a);
      const fieldB = mappedValues[i].get(b);
      if (fieldA === fieldB) continue;

      return fieldA < fieldB ? (segment.desc ? 1 : -1) : segment.desc ? -1 : 1;
    }
    return 0;
  });
}

type Comparable = Record<string, any> | any[] | null | undefined;
export const shallowCompare = (obj1: Comparable, obj2: Comparable) => {
  return shallowEqual(obj1, obj2);
};

function shallowEqual<T extends Comparable>(a: T, b: T): boolean {
  const aIsArr = Array.isArray(a);
  const bIsArr = Array.isArray(b);

  if (typeof a === "string" || typeof b === "string") {
    return a === b;
  }

  if (aIsArr !== bIsArr) {
    return false;
  }

  if (aIsArr && bIsArr) {
    return shallowEqualArrays(a, b);
  }

  return shallowEqualObjects(a, b);
}

export function shallowEqualArrays(arrA: validArrayValue, arrB: validArrayValue): boolean {
  if (arrA === arrB) {
    return true;
  }

  if (!arrA || !arrB) {
    return false;
  }

  const len = arrA.length;

  if (arrB.length !== len) {
    return false;
  }

  for (let i = 0; i < len; i++) {
    if (arrA[i] !== arrB[i]) {
      return false;
    }
  }

  return true;
}

export type validObjectValue = Record<string | symbol, any> | null | undefined;
export type validArrayValue = any[] | null | undefined;

export function shallowEqualObjects<T>(objA: validObjectValue, objB: validObjectValue): boolean {
  if (objA === objB) {
    return true;
  }

  if (!objA || !objB) {
    return false;
  }

  const aKeys = Reflect.ownKeys(objA);
  const bKeys = Reflect.ownKeys(objB);
  const len = aKeys.length;

  if (bKeys.length !== len) {
    return false;
  }

  for (let i = 0; i < len; i++) {
    const key = aKeys[i];

    if (objA[key] !== objB[key] || !Object.prototype.hasOwnProperty.call(objB, key)) {
      return false;
    }
  }

  return true;
}

export const pickFromObject = (object: Record<any, any> | undefined, paths: string[]) => {
  const ret: any = {};
  paths.forEach((path) => {
    if (get(object, path) !== undefined) {
      ret[path] = get(object, path);
    }
  });
  return ret;
};

export const isPrimitive = (val: any) => Object(val) !== val;

export function formatFileSizeInBytes(size?: number) {
  if (!size) return "-";
  return humanFileSize(size);
}

export function getFileExtension(fileName: string, mimeType?: string) {
  return checkFileType(fileName, mimeType);
}

export function pluralize(number: number, singular: string, plural: string): string {
  if (number === 1) {
    return `${number} ${singular}`;
  }
  return `${number} ${plural}`;
}

export function toHashObject(arr: any[], keyProp: string, valueProp: string): any {
  return (arr ?? []).reduce((acc, item) => {
    acc[item[keyProp]] = item[valueProp];
    return acc;
  }, {});
}

export function findByField(arr: any[], field: string, value: any): any {
  return (arr ?? []).find((item) => item[field || ""] === value);
}

export function distinct<T>(arr: T[]): T[] {
  if (!Array.isArray(arr) || !arr || !arr.length) {
    return [];
  }
  return Array.from(new Set(arr));
}

// from here: https://github.com/lodash/lodash/issues/4815
/**
 * Throttles an async function in a way that can be awaited.
 * By default throttle doesn't return a promise for async functions unless it's invoking them immediately. See CUR-4769 for details.
 * @param func async function to throttle calls for.
 * @param wait same function as lodash.throttle's wait parameter.
 *             Call this function at most this often.
 * @returns a promise which will be resolved/ rejected only if the function is executed, with the result of the underlying call.
 */
export function asyncThrottle<F extends (...args: any[]) => Promise<any>>(
  func: F,
  wait?: number,
  options?: ThrottleSettings,
) {
  const throttled = throttle(
    (resolve, reject, args: Parameters<F>) => {
      void func(...args)
        .then(resolve)
        .catch(reject);
    },
    wait,
    options,
  );
  return (...args: Parameters<F>): ReturnType<F> =>
    new Promise((resolve, reject) => {
      throttled(resolve, reject, args);
    }) as ReturnType<F>;
}

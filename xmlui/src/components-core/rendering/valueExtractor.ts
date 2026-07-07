export function asOptionalBoolean(value: unknown, defValue?: boolean): boolean | undefined {
  if (value === undefined || value === null) {
    return defValue;
  }
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }
  if (typeof value === "object" && Object.keys(value).length === 0) {
    return false;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "") {
      return false;
    }
    if (normalized === "true") {
      return true;
    }
    if (normalized === "false") {
      return false;
    }
    return true;
  }
  if (typeof value === "boolean") {
    return value;
  }
  return true;
}

// Testable helper function to convert request parameters
export function convertRequestParamPart(
  part: Record<string, any>,
  paramTypes?: Record<string, string>
): Record<string, any> {
  if (!paramTypes) return part;

  const result = { ...part };
  Object.keys(part).forEach((key) => {
    if (!(key in paramTypes)) return;

    const partValue = part[key];
    const partValueType = typeof partValue;
    switch (paramTypes[key]) {
      // --- Parameter to integer
      case "integer":
        switch (partValueType) {
          case "number":
            result[key] = Math.round(partValue);
            break;
          case "string":
            result[key] = parseInt(partValue, 10);
            break;
          case "boolean":
            result[key] = partValue ? 1 : 0;
            break;
        }
        break;

      // --- Parameter to float
      case "float":
      case "real":
      case "double":
        switch (partValueType) {
          case "number":
            result[key] = partValue;
            break;
          case "string":
            result[key] = parseFloat(partValue);
            break;
          case "boolean":
            result[key] = partValue ? 1 : 0;
            break;
        }
        break;

      // --- Parameter to boolean
      case "boolean":
        switch (partValueType) {
          case "string":
            switch (partValue.toLowerCase()) {
              case "true":
              case "yes":
              case "on":
                result[key] = true;
                break;
              case "false":
              case "no":
              case "off":
                result[key] = false;
                break;
            }
            break;
          case "number":
            result[key] = !!partValue;
            break;
        }
        break;
    }
  });
  return result;
}

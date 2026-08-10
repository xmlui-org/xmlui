export {
  VALUE_TYPE_NAMES as COLUMN_TYPE_NAMES,
  isValueTypeName as isColumnTypeName,
  normalizeValueType as normalizeColumnType,
} from "../Value/value-types";

export type {
  ValueTypeDiagnostic as ColumnTypeDiagnostic,
  ValueTypeDiagnosticCode as ColumnTypeDiagnosticCode,
  ValueTypeName as ColumnTypeName,
  ValueTypeSource as ColumnTypeSource,
  NormalizeValueTypeResult as NormalizeColumnTypeResult,
  NormalizedValueType as NormalizedColumnType,
} from "../Value/value-types";

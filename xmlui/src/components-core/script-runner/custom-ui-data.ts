/**
 * Represents the root class of custom data types
 */
export interface ICustomUiData {
  readonly _custom_data_type_: string;
}

/**
 * Type guard function for the CustomUiData type
 * @param data Object to guard
 */
export function isCustomUiData (data: any): data is ICustomUiData {
  return data._custom_data_type_ !== undefined;
}

/**
 * Base class for all custom UI data related errors
 */
abstract class CustomUiDataError extends Error {
  protected constructor (message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomUiDataError.prototype);
  }
}

/**
 * This error is raised when an operation gets an unexpected type
 */
export class UnexpectedTypeError extends CustomUiDataError {
  constructor (expectedType: string, detail?: string) {
    super(`You must use ${expectedType} with the operation${detail ? " (" + detail + ")" : ""}`);
    Object.setPrototypeOf(this, UnexpectedTypeError.prototype);
  }
}

/**
 * This error is raised when an operation gets an unexpected type
 */
export class OverflowInCalculationError extends CustomUiDataError {
  constructor (number: bigint | string) {
    super(`The decimal ${number} is too large to be saved`);
    Object.setPrototypeOf(this, OverflowInCalculationError.prototype);
  }
}
